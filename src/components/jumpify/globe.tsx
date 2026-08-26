import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import type { IssPayload, JumpifyEvent, Mode, Quake, RadioStation } from "@/lib/events";
import { nightPolygon } from "@/lib/sun";
import { writeShare } from "@/lib/share";

export type InspectTarget =
  | { kind: "place"; lng: number; lat: number }
  | { kind: "event"; id: string }
  | { kind: "quake"; id: string }
  | { kind: "radio"; id: string }
  | { kind: "iss" };

type GlobeProps = {
  mode: Mode;
  dark: boolean;
  events: JumpifyEvent[];
  quakes: Quake[];
  stations: RadioStation[];
  iss: IssPayload | null;
  onInspect: (target: InspectTarget) => void;
  focus: { lng: number; lat: number; zoom?: number; nonce: number } | null;
  initial: { lng: number; lat: number; z: number } | undefined;
};

const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function eventsCollection(events: JumpifyEvent[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: events.map((ev) => ({
      type: "Feature",
      properties: { id: ev.id, category: ev.category, title: ev.title },
      geometry: { type: "Point", coordinates: ev.centroid },
    })),
  };
}

function quakesCollection(quakes: Quake[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: quakes.map((q) => ({
      type: "Feature",
      properties: { id: q.id, mag: q.mag ?? 0, place: q.place },
      geometry: { type: "Point", coordinates: [q.lng, q.lat] },
    })),
  };
}

function radioCollection(stations: RadioStation[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: stations.map((s) => ({
      type: "Feature",
      properties: { id: s.id, name: s.name },
      geometry: { type: "Point", coordinates: [s.lng, s.lat] },
    })),
  };
}

function issCollection(iss: IssPayload | null): GeoJSON.FeatureCollection {
  if (!iss) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "iss" },
        geometry: { type: "Point", coordinates: [iss.longitude, iss.latitude] },
      },
    ],
  };
}

function ensureLayers(map: MapLibreMap): void {
  if (!map.getSource("night")) {
    map.addSource("night", { type: "geojson", data: nightPolygon() });
    map.addLayer({
      id: "night-fill",
      type: "fill",
      source: "night",
      paint: { "fill-color": "#0b1220", "fill-opacity": 0.28 },
    });
  }
  if (!map.getSource("events")) {
    map.addSource("events", { type: "geojson", data: eventsCollection([]) });
    map.addLayer({
      id: "events-glow",
      type: "circle",
      source: "events",
      paint: {
        "circle-radius": 10,
        "circle-color": "#e07832",
        "circle-opacity": 0.18,
        "circle-blur": 0.6,
      },
    });
    map.addLayer({
      id: "events-dot",
      type: "circle",
      source: "events",
      paint: {
        "circle-radius": 4.2,
        "circle-color": "#e07832",
        "circle-stroke-width": 1.2,
        "circle-stroke-color": "#f6efe2",
      },
    });
  }
  if (!map.getSource("quakes")) {
    map.addSource("quakes", { type: "geojson", data: quakesCollection([]) });
    map.addLayer({
      id: "quakes-heat",
      type: "heatmap",
      source: "quakes",
      maxzoom: 6,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 2.5, 0.2, 7, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.7, 6, 2],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 6, 22],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(224,138,44,0)",
          0.3,
          "rgba(224,138,44,0.35)",
          0.7,
          "rgba(212,90,70,0.7)",
          1,
          "rgba(180,40,30,0.9)",
        ],
      },
    });
    map.addLayer({
      id: "quakes-dot",
      type: "circle",
      source: "quakes",
      minzoom: 3,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 2.5, 3, 7, 10],
        "circle-color": "#d45a46",
        "circle-opacity": 0.85,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#f6efe2",
      },
    });
  }
  if (!map.getSource("radio")) {
    map.addSource("radio", { type: "geojson", data: radioCollection([]) });
    map.addLayer({
      id: "radio-dot",
      type: "circle",
      source: "radio",
      paint: {
        "circle-radius": 4,
        "circle-color": "#4eb4c8",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#f6efe2",
      },
    });
  }
  if (!map.getSource("iss")) {
    map.addSource("iss", { type: "geojson", data: issCollection(null) });
    map.addLayer({
      id: "iss-glow",
      type: "circle",
      source: "iss",
      paint: {
        "circle-radius": 16,
        "circle-color": "#e08a2c",
        "circle-opacity": 0.22,
        "circle-blur": 0.8,
      },
    });
    map.addLayer({
      id: "iss-dot",
      type: "circle",
      source: "iss",
      paint: {
        "circle-radius": 6,
        "circle-color": "#f4c56a",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#1c2433",
      },
    });
  }
}

function setModeVisibility(map: MapLibreMap, mode: Mode): void {
  const vis = (id: string, on: boolean) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    }
  };
  vis("night-fill", true);
  vis("iss-glow", mode === "orbit");
  vis("iss-dot", mode === "orbit");
  vis("quakes-heat", mode === "pulse");
  vis("quakes-dot", mode === "pulse");
  vis("events-glow", mode === "pulse");
  vis("events-dot", mode === "pulse");
  vis("radio-dot", mode === "listen");
}

function setSourceData(
  map: MapLibreMap,
  id: string,
  data: GeoJSON.FeatureCollection | GeoJSON.Feature,
): void {
  const source = map.getSource(id);
  if (source && "setData" in source) {
    (source as maplibregl.GeoJSONSource).setData(data);
  }
}

export default function Globe({
  mode,
  dark,
  events,
  quakes,
  stations,
  iss,
  onInspect,
  focus,
  initial,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onInspectRef = useRef(onInspect);
  const modeRef = useRef(mode);
  const readyRef = useRef(false);

  useEffect(() => {
    onInspectRef.current = onInspect;
  }, [onInspect]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const map = new maplibregl.Map({
      container: el,
      style: dark ? DARK_STYLE : LIGHT_STYLE,
      center: [initial?.lng ?? 12, initial?.lat ?? 18],
      zoom: initial?.z ?? 1.35,
      minZoom: 0.6,
      maxZoom: 12,
      attributionControl: false,
      pitch: 0,
      maxPitch: 80,
    });
    mapRef.current = map;

    const boot = () => {
      map.setProjection({ type: "globe" });
      const style = map.getStyle() as StyleSpecification;
      map.setSky({
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 8, 0],
      });
      if (style) {
        /* sky applied */
      }
      ensureLayers(map);
      setModeVisibility(map, modeRef.current);
      readyRef.current = true;
    };
    const onClick = (e: maplibregl.MapMouseEvent) => {
      const layers = ["iss-dot", "events-dot", "quakes-dot", "radio-dot"].filter((id) =>
        map.getLayer(id),
      );
      const hits = layers.length ? map.queryRenderedFeatures(e.point, { layers }) : [];
      const hit = hits[0];
      if (hit?.layer?.id === "iss-dot") {
        onInspectRef.current({ kind: "iss" });
        return;
      }
      const hitId = hit?.properties ? hit.properties["id"] : undefined;
      if (hit?.layer?.id === "events-dot" && typeof hitId === "string") {
        onInspectRef.current({ kind: "event", id: hitId });
        return;
      }
      if (hit?.layer?.id === "quakes-dot" && typeof hitId === "string") {
        onInspectRef.current({ kind: "quake", id: hitId });
        return;
      }
      if (hit?.layer?.id === "radio-dot" && typeof hitId === "string") {
        onInspectRef.current({ kind: "radio", id: hitId });
        return;
      }
      onInspectRef.current({ kind: "place", lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    const persist = () => {
      const c = map.getCenter();
      writeShare({ mode: modeRef.current, lng: c.lng, lat: c.lat, z: map.getZoom() });
    };

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.GlobeControl(), "bottom-right");
    map.on("style.load", boot);
    map.on("click", onClick);
    map.on("moveend", persist);

    return () => {
      readyRef.current = false;
      map.off("style.load", boot);
      map.off("click", onClick);
      map.off("moveend", persist);
      map.remove();
      mapRef.current = null;
    };
    // Map is created once; theme changes handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    readyRef.current = false;
    map.setStyle(dark ? DARK_STYLE : LIGHT_STYLE);
  }, [dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    setModeVisibility(map, mode);
    const c = map.getCenter();
    writeShare({ mode, lng: c.lng, lat: c.lat, z: map.getZoom() });
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    setSourceData(map, "events", eventsCollection(events));
  }, [events]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    setSourceData(map, "quakes", quakesCollection(quakes));
  }, [quakes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    setSourceData(map, "radio", radioCollection(stations));
  }, [stations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    setSourceData(map, "iss", issCollection(iss));
  }, [iss]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tick = () => {
      if (!readyRef.current) return;
      setSourceData(map, "night", nightPolygon());
    };
    const id = window.setInterval(tick, 60_000);
    tick();
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({
      center: [focus.lng, focus.lat],
      zoom: Math.max(map.getZoom(), focus.zoom ?? 3.4),
      duration: 900,
    });
  }, [focus]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      role="application"
      aria-label="Interactive globe"
    />
  );
}

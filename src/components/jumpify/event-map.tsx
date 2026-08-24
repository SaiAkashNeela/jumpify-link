import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import {
  Map as MapView,
  MapControls,
  MapGeoJSON,
  MapClusterLayer,
  MapMarker,
  MarkerContent,
  type MapRef,
} from "@/components/ui/map";
import {
  CATEGORY_META,
  categoryMeta,
  isPointGeometry,
  type JumpifyEvent,
} from "@/lib/events";

type EventProperties = { id: string };

type CategoryBuckets = {
  points: FeatureCollection<Point, EventProperties>;
  areas: FeatureCollection;
};

export type FocusRequest = { id: string; nonce: number };

/**
 * MapLibre paint properties only accept hex/rgb colors, but our design
 * tokens are oklch(). Convert an oklch() CSS string to #rrggbb.
 */
function oklchToHex(value: string): string | null {
  const m = value.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (m[1].endsWith("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m2 = m_ ** 3;
  const s = s_ ** 3;
  const r = +4.0767416621 * l - 3.3077115913 * m2 + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m2 - 0.3413193965 * s;
  const b2 = -0.0041960863 * l - 0.7034186147 * m2 + 1.707614701 * s;
  const toSrgb = (x: number) => {
    const c = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, c)) * 255);
  };
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(toSrgb(r))}${hex(toSrgb(g))}${hex(toSrgb(b2))}`;
}

type EventMapProps = {
  events: JumpifyEvent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  focusRequest: FocusRequest | null;
};

/**
 * The Jumpify world map. Blank (tile-less) canvas with a Natural Earth
 * country layer for geographic context, per-category clustered point layers
 * for event locations, and fill/outline layers for affected-area geometries.
 */
export default function EventMap({
  events,
  selectedId,
  onSelect,
  focusRequest,
}: EventMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Land colors come from CSS design tokens so the map follows the theme.
  const [landColors, setLandColors] = useState({
    land: "#f2f0ea",
    border: "#9aa5b1",
  });
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const land = oklchToHex(styles.getPropertyValue("--land").trim());
    const border = oklchToHex(styles.getPropertyValue("--land-border").trim());
    if (land && border) setLandColors({ land, border });
  }, []);

  const byCategory = useMemo(() => {
    const buckets = new Map<string, CategoryBuckets>();
    for (const ev of events) {
      const key = CATEGORY_META[ev.category] ? ev.category : "other";
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          points: { type: "FeatureCollection", features: [] },
          areas: { type: "FeatureCollection", features: [] },
        };
        buckets.set(key, bucket);
      }
      if (ev.geometry.type === "Point") {
        bucket.points.features.push({
          type: "Feature",
          properties: { id: ev.id },
          geometry: ev.geometry,
        });
      } else if (ev.geometry.type === "MultiPoint") {
        for (const coordinates of ev.geometry.coordinates) {
          bucket.points.features.push({
            type: "Feature",
            properties: { id: ev.id },
            geometry: { type: "Point", coordinates },
          });
        }
      } else {
        bucket.areas.features.push({
          type: "Feature",
          properties: { id: ev.id },
          geometry: ev.geometry,
        });
      }
    }
    return buckets;
  }, [events]);

  const selected = events.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (!focusRequest || !mapRef.current) return;
    const ev = events.find((e) => e.id === focusRequest.id);
    if (!ev) return;
    const map = mapRef.current;
    map.flyTo({
      center: ev.centroid,
      zoom: Math.max(map.getZoom(), 4),
      duration: 900,
    });
  }, [focusRequest, events]);

  return (
    <MapView
      ref={mapRef}
      blank
      center={[10, 25]}
      zoom={1.3}
      minZoom={0.9}
      maxZoom={12}
      attributionControl={false}
      className="h-full w-full"
    >
      {/* Geographic context: Natural Earth 50m country boundaries
          (includes small island nations) + minor islands/islets layer */}
      <MapGeoJSON
        data="/data/countries.geojson"
        fillPaint={{ "fill-color": landColors.land, "fill-opacity": 1 }}
        linePaint={{ "line-color": landColors.border, "line-width": 0.6 }}
      />
      <MapGeoJSON
        data="/data/minor-islands.geojson"
        fillPaint={{ "fill-color": landColors.land, "fill-opacity": 1 }}
        linePaint={{ "line-color": landColors.border, "line-width": 0.4 }}
      />

      {[...byCategory.entries()].map(([cat, bucket]) => {
        const meta = categoryMeta(cat);
        return (
          <Fragment key={cat}>
            {bucket.areas.features.length > 0 && (
              <MapGeoJSON
                data={bucket.areas}
                interactive
                fillPaint={{
                  "fill-color": meta.color,
                  "fill-opacity": 0.18,
                }}
                linePaint={{
                  "line-color": meta.color,
                  "line-width": 1.2,
                  "line-opacity": 0.7,
                }}
                onClick={(e) => onSelect(e.feature.properties?.["id"] ?? null)}
              />
            )}
            {bucket.points.features.length > 0 && (
              <MapClusterLayer<EventProperties>
                data={bucket.points}
                clusterRadius={42}
                clusterMaxZoom={7}
                clusterColors={meta.cluster}
                clusterThresholds={[10, 40]}
                pointColor={meta.color}
                onPointClick={(feature) =>
                  onSelect(feature.properties?.["id"] ?? null)
                }
              />
            )}
          </Fragment>
        );
      })}

      {selected && (
        <MapMarker
          longitude={selected.centroid[0]}
          latitude={selected.centroid[1]}
        >
          <MarkerContent>
            <div
              className="pointer-events-none size-4 rounded-full border-2 border-card"
              style={{
                backgroundColor: categoryMeta(selected.category).color,
                boxShadow: `0 0 0 6px ${categoryMeta(selected.category).color}44, 0 1px 4px rgb(0 0 0 / 0.3)`,
              }}
            />
          </MarkerContent>
        </MapMarker>
      )}

      <MapControls position="bottom-right" showCompass={false} />
    </MapView>
  );
}

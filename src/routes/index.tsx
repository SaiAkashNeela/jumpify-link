import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Hud } from "@/components/jumpify/hud";
import { DetailSheet } from "@/components/jumpify/detail-sheet";
import { RadioBar } from "@/components/jumpify/radio-bar";
import { Credits } from "@/components/jumpify/credits";
import { useNow } from "@/hooks/use-now";
import { useTheme } from "@/hooks/use-theme";
import { useProjection } from "@/hooks/use-projection";
import { parseShare } from "@/lib/share";
import { resolveDark } from "@/lib/theme";
import { SPACEPORTS } from "@/lib/spaceports";
import { CABLES } from "@/lib/cables";
import { getRandomWonder } from "@/lib/wonders";
import {
  formatRelativeTime,
  isMode,
  type EventsPayload,
  type IssPayload,
  type Mode,
  type QuakesPayload,
  type RadioPayload,
  type RadioStation,
} from "@/lib/events";
import type { InspectTarget } from "@/components/jumpify/globe";

const Globe = lazy(() => import("@/components/jumpify/globe"));

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} failed (${res.status})`);
  return res.json() as Promise<T>;
}

function MapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ocean">
      <p className="px-6 text-center text-sm text-muted">Spinning up the planet…</p>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jumpify — poke the live planet" },
      {
        name: "description",
        content:
          "An interactive 3D globe & 2D flat map for ISS orbit, spaceports, earthquakes, natural disasters, undersea internet cables, world radio, and tap-anywhere weather.",
      },
      { property: "og:title", content: "Jumpify — poke the live planet" },
      {
        property: "og:description",
        content:
          "Explore the planet in 3D or 2D. Follow the ISS & spaceports. Inspect undersea fiber cables. Tap anywhere for weather & history. Listen to live world radio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const now = useNow(15_000);
  const [theme, setTheme] = useTheme();
  const [projection, setProjection] = useProjection();
  const [mode, setMode] = useState<Mode>("orbit");
  const [inspect, setInspect] = useState<InspectTarget | null>(null);
  const [playing, setPlaying] = useState<RadioStation | null>(null);
  const [focus, setFocus] = useState<{ lng: number; lat: number; zoom?: number; nonce: number } | null>(null);
  const [share] = useState(() =>
    typeof window === "undefined" ? {} : parseShare(window.location.search),
  );
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (share.mode && isMode(share.mode)) setMode(share.mode);
  }, [share.mode]);

  useEffect(() => {
    setDark(resolveDark(theme));
  }, [theme]);

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => getJson<EventsPayload>("/api/events"),
    staleTime: 60_000,
    refetchInterval: () => (document.hidden ? false : 60_000),
    retry: 1,
    placeholderData: (prev) => prev,
  });
  const quakesQuery = useQuery({
    queryKey: ["quakes"],
    queryFn: () => getJson<QuakesPayload>("/api/quakes"),
    staleTime: 60_000,
    refetchInterval: () => (document.hidden ? false : 90_000),
    retry: 1,
    placeholderData: (prev) => prev,
  });
  const radioQuery = useQuery({
    queryKey: ["radio"],
    queryFn: () => getJson<RadioPayload>("/api/radio"),
    staleTime: 10 * 60_000,
    retry: 1,
    placeholderData: (prev) => prev,
  });
  const issQuery = useQuery({
    queryKey: ["iss"],
    queryFn: () => getJson<IssPayload>("/api/iss"),
    staleTime: 3_000,
    refetchInterval: () => (document.hidden || mode !== "orbit" ? false : 5_000),
    retry: 1,
    placeholderData: (prev) => prev,
    enabled: mode === "orbit",
  });

  const events = eventsQuery.data?.events ?? [];
  const quakes = quakesQuery.data?.quakes ?? [];
  const stations = radioQuery.data?.stations ?? [];
  const iss = issQuery.data ?? null;

  const status = useMemo(() => {
    if (mode === "orbit" && iss) {
      return `ISS ${iss.latitude.toFixed(1)}°, ${iss.longitude.toFixed(1)}° · ${iss.altitude.toFixed(0)} km · ${SPACEPORTS.length} spaceports`;
    }
    if (mode === "pulse") {
      const n = events.length + quakes.length;
      const stamp = eventsQuery.data?.refreshedAt ?? quakesQuery.data?.refreshedAt;
      return `${n} natural pulses · ${stamp ? `updated ${formatRelativeTime(stamp, now)}` : "loading"}`;
    }
    if (mode === "cables") {
      return `${CABLES.length} transoceanic optical submarine cables`;
    }
    if (mode === "listen") {
      return `${stations.length} radio stations live with coordinates`;
    }
    return "Live planet";
  }, [mode, iss, events.length, quakes.length, stations.length, eventsQuery.data, quakesQuery.data, now]);

  const handleInspect = (target: InspectTarget) => {
    setInspect(target);
    if (target.kind === "place") {
      setFocus({ lng: target.lng, lat: target.lat, zoom: 4.5, nonce: Date.now() });
    }
    if (target.kind === "spaceport") {
      const sp = SPACEPORTS.find((s) => s.id === target.id);
      if (sp) setFocus({ lng: sp.lng, lat: sp.lat, zoom: 5.5, nonce: Date.now() });
    }
    if (target.kind === "cable") {
      const c = CABLES.find((item) => item.id === target.id);
      if (c && c.coordinates[0]) {
        const mid = c.coordinates[Math.floor(c.coordinates.length / 2)]!;
        setFocus({ lng: mid[0], lat: mid[1], zoom: 3.5, nonce: Date.now() });
      }
    }
    if (target.kind === "event") {
      const ev = events.find((e) => e.id === target.id);
      if (ev) setFocus({ lng: ev.centroid[0], lat: ev.centroid[1], zoom: 4, nonce: Date.now() });
    }
    if (target.kind === "quake") {
      const q = quakes.find((item) => item.id === target.id);
      if (q) setFocus({ lng: q.lng, lat: q.lat, zoom: 4.5, nonce: Date.now() });
    }
    if (target.kind === "radio") {
      const s = stations.find((item) => item.id === target.id);
      if (s) setFocus({ lng: s.lng, lat: s.lat, zoom: 4, nonce: Date.now() });
    }
    if (target.kind === "iss" && iss) {
      setFocus({ lng: iss.longitude, lat: iss.latitude, zoom: 3, nonce: Date.now() });
    }
  };

  const handleTeleport = () => {
    const spot = getRandomWonder();
    setFocus({ lng: spot.lng, lat: spot.lat, zoom: spot.zoom, nonce: Date.now() });
    setInspect({ kind: "place", lng: spot.lng, lat: spot.lat });
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean text-ink">
      <h1 className="sr-only">Jumpify — poke the live planet</h1>
      <div className="absolute inset-0">
        <ClientOnly fallback={<MapFallback />}>
          <Suspense fallback={<MapFallback />}>
            <Globe
              mode={mode}
              projection={projection}
              dark={dark}
              events={events}
              quakes={quakes}
              stations={stations}
              iss={iss}
              onInspect={handleInspect}
              focus={focus}
              initial={
                share.lng !== undefined && share.lat !== undefined
                  ? { lng: share.lng, lat: share.lat, z: share.z ?? 1.35 }
                  : undefined
              }
            />
          </Suspense>
        </ClientOnly>
      </div>

      <Hud
        mode={mode}
        onMode={setMode}
        projection={projection}
        onProjection={setProjection}
        onTeleport={handleTeleport}
        theme={theme}
        onTheme={setTheme}
        status={status}
      />
      <Credits />
      <DetailSheet
        target={inspect}
        events={events}
        quakes={quakes}
        stations={stations}
        iss={iss}
        now={now}
        onClose={() => setInspect(null)}
        onPlayRadio={setPlaying}
      />
      <RadioBar station={playing} onStop={() => setPlaying(null)} />
    </main>
  );
}

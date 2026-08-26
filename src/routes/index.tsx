import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Hud } from "@/components/jumpify/hud";
import { DetailSheet } from "@/components/jumpify/detail-sheet";
import { RadioBar } from "@/components/jumpify/radio-bar";
import { Credits } from "@/components/jumpify/credits";
import { useNow } from "@/hooks/use-now";
import { useTheme } from "@/hooks/use-theme";
import { parseShare } from "@/lib/share";
import { resolveDark } from "@/lib/theme";
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
      <p className="px-6 text-center text-sm text-muted">Spinning up the globe…</p>
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
          "An interactive globe for ISS orbit, earthquakes, named natural events, world radio, and tap-anywhere weather. Free, no account.",
      },
      { property: "og:title", content: "Jumpify — poke the live planet" },
      {
        property: "og:description",
        content:
          "Spin a live globe. Follow the ISS. Tap a city for weather. Listen to world radio. Optional NASA events overlay.",
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
      return `ISS ${iss.latitude.toFixed(1)}°, ${iss.longitude.toFixed(1)}° · ${iss.altitude.toFixed(0)} km`;
    }
    if (mode === "pulse") {
      const n = events.length + quakes.length;
      const stamp = eventsQuery.data?.refreshedAt ?? quakesQuery.data?.refreshedAt;
      return `${n} pulses · ${stamp ? `updated ${formatRelativeTime(stamp, now)}` : "loading"}`;
    }
    if (mode === "listen") {
      return `${stations.length} stations with coordinates`;
    }
    return "Live globe";
  }, [mode, iss, events.length, quakes.length, stations.length, eventsQuery.data, quakesQuery.data, now]);

  const handleInspect = (target: InspectTarget) => {
    setInspect(target);
    if (target.kind === "place") {
      setFocus({ lng: target.lng, lat: target.lat, zoom: 4, nonce: Date.now() });
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

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean text-ink">
      <h1 className="sr-only">Jumpify — poke the live planet</h1>
      <div className="absolute inset-0">
        <ClientOnly fallback={<MapFallback />}>
          <Suspense fallback={<MapFallback />}>
            <Globe
              mode={mode}
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

      <Hud mode={mode} onMode={setMode} theme={theme} onTheme={setTheme} status={status} />
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

import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  formatRelativeTime,
  type EventsPayload,
} from "@/lib/events";
import { FilterBar } from "@/components/jumpify/filter-bar";
import { RecentEvents } from "@/components/jumpify/recent-events";
import { EventPanel } from "@/components/jumpify/event-panel";
import type { FocusRequest } from "@/components/jumpify/event-map";

const EventMap = lazy(() => import("@/components/jumpify/event-map"));

async function fetchEvents(): Promise<EventsPayload> {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error(`Events request failed (${res.status})`);
  return res.json();
}

function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jumpify — Natural Events Happening Around the World" },
      {
        name: "description",
        content:
          "Explore wildfires, storms, volcanoes, floods and other natural events happening around the world on a live interactive map.",
      },
      {
        property: "og:title",
        content: "Jumpify — Natural Events Happening Around the World",
      },
      {
        property: "og:description",
        content:
          "Explore wildfires, storms, volcanoes, floods and other natural events happening around the world on a live interactive map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Jumpify",
          description:
            "Explore wildfires, storms, volcanoes, floods and other natural events happening around the world on a live interactive map.",
          applicationCategory: "ReferenceApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Home,
});

function MapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ocean">
      <div className="px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Loading the live world map…
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Jumpify shows wildfires, storms, volcanoes, floods and other natural
          events happening around the world right now.
        </p>
      </div>
    </div>
  );
}

function Home() {
  const now = useNow();
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

  const { data, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
    placeholderData: (prev) => prev,
  });

  const events = useMemo(() => data?.events ?? [], [data]);

  const { categories, counts } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of events) {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1;
    }
    return { categories: Object.keys(counts), counts };
  }, [events]);

  const filtered = useMemo(
    () =>
      category === "all"
        ? events
        : events.filter((ev) => ev.category === category),
    [events, category],
  );

  const selected = events.find((ev) => ev.id === selectedId) ?? null;

  const handleFocus = (id: string) => {
    setSelectedId(id);
    setFocusRequest({ id, nonce: Date.now() });
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean text-foreground">
      {/* Map layer */}
      <div className="absolute inset-0">
        <ClientOnly fallback={<MapFallback />}>
          <Suspense fallback={<MapFallback />}>
            <EventMap
              events={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              focusRequest={focusRequest}
            />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex h-13 items-center justify-between gap-3 px-3 pt-2 pb-1.5 sm:px-5">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="text-[15px] font-bold tracking-[0.22em]">
              JUMPIFY
            </h1>
            <p className="hidden text-[13px] text-muted-foreground sm:block">
              The world, right now.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {data && (
              <span className="hidden md:inline">
                <strong className="font-semibold text-foreground">
                  {data.count.toLocaleString()}
                </strong>{" "}
                active events ·{" "}
                <strong className="font-semibold text-foreground">
                  {categories.length}
                </strong>{" "}
                categories
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-live" />
              Live
            </span>
            {data && (
              <span className="hidden font-mono text-[11px] sm:inline">
                Updated {formatRelativeTime(data.refreshedAt, now)}
              </span>
            )}
          </div>
        </div>

        <FilterBar
          categories={categories}
          counts={counts}
          total={events.length}
          active={category}
          onChange={setCategory}
        />
      </header>

      {/* Latest events (desktop) */}
      <RecentEvents
        events={filtered}
        selectedId={selectedId}
        now={now}
        onFocus={handleFocus}
      />

      {/* Selected event details */}
      {selected && (
        <EventPanel event={selected} onClose={() => setSelectedId(null)} />
      )}

      {/* Attribution */}
      <p className="pointer-events-none absolute bottom-2 left-3 z-10 text-[11px] text-muted-foreground/80">
        Natural event data: NASA EONET
      </p>

      {/* Stale-data notice */}
      {data?.stale && (
        <div className="absolute bottom-8 left-1/2 z-20 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-border bg-card px-3.5 py-1.5 text-center text-xs text-muted-foreground shadow-sm">
          Unable to refresh events — showing the last successful update (
          {formatRelativeTime(data.refreshedAt, now)}).
        </div>
      )}

      {/* Hard failure: no cached dataset at all */}
      {error && !data && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-sm">
            <h2 className="text-base font-semibold">
              Events are temporarily unavailable.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again shortly.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { fetchEonetEvents } from "@/lib/eonet.server";
import type { EventsPayload, JumpifyEvent } from "@/lib/events";

/**
 * Jumpify's public event endpoint.
 *
 * The browser only ever talks to this route — never to NASA directly. The
 * upstream EONET feed is refreshed server-side at most once every 3 minutes
 * (deduplicated across concurrent requests) and the latest successful
 * snapshot is cached in memory. If a refresh fails, the previous snapshot
 * keeps being served with `stale: true`.
 */
const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

type CacheEntry = {
  events: JumpifyEvent[];
  fetchedAtMs: number;
  fetchedAtIso: string;
};

let cache: CacheEntry | null = null;
let inflight: Promise<void> | null = null;

async function refresh(): Promise<void> {
  const events = await fetchEonetEvents();
  cache = {
    events,
    fetchedAtMs: Date.now(),
    fetchedAtIso: new Date().toISOString(),
  };
}

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      ...(init?.headers ?? {}),
    },
  });
}

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        const fresh = cache !== null && now - cache.fetchedAtMs < REFRESH_INTERVAL_MS;

        if (!fresh) {
          if (!inflight) {
            inflight = refresh()
              .catch(() => {
                // Upstream failed — keep serving the previous snapshot.
              })
              .finally(() => {
                inflight = null;
              });
          }
          await inflight;
        }

        if (!cache) {
          return json(
            {
              error: "unavailable",
              message: "Events are temporarily unavailable. Please try again shortly.",
            },
            { status: 503 },
          );
        }

        const payload: EventsPayload = {
          events: cache.events,
          refreshedAt: cache.fetchedAtIso,
          stale: Date.now() - cache.fetchedAtMs >= REFRESH_INTERVAL_MS,
          count: cache.events.length,
        };
        return json(payload);
      },
    },
  },
});

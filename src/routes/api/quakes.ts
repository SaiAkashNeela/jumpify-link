import { createFileRoute } from "@tanstack/react-router";
import { cachedJson, fetchUpstream, jsonResponse } from "@/lib/cache.server";
import type { Quake, QuakesPayload } from "@/lib/events";

const USGS =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export const Route = createFileRoute("/api/quakes")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await cachedJson<QuakesPayload>("quakes", 60_000, async () => {
            const res = await fetchUpstream(USGS);
            if (!res.ok) throw new Error(`USGS ${res.status}`);
            const json = (await res.json()) as {
              features?: Array<{
                id?: unknown;
                properties?: { mag?: unknown; place?: unknown; time?: unknown; url?: unknown };
                geometry?: { coordinates?: unknown };
              }>;
            };
            const quakes: Quake[] = [];
            for (const f of json.features ?? []) {
              const coords = f.geometry?.coordinates;
              if (!Array.isArray(coords) || coords.length < 2) continue;
              const lng = Number(coords[0]);
              const lat = Number(coords[1]);
              if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
              if (typeof f.id !== "string") continue;
              quakes.push({
                id: f.id,
                mag: typeof f.properties?.mag === "number" ? f.properties.mag : null,
                place: typeof f.properties?.place === "string" ? f.properties.place : "Unknown",
                time: typeof f.properties?.time === "number" ? f.properties.time : Date.now(),
                lng,
                lat,
                depth: typeof coords[2] === "number" ? coords[2] : null,
                url: typeof f.properties?.url === "string" ? f.properties.url : null,
              });
            }
            return { quakes, refreshedAt: new Date().toISOString(), stale: false };
          });
          return jsonResponse(payload);
        } catch {
          return jsonResponse({ error: "unavailable" }, { status: 503 });
        }
      },
    },
  },
});

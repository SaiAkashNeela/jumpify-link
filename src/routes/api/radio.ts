import { createFileRoute } from "@tanstack/react-router";
import { cachedJson, fetchUpstream, jsonResponse } from "@/lib/cache.server";
import type { RadioPayload, RadioStation } from "@/lib/events";

const RADIO =
  "https://de1.api.radio-browser.info/json/stations/search?has_geo_info=true&hidebroken=true&limit=180&order=clickcount&reverse=true";

export const Route = createFileRoute("/api/radio")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await cachedJson<RadioPayload>("radio", 10 * 60_000, async () => {
            const res = await fetchUpstream(RADIO);
            if (!res.ok) throw new Error(`Radio ${res.status}`);
            const rows = (await res.json()) as Array<Record<string, unknown>>;
            const stations: RadioStation[] = [];
            for (const row of rows) {
              const lat = Number(row.geo_lat);
              const lng = Number(row.geo_long);
              const stream = typeof row.url_resolved === "string" ? row.url_resolved : "";
              const id = typeof row.stationuuid === "string" ? row.stationuuid : "";
              const name = typeof row.name === "string" ? row.name.trim() : "";
              if (!id || !name || !stream || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
              if (stream.startsWith("http://")) continue;
              stations.push({
                id,
                name,
                lat,
                lng,
                country: typeof row.country === "string" ? row.country : "",
                tags: typeof row.tags === "string" ? row.tags : "",
                bitrate: typeof row.bitrate === "number" ? row.bitrate : 0,
                stream,
                homepage: typeof row.homepage === "string" && row.homepage ? row.homepage : null,
              });
              if (stations.length >= 120) break;
            }
            return { stations, refreshedAt: new Date().toISOString(), stale: false };
          });
          return jsonResponse(payload);
        } catch {
          return jsonResponse({ error: "unavailable" }, { status: 503 });
        }
      },
    },
  },
});

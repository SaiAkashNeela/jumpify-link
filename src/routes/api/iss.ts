import { createFileRoute } from "@tanstack/react-router";
import { cachedJson, fetchUpstream, jsonResponse } from "@/lib/cache.server";
import type { IssPayload } from "@/lib/events";

export const Route = createFileRoute("/api/iss")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await cachedJson<IssPayload>("iss", 4_000, async () => {
            const res = await fetchUpstream("https://api.wheretheiss.at/v1/satellites/25544");
            if (!res.ok) throw new Error(`ISS ${res.status}`);
            const data = (await res.json()) as Record<string, unknown>;
            const latitude = Number(data.latitude);
            const longitude = Number(data.longitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              throw new Error("ISS payload missing coordinates");
            }
            return {
              latitude,
              longitude,
              altitude: Number(data.altitude) || 0,
              velocity: Number(data.velocity) || 0,
              timestamp: Number(data.timestamp) || Math.floor(Date.now() / 1000),
              visibility: typeof data.visibility === "string" ? data.visibility : "unknown",
            };
          });
          return jsonResponse(payload, {
            headers: { "cache-control": "public, max-age=2" },
          });
        } catch {
          return jsonResponse({ error: "unavailable" }, { status: 503 });
        }
      },
    },
  },
});

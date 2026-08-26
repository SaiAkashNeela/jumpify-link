import { createFileRoute } from "@tanstack/react-router";
import { fetchEonetEvents } from "@/lib/eonet.server";
import { cachedJson, jsonResponse } from "@/lib/cache.server";
import type { EventsPayload } from "@/lib/events";

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await cachedJson<EventsPayload>(
            "eonet",
            3 * 60_000,
            async () => {
              const events = await fetchEonetEvents();
              return {
                events,
                refreshedAt: new Date().toISOString(),
                stale: false,
                count: events.length,
              };
            },
          );
          return jsonResponse(payload);
        } catch {
          return jsonResponse(
            {
              error: "unavailable",
              message: "Events are temporarily unavailable. Please try again shortly.",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});

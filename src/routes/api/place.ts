import { createFileRoute } from "@tanstack/react-router";
import { cachedJson, fetchUpstream, jsonResponse } from "@/lib/cache.server";
import type { PlacePayload } from "@/lib/events";

function clampCoord(value: string | null, min: number, max: number): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function formatLocal(timezone: string, date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export const Route = createFileRoute("/api/place")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const lat = clampCoord(url.searchParams.get("lat"), -90, 90);
        const lng = clampCoord(url.searchParams.get("lng"), -180, 180);
        if (lat === null || lng === null) {
          return jsonResponse({ error: "lat and lng required" }, { status: 400 });
        }
        const key = `place:${lat.toFixed(2)},${lng.toFixed(2)}`;
        try {
          const payload = await cachedJson<PlacePayload>(key, 10 * 60_000, async () => {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`;
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`;
            const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=12000&gslimit=1&format=json&origin=*`;
            const [weatherRes, aqiRes, wikiRes] = await Promise.allSettled([
              fetchUpstream(weatherUrl),
              fetchUpstream(aqiUrl),
              fetchUpstream(wikiUrl),
            ]);

            let timezone = "UTC";
            let weather: PlacePayload["weather"] = null;
            if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
              const w = (await weatherRes.value.json()) as {
                timezone?: string;
                current_weather?: {
                  temperature?: number;
                  windspeed?: number;
                  weathercode?: number;
                  is_day?: number;
                };
              };
              timezone = typeof w.timezone === "string" ? w.timezone : "UTC";
              const cw = w.current_weather;
              if (cw) {
                weather = {
                  temperature: typeof cw.temperature === "number" ? cw.temperature : null,
                  windspeed: typeof cw.windspeed === "number" ? cw.windspeed : null,
                  weathercode: typeof cw.weathercode === "number" ? cw.weathercode : null,
                  isDay: typeof cw.is_day === "number" ? cw.is_day === 1 : null,
                };
              }
            }

            let aqi: number | null = null;
            if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
              const a = (await aqiRes.value.json()) as { current?: { us_aqi?: number } };
              aqi = typeof a.current?.us_aqi === "number" ? a.current.us_aqi : null;
            }

            let wiki: PlacePayload["wiki"] = null;
            if (wikiRes.status === "fulfilled" && wikiRes.value.ok) {
              const q = (await wikiRes.value.json()) as {
                query?: { geosearch?: Array<{ title?: string; pageid?: number }> };
              };
              const hit = q.query?.geosearch?.[0];
              if (hit?.title) {
                const extractRes = await fetchUpstream(
                  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
                );
                if (extractRes.ok) {
                  const s = (await extractRes.json()) as {
                    title?: string;
                    extract?: string;
                    content_urls?: { desktop?: { page?: string } };
                  };
                  wiki = {
                    title: s.title ?? hit.title,
                    extract: s.extract ?? "",
                    url:
                      s.content_urls?.desktop?.page ??
                      `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
                  };
                }
              }
            }

            return {
              name: wiki?.title ?? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
              country: null,
              timezone,
              localTime: formatLocal(timezone),
              weather,
              wiki,
              aqi,
            };
          });
          return jsonResponse(payload);
        } catch {
          return jsonResponse({ error: "unavailable" }, { status: 503 });
        }
      },
    },
  },
});

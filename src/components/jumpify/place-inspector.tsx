import { Inspector, Field } from "@/components/jumpify/inspector";
import { usePlace } from "@/hooks/use-place";
import { weatherLabel } from "@/lib/events";

export function PlaceInspector({
  lng,
  lat,
  onClose,
}: {
  lng: number;
  lat: number;
  onClose: () => void;
}) {
  const { place, error } = usePlace(lat, lng);
  return (
    <Inspector
      title={place?.name ?? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}
      kicker="Tap anywhere"
      onClose={onClose}
      footer="Weather: Open-Meteo · Nearby: Wikipedia"
    >
      {error ? <p className="text-muted">{error}</p> : null}
      {!place && !error ? <p className="text-muted">Reading the ground…</p> : null}
      {place ? (
        <>
          <Field label="Local time" value={`${place.localTime} · ${place.timezone}`} />
          {place.weather ? (
            <Field
              label="Weather"
              value={`${place.weather.temperature ?? "—"}°C · ${weatherLabel(place.weather.weathercode)}${
                place.weather.windspeed !== null ? ` · ${place.weather.windspeed} km/h` : ""
              }`}
            />
          ) : null}
          {place.aqi !== null ? <Field label="US AQI" value={String(place.aqi)} /> : null}
          {place.wiki?.extract ? <p className="text-muted">{place.wiki.extract}</p> : null}
          {place.wiki?.url ? (
            <a
              href={place.wiki.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-lg border border-rule px-3 text-sm font-medium hover:bg-paper-2"
            >
              Wikipedia
            </a>
          ) : null}
        </>
      ) : null}
    </Inspector>
  );
}

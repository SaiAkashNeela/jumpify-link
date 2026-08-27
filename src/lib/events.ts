export const MODES = ["orbit", "pulse", "cables", "listen"] as const;
export type Mode = (typeof MODES)[number];

export function isMode(value: string | null | undefined): value is Mode {
  return value === "orbit" || value === "pulse" || value === "cables" || value === "listen";
}

export type ProjectionChoice = "globe" | "map";
export const PROJECTION_STORAGE_KEY = "jumpify_projection_v1";

export type ThemeChoice = "system" | "light" | "dark";
export const THEME_STORAGE_KEY = "jumpify_theme_v1";

export type JumpifyEvent = {
  id: string;
  title: string;
  category: string;
  categoryTitle: string;
  geometry: GeoJSON.Geometry;
  centroid: [number, number];
  date: string;
  closed: string | null;
  description: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
};

export type EventsPayload = {
  events: JumpifyEvent[];
  refreshedAt: string;
  stale: boolean;
  count: number;
};

export type Quake = {
  id: string;
  mag: number | null;
  place: string;
  time: number;
  lng: number;
  lat: number;
  depth: number | null;
  url: string | null;
};

export type QuakesPayload = {
  quakes: Quake[];
  refreshedAt: string;
  stale: boolean;
};

export type IssPayload = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
  visibility: string;
};

export type RadioStation = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  country: string;
  tags: string;
  bitrate: number;
  stream: string;
  homepage: string | null;
};

export type RadioPayload = {
  stations: RadioStation[];
  refreshedAt: string;
  stale: boolean;
};

export type PlacePayload = {
  name: string;
  country: string | null;
  timezone: string;
  localTime: string;
  weather: {
    temperature: number | null;
    windspeed: number | null;
    weathercode: number | null;
    isDay: boolean | null;
  } | null;
  wiki: { title: string; extract: string; url: string } | null;
  aqi: number | null;
};

export type CategoryMeta = {
  id: string;
  label: string;
  short: string;
  color: string;
};

export const OTHER_CATEGORY = "other";

const OTHER_META: CategoryMeta = {
  id: OTHER_CATEGORY,
  label: "Other",
  short: "Other",
  color: "#9aa4ad",
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  wildfires: { id: "wildfires", label: "Wildfire", short: "Wildfires", color: "#e07832" },
  severeStorms: { id: "severeStorms", label: "Storm", short: "Storms", color: "#5b8fd4" },
  volcanoes: { id: "volcanoes", label: "Volcano", short: "Volcanoes", color: "#d45a46" },
  floods: { id: "floods", label: "Flood", short: "Floods", color: "#4a96d4" },
  landslides: { id: "landslides", label: "Landslide", short: "Landslides", color: "#c4924a" },
  seaLakeIce: { id: "seaLakeIce", label: "Ice", short: "Ice", color: "#4eb4c8" },
  earthquakes: { id: "earthquakes", label: "Quake", short: "Quakes", color: "#d4a03c" },
  [OTHER_CATEGORY]: OTHER_META,
};

export function categoryMeta(id: string): CategoryMeta {
  return CATEGORY_META[id] ?? OTHER_META;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatUtcDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} d ago`;
}

export function weatherLabel(code: number | null): string {
  if (code === null) return "Unknown";
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Storm";
}

export const MODE_COPY: Record<Mode, { label: string; line: string }> = {
  orbit: { label: "Orbit", line: "ISS real-time tracking, orbital spaceports & day/night line." },
  pulse: { label: "Pulse", line: "Live USGS earthquakes & NASA disaster activity worldwide." },
  cables: { label: "Cables", line: "Transoceanic subsea fiber optic cables connecting continents." },
  listen: { label: "Listen", line: "Live world radio. Tap any station to stream local audio." },
};

import type { Geometry } from "geojson";

/**
 * Normalized natural-event model consumed by the Jumpify frontend.
 * Source adapters (NASA EONET today, USGS etc. later) map into this shape.
 */
export type JumpifyEvent = {
  id: string;
  title: string;
  category: string;
  categoryTitle: string;
  geometry: Geometry;
  /** [longitude, latitude] — bbox center of the geometry, for focus/popup. */
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
  /** ISO timestamp of the last successful upstream refresh. */
  refreshedAt: string;
  /** True when the upstream refresh failed and this is a previous snapshot. */
  stale: boolean;
  count: number;
};

export type CategoryMeta = {
  id: string;
  /** Singular label, e.g. "Wildfire" */
  label: string;
  /** Plural chip label, e.g. "Wildfires" */
  short: string;
  /** Base color (hex — required by MapLibre paint props). */
  color: string;
  /** Cluster circle colors: [small, medium, large]. */
  cluster: [string, string, string];
};

export const OTHER_CATEGORY = "other";

/**
 * Category palette keyed by EONET v3 category id. Unknown categories fall
 * back to "other". Colors are data-viz semantics (like chart tokens).
 */
const OTHER_META: CategoryMeta = {
  id: OTHER_CATEGORY,
  label: "Other",
  short: "Other",
  color: "#9aa4ad",
  cluster: ["#9aa4ad", "#6f7880", "#4a5158"],
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  wildfires: {
    id: "wildfires",
    label: "Wildfire",
    short: "Wildfires",
    color: "#f2682e",
    cluster: ["#f2682e", "#c74d1a", "#8f360e"],
  },
  severeStorms: {
    id: "severeStorms",
    label: "Severe Storm",
    short: "Storms",
    color: "#6ea3dd",
    cluster: ["#6ea3dd", "#4a7cb8", "#2f5682"],
  },
  volcanoes: {
    id: "volcanoes",
    label: "Volcano",
    short: "Volcanoes",
    color: "#e05a4c",
    cluster: ["#e05a4c", "#b53e32", "#822920"],
  },
  floods: {
    id: "floods",
    label: "Flood",
    short: "Floods",
    color: "#58a6e8",
    cluster: ["#58a6e8", "#3a80bd", "#265a87"],
  },
  landslides: {
    id: "landslides",
    label: "Landslide",
    short: "Landslides",
    color: "#d0a45c",
    cluster: ["#d0a45c", "#a67f3e", "#755a28"],
  },
  seaLakeIce: {
    id: "seaLakeIce",
    label: "Sea/Lake Ice",
    short: "Ice",
    color: "#5cc6de",
    cluster: ["#5cc6de", "#3a9cb4", "#267181"],
  },
  earthquakes: {
    id: "earthquakes",
    label: "Earthquake",
    short: "Earthquakes",
    color: "#e0b44e",
    cluster: ["#e0b44e", "#b58c2e", "#7f6320"],
  },
  [OTHER_CATEGORY]: OTHER_META,
};

export function categoryMeta(id: string): CategoryMeta {
  return CATEGORY_META[id] ?? OTHER_META;
}

export function isPointGeometry(g: Geometry): boolean {
  return g.type === "Point" || g.type === "MultiPoint";
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "24 Aug 2026 · 18:42 UTC" */
export function formatUtcDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

/** "just now" / "12 min ago" / "3 hr ago" / "2 d ago" */
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

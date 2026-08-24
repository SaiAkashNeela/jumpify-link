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
  color: "#6f7780",
  cluster: ["#6f7780", "#535a61", "#373c41"],
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  wildfires: {
    id: "wildfires",
    label: "Wildfire",
    short: "Wildfires",
    color: "#d64f1c",
    cluster: ["#d64f1c", "#a83c12", "#73280a"],
  },
  severeStorms: {
    id: "severeStorms",
    label: "Severe Storm",
    short: "Storms",
    color: "#3f5c7d",
    cluster: ["#3f5c7d", "#2e4459", "#1d2c3b"],
  },
  volcanoes: {
    id: "volcanoes",
    label: "Volcano",
    short: "Volcanoes",
    color: "#b33226",
    cluster: ["#b33226", "#8a251b", "#5c1711"],
  },
  floods: {
    id: "floods",
    label: "Flood",
    short: "Floods",
    color: "#2e6da8",
    cluster: ["#2e6da8", "#22517d", "#163452"],
  },
  landslides: {
    id: "landslides",
    label: "Landslide",
    short: "Landslides",
    color: "#8a6a35",
    cluster: ["#8a6a35", "#665027", "#423219"],
  },
  seaLakeIce: {
    id: "seaLakeIce",
    label: "Sea/Lake Ice",
    short: "Ice",
    color: "#3f9db4",
    cluster: ["#3f9db4", "#2e7688", "#1e4e5a"],
  },
  earthquakes: {
    id: "earthquakes",
    label: "Earthquake",
    short: "Earthquakes",
    color: "#b5892e",
    cluster: ["#b5892e", "#8a6822", "#5c4516"],
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

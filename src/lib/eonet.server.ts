import type { Geometry } from "geojson";
import { CATEGORY_META, categoryMeta, OTHER_CATEGORY, type JumpifyEvent } from "./events";

const EONET_URL =
  "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open&days=1";

const ALLOWED_GEOMETRY_TYPES = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
]);

type EonetFeature = {
  type?: unknown;
  properties?: {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    closed?: unknown;
    date?: unknown;
    magnitudeValue?: unknown;
    magnitudeUnit?: unknown;
    categories?: Array<{ id?: unknown; title?: unknown }>;
    sources?: Array<{ id?: unknown; url?: unknown }>;
  };
  geometry?: { type?: unknown; coordinates?: unknown };
};

function isFiniteNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

function coordinatesAreValid(coords: unknown): boolean {
  if (isFiniteNumberArray(coords)) return coords.length >= 2;
  if (Array.isArray(coords)) return coords.every(coordinatesAreValid);
  return false;
}

/** Recursively collect [lng, lat] positions from any GeoJSON coordinates. */
function collectPositions(coords: unknown, out: [number, number][]): void {
  if (isFiniteNumberArray(coords)) {
    const [lng, lat] = coords;
    if (typeof lng === "number" && typeof lat === "number") {
      out.push([lng, lat]);
    }
    return;
  }
  if (Array.isArray(coords)) {
    for (const c of coords) collectPositions(c, out);
  }
}

function centroidOf(geometry: Geometry): [number, number] {
  const positions: [number, number][] = [];
  collectPositions(
    (geometry as { coordinates?: unknown }).coordinates,
    positions,
  );
  if (positions.length === 0) return [0, 0];
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of positions) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

function normalizeFeature(feature: EonetFeature): JumpifyEvent | null {
  const props = feature.properties;
  const geom = feature.geometry;
  if (!props || typeof props.id !== "string" || !props.id) return null;
  if (typeof props.title !== "string" || !props.title) return null;
  if (
    !geom ||
    typeof geom.type !== "string" ||
    !ALLOWED_GEOMETRY_TYPES.has(geom.type) ||
    !coordinatesAreValid(geom.coordinates)
  ) {
    return null;
  }

  const rawCategory = props.categories?.[0];
  const rawCategoryId =
    typeof rawCategory?.id === "string" ? rawCategory.id : OTHER_CATEGORY;
  const known = Boolean(CATEGORY_META[rawCategoryId]);
  const category = known ? rawCategoryId : OTHER_CATEGORY;
  const categoryTitle = known
    ? typeof rawCategory?.title === "string" && rawCategory.title
      ? rawCategory.title
      : categoryMeta(category).short
    : "Other";

  const source = props.sources?.[0];

  const geometry = {
    type: geom.type,
    coordinates: geom.coordinates,
  } as Geometry;

  return {
    id: props.id,
    title: props.title,
    category,
    categoryTitle,
    geometry,
    centroid: centroidOf(geometry),
    date: typeof props.date === "string" ? props.date : new Date().toISOString(),
    closed: typeof props.closed === "string" ? props.closed : null,
    description:
      typeof props.description === "string" && props.description
        ? props.description
        : null,
    sourceUrl:
      typeof source?.url === "string" && source.url ? source.url : null,
    sourceName:
      typeof source?.id === "string" && source.id ? source.id : null,
    magnitudeValue:
      typeof props.magnitudeValue === "number" &&
      Number.isFinite(props.magnitudeValue)
        ? props.magnitudeValue
        : null,
    magnitudeUnit:
      typeof props.magnitudeUnit === "string" && props.magnitudeUnit
        ? props.magnitudeUnit
        : null,
  };
}

/**
 * Fetch the current open natural events from NASA EONET v3 and normalize them
 * into the JumpifyEvent model. Throws on network failure or unexpected shape —
 * callers should keep serving the previous snapshot in that case.
 */
export async function fetchEonetEvents(): Promise<JumpifyEvent[]> {
  const res = await fetch(EONET_URL, {
    signal: AbortSignal.timeout(12_000),
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`EONET responded with ${res.status}`);
  }
  const json: unknown = await res.json();
  if (
    !json ||
    typeof json !== "object" ||
    (json as { type?: unknown }).type !== "FeatureCollection" ||
    !Array.isArray((json as { features?: unknown }).features)
  ) {
    throw new Error("Unexpected EONET response shape");
  }

  const seen = new Set<string>();
  const events: JumpifyEvent[] = [];
  for (const feature of (json as { features: EonetFeature[] }).features) {
    const event = normalizeFeature(feature);
    if (!event || seen.has(event.id)) continue;
    seen.add(event.id);
    events.push(event);
  }
  return events;
}

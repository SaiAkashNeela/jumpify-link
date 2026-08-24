import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

type CountryFeature = {
  type: "Feature";
  properties: { name?: string };
  geometry: Polygon | MultiPolygon;
};

type CountryCollection = FeatureCollection<Polygon | MultiPolygon, { name?: string }>;

let cache: Promise<CountryFeature[]> | null = null;

/** Fetch + cache the Natural Earth country polygons (also used by the map). */
function loadCountries(): Promise<CountryFeature[]> {
  if (!cache) {
    cache = fetch("/data/countries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`Countries request failed (${res.status})`);
        return res.json() as Promise<CountryCollection>;
      })
      .then((fc) => fc.features as CountryFeature[])
      .catch((err) => {
        cache = null; // allow retry after a failed fetch
        throw err;
      });
  }
  return cache;
}

/** Ray-casting point-in-ring test on [lng, lat] coordinates. */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0] ?? 0;
    const yi = ring[i]?.[1] ?? 0;
    const xj = ring[j]?.[0] ?? 0;
    const yj = ring[j]?.[1] ?? 0;
    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, polygon: number[][][]): boolean {
  const outer = polygon[0];
  if (!outer || !pointInRing(lng, lat, outer)) return false;
  // Exclude holes
  for (let h = 1; h < polygon.length; h++) {
    const hole = polygon[h];
    if (hole && pointInRing(lng, lat, hole)) return false;
  }
  return true;
}

/**
 * Resolve the country containing [lng, lat] from the local Natural Earth
 * dataset. Returns null for open ocean / unmatched points.
 */
export async function findCountryName(
  lng: number,
  lat: number,
): Promise<string | null> {
  const countries = await loadCountries();
  for (const feature of countries) {
    const { geometry, properties } = feature;
    if (geometry.type === "Polygon") {
      if (pointInPolygon(lng, lat, geometry.coordinates)) {
        return properties.name ?? null;
      }
    } else {
      for (const polygon of geometry.coordinates) {
        if (pointInPolygon(lng, lat, polygon)) {
          return properties.name ?? null;
        }
      }
    }
  }
  return null;
}

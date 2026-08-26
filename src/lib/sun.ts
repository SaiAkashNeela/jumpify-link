/** Approximate subsolar point + night-side polygon for the terminator overlay. */

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function subsolarPoint(date = new Date()): { lng: number; lat: number } {
  const jd = julianDay(date);
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lambda =
    (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
  const epsilon = (23.439 - 0.0000004 * n) * (Math.PI / 180);
  const lat = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * (180 / Math.PI);
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const lng = ((ra * 180) / Math.PI - gmst * 15 + 540) % 360 - 180;
  return { lng, lat };
}

export function nightPolygon(date = new Date()): GeoJSON.Feature<GeoJSON.Polygon> {
  const sun = subsolarPoint(date);
  const coords: [number, number][] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 360;
    const p = destination(sun.lat, sun.lng, 90, bearing);
    coords.push([p.lng, p.lat]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

function destination(
  lat: number,
  lng: number,
  distanceDeg: number,
  bearingDeg: number,
): { lat: number; lng: number } {
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const δ = (distanceDeg * Math.PI) / 180;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return { lat: (φ2 * 180) / Math.PI, lng: ((λ2 * 180) / Math.PI + 540) % 360 - 180 };
}

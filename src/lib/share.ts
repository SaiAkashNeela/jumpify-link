import { isMode, type Mode } from "@/lib/events";

export type CameraShare = {
  mode: Mode;
  lng: number;
  lat: number;
  z: number;
};

export function parseShare(search: string): Partial<CameraShare> {
  const params = new URLSearchParams(search);
  const out: Partial<CameraShare> = {};
  if (isMode(params.get("m"))) out.mode = params.get("m") as Mode;
  const lng = Number(params.get("lng"));
  const lat = Number(params.get("lat"));
  const z = Number(params.get("z"));
  if (Number.isFinite(lng) && lng >= -180 && lng <= 180) out.lng = lng;
  if (Number.isFinite(lat) && lat >= -85 && lat <= 85) out.lat = lat;
  if (Number.isFinite(z) && z >= 0 && z <= 12) out.z = z;
  return out;
}

export function writeShare(share: CameraShare): void {
  const params = new URLSearchParams({
    m: share.mode,
    lng: share.lng.toFixed(3),
    lat: share.lat.toFixed(3),
    z: share.z.toFixed(2),
  });
  const next = `?${params.toString()}`;
  if (window.location.search !== next) {
    window.history.replaceState(null, "", next);
  }
}

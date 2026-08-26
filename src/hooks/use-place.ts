import { useEffect, useState } from "react";
import type { PlacePayload } from "@/lib/events";

export function usePlace(lat: number, lng: number): {
  place: PlacePayload | null;
  error: string | null;
} {
  const [place, setPlace] = useState<PlacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setPlace(null);
    setError(null);
    fetch(`/api/place?lat=${lat.toFixed(3)}&lng=${lng.toFixed(3)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("place failed");
        return res.json() as Promise<PlacePayload>;
      })
      .then(setPlace)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Could not load this place.");
      });
    return () => controller.abort();
  }, [lat, lng]);

  return { place, error };
}

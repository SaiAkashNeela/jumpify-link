import { useEffect, useState } from "react";
import { PROJECTION_STORAGE_KEY, type ProjectionChoice } from "@/lib/events";

export function readStoredProjection(): ProjectionChoice {
  if (typeof window === "undefined") return "globe";
  try {
    const v = window.localStorage.getItem(PROJECTION_STORAGE_KEY);
    if (v === "globe" || v === "map") return v;
  } catch {
    /* ignore storage access error */
  }
  return "globe";
}

export function writeStoredProjection(choice: ProjectionChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROJECTION_STORAGE_KEY, choice);
  } catch {
    /* ignore storage access error */
  }
}

export function useProjection(): [ProjectionChoice, (next: ProjectionChoice) => void] {
  const [projection, setProjection] = useState<ProjectionChoice>("globe");

  useEffect(() => {
    setProjection(readStoredProjection());
  }, []);

  const update = (next: ProjectionChoice) => {
    setProjection(next);
    writeStoredProjection(next);
  };

  return [projection, update];
}

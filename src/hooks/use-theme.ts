import { useEffect, useState } from "react";
import type { ThemeChoice } from "@/lib/events";
import { applyTheme, readStoredTheme, writeStoredTheme } from "@/lib/theme";

export function useTheme(): [ThemeChoice, (next: ThemeChoice) => void] {
  const [theme, setTheme] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStoredTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const update = (next: ThemeChoice) => {
    setTheme(next);
    writeStoredTheme(next);
    applyTheme(next);
  };

  return [theme, update];
}

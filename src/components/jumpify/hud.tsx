import { JumpifyMark, JumpifyWordmark } from "@/logo";
import { MODES, MODE_COPY, type Mode, type ProjectionChoice, type ThemeChoice } from "@/lib/events";

type HudProps = {
  mode: Mode;
  onMode: (mode: Mode) => void;
  projection: ProjectionChoice;
  onProjection: (projection: ProjectionChoice) => void;
  onTeleport: () => void;
  theme: ThemeChoice;
  onTheme: (theme: ThemeChoice) => void;
  status: string;
};

const THEMES: ThemeChoice[] = ["system", "light", "dark"];

export function Hud({
  mode,
  onMode,
  projection,
  onProjection,
  onTeleport,
  theme,
  onTheme,
  status,
}: HudProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
      <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="jumpify-hud flex max-w-full items-center gap-2.5 rounded-2xl px-3 py-2">
          <JumpifyMark size={28} />
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <JumpifyWordmark className="text-[17px] font-semibold tracking-tight text-ink" />
              <span className="hidden text-[12px] text-muted sm:inline">.link</span>
            </p>
            <p className="truncate text-[12px] text-muted">{MODE_COPY[mode].line}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Globe mode"
            className="jumpify-hud flex rounded-2xl p-1"
          >
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => onMode(item)}
                className={
                  mode === item
                    ? "h-9 whitespace-nowrap rounded-xl bg-accent px-3 text-[13px] font-medium text-accent-ink transition-colors"
                    : "h-9 whitespace-nowrap rounded-xl px-3 text-[13px] font-medium text-ink transition-colors hover:bg-paper-2"
                }
              >
                {MODE_COPY[item].label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Map projection"
            className="jumpify-hud flex rounded-2xl p-1"
          >
            <button
              type="button"
              aria-pressed={projection === "globe"}
              onClick={() => onProjection("globe")}
              className={
                projection === "globe"
                  ? "h-9 whitespace-nowrap rounded-xl bg-paper-2 px-2.5 text-[12px] font-medium text-ink shadow-xs"
                  : "h-9 whitespace-nowrap rounded-xl px-2.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
              }
              title="3D Globe View"
            >
              🌐 Globe
            </button>
            <button
              type="button"
              aria-pressed={projection === "map"}
              onClick={() => onProjection("map")}
              className={
                projection === "map"
                  ? "h-9 whitespace-nowrap rounded-xl bg-paper-2 px-2.5 text-[12px] font-medium text-ink shadow-xs"
                  : "h-9 whitespace-nowrap rounded-xl px-2.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
              }
              title="2D Flat Map View"
            >
              🗺️ Map
            </button>
          </div>

          <button
            type="button"
            onClick={onTeleport}
            className="jumpify-hud flex h-11 items-center gap-1.5 rounded-2xl px-3 text-[13px] font-medium text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
            title="Teleport to a random wonder on Earth"
          >
            <span aria-hidden="true">🎲</span>
            <span>Jump</span>
          </button>

          <div
            role="group"
            aria-label="Colour theme"
            className="jumpify-hud flex rounded-2xl p-1"
          >
            {THEMES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={theme === item}
                onClick={() => onTheme(item)}
                className={
                  theme === item
                    ? "h-9 whitespace-nowrap rounded-xl bg-paper-2 px-2.5 text-[12px] font-medium capitalize text-ink shadow-xs"
                    : "h-9 whitespace-nowrap rounded-xl px-2.5 text-[12px] font-medium capitalize text-muted transition-colors hover:text-ink"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="pointer-events-none mt-2 hidden text-[11px] tracking-wide text-muted sm:block">
        {status}
      </p>
    </header>
  );
}

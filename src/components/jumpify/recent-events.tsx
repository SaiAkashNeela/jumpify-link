import { categoryMeta, formatRelativeTime, type JumpifyEvent } from "@/lib/events";

type RecentEventsProps = {
  events: JumpifyEvent[];
  selectedId: string | null;
  now: number;
  onFocus: (id: string) => void;
};

/**
 * "Latest" panel — the most recently updated events, desktop only.
 * Clicking an item selects it and flies the map to its location.
 */
export function RecentEvents({
  events,
  selectedId,
  now,
  onFocus,
}: RecentEventsProps) {
  const latest = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (latest.length === 0) return null;

  return (
    <section
      aria-label="Latest events"
      className="absolute top-32 left-4 z-10 hidden w-72 overflow-hidden rounded-lg border border-border bg-background/92 shadow-sm backdrop-blur-sm lg:block"
    >
      <h2 className="border-b border-border px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Latest
      </h2>
      <ul className="divide-y divide-border">
        {latest.map((ev) => {
          const meta = categoryMeta(ev.category);
          const isSelected = ev.id === selectedId;
          return (
            <li key={ev.id}>
              <button
                type="button"
                onClick={() => onFocus(ev.id)}
                className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] leading-snug font-medium">
                    {ev.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {ev.categoryTitle} · {formatRelativeTime(ev.date, now)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

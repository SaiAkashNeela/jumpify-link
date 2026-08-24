import { ExternalLink, X } from "lucide-react";
import {
  categoryMeta,
  formatUtcDateTime,
  type JumpifyEvent,
} from "@/lib/events";

type EventPanelProps = {
  event: JumpifyEvent;
  onClose: () => void;
};

/**
 * Selected-event details. Bottom sheet on mobile, floating card on desktop.
 * Only renders fields that actually exist on the event.
 */
export function EventPanel({ event, onClose }: EventPanelProps) {
  const meta = categoryMeta(event.category);

  return (
    <aside
      role="dialog"
      aria-label={`Event details: ${event.title}`}
      className="absolute inset-x-0 bottom-0 z-30 max-h-[58dvh] overflow-y-auto rounded-t-xl border border-border bg-card shadow-lg sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-32 sm:w-85 sm:max-h-[calc(100dvh-10rem)] sm:rounded-lg"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            {event.categoryTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="-mr-1 -mt-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 className="mt-1.5 text-base leading-snug font-semibold text-balance">
          {event.title}
        </h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Started
            </dt>
            <dd className="mt-0.5 font-mono text-[13px]">
              {formatUtcDateTime(event.date)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Status
            </dt>
            <dd className="mt-0.5">{event.closed ? "Closed" : "Active"}</dd>
          </div>
          {event.magnitudeValue !== null && (
            <div>
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Magnitude
              </dt>
              <dd className="mt-0.5 font-mono text-[13px]">
                {event.magnitudeValue.toLocaleString()}
                {event.magnitudeUnit ? ` ${event.magnitudeUnit}` : ""}
              </dd>
            </div>
          )}
        </dl>

        {event.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            View source{event.sourceName ? ` (${event.sourceName})` : ""}
            <ExternalLink className="size-3.5" />
          </a>
        )}

        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
          Natural event data: NASA EONET
        </p>
      </div>
    </aside>
  );
}

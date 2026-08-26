import type { ReactNode } from "react";

type InspectorProps = {
  title: string;
  kicker: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Inspector({ title, kicker, onClose, children, footer }: InspectorProps) {
  return (
    <aside
      aria-label={title}
      className="jumpify-hud absolute inset-x-0 bottom-0 z-30 max-h-[58dvh] overflow-y-auto rounded-t-2xl sm:inset-x-auto sm:right-4 sm:bottom-8 sm:top-auto sm:w-80 sm:max-h-[min(70dvh,34rem)] sm:rounded-2xl"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-rule sm:hidden" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">{kicker}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="-mr-1 -mt-1 flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink"
          >
            ×
          </button>
        </div>
        <h2 className="mt-1 text-base leading-snug font-semibold text-balance">{title}</h2>
        <div className="mt-3 space-y-3 text-sm">{children}</div>
        {footer ? <div className="mt-4 border-t border-rule pt-3 text-[11px] text-muted">{footer}</div> : null}
      </div>
    </aside>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-0.5 tabular">{value}</p>
    </div>
  );
}

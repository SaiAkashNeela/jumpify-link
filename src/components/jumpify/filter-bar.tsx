import { categoryMeta } from "@/lib/events";

const CATEGORY_ORDER = [
  "wildfires",
  "severeStorms",
  "volcanoes",
  "floods",
  "landslides",
  "seaLakeIce",
  "earthquakes",
  "other",
];

type FilterBarProps = {
  /** Category ids present in the current dataset. */
  categories: string[];
  counts: Record<string, number>;
  total: number;
  active: string;
  onChange: (category: string) => void;
};

/**
 * Horizontally scrollable category filter chips. Filtering is fully local —
 * it never triggers a new network request.
 */
export function FilterBar({
  categories,
  counts,
  total,
  active,
  onChange,
}: FilterBarProps) {
  const ordered = [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div
      role="group"
      aria-label="Filter events by category"
      className="flex gap-1.5 overflow-x-auto px-3 pt-0 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
    >
      <FilterChip
        label="All"
        count={total}
        active={active === "all"}
        onClick={() => onChange("all")}
      />
      {ordered.map((cat) => {
        const meta = categoryMeta(cat);
        return (
          <FilterChip
            key={cat}
            label={meta.short}
            count={counts[cat] ?? 0}
            color={meta.color}
            active={active === cat}
            onClick={() => onChange(cat)}
          />
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 text-xs font-medium whitespace-nowrap text-primary-foreground"
          : "flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent"
      }
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
      <span
        className={
          active
            ? "font-mono text-[10px] text-primary-foreground/70"
            : "font-mono text-[10px] text-muted-foreground"
        }
      >
        {count}
      </span>
    </button>
  );
}

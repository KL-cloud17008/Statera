import { cn } from "@/lib/utils";

export function PeriodToggle<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill border border-rule bg-sunken p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              /* Was bare `font-mono`, which gave mono glyphs but proportional
                 figures — `.num` is the one expression of that intent. */
              "num min-h-8 rounded-pill px-3 text-label uppercase",
              "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              /* The active chip is ink with paper text. The previous pairing
                 was bg-primary/text-primary-foreground, and since
                 primary-foreground has no mapping in the theme it inherited
                 body colour — near-black on near-black, 1.00:1. */
              active
                ? "bg-ink text-on-ink"
                : "text-secondary hover:text-primary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

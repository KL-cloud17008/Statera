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
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-focus",
              active
                ? "bg-card text-foreground shadow-[0_8px_20px_rgba(2,8,23,0.16)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

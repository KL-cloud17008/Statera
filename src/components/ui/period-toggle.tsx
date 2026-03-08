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
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)]",
              active
                ? "bg-card text-foreground shadow-[0_10px_24px_rgba(2,8,23,0.18)]"
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

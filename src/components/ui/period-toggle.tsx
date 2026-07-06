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
        "inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] bg-[var(--basalt-1)] p-1",
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
              "min-h-10 rounded-full px-3 py-2 font-mono text-xs font-medium uppercase tracking-[0.12em] transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)]",
              active
                ? "bg-primary text-primary-foreground"
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

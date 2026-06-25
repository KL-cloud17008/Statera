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
        "inline-flex items-center gap-1 rounded-full border border-[rgba(7,17,31,0.1)] bg-white/58 p-1 shadow-[var(--shadow-soft)] backdrop-blur-md",
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
                ? "bg-[linear-gradient(180deg,#15243a,#08111f)] text-primary-foreground shadow-[var(--shadow-command)]"
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

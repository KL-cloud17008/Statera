import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A single figure on the canvas. The ledger has no card grid, so this is a
 * label/value/hint stack separated by rules like everything else — the same
 * shape as `Figure` in ui/ledger, with room for an icon and an accent strip.
 *
 * Nothing renders this today; `Figure` is what the converted routes use.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  className,
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label uppercase text-tertiary">{label}</p>
          <div className="num num-left mt-1.5 text-data-lg font-medium leading-none text-primary">
            {value}
          </div>
        </div>
        {icon ? <div className="mt-0.5 shrink-0 text-faint">{icon}</div> : null}
      </div>
      {hint ? <p className="mt-1.5 text-caption text-tertiary">{hint}</p> : null}
      {children}
      {accent ? <div className="mt-3 h-0.5">{accent}</div> : null}
    </div>
  );
}

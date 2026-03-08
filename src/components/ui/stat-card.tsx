import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">
              {label}
            </p>
            <div className="mt-3 text-[clamp(2rem,1.55rem+1vw,2.7rem)] font-semibold tracking-tight text-foreground data-number">
              {value}
            </div>
          </div>
          {icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="supporting-copy">{hint}</p> : null}
        {children}
        {accent ? <div className="absolute inset-x-0 bottom-0 h-1">{accent}</div> : null}
      </CardContent>
    </Card>
  );
}

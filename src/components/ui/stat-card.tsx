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
          <div className="space-y-3">
            <p className="eyebrow">{label}</p>
            <div className="text-4xl font-semibold tracking-normal text-foreground data-number sm:text-5xl">
              {value}
            </div>
          </div>
          {icon ? <div className="duna-mark-surface mt-1 flex size-10 items-center justify-center rounded-full text-muted-foreground">{icon}</div> : null}
        </div>
        {hint ? <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p> : null}
        {children}
        {accent ? <div className="absolute inset-x-0 bottom-0 h-1">{accent}</div> : null}
      </CardContent>
    </Card>
  );
}

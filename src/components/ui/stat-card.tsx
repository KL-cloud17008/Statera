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
            <div className="text-[clamp(2.2rem,1.8rem+1.2vw,3.2rem)] font-semibold tracking-[-0.06em] text-foreground data-number">
              {value}
            </div>
          </div>
          {icon ? <div className="mt-1 text-muted-foreground">{icon}</div> : null}
        </div>
        {hint ? <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p> : null}
        {children}
        {accent ? <div className="absolute inset-x-0 bottom-0 h-1">{accent}</div> : null}
      </CardContent>
    </Card>
  );
}

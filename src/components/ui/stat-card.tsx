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
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground data-number">
              {value}
            </div>
          </div>
          {icon ? (
            <div className="icon-container icon-container-primary">
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        {children}
        {accent ? <div className="absolute inset-x-0 bottom-0 h-1">{accent}</div> : null}
      </CardContent>
    </Card>
  );
}

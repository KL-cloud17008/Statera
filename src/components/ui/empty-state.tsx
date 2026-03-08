import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border-t border-border/70 py-8 text-left",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/8 bg-white/[0.03] text-foreground/82">
        <Icon className="h-[1.125rem] w-[1.125rem]" />
      </div>
      <h3 className="text-lg font-semibold tracking-[-0.04em] text-foreground">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

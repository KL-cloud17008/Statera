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
        "editorial-panel focus-surface flex flex-col items-center rounded-[1.75rem] border border-dashed px-6 py-10 text-center sm:px-8 sm:py-12",
        className
      )}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Icon className="h-6 w-6" />
      </div>
      <p className="eyebrow">Nothing here yet</p>
      <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 max-w-md supporting-copy">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

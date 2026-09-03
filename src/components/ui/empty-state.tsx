import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The absence of records, stated on the canvas. It is not a panel — a dashed
 * box would be the only floating container in the ledger. The rule above it
 * is the same device that separates every other section.
 */
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
    <div className={cn("flex flex-col items-start gap-2 border-l-2 border-accent bg-sunken px-5 py-6", className)}>
      {/* Decorative: the title carries the meaning, so this takes the faint
          tone that is WCAG-exempt for non-text. */}
      <Icon aria-hidden className="size-5 text-accent" strokeWidth={1.5} />
      <p className="text-body font-medium text-primary">{title}</p>
      <p className="max-w-md text-row text-tertiary">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

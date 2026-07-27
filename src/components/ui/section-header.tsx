import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The page masthead. One focal point: eyebrow, title, optional lead, and at
 * most one primary action supplied by the caller.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          {eyebrow ? (
            <p className="text-label uppercase text-tertiary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2">{title}</h1>
          {description ? (
            <p className="mt-2 text-body text-secondary">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </header>
  );
}

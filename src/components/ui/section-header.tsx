import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <section className={cn("page-hero", className)}>
      <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl space-y-4">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <div className="space-y-3">
            <h1>{title}</h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="pt-2">{children}</div> : null}
        </div>
        {action ? <div className="relative z-10 shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

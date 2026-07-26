"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Every chart in the product sits in this frame: title row, optional range
 * control, a fixed-height plot area, and an optional footnote. Charts read as
 * ink on the card; the accent marks only the series under focus.
 *
 * `emptyLabel` renders instead of the plot when there is nothing to draw, so
 * no chart surface can ship without an empty state.
 */
export function ChartShell({
  title,
  description,
  action,
  children,
  footnote,
  isEmpty = false,
  emptyLabel = "No data yet",
  height = "h-64",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  footnote?: ReactNode;
  isEmpty?: boolean;
  emptyLabel?: string;
  height?: string;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-panel border border-rule bg-raised", className)}
      aria-label={title}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-body text-primary">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-caption text-tertiary">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div className={cn("px-2 pt-4", height)}>
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-control bg-sunken">
            <p className="text-caption text-tertiary">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>

      {footnote ? (
        <div className="border-t border-rule px-5 py-3 text-caption text-tertiary">
          {footnote}
        </div>
      ) : null}
    </section>
  );
}

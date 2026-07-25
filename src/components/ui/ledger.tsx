import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The ledger grammar. These components replace the card grid: content sits
 * directly on the continuous canvas and is separated by hairline rules.
 * Nothing here draws a floating panel.
 */

/** A page section. Consecutive sections are separated by a rule (see globals). */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ledger-section", className)}>
      {title || action ? (
        <div className="mb-3 flex items-baseline justify-between gap-4">
          {title ? <h2>{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** A run of ledger rows, hairline-separated. `columns` is a grid template. */
export function Rows({
  columns,
  head,
  children,
  className,
}: {
  columns: string;
  head?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {head ? (
        <div className="ledger-head" style={{ gridTemplateColumns: columns }}>
          {head}
        </div>
      ) : null}
      <div className="ledger-rows">{children}</div>
    </div>
  );
}

/** One record. Cells are supplied by the caller and align to `columns`. */
export function Row({
  columns,
  interactive = false,
  children,
  className,
}: {
  columns: string;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("ledger-row", interactive && "ledger-row-interactive", className)}
      style={{ gridTemplateColumns: columns }}
    >
      {children}
    </div>
  );
}

/** A right-aligned tabular numeral — the default for every figure in a row. */
export function Num({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "copper" | "positive";
  className?: string;
}) {
  const toneClass =
    tone === "copper"
      ? "text-copper"
      : tone === "positive"
        ? "text-positive"
        : tone === "secondary"
          ? "text-secondary"
          : "text-primary";
  return <span className={cn("num", toneClass, className)}>{children}</span>;
}

/**
 * A summary figure printed directly on the canvas — label above, tabular
 * value below. Used in the summary strip, never wrapped in its own panel.
 */
export function Figure({
  label,
  value,
  detail,
  tone = "primary",
  size = "md",
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "primary" | "copper" | "positive";
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const valueSize =
    size === "xl" ? "text-data-xl" : size === "lg" ? "text-data-lg" : "text-data-md";
  const toneClass =
    tone === "copper" ? "text-copper" : tone === "positive" ? "text-positive" : "text-primary";

  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-label uppercase text-tertiary">{label}</dt>
      <dd
        className={cn(
          "num num-left mt-1.5 font-medium leading-none",
          valueSize,
          toneClass
        )}
      >
        {value}
      </dd>
      {detail ? <p className="mt-1.5 text-caption text-tertiary">{detail}</p> : null}
    </div>
  );
}

/** The page masthead: the one large title per screen. */
export function PageTitle({
  eyebrow,
  title,
  lead,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="text-label uppercase text-tertiary">{eyebrow}</p> : null}
        <h1 className="mt-2">{title}</h1>
        {lead ? <p className="mt-2 text-body-lg text-secondary">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** A one-line notice for the sanctioned attention states. Not a card. */
export function Notice({
  tone = "copper",
  children,
  className,
}: {
  tone?: "copper" | "critical" | "positive";
  children: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === "critical"
      ? "border-critical-line bg-critical-surface text-critical"
      : tone === "positive"
        ? "border-positive-line bg-positive-surface text-positive"
        : "border-copper-line bg-copper-surface text-copper";

  return (
    <p
      className={cn(
        "rounded-control border-l-2 px-3 py-2 text-row",
        toneClass,
        className
      )}
    >
      {children}
    </p>
  );
}

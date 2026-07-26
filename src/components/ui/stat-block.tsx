import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatTone = "neutral" | "attention" | "positive";

const toneClass: Record<StatTone, string> = {
  neutral: "text-primary",
  attention: "text-ember",
  positive: "text-accent",
};

/**
 * The single way a figure is presented anywhere in the ledger:
 * micro label → tabular value → optional caption.
 *
 * `label` is the accessible name for the value; it is never removed. `tone`
 * is reserved for sanctioned coaching states (pain gating, at-risk streak,
 * pace guardrail, goal-met) — not for emphasis.
 */
export function StatBlock({
  label,
  value,
  caption,
  tone = "neutral",
  size = "md",
  icon,
  action,
  className,
}: {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  tone?: StatTone;
  size?: "md" | "lg" | "xl";
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const valueSize =
    size === "xl" ? "text-data-xl" : size === "lg" ? "text-data-lg" : "text-data-md";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-label uppercase text-tertiary">{label}</span>
        {icon ? <span className="text-tertiary">{icon}</span> : null}
      </div>
      <span className={cn("tabular font-medium leading-none", valueSize, toneClass[tone])}>
        {value}
      </span>
      {caption ? <span className="text-caption text-tertiary">{caption}</span> : null}
      {action}
    </div>
  );
}

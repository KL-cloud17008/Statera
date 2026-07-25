"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildMonthlyHeatmap, type SerializedStepsEntry } from "@/lib/steps";

function formatCellSteps(steps: number) {
  if (steps <= 0) {
    return "—";
  }
  if (steps >= 10000) {
    return `${Math.round(steps / 1000)}k`;
  }
  return `${Math.round(steps / 100) / 10}k`;
}

function getHeatLevel(steps: number, goal: number) {
  const ratio = goal > 0 ? steps / goal : 0;
  if (ratio >= 1) return "bg-[linear-gradient(180deg,var(--sky-accent),var(--electric-blue))] text-[#07111f] border-transparent";
  if (ratio >= 0.75) return "bg-[rgba(112,199,255,0.22)] text-foreground border-[rgba(79,124,255,0.32)]";
  if (ratio >= 0.5) return "bg-[rgba(112,199,255,0.12)] text-foreground border-[var(--hairline)]";
  if (ratio > 0) return "bg-[var(--veil-1)] text-muted-foreground border-[var(--hairline)]";
  return "bg-transparent text-muted-foreground/60 border-[var(--hairline)]";
}

export function StepsHeatmap({
  entries,
  goal,
}: {
  entries: SerializedStepsEntry[];
  goal: number;
}) {
  const [monthDate, setMonthDate] = useState(() => new Date());

  const days = useMemo(() => buildMonthlyHeatmap(entries, monthDate), [entries, monthDate]);
  const startWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Monthly heatmap</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startWeekday }).map((_, index) => (
            <div key={`pad-${index}`} className="h-14 rounded-[var(--radius-tight)] border border-transparent" />
          ))}
          {days.map((day) => (
            <div
              key={day.date}
              className={`flex h-14 min-w-0 flex-col justify-between overflow-hidden rounded-[var(--radius-tight)] border px-1.5 py-1.5 ${getHeatLevel(day.steps, goal)}`}
              title={`${day.date}: ${day.steps.toLocaleString()} steps`}
            >
              <span className="text-[11px] leading-none">{day.day}</span>
              <span className="data-number whitespace-nowrap text-[10px] leading-none">
                {formatCellSteps(day.steps)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

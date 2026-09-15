"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildMonthlyHeatmap, type SerializedStepsEntry } from "@/lib/steps";
import { getTodayDateString, parseDate } from "@/lib/dates";

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
  if (ratio >= 1) return "bg-accent text-on-accent border-transparent";
  if (ratio >= 0.75) return "bg-accent-subtle text-primary border-accent-line";
  if (ratio >= 0.5) return "bg-accent-subtle text-primary border-rule";
  if (ratio > 0) return "bg-sunken text-tertiary border-rule";
  /* Tertiary, not faint: the day number and dash are content, and faint is
     2.31:1 against the cell. */
  return "bg-transparent text-tertiary border-rule";
}

export function StepsHeatmap({
  entries,
  goal,
  timezone,
}: {
  entries: SerializedStepsEntry[];
  goal: number;
  timezone?: string;
}) {
  const today = getTodayDateString(timezone);
  const [monthDate, setMonthDate] = useState(() => parseDate(today));

  const days = useMemo(() => buildMonthlyHeatmap(entries, monthDate), [entries, monthDate]);
  const startWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();

  return (
    <div>
      {/* No card: the calendar sits on the canvas under the section rule. */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-row font-medium text-primary">
          {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11"
            onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11"
            disabled={monthDate.getFullYear() === Number(today.slice(0, 4)) && monthDate.getMonth() === Number(today.slice(5, 7)) - 1}
            onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-label text-secondary">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5" aria-label="Monthly step goal heatmap">
        {Array.from({ length: startWeekday }).map((_, index) => (
          <div key={`pad-${index}`} className="aspect-square rounded-control border border-transparent" />
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            className={`flex min-h-14 min-w-0 flex-col justify-between overflow-hidden rounded-control border p-1.5 sm:min-h-20 ${getHeatLevel(day.steps, goal)}`}
            title={`${day.date}: ${day.steps.toLocaleString()} steps`}
          >
            {/* Day-of-month in a fixed grid — the column only reads as a grid
                if the figures are the same width. */}
            <span className="num text-xs leading-none sm:text-sm">{day.day}</span>
            <span className="num num-left whitespace-nowrap text-xs leading-none sm:text-sm">
              {formatCellSteps(day.steps)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-tertiary">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-sunken" /> Some movement</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent-subtle border border-accent-line" /> Near goal</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent" /> Goal met</span>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMonthlyHeatmap, type SerializedStepsEntry } from "@/lib/steps";

function getHeatLevel(steps: number, goal: number) {
  const ratio = goal > 0 ? steps / goal : 0;
  if (ratio >= 1) return "bg-primary/90 text-primary-foreground border-primary/60";
  if (ratio >= 0.75) return "bg-primary/38 text-foreground border-primary/30";
  if (ratio >= 0.5) return "bg-secondary/55 text-foreground border-secondary/25";
  if (ratio > 0) return "bg-muted/85 text-muted-foreground border-border";
  return "bg-transparent text-muted-foreground/60 border-border/60";
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
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Monthly View</p>
            <CardTitle className="mt-2">Movement heatmap</CardTitle>
            <p className="mt-3 supporting-copy">
              Scan for empty patches or clusters of green to see how consistent the month really was.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() =>
                setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <p className="min-w-32 text-center text-sm text-muted-foreground">
              {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() =>
                setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startWeekday }).map((_, index) => (
            <div key={`pad-${index}`} className="h-14 rounded-[1.1rem] border border-transparent" />
          ))}
          {days.map((day) => {
            const isToday = day.date === today;
            return (
              <div
                key={day.date}
                className={`flex h-14 flex-col justify-between rounded-[1.1rem] border px-2.5 py-2 text-xs ${getHeatLevel(day.steps, goal)} ${isToday ? "ring-1 ring-primary/35 ring-offset-0" : ""}`}
                title={`${day.date}: ${day.steps.toLocaleString()} steps`}
              >
                <span className="font-medium">{day.day}</span>
                <span className="data-number text-[11px]">
                  {day.steps > 0 ? Math.round(day.steps / 100) / 10 : "-"}k
                </span>
              </div>
            );
          })}
        </div>

        <div className="section-rule" />

        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <LegendPill label="0" className="bg-transparent border-border/60" />
          <LegendPill label="50%" className="bg-muted/85 border-border" />
          <LegendPill label="75%" className="bg-secondary/55 border-secondary/25" />
          <LegendPill label="Goal" className="bg-primary/90 border-primary/60 text-primary-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 ${className}`}>
      {label}
    </span>
  );
}

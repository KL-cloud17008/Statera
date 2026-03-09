"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildMonthlyHeatmap, type SerializedStepsEntry } from "@/lib/steps";

function getHeatLevel(steps: number, goal: number) {
  const ratio = goal > 0 ? steps / goal : 0;
  if (ratio >= 1) return "bg-primary/90 text-primary-foreground border-primary/50";
  if (ratio >= 0.75) return "bg-primary/35 text-foreground border-primary/30";
  if (ratio >= 0.5) return "bg-secondary/50 text-foreground border-secondary/25";
  if (ratio > 0) return "bg-muted text-muted-foreground border-border";
  return "bg-transparent text-muted-foreground/50 border-border/50";
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
          <CardTitle>Monthly Heatmap</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <p className="min-w-[8rem] text-center text-sm text-muted-foreground">
              {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startWeekday }).map((_, index) => (
            <div key={`pad-${index}`} className="h-12 rounded-xl border border-transparent" />
          ))}
          {days.map((day) => (
            <div
              key={day.date}
              className={cn(
                "flex h-12 flex-col justify-between rounded-xl border px-1.5 py-1.5 text-xs transition-opacity hover:opacity-80",
                getHeatLevel(day.steps, goal)
              )}
              title={`${day.date}: ${day.steps.toLocaleString()} steps`}
            >
              <span className="text-[11px] leading-none">{day.day}</span>
              <span className="data-number text-[10px] leading-none">
                {day.steps > 0 ? `${(Math.round(day.steps / 100) / 10).toFixed(1)}k` : "\u2013"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildDailyStepsData,
  buildMonthlyAggregateData,
  buildWeeklyAggregateData,
  type SerializedStepsEntry,
} from "@/lib/steps";

type StepsView = "daily" | "weekly" | "monthly";

export function StepsChart({
  entries,
  goal,
  timezone,
}: {
  entries: SerializedStepsEntry[];
  goal: number;
  timezone?: string;
}) {
  const [view, setView] = useState<StepsView>("daily");

  const daily = useMemo(() => buildDailyStepsData(entries, 7, timezone), [entries, timezone]);
  const weekly = useMemo(() => buildWeeklyAggregateData(entries), [entries]);
  const monthly = useMemo(() => buildMonthlyAggregateData(entries), [entries]);

  const config = view === "daily"
    ? { data: daily, xKey: "label", barKey: "steps", reference: goal }
    : view === "weekly"
      ? { data: weekly, xKey: "key", barKey: "steps", reference: null }
      : { data: monthly, xKey: "label", barKey: "steps", reference: null };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Step Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No steps logged yet. Add an entry to unlock trend charts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-foreground">Step Trends</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant={view === "daily" ? "default" : "outline"} size="sm" onClick={() => setView("daily")}>7D</Button>
            <Button type="button" variant={view === "weekly" ? "default" : "outline"} size="sm" onClick={() => setView("weekly")}>Weekly</Button>
            <Button type="button" variant={view === "monthly" ? "default" : "outline"} size="sm" onClick={() => setView("monthly")}>Monthly</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Steps"]}
              />
              {typeof config.reference === "number" ? (
                <ReferenceLine y={config.reference} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
              ) : null}
              <Bar dataKey={config.barKey} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

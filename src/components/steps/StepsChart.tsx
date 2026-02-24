"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function StepsChart({ entries }: { entries: StepsEntry[] }) {
  const chartData = useMemo(() => {
    // Build last 7 days
    const days: { date: string; label: string; steps: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const entry = entries.find((e) => e.date === dateStr);
      days.push({
        date: dateStr,
        label,
        steps: entry?.steps ?? 0,
      });
    }

    return days;
  }, [entries]);

  const avg = useMemo(() => {
    const logged = chartData.filter((d) => d.steps > 0);
    if (logged.length === 0) return 0;
    return Math.round(logged.reduce((s, d) => s + d.steps, 0) / logged.length);
  }, [chartData]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Weekly Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No steps logged yet. Start logging to see your chart!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Weekly Steps</CardTitle>
          {avg > 0 && (
            <span className="text-xs text-muted-foreground">
              Avg: {avg.toLocaleString()} steps
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value) => [
                  Number(value).toLocaleString(),
                  "Steps",
                ]}
              />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                />
              )}
              <Bar
                dataKey="steps"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

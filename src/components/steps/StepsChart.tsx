"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PeriodToggle } from "@/components/ui/period-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
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

  const daily = useMemo(
    () => buildDailyStepsData(entries, 7, timezone),
    [entries, timezone]
  );
  const weekly = useMemo(() => buildWeeklyAggregateData(entries), [entries]);
  const monthly = useMemo(() => buildMonthlyAggregateData(entries), [entries]);

  const config =
    view === "daily"
      ? { data: daily, xKey: "label", barKey: "steps", reference: goal }
      : view === "weekly"
        ? { data: weekly, xKey: "key", barKey: "steps", reference: null }
        : { data: monthly, xKey: "label", barKey: "steps", reference: null };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No step trends yet"
        description="Log a few days and trend views will unlock."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Movement Trends</p>
          <CardTitle className="mt-2">Daily, weekly, monthly</CardTitle>
        </div>
        <PeriodToggle
          value={view}
          onChange={setView}
          options={[
            { label: "7D", value: "daily" },
            { label: "Week", value: "weekly" },
            { label: "Month", value: "monthly" },
          ]}
        />
      </CardHeader>
      <CardContent>
        <div className="chart-frame h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={config.data} margin={{ top: 12, right: 10, left: -18, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.45} />
              <XAxis
                dataKey={config.xKey}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={{ stroke: "var(--color-border)" }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                cursor={{ fill: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "1rem",
                  boxShadow: "var(--shadow-soft)",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Steps"]}
              />
              {typeof config.reference === "number" ? (
                <ReferenceLine y={config.reference} stroke="var(--color-chart-2)" strokeDasharray="6 4" />
              ) : null}
              <Bar dataKey={config.barKey} radius={[10, 10, 4, 4]} animationDuration={650}>
                {config.data.map((point, index) => {
                  const isToday = "isToday" in point && point.isToday;
                  return (
                    <Cell
                      key={`${point[config.xKey as keyof typeof point]}-${index}`}
                      fill={isToday ? "var(--color-chart-2)" : "var(--color-chart-1)"}
                      opacity={isToday ? 1 : 0.86}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

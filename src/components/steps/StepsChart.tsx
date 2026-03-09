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
import {
  CHART_TOOLTIP_STYLE,
  CHART_CURSOR_STYLE,
  CHART_AXIS_TICK,
  CHART_AXIS_LINE,
  CHART_GRID_PROPS,
} from "@/lib/chart-theme";

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
        description="Log a few days of movement and the weekly and monthly charts will populate automatically."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Movement Trends</p>
          <CardTitle className="mt-2">Daily, weekly, and monthly totals</CardTitle>
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
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={config.data} margin={{ top: 12, right: 10, left: -18, bottom: 8 }}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis
                dataKey={config.xKey}
                tick={CHART_AXIS_TICK}
                axisLine={CHART_AXIS_LINE}
                tickLine={CHART_AXIS_LINE}
              />
              <YAxis
                tick={CHART_AXIS_TICK}
                axisLine={CHART_AXIS_LINE}
                tickLine={CHART_AXIS_LINE}
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                cursor={CHART_CURSOR_STYLE}
                contentStyle={CHART_TOOLTIP_STYLE}
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

"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { buildChartData, type SerializedWeightEntry } from "@/lib/weight";
import { formatBodyweightWithConversions } from "@/lib/units";

export function DashboardWeightChart({
  entries,
}: {
  entries: SerializedWeightEntry[];
}) {
  const chartData = useMemo(() => {
    const all = buildChartData(entries);
    // Show last 30 days on dashboard
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return all.filter((p) => p.date >= cutoffStr);
  }, [entries]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-panel border border-rule bg-sunken">
        <span className="text-sm text-muted-foreground">
          No weight data yet
        </span>
      </div>
    );
  }

  const weights = chartData
    .map((p) => p.weight)
    .filter((w): w is number => w != null);
  const avgs = chartData
    .map((p) => p.avg7)
    .filter((a): a is number => a != null);
  const allValues = [...weights, ...avgs];
  const minY =
    allValues.length > 0 ? Math.floor(Math.min(...allValues) - 2) : 300;
  const maxY =
    allValues.length > 0 ? Math.ceil(Math.max(...allValues) + 2) : 340;

  return (
    <ResponsiveContainer width="100%" height={192} minWidth={0}>
      <ComposedChart
        data={chartData}
        margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          opacity={0.5}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const [y, m, d] = v.split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          domain={[minY, maxY]}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            fontSize: "0.75rem",
            boxShadow: "var(--shadow-overlay)",
          }}
          labelFormatter={(label) => {
            const [y, m, d] = String(label).split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
          formatter={(value, name) => [
            formatBodyweightWithConversions(Number(value)),
            name === "weight" ? "Weight" : "7-Day Avg",
          ]}
        />
        <Scatter
          dataKey="weight"
          fill="var(--color-chart-1)"
          opacity={0.8}
          r={2.5}
        />
        <Line
          dataKey="avg7"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          type="monotone"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

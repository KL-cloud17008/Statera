"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeGoalTargetDate } from "@/lib/app-settings";
import {
  buildChartData,
  computeRequiredWeeklyLossPace,
  type SerializedWeightEntry,
} from "@/lib/weight";

type ZoomRange = "1W" | "1M" | "3M" | "ALL";

type WeightChartPoint = {
  date: string;
  weight: number | null;
  avg7: number | null;
  displayWeight: number | null;
  displayAvg7: number | null;
  projection: number | null;
};

type TargetDateSummary = {
  targetDate: string;
  requiredPace: number | null;
};

export function WeightChart({
  entries,
  goalWeight,
}: {
  entries: SerializedWeightEntry[];
  goalWeight: number | null;
}) {
  const { settings } = useAppSettings();
  const [zoom, setZoom] = useState<ZoomRange>("1M");

  const allChartData = useMemo(() => buildChartData(entries), [entries]);
  const targetDate = normalizeGoalTargetDate(settings.weightGoalTargetDate);
  // On short windows the far-off goal would crush the Y-axis and flatten real
  // progress; scale to visible data and annotate the goal instead.
  const showFullGoal = zoom === "3M" || zoom === "ALL";

  const targetSummary = useMemo<TargetDateSummary | null>(() => {
    if (!targetDate) {
      return null;
    }

    const lastPoint = allChartData[allChartData.length - 1];
    const currentWeight = lastPoint?.weight ?? lastPoint?.avg7 ?? null;
    return {
      targetDate,
      requiredPace: lastPoint
        ? computeRequiredWeeklyLossPace(currentWeight, goalWeight, lastPoint.date, targetDate)
        : null,
    };
  }, [allChartData, goalWeight, targetDate]);

  const filteredData = useMemo(() => {
    if (zoom === "ALL" || allChartData.length === 0) {
      return allChartData;
    }

    const now = new Date();
    const cutoff = new Date(now);
    if (zoom === "1W") {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (zoom === "1M") {
      cutoff.setMonth(cutoff.getMonth() - 1);
    } else if (zoom === "3M") {
      cutoff.setMonth(cutoff.getMonth() - 3);
    }

    const cutoffStr = cutoff.toISOString().split("T")[0];
    return allChartData.filter((point) => point.date >= cutoffStr);
  }, [allChartData, zoom]);

  const chartData = useMemo<WeightChartPoint[]>(() => {
    const transformed: WeightChartPoint[] = filteredData.map((point) => ({
      ...point,
      displayWeight: point.weight,
      displayAvg7: point.avg7,
      projection: null,
    }));

    if (
      !showFullGoal ||
      !targetDate ||
      goalWeight == null ||
      transformed.length === 0
    ) {
      return transformed;
    }

    const lastPoint = transformed[transformed.length - 1];
    const currentWeight = lastPoint.displayWeight;
    const targetWeight = goalWeight;
    if (currentWeight == null) {
      return transformed;
    }

    const hasTarget = transformed.some(
      (point) => point.date === targetDate
    );
    const base = transformed.map((point) => ({
      ...point,
      projection: point.date === lastPoint.date ? currentWeight : null,
    }));

    if (hasTarget) {
      return base.map((point) => ({
        ...point,
        projection:
          point.date === lastPoint.date
            ? currentWeight
            : point.date === targetDate
              ? targetWeight
              : point.projection,
      }));
    }

    return [
      ...base,
      {
        date: targetDate,
        weight: null,
        avg7: null,
        displayWeight: null,
        displayAvg7: null,
        projection: targetWeight,
      },
    ].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData, goalWeight, showFullGoal, targetDate]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Weight trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="warm-empty-panel flex h-48 items-center justify-center rounded-[var(--radius-card)]">
            <span className="text-muted-foreground">
              Add weight entries to see your trend
            </span>
          </div>
          <TargetDateNote summary={targetSummary} />
        </CardContent>
      </Card>
    );
  }

  const values = chartData.flatMap((point) =>
    [point.displayWeight, point.displayAvg7, point.projection].filter(
      (value): value is number => value != null
    )
  );
  const minY = values.length > 0 ? Math.floor(Math.min(...values) - 2) : 0;
  const maxY = values.length > 0 ? Math.ceil(Math.max(...values) + 2) : 10;
  const goalLine = goalWeight;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-foreground">Trend and goal line</CardTitle>
          <div className="flex gap-1">
            {(["1W", "1M", "3M", "ALL"] as const).map((range) => (
              <Button
                key={range}
                variant={zoom === range ? "default" : "ghost"}
                size="sm"
                type="button"
                onClick={() => setZoom(range)}
                className="h-7 px-2.5 text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-frame relative">
        {!showFullGoal && goalWeight != null ? (
          <span className="absolute bottom-4 right-5 z-10 rounded-full border border-[var(--hairline)] bg-[var(--basalt-2)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cream-2)]">
            Goal {goalWeight.toFixed(1)} lb{goalWeight < minY ? " ↓" : goalWeight > maxY ? " ↑" : ""}
          </span>
        ) : null}
        <ResponsiveContainer width="100%" height={280}>
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
              tickFormatter={(value) => formatChartDate(value, zoom)}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={{ stroke: "var(--color-border)" }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={{ stroke: "var(--color-border)" }}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                fontSize: "0.8125rem",
                boxShadow: "var(--shadow-soft)",
              }}
              labelFormatter={(label) => {
                const [y, m, d] = String(label).split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(1)} lb`,
                name === "displayWeight"
                  ? "Weight"
                  : name === "displayAvg7"
                    ? "7-Day Avg"
                    : "Projection",
              ]}
            />
            {showFullGoal && goalLine != null ? (
              <ReferenceLine
                y={goalLine}
                stroke="var(--color-chart-3)"
                strokeDasharray="4 4"
              />
            ) : null}
            <Scatter
              dataKey="displayWeight"
              fill="var(--color-chart-1)"
              opacity={0.8}
              r={3}
            />
            <Line
              dataKey="displayAvg7"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              type="monotone"
            />
            <Line
              dataKey="projection"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              connectNulls
              type="linear"
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
        <TargetDateNote summary={targetSummary} />
      </CardContent>
    </Card>
  );
}

function TargetDateNote({ summary }: { summary: TargetDateSummary | null }) {
  if (!summary) {
    return null;
  }

  const paceCopy =
    summary.requiredPace != null
      ? `Required pace: about ${summary.requiredPace.toFixed(1)} lb/week. ${
          summary.requiredPace >= 2
            ? "This is an aggressive target; use the trend as guidance, not medical advice."
            : "Use the trend as guidance, not medical advice."
        }`
      : "Log current weight and goal weight to estimate the required pace.";

  return (
    <p className="status-note mt-4 px-3 py-2 text-xs">
      Target date: {formatTargetDate(summary.targetDate)}. {paceCopy}
    </p>
  );
}

function formatChartDate(dateStr: string, zoom: ZoomRange): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (zoom === "1W") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTargetDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

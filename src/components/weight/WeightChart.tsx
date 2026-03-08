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
import { PeriodToggle } from "@/components/ui/period-toggle";
import { buildChartData, type SerializedWeightEntry } from "@/lib/weight";
import { convertWeight } from "@/lib/units";

type ZoomRange = "1W" | "1M" | "3M" | "ALL";

type WeightChartPoint = {
  date: string;
  weight: number | null;
  avg7: number | null;
  displayWeight: number | null;
  displayAvg7: number | null;
  projection: number | null;
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
      displayWeight:
        point.weight != null ? convertWeight(point.weight, settings.weightUnit) : null,
      displayAvg7:
        point.avg7 != null ? convertWeight(point.avg7, settings.weightUnit) : null,
      projection: null,
    }));

    if (!settings.weightGoalTargetDate || goalWeight == null || transformed.length === 0) {
      return transformed;
    }

    const lastPoint = transformed[transformed.length - 1];
    const currentWeight = lastPoint.displayWeight;
    const targetWeight = convertWeight(goalWeight, settings.weightUnit);
    if (currentWeight == null) {
      return transformed;
    }

    const hasTarget = transformed.some(
      (point) => point.date === settings.weightGoalTargetDate
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
            : point.date === settings.weightGoalTargetDate
              ? targetWeight
              : point.projection,
      }));
    }

    return [
      ...base,
      {
        date: settings.weightGoalTargetDate,
        weight: null,
        avg7: null,
        displayWeight: null,
        displayAvg7: null,
        projection: targetWeight,
      },
    ].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData, goalWeight, settings.weightGoalTargetDate, settings.weightUnit]);

  if (entries.length === 0) {
    return (
      <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Weight Trend</p>
            <h2 className="mt-2">Trend, average, and projection</h2>
            <p className="mt-3 supporting-copy">
              Add a few entries and the chart will plot raw weigh-ins, the smoothed average,
              and your goal line.
            </p>
          </div>
          <PeriodToggle
            value={zoom}
            onChange={setZoom}
            options={[
              { label: "1W", value: "1W" },
              { label: "1M", value: "1M" },
              { label: "3M", value: "3M" },
              { label: "All", value: "ALL" },
            ]}
          />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-foreground">No trend to display yet</p>
          <p className="mt-3 supporting-copy">
            Log your first weigh-in below and the visual history will populate automatically.
          </p>
        </div>
      </section>
    );
  }

  const values = chartData.flatMap((point) =>
    [point.displayWeight, point.displayAvg7, point.projection].filter(
      (value): value is number => value != null
    )
  );
  const minY = values.length > 0 ? Math.floor(Math.min(...values) - 2) : 0;
  const maxY = values.length > 0 ? Math.ceil(Math.max(...values) + 2) : 10;
  const goalLine =
    goalWeight != null ? convertWeight(goalWeight, settings.weightUnit) : null;

  return (
    <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Weight Trend</p>
          <h2 className="mt-2">Trend, average, and projection</h2>
          <p className="mt-3 supporting-copy">
            Read the raw weigh-ins against the 7-day average to judge direction without overreacting
            to day-to-day noise.
          </p>
        </div>
        <PeriodToggle
          value={zoom}
          onChange={setZoom}
          options={[
            { label: "1W", value: "1W" },
            { label: "1M", value: "1M" },
            { label: "3M", value: "3M" },
            { label: "All", value: "ALL" },
          ]}
        />
      </div>

      <div className="mt-6 h-[320px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 10, bottom: 8, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.42} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatChartDate(value, zoom)}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "color-mix(in srgb, var(--color-popover) 94%, transparent)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                fontSize: "0.8125rem",
                boxShadow: "var(--shadow-soft)",
              }}
              cursor={{ stroke: "rgba(122, 201, 255, 0.22)", strokeWidth: 1 }}
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
                `${Number(value).toFixed(1)} ${settings.weightUnit}`,
                name === "displayWeight"
                  ? "Weight"
                  : name === "displayAvg7"
                    ? "7-Day Avg"
                    : "Projection",
              ]}
            />
            {goalLine != null ? (
              <ReferenceLine y={goalLine} stroke="var(--color-chart-3)" strokeDasharray="5 5" />
            ) : null}
            <Scatter dataKey="displayWeight" fill="var(--color-chart-1)" opacity={0.84} r={3.5} />
            <Line
              dataKey="displayAvg7"
              stroke="var(--color-chart-2)"
              strokeWidth={2.35}
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

      <div className="section-rule mt-6" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <LegendItem
          label="Weigh-ins"
          description="Every logged entry"
          swatchClassName="bg-primary"
        />
        <LegendItem
          label="7-day average"
          description="Smoothed trend line"
          swatchClassName="bg-secondary"
        />
        <LegendItem
          label="Projection"
          description="Target path to goal"
          swatchClassName="bg-warning"
        />
      </div>
    </section>
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

function LegendItem({
  label,
  description,
  swatchClassName,
}: {
  label: string;
  description: string;
  swatchClassName: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-border/80 bg-background/35 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${swatchClassName}`} />
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

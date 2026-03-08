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
import { BarChart3 } from "lucide-react";
import { PeriodToggle } from "@/components/ui/period-toggle";
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
      <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Movement Trends</p>
            <h2 className="mt-2">Daily, weekly, and monthly totals</h2>
            <p className="mt-3 supporting-copy">
              Log a few days of movement and the trend views will fill in automatically.
            </p>
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
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 px-6 py-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-lg font-semibold text-foreground">No step trends yet</p>
          <p className="mt-3 supporting-copy">
            Start logging and this panel will turn into your movement report.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Movement Trends</p>
          <h2 className="mt-2">Daily, weekly, and monthly totals</h2>
          <p className="mt-3 supporting-copy">
            Toggle the frame depending on whether you want to inspect short-term consistency or the
            larger movement picture.
          </p>
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
      </div>

      <div className="mt-6 h-[320px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={config.data} margin={{ top: 12, right: 10, left: -18, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.42} />
            <XAxis
              dataKey={config.xKey}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(122, 201, 255, 0.08)" }}
              contentStyle={{
                backgroundColor: "color-mix(in srgb, var(--color-popover) 94%, transparent)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                boxShadow: "var(--shadow-soft)",
              }}
              formatter={(value) => [Number(value).toLocaleString(), "Steps"]}
            />
            {typeof config.reference === "number" ? (
              <ReferenceLine y={config.reference} stroke="var(--color-chart-2)" strokeDasharray="6 4" />
            ) : null}
            <Bar dataKey={config.barKey} radius={[12, 12, 4, 4]} animationDuration={650}>
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

      <div className="section-rule mt-6" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <LegendItem
          label="Primary bars"
          description="Recorded totals in view"
          swatchClassName="bg-primary"
        />
        <LegendItem
          label="Highlight"
          description="Today’s bar stands apart"
          swatchClassName="bg-secondary"
        />
        <LegendItem
          label="Goal line"
          description="Shown on daily view"
          swatchClassName="bg-warning"
        />
      </div>
    </section>
  );
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

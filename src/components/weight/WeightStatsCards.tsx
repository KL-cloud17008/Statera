"use client";

import type { ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  Minus,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StatCard } from "@/components/ui/stat-card";
import type { WeightStats } from "@/lib/weight";
import {
  formatWeight,
  formatWeightDelta,
  poundsPerWeekToUnit,
} from "@/lib/units";

export function WeightStatsCards({ stats }: { stats: WeightStats }) {
  const { settings } = useAppSettings();

  const trendIcon =
    stats.trend === "down" ? (
      <TrendingDown className="h-5 w-5" />
    ) : stats.trend === "up" ? (
      <TrendingUp className="h-5 w-5" />
    ) : (
      <Minus className="h-5 w-5" />
    );

  const weeklyRate =
    stats.weeklyRate != null
      ? `${stats.weeklyRate > 0 ? "+" : ""}${poundsPerWeekToUnit(stats.weeklyRate, settings.weightUnit).toFixed(1)} ${settings.weightUnit}/wk`
      : "--";
  const directionLabel =
    stats.trend === "stable" ? "Holding" : stats.trend === "down" ? "Cutting" : "Rising";

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Scale className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">Current Weight</p>
                <p className="mt-3 text-[clamp(2.4rem,2rem+1.5vw,4rem)] font-semibold tracking-tight text-foreground data-number">
                  {formatWeight(stats.currentWeight, settings.weightUnit)}
                </p>
                <p className="mt-3 supporting-copy">
                  {stats.lastEntryDate
                    ? `Latest entry ${stats.lastEntryDate}`
                    : "Log your first weigh-in to establish the trend line."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-primary/12 px-3 py-1.5 text-primary">
                {directionLabel}
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1.5 text-muted-foreground">
                Weekly rate {weeklyRate}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricStat
              label="7-Day Trend"
              value={formatWeight(stats.avg7Day, settings.weightUnit)}
              hint="Smoothed moving average"
              icon={<Activity className="h-4 w-4" />}
            />
            <MetricStat
              label="Goal Weight"
              value={formatWeight(stats.goalWeight, settings.weightUnit)}
              hint="Target marker on chart"
              icon={<Target className="h-4 w-4" />}
            />
            <MetricStat
              label="BMI"
              value={stats.bmi?.toFixed(1) ?? "--"}
              hint="Calculated from saved height"
              icon={<HeartPulse className="h-4 w-4" />}
            />
            <MetricStat
              label="Direction"
              value={directionLabel}
              hint="Based on recent change velocity"
              icon={trendIcon}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <StatCard
          label="This Week"
          value={formatWeightDelta(stats.totalChange, settings.weightUnit)}
          hint={`Rate ${weeklyRate}`}
          icon={trendIcon}
        />
        <StatCard
          label="Goal Pace"
          value={stats.projectedGoalDate ?? "--"}
          hint={
            stats.projectedGoalDate
              ? "Projected date at current velocity"
              : "Set a goal date in settings to see projection"
          }
          icon={<Target className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

function MetricStat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/80 bg-background/35 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground data-number">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

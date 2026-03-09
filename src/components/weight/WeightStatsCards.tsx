"use client";

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Current Weight"
        value={formatWeight(stats.currentWeight, settings.weightUnit)}
        hint={stats.lastEntryDate ?? "No data yet"}
        icon={<Scale className="h-5 w-5" />}
      />
      <StatCard
        label="This Week"
        value={formatWeightDelta(stats.totalChange, settings.weightUnit)}
        hint={`Rate ${weeklyRate}`}
        icon={trendIcon}
      />
      <StatCard
        label="7-Day Trend"
        value={formatWeight(stats.avg7Day, settings.weightUnit)}
        hint="Smoothed moving average"
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        label="BMI"
        value={stats.bmi?.toFixed(1) ?? "--"}
        hint="Based on height set in profile"
        icon={<HeartPulse className="h-5 w-5" />}
      />
      <StatCard
        label="Goal Weight"
        value={formatWeight(stats.goalWeight, settings.weightUnit)}
        hint={
          stats.projectedGoalDate
            ? `Projected ${stats.projectedGoalDate}`
            : "Set a target date in settings"
        }
        icon={<Target className="h-5 w-5" />}
      />
      <StatCard
        label="Direction"
        value={stats.trend === "stable" ? "Holding" : stats.trend === "down" ? "Cutting" : "Rising"}
        hint="Based on recent change velocity"
        icon={trendIcon}
      />
    </div>
  );
}

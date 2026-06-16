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
import { StatCard } from "@/components/ui/stat-card";
import type { WeightStats } from "@/lib/weight";
import {
  formatBodyweight,
  formatBodyweightDelta,
} from "@/lib/units";

export function WeightStatsCards({ stats }: { stats: WeightStats }) {
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
      ? `${stats.weeklyRate > 0 ? "+" : ""}${stats.weeklyRate.toFixed(1)} lb/wk`
      : "--";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Current Weight"
        value={formatBodyweight(stats.currentWeight)}
        hint={stats.lastEntryDate ?? "No data yet"}
        icon={<Scale className="h-5 w-5" />}
      />
      <StatCard
        label="This Week"
        value={formatBodyweightDelta(stats.totalChange)}
        hint={`Rate ${weeklyRate}`}
        icon={trendIcon}
      />
      <StatCard
        label="7-Day Trend"
        value={formatBodyweight(stats.avg7Day)}
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
        value={formatBodyweight(stats.goalWeight)}
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

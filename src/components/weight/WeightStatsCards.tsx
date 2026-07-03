"use client";

import {
  CalendarClock,
  Flag,
  Gauge,
  HeartPulse,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StatCard } from "@/components/ui/stat-card";
import { normalizeGoalTargetDate } from "@/lib/app-settings";
import { computeRequiredWeeklyLossPace, type WeightStats } from "@/lib/weight";
import {
  formatBodyweight,
  formatBodyweightDelta,
} from "@/lib/units";

export function WeightStatsCards({ stats }: { stats: WeightStats }) {
  const { settings } = useAppSettings();
  const targetDate = normalizeGoalTargetDate(settings.weightGoalTargetDate);
  const requiredPace = computeRequiredWeeklyLossPace(
    stats.currentWeight,
    stats.goalWeight,
    stats.lastEntryDate,
    targetDate
  );

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

  const remainingToGoal =
    stats.currentWeight != null && stats.goalWeight != null
      ? stats.goalWeight - stats.currentWeight
      : null;

  const projectedHint = stats.projectedGoalDate
    ? `At the current ${weeklyRate} pace`
    : stats.weeklyRate == null
      ? "Needs more weigh-ins to project"
      : "Current pace is not moving toward goal";

  const paceHint =
    requiredPace != null && targetDate
      ? `Required -${requiredPace.toFixed(1)} lb/wk to hit ${formatGoalDate(targetDate)}`
      : targetDate
        ? `No further loss required by ${formatGoalDate(targetDate)}`
        : "Set a target date in settings to compare";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Projected Goal Date"
        value={stats.projectedGoalDate ? formatGoalDate(stats.projectedGoalDate) : "--"}
        hint={projectedHint}
        icon={<CalendarClock className="h-5 w-5" />}
      />
      <StatCard
        label="Weekly Pace"
        value={weeklyRate}
        hint={paceHint}
        icon={<Gauge className="h-5 w-5" />}
      />
      <StatCard
        label="Remaining to Goal"
        value={formatBodyweightDelta(remainingToGoal)}
        hint={
          stats.goalWeight != null
            ? `To reach ${formatBodyweight(stats.goalWeight)}`
            : "Set a goal weight in settings"
        }
        icon={<Flag className="h-5 w-5" />}
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
        hint="Target set in profile settings"
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

function formatGoalDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

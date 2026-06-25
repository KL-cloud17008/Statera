"use client";

import { Flame, Footprints, Target, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHeatmap } from "@/components/steps/StepsHeatmap";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import {
  calculateStepStats,
  getWeeklyStepChange,
  type SerializedStepsEntry,
} from "@/lib/steps";
import { formatDistance } from "@/lib/units";

export function StepsPageClient({
  entries,
  timezone,
}: {
  entries: SerializedStepsEntry[];
  timezone?: string;
}) {
  const { settings } = useAppSettings();
  const stats = calculateStepStats(entries, settings.stepGoal, { timezone });
  const weeklyChange = getWeeklyStepChange(entries, timezone);

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Step Counter"
        title="Build daily movement momentum"
        description="Track today's total, review your weekly and monthly trends, and keep your streak alive with a clear goal target."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="warm-pill rounded-full px-3 py-1.5">Goal {settings.stepGoal.toLocaleString()} steps</span>
          <span className="warm-pill rounded-full px-3 py-1.5">{formatDistance(stats.todaySteps, settings.distanceUnit)}</span>
        </div>
      </SectionHeader>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-elevated flex flex-col items-center justify-center rounded-[var(--radius-panel)] px-6 py-8">
          <StepsProgressRing current={stats.todaySteps} goal={settings.stepGoal} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="warm-pill rounded-full px-3 py-1.5 text-primary">
              {stats.goalDaysTotal} goal days total
            </span>
            <span>{stats.completionRate}% completion rate</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Today"
            value={stats.todaySteps.toLocaleString()}
            hint={formatDistance(stats.todaySteps, settings.distanceUnit)}
            icon={<Footprints className="h-5 w-5" />}
          />
          <StatCard
            label="7-Day Average"
            value={stats.sevenDayAverage.toLocaleString()}
            hint={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toLocaleString()} vs last week`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Streak"
            value={`${stats.currentStreak}`}
            hint="Consecutive goal days"
            icon={<Flame className="h-5 w-5" />}
          />
          <StatCard
            label="Best Day"
            value={stats.bestDay?.steps?.toLocaleString() ?? "--"}
            hint={stats.bestDay?.date ?? "No data yet"}
            icon={<Target className="h-5 w-5" />}
          />
        </div>
      </section>

      <StepsChart entries={entries} goal={settings.stepGoal} timezone={timezone} />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <StepsEntryForm timezone={timezone} />
          <StepsHeatmap entries={entries} goal={settings.stepGoal} />
        </div>
        <StepsHistoryList entries={entries} />
      </div>
    </div>
  );
}

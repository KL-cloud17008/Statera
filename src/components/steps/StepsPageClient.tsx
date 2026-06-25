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
        eyebrow="Steps"
        title="Foot load and daily movement."
        description="Daily step signal, streak pressure, weekly rhythm, and monthly load."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="warm-pill rounded-full px-3 py-1.5">Goal {settings.stepGoal.toLocaleString()} steps</span>
          <span className="warm-pill rounded-full px-3 py-1.5">{formatDistance(stats.todaySteps, settings.distanceUnit)}</span>
        </div>
      </SectionHeader>

      <section className="command-deck grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(18rem,0.38fr)_minmax(0,0.62fr)] xl:items-center" data-animated="true">
        <div className="flex justify-center">
          <StepsProgressRing current={stats.todaySteps} goal={settings.stepGoal} />
        </div>

        <div>
          <p className="eyebrow">Today</p>
          <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-3">
            <p className="data-number text-6xl font-semibold leading-none text-white sm:text-7xl">
              {stats.todaySteps.toLocaleString()}
            </p>
            <p className="pb-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/58">
              steps logged
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CommandMetric label="Goal Days" value={stats.goalDaysTotal.toLocaleString()} detail={`${stats.completionRate}% completion rate`} />
            <CommandMetric label="Streak" value={stats.currentStreak.toLocaleString()} detail="Consecutive goal days" />
            <CommandMetric label="7-Day Avg" value={stats.sevenDayAverage.toLocaleString()} detail={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toLocaleString()} vs last week`} />
            <CommandMetric label="Distance" value={formatDistance(stats.todaySteps, settings.distanceUnit)} detail={`Goal ${settings.stepGoal.toLocaleString()}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

function CommandMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="black-glass rounded-[var(--radius-card)] p-4">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="data-number mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/58">{detail}</p>
    </div>
  );
}

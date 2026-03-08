"use client";

import type { ReactNode } from "react";
import { Flame, Footprints, Route, Target, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHeatmap } from "@/components/steps/StepsHeatmap";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import {
  computeStepStats,
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
  const stats = computeStepStats(entries, settings.stepGoal, timezone);
  const weeklyChange = getWeeklyStepChange(entries, timezone);

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Step Counter"
        title="Daily movement, presented clearly"
        description="Keep the movement story legible: today’s progress up front, supporting trend views below, and editing tools that stay out of the way."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            Goal {settings.stepGoal.toLocaleString()} steps
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            {stats.completionRate}% completion rate
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            {formatDistance(stats.todaySteps, settings.distanceUnit)}
          </span>
        </div>
      </SectionHeader>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="mx-auto lg:mx-0">
              <StepsProgressRing current={stats.todaySteps} goal={settings.stepGoal} size={212} />
            </div>
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Today</p>
                <h2 className="mt-2">Keep the week moving forward</h2>
                <p className="mt-3 supporting-copy">
                  Use the ring for instant progress, then read the supporting metrics for distance,
                  goal hits, and how much margin you still have left today.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricStat
                  label="Distance"
                  value={formatDistance(stats.todaySteps, settings.distanceUnit)}
                  hint="Estimated from steps"
                  icon={<Route className="h-4 w-4" />}
                />
                <MetricStat
                  label="Goal Hits"
                  value={stats.goalMetCount.toLocaleString()}
                  hint="Lifetime clears"
                  icon={<Target className="h-4 w-4" />}
                />
                <MetricStat
                  label="Remaining"
                  value={Math.max(settings.stepGoal - stats.todaySteps, 0).toLocaleString()}
                  hint="Steps to target"
                  icon={<Footprints className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard
            label="7-Day Average"
            value={stats.average.toLocaleString()}
            hint={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toLocaleString()} vs last week`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Streak"
            value={`${stats.streak}`}
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

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="page-stack">
          <StepsEntryForm />
          <StepsHeatmap entries={entries} goal={settings.stepGoal} />
        </div>
        <StepsHistoryList entries={entries} />
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
      <p className="mt-3 text-xl font-semibold tracking-tight text-foreground data-number">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

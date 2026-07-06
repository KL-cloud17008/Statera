"use client";

import Link from "next/link";
import { CalendarCheck, Flame, Target, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHeatmap } from "@/components/steps/StepsHeatmap";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { getTodayDateString } from "@/lib/dates";
import {
  calculateStepStats,
  getWeeklyStepChange,
  type SerializedStepsEntry,
} from "@/lib/steps";
import { formatDistance } from "@/lib/units";

export function StepsPageClient({
  entries,
  timezone,
  backfillDate,
}: {
  entries: SerializedStepsEntry[];
  timezone?: string;
  backfillDate?: string;
}) {
  const { settings } = useAppSettings();
  const stats = calculateStepStats(entries, settings.stepGoal, { timezone });
  const weeklyChange = getWeeklyStepChange(entries, timezone);
  const today = getTodayDateString(timezone);
  const monthPrefix = today.slice(0, 7);
  const daysIntoMonth = Number.parseInt(today.slice(8, 10), 10);
  const goalDaysThisMonth = entries.filter(
    (entry) => entry.date.slice(0, 7) === monthPrefix && (entry.steps ?? 0) >= settings.stepGoal
  ).length;

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
            <p className="data-number value-reveal text-6xl font-medium leading-none text-[var(--cream)] sm:text-7xl">
              {stats.todaySteps.toLocaleString()}
            </p>
            <p className="pb-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">
              steps logged
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <CommandMetric label="Goal Days" value={stats.goalDaysTotal.toLocaleString()} detail={`${stats.completionRate}% of days since first entry`} />
            <CommandMetric
              label="Streak"
              value={stats.currentStreak.toLocaleString()}
              detail={
                stats.streakUnloggedDays > 0
                  ? `At risk — ${stats.streakUnloggedDays} unlogged ${stats.streakUnloggedDays === 1 ? "day" : "days"}`
                  : "Consecutive goal days"
              }
            />
            <CommandMetric label="7-Day Avg" value={stats.sevenDayAverage.toLocaleString()} detail={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toLocaleString()} vs last week`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Goal Days This Month"
            value={goalDaysThisMonth.toLocaleString()}
            hint={`Of ${daysIntoMonth} ${daysIntoMonth === 1 ? "day" : "days"} so far`}
            icon={<CalendarCheck className="h-5 w-5" />}
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
            hint={
              stats.streakUnloggedDays > 0 && stats.streakBackfillDate ? (
                <span className="text-[var(--attention)]">
                  Streak at risk: {stats.streakUnloggedDays} unlogged{" "}
                  {stats.streakUnloggedDays === 1 ? "day" : "days"} —{" "}
                  <Link
                    href={`/steps?backfill=${stats.streakBackfillDate}#quick-add`}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    backfill {formatBackfillDate(stats.streakBackfillDate)}
                  </Link>
                </span>
              ) : (
                "Consecutive goal days"
              )
            }
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
        <div id="quick-add" className="space-y-4">
          <StepsEntryForm key={backfillDate ?? "today"} timezone={timezone} initialDate={backfillDate} />
          <StepsHeatmap entries={entries} goal={settings.stepGoal} />
        </div>
        <StepsHistoryList entries={entries} />
      </div>
    </div>
  );
}

function formatBackfillDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
      <p className="data-number value-reveal mt-3 text-2xl font-medium text-[var(--cream)]">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--cream-3)]">{detail}</p>
    </div>
  );
}

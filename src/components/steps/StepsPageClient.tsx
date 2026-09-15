"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Figure, Num, PageTitle, Row, Rows, Section } from "@/components/ui/ledger";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHeatmap } from "@/components/steps/StepsHeatmap";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";

import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { getTodayDateString } from "@/lib/dates";
import { isStepGoalSuspendedByPlan } from "@/lib/plan-preview";
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
  const stats = calculateStepStats(entries, settings.stepGoal, {
    timezone,
    isGoalSuspended: isStepGoalSuspendedByPlan,
  });
  const weeklyChange = getWeeklyStepChange(entries, timezone);
  const today = getTodayDateString(timezone);
  const stepGoalSuspended = isStepGoalSuspendedByPlan(today);
  const monthPrefix = today.slice(0, 7);
  const daysIntoMonth = Number.parseInt(today.slice(8, 10), 10);
  const goalDaysThisMonth = entries.filter(
    (entry) => entry.date.slice(0, 7) === monthPrefix && (entry.steps ?? 0) >= settings.stepGoal
  ).length;

  return (
    <>
      <PageTitle
        title="Steps"
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="#quick-add">Log steps</Link>
          </Button>
        }
      />

      <div className="measurement-overview">
      <Section className="measurement-summary">
          <dl className="min-w-0">
            <Figure
              label="Today"
              size="xl"
              value={stats.todaySteps.toLocaleString()}
              detail={`${stepGoalSuspended ? "Rest day · no goal" : `of ${settings.stepGoal.toLocaleString()}`} · ${formatDistance(stats.todaySteps, settings.distanceUnit)}`}
            />
            {!stepGoalSuspended ? <div role="progressbar" aria-label="Daily step goal" aria-valuemin={0} aria-valuemax={settings.stepGoal} aria-valuenow={Math.min(stats.todaySteps, settings.stepGoal)} className="mt-3 h-1.5 bg-sunken">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, stats.todaySteps / settings.stepGoal * 100)}%` }} />
            </div> : null}
            <div className="supporting-figures grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <Figure
              label="Streak"
              size="lg"
              tone="accent"
              value={stats.currentStreak.toLocaleString()}
              detail="Consecutive goal days"
            />
            <Figure
              label="7-day avg"
              size="lg"
              value={stats.sevenDayAverage.toLocaleString()}
              detail={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toLocaleString()} vs last week`}
            />
            <Figure
              label="Best day"
              size="lg"
              value={stats.bestDay?.steps?.toLocaleString() ?? "--"}
              detail={stats.bestDay?.date ?? "No data yet"}
            />
            </div>
          </dl>
      </Section>

      <Section title="Log steps" className="measurement-entry scroll-mt-24" id="quick-add">
        <StepsEntryForm key={backfillDate ?? "today"} timezone={timezone} initialDate={backfillDate} entries={entries} />
      </Section>
      </div>

      <Section title="Consistency">
        <Rows columns="minmax(0,1fr) auto">
          <Row columns="minmax(0,1fr) auto">
            <span className="text-secondary">Goal days this month</span>
            <Num>
              {goalDaysThisMonth} / {daysIntoMonth}
            </Num>
          </Row>
          <Row columns="minmax(0,1fr) auto">
            <span className="text-secondary">Goal days all time</span>
            <Num>{stats.goalDaysTotal.toLocaleString()}</Num>
          </Row>
          <Row columns="minmax(0,1fr) auto">
            <span className="text-secondary">Completion rate since first entry</span>
            <Num tone="accent">{stats.completionRate}%</Num>
          </Row>
        </Rows>
      </Section>

      <Section title="Daily steps">
        <StepsChart entries={entries} goal={settings.stepGoal} timezone={timezone} />
      </Section>

      <Section title="Month">
        <StepsHeatmap entries={entries} goal={settings.stepGoal} timezone={timezone} />
      </Section>

      <Section title="Recent entries">
        <StepsHistoryList entries={entries} timezone={timezone} />
      </Section>
    </>
  );
}


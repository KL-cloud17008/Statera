"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Figure, Num, PageTitle, Row, Rows, Section } from "@/components/ui/ledger";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHeatmap } from "@/components/steps/StepsHeatmap";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
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
  const monthPrefix = today.slice(0, 7);
  const daysIntoMonth = Number.parseInt(today.slice(8, 10), 10);
  const goalDaysThisMonth = entries.filter(
    (entry) => entry.date.slice(0, 7) === monthPrefix && (entry.steps ?? 0) >= settings.stepGoal
  ).length;

  return (
    <>
      <PageTitle
        eyebrow="Steps"
        title="Foot load and daily movement."
        lead="Daily step signal, current streak, weekly rhythm, and monthly load."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="#quick-add">Log steps</Link>
          </Button>
        }
      />

      {/* Today reads as one figure on the canvas, with the goal ring beside it.
          The streak/average figures appear once here — the previous build
          printed Streak and 7-Day Average twice, in the deck and again in the
          card row below it. */}
      <Section className="mt-6">
        {/* The ring and the figures sit side by side only when there is room.
            Below sm the figures take the full width — sharing the row left
            each cell ~95px, and the 2rem Today numeral overran into Streak. */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <div className="mx-auto shrink-0 sm:mx-0">
            <StepsProgressRing current={stats.todaySteps} goal={settings.stepGoal} />
          </div>
          {/* Today keeps its own line: sharing a 4-up row with the ring beside
              it left 61px cells for a 115px numeral, and .num is nowrap. */}
          <dl className="w-full min-w-0 sm:w-auto sm:flex-1">
            <Figure
              label="Today"
              size="xl"
              value={stats.todaySteps.toLocaleString()}
              detail={`of ${settings.stepGoal.toLocaleString()} · ${formatDistance(stats.todaySteps, settings.distanceUnit)}`}
            />
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
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
        </div>
      </Section>

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
        <StepsHeatmap entries={entries} goal={settings.stepGoal} />
      </Section>

      <Section title="Log an entry" className="scroll-mt-20" id="quick-add">
        <StepsEntryForm key={backfillDate ?? "today"} timezone={timezone} initialDate={backfillDate} />
      </Section>

      <Section title="Recent entries">
        <StepsHistoryList entries={entries} />
      </Section>
    </>
  );
}


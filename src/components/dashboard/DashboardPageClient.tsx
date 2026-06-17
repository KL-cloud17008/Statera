"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { computeStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { formatBodyweight, formatWorkoutVolume } from "@/lib/units";
import { cn } from "@/lib/utils";

type WeightStats = {
  currentWeight: number | null;
  trend: "down" | "up" | "stable";
};

type WorkoutSummary = {
  weeklyVolume: number;
  weeklySessions: number;
  lastWorkout: {
    label: string;
    trainingDate: string;
    volume: number;
    setCount: number;
  } | null;
};

const WEEKLY_RHYTHM = [
  { day: "Mon", label: "Upper A", type: "Lift", dayOfWeek: 1 },
  { day: "Tue", label: "Lower A", type: "Lift", dayOfWeek: 2 },
  { day: "Wed", label: "Mobility", type: "Recovery", dayOfWeek: 3 },
  { day: "Thu", label: "Upper B", type: "Lift", dayOfWeek: 4 },
  { day: "Fri", label: "Lower B", type: "Lift", dayOfWeek: 5 },
  { day: "Sat", label: "Mobility", type: "Recovery", dayOfWeek: 6 },
  { day: "Sun", label: "Complete rest", type: "Off", dayOfWeek: 0 },
];

const NEXT_BY_DAY = [
  "Complete rest",
  "Upper A",
  "Lower A",
  "Mobility",
  "Upper B",
  "Lower B",
  "Mobility",
];

export function DashboardPageClient({
  stepsEntries,
  todaySteps,
  weightStats,
  workoutSummary,
  timezone,
  trainingDayOfWeek,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  weightStats: WeightStats;
  workoutSummary: WorkoutSummary;
  timezone?: string;
  trainingDayOfWeek: number;
}) {
  const { settings } = useAppSettings();
  const stepStats = computeStepStats(stepsEntries, settings.stepGoal, timezone);
  const greeting = getGreeting();
  const stepCompletion = settings.stepGoal > 0
    ? Math.min(100, Math.round((todaySteps / settings.stepGoal) * 100))
    : 0;
  const weeklyVolume = formatWorkoutVolume(workoutSummary.weeklyVolume);
  const lastWorkoutVolume = workoutSummary.lastWorkout
    ? formatWorkoutVolume(workoutSummary.lastWorkout.volume)
    : null;
  const lastWorkoutDate = workoutSummary.lastWorkout
    ? formatShortDate(workoutSummary.lastWorkout.trainingDate)
    : null;
  const nextProtocol = getNextProtocol(trainingDayOfWeek);

  const TrendIcon =
    weightStats.trend === "down"
      ? ArrowDown
      : weightStats.trend === "up"
        ? ArrowUp
        : ArrowRight;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
          <div className="max-w-5xl">
            <p className="eyebrow">{greeting}</p>
            <h1 className="mt-5 max-w-5xl">Today, training rhythm, and recovery status in one command ledger.</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              A focused operating view for movement, training, bodyweight, and mobility without
              turning the day into a grid of competing widgets.
            </p>
          </div>

          <div className="command-panel rounded-[var(--radius-panel)] p-6">
            <p className="eyebrow">Next protocol</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{nextProtocol}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {workoutSummary.weeklySessions} lift sessions logged this week.
            </p>
            <div className="copper-rule mt-5" />
            <Link href="/workout" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground transition-colors hover:text-[#e6a07d]">
              Open workout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="document-panel">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)]">
          <div>
            <p className="eyebrow">Today</p>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="data-number text-6xl font-medium text-foreground">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {stepCompletion}% of {settings.stepGoal.toLocaleString()} steps
                </p>
              </div>
              <div className="min-w-56 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily movement</span>
                  <span className="data-number text-foreground">{stepCompletion}%</span>
                </div>
                <div className="h-px bg-border">
                  <div className="h-px bg-foreground" style={{ width: `${stepCompletion}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="eyebrow">Consistency</p>
            <div className="mt-5 grid grid-cols-2 gap-6">
              <div>
                <p className="data-number text-3xl text-foreground">{stepStats.streak}</p>
                <p className="mt-1 text-sm text-muted-foreground">day streak</p>
              </div>
              <div>
                <p className="data-number text-3xl text-foreground">{stepStats.goalMetCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">goal days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="quiet-rule" />

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Weekly rhythm</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lift four days, recover twice, leave Sunday fully clear.
              </p>
            </div>
            <Link href="/workout/plan" className="text-link inline-flex items-center gap-2 text-sm font-medium">
              Full plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 divide-y divide-border border-y border-border">
            {WEEKLY_RHYTHM.map((item) => {
              const isToday = item.dayOfWeek === trainingDayOfWeek;
              return (
                <div
                  key={item.day}
                  className={cn(
                    "interactive-row grid gap-3 px-2 py-3 text-sm sm:grid-cols-[4rem_minmax(0,1fr)_8rem] sm:items-center",
                    isToday && "completed-row -mx-2 rounded-[var(--radius-card)] px-4"
                  )}
                >
                  <p className="eyebrow text-[10px]">{item.day}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{item.label}</p>
                    {isToday ? <span className="warm-pill rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">Today</span> : null}
                  </div>
                  <p className="text-muted-foreground sm:text-right">{item.type}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-0 border-y border-border lg:grid-cols-3 lg:divide-x lg:divide-border">
          <Link href="/weight" className="interactive-row group block py-6 lg:px-6 lg:first:pl-0">
            <p className="eyebrow">Bodyweight trend</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="data-number text-4xl font-medium text-foreground">
                {formatBodyweight(weightStats.currentWeight)}
              </p>
              <TrendIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {getTrendCopy(weightStats.trend)}
            </p>
          </Link>

          <Link href="/workout/history" className="interactive-row group block border-t border-border py-6 lg:border-t-0 lg:px-6">
            <p className="eyebrow">Training output</p>
            <p className="data-number mt-4 text-4xl font-medium text-foreground">
              {weeklyVolume}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Across {workoutSummary.weeklySessions} completed sessions this week.
            </p>
          </Link>

          <Link href="/mobility" className="interactive-row group block border-t border-border py-6 lg:border-t-0 lg:px-6 lg:last:pr-0">
            <p className="eyebrow">Mobility cadence</p>
            <p className="mt-4 text-4xl font-medium text-foreground">2+2</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Wednesday and Saturday recovery, plus short resets around lifting days.
            </p>
          </Link>
        </div>

        <div className="ledger-row pt-0">
          <div>
            <p className="eyebrow">Last session</p>
          </div>
          {workoutSummary.lastWorkout ? (
            <>
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {workoutSummary.lastWorkout.label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{lastWorkoutDate}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground md:text-right">
                <p>
                  <span className="data-number text-foreground">{workoutSummary.lastWorkout.setCount}</span> sets logged
                </p>
                <p>
                  <span className="data-number text-foreground">{lastWorkoutVolume}</span> moved
                </p>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                No completed workouts yet. Start with the programmed day, then let history build from there.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function getNextProtocol(dayOfWeek: number) {
  return NEXT_BY_DAY[dayOfWeek] ?? "Upper A";
}

function getTrendCopy(trend: WeightStats["trend"]) {
  if (trend === "down") {
    return "Moving down. Open the chart for pace and context.";
  }
  if (trend === "up") {
    return "Ticking upward. Review the full chart before changing course.";
  }
  return "Holding steady. The longer chart shows whether that stability is deliberate.";
}

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

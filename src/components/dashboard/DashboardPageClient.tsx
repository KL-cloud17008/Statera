"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { computeStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { convertWeight, formatWeight } from "@/lib/units";

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

export function DashboardPageClient({
  stepsEntries,
  todaySteps,
  weightStats,
  workoutSummary,
  timezone,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  weightStats: WeightStats;
  workoutSummary: WorkoutSummary;
  timezone?: string;
}) {
  const { settings } = useAppSettings();
  const stepStats = computeStepStats(stepsEntries, settings.stepGoal, timezone);
  const greeting = getGreeting();
  const stepCompletion = settings.stepGoal > 0
    ? Math.min(100, Math.round((todaySteps / settings.stepGoal) * 100))
    : 0;
  const weeklyVolume = Math.round(
    convertWeight(workoutSummary.weeklyVolume, settings.weightUnit)
  ).toLocaleString();
  const lastWorkoutVolume = workoutSummary.lastWorkout
    ? Math.round(
        convertWeight(workoutSummary.lastWorkout.volume, settings.weightUnit)
      ).toLocaleString()
    : null;
  const lastWorkoutDate = workoutSummary.lastWorkout
    ? formatShortDate(workoutSummary.lastWorkout.trainingDate)
    : null;

  const TrendIcon =
    weightStats.trend === "down"
      ? ArrowDown
      : weightStats.trend === "up"
        ? ArrowUp
        : ArrowRight;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] xl:items-end">
          <div className="max-w-4xl">
            <p className="eyebrow">{greeting}</p>
            <h1 className="mt-5 max-w-4xl">Movement, training, and bodyweight in one calm view.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The app foregrounds only the signals that matter today: whether you moved, how
              bodyweight is trending, and what training has already accumulated this week.
            </p>
          </div>

          <div className="grid gap-6 xl:justify-self-end xl:text-right">
            <div>
              <p className="eyebrow">Today</p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.08em] text-foreground data-number">
                {todaySteps.toLocaleString()}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {stepCompletion}% of your {settings.stepGoal.toLocaleString()} step target
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground xl:justify-end">
              <span>{stepStats.streak} day streak</span>
              <span>{workoutSummary.weeklySessions} sessions this week</span>
            </div>
            <Link href="/workout" className="text-link inline-flex items-center gap-2 text-sm font-medium xl:justify-end">
              Open workout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="editorial-surface">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <div className="space-y-10">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
              <div>
                <p className="eyebrow">Daily movement</p>
                <p className="mt-5 text-[clamp(3rem,2.4rem+2vw,4.75rem)] font-semibold tracking-[-0.08em] text-foreground data-number">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                  Stay above {settings.stepGoal.toLocaleString()} steps to keep your streak alive.
                </p>
              </div>

              <div className="space-y-5 border-t border-border/70 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div>
                  <p className="eyebrow">Goal days</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground data-number">
                    {stepStats.goalMetCount}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Current streak</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground data-number">
                    {stepStats.streak}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span className="data-number text-foreground">{stepCompletion}%</span>
              </div>
              <div className="h-px bg-white/10">
                <div
                  className="h-px bg-foreground"
                  style={{ width: `${stepCompletion}%` }}
                />
              </div>
            </div>

            <div className="quiet-rule" />

            <div className="grid gap-8 md:grid-cols-2">
              <Link href="/weight" className="group block">
                <p className="eyebrow">Weight</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-[-0.07em] text-foreground data-number">
                    {formatWeight(weightStats.currentWeight, settings.weightUnit)}
                  </p>
                  <TrendIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {getTrendCopy(weightStats.trend)}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/78 transition-colors group-hover:text-foreground">
                  Open weight log
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <Link href="/workout/history" className="group block md:border-l md:border-border/70 md:pl-8">
                <p className="eyebrow">Training</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-foreground data-number">
                  {weeklyVolume}
                  <span className="ml-2 text-2xl text-muted-foreground">{settings.weightUnit}</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Across {workoutSummary.weeklySessions} completed sessions this week.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/78 transition-colors group-hover:text-foreground">
                  Open history
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          <aside className="space-y-8 border-t border-border/70 pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <div className="space-y-3">
              <p className="eyebrow">Rhythm</p>
              <p className="text-2xl font-semibold tracking-[-0.05em]">
                Weekly overview
              </p>
            </div>

            {workoutSummary.lastWorkout ? (
              <div className="space-y-4">
                <div>
                  <p className="eyebrow">Last session</p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
                    {workoutSummary.lastWorkout.label}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{lastWorkoutDate}</p>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="labelled-row">
                    <span>Sets logged</span>
                    <span className="data-number text-foreground">
                      {workoutSummary.lastWorkout.setCount}
                    </span>
                  </div>
                  <div className="labelled-row">
                    <span>Volume moved</span>
                    <span className="data-number text-foreground">
                      {lastWorkoutVolume} {settings.weightUnit}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="eyebrow">Last session</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No completed workouts yet. Once a session lands, the recap lives here instead of
                  in another box.
                </p>
              </div>
            )}

            <div className="quiet-rule" />

            <div className="space-y-3">
              <p className="eyebrow">Quick routes</p>
              <div className="space-y-2 text-sm">
                <Link href="/steps" className="text-link inline-flex items-center gap-2">
                  Steps log
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/weight" className="text-link inline-flex items-center gap-2">
                  Weight chart
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/workout/history" className="text-link inline-flex items-center gap-2">
                  Workout history
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
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

function getTrendCopy(trend: WeightStats["trend"]) {
  if (trend === "down") {
    return "Weight is moving down. Open the full chart to see the longer trajectory.";
  }
  if (trend === "up") {
    return "Weight is ticking upward. Review the full chart for pace and context.";
  }
  return "Weight is holding steady. The longer chart will show whether that stability is deliberate.";
}

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

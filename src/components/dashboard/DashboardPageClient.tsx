"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2 } from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { calculateStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { formatBodyweight, formatWorkoutVolume } from "@/lib/units";
import { cn } from "@/lib/utils";

type WeightStats = {
  currentWeight: number | null;
  trend: "down" | "up" | "stable";
};

type WorkoutSummary = {
  weeklyVolume: number;
  weeklySessions: number;
  hasCompletedWorkoutToday: boolean;
  lastWorkout: {
    label: string;
    trainingDate: string;
    volume: number;
    setCount: number;
  } | null;
};

type MobilitySummary = {
  completedTypes: string[];
  footFlareLogged: boolean;
};

const WEEKLY_RHYTHM = [
  { day: "MON", label: "Upper A", protocol: "Strength Protocol", dayOfWeek: 1 },
  { day: "TUE", label: "Lower A", protocol: "Strength Protocol", dayOfWeek: 2 },
  { day: "WED", label: "Mobility, Flexibility & Balance", protocol: "Recovery Protocol", meta: "10,000 steps", dayOfWeek: 3 },
  { day: "THU", label: "Upper B", protocol: "Strength Protocol", dayOfWeek: 4 },
  { day: "FRI", label: "Lower B", protocol: "Strength Protocol", dayOfWeek: 5 },
  { day: "SAT", label: "Mobility, Flexibility & Balance", protocol: "Recovery Protocol", dayOfWeek: 6 },
  { day: "SUN", label: "Complete rest", protocol: "Full Rest", dayOfWeek: 0 },
];

const NEXT_BY_DAY = [
  "Complete rest",
  "Upper A",
  "Lower A",
  "Mobility, Flexibility & Balance",
  "Upper B",
  "Lower B",
  "Mobility, Flexibility & Balance",
];

export function DashboardPageClient({
  stepsEntries,
  todaySteps,
  weightStats,
  workoutSummary,
  mobilitySummary,
  latestWeightDate,
  timezone,
  trainingDayOfWeek,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  weightStats: WeightStats;
  workoutSummary: WorkoutSummary;
  mobilitySummary: MobilitySummary;
  latestWeightDate: string | null;
  timezone?: string;
  trainingDayOfWeek: number;
}) {
  const { settings } = useAppSettings();
  const stepStats = calculateStepStats(stepsEntries, settings.stepGoal, { timezone });
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
  const decision = buildDecision({
    stepsEntries,
    todaySteps,
    stepGoal: settings.stepGoal,
    workoutSummary,
    mobilitySummary,
    latestWeightDate,
    trainingDayOfWeek,
  });

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
            <h1 className="mt-5 max-w-5xl">Today&apos;s command ledger.</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Training, steps, bodyweight, and recovery status.
            </p>
          </div>

          <div className="command-panel rounded-[var(--radius-panel)] p-6">
            <p className="eyebrow">Next protocol</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{nextProtocol}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {workoutSummary.weeklySessions} strength sessions logged this week.
            </p>
            <div className="copper-rule mt-5" />
            <Link href="/workout" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground transition-colors hover:text-[#9fb7ff]">
              Open training
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
                <p className="data-number text-3xl text-foreground">{stepStats.currentStreak}</p>
                <p className="mt-1 text-sm text-muted-foreground">day streak</p>
              </div>
              <div>
                <p className="data-number text-3xl text-foreground">{stepStats.goalDaysTotal}</p>
                <p className="mt-1 text-sm text-muted-foreground">goal days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="quiet-rule" />

        <div className="warm-row rounded-[var(--radius-card)] p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="eyebrow">Today&apos;s decision</p>
              <h2 className="mt-2 text-3xl">{decision.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {decision.description}
              </p>
            </div>
            <Link href={decision.href} className="text-link inline-flex items-center gap-2 text-sm font-semibold">
              Open next action
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {decision.signals.map((signal) => (
              <p
                key={signal}
                className="status-note flex items-start gap-2 px-3 py-2 text-xs leading-relaxed"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/70" />
                <span>{signal}</span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Weekly rhythm</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Strength four days. Recovery Wednesday and Saturday. Sunday full rest.
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
                    "interactive-row grid gap-2 px-2 py-2.5 text-sm sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(7.75rem,auto)] sm:items-center",
                    isToday && "-mx-2 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--electric-blue)_34%,var(--border)_66%)] bg-[color-mix(in_srgb,var(--electric-blue)_7%,var(--background)_93%)] px-3"
                  )}
                >
                  <p className="eyebrow text-[10px]">{item.day}</p>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-snug text-foreground">{item.label}</p>
                      {isToday ? (
                        <span className="rounded-full border border-[color-mix(in_srgb,var(--electric-blue)_36%,var(--border)_64%)] bg-[color-mix(in_srgb,var(--electric-blue)_8%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--electric-blue)_54%,var(--foreground)_46%)]">
                          Today
                        </span>
                      ) : null}
                    </div>
                    {item.meta ? <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p> : null}
                  </div>
                  <p className="justify-self-start whitespace-nowrap rounded-full border border-border/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:justify-self-end sm:text-right">
                    {item.protocol}
                  </p>
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
                No completed training sessions yet. Start with the programmed day, then let history build from there.
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

function buildDecision({
  stepsEntries,
  todaySteps,
  stepGoal,
  workoutSummary,
  mobilitySummary,
  latestWeightDate,
  trainingDayOfWeek,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  stepGoal: number;
  workoutSummary: WorkoutSummary;
  mobilitySummary: MobilitySummary;
  latestWeightDate: string | null;
  trainingDayOfWeek: number;
}) {
  const recentStepEntries = [...stepsEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentStepTotal = recentStepEntries.reduce((sum, entry) => sum + (entry.steps ?? 0), 0);
  const recentStepAverage = recentStepEntries.length > 0
    ? Math.round(recentStepTotal / recentStepEntries.length)
    : todaySteps;
  const highStepLoad =
    (recentStepEntries.length >= 3 && recentStepAverage >= stepGoal * 1.15) ||
    todaySteps >= stepGoal * 1.35;
  const isStrengthDay = [1, 2, 4, 5].includes(trainingDayOfWeek);
  const expectedMobilityType = isStrengthDay ? "PRE_WORKOUT" : "POST_WORKOUT";
  const mobilityDone = mobilitySummary.completedTypes.includes(expectedMobilityType);
  const weightStale = !latestWeightDate || daysSince(latestWeightDate) >= 4;
  const signals = [
    `${todaySteps.toLocaleString()} of ${stepGoal.toLocaleString()} steps logged today.`,
    "Nutrition is tracked externally in Cronometer.",
    mobilityDone ? "Expected mobility is logged." : "Expected mobility is still open.",
  ];

  if (mobilitySummary.footFlareLogged || highStepLoad) {
    return {
      title: mobilitySummary.footFlareLogged
        ? "Required foot-flare recovery is logged."
        : "High step load. Required foot-flare recovery applies.",
      description: highStepLoad
        ? `The recent step average is ${recentStepAverage.toLocaleString()}, so complete required foot-flare recovery and keep it easy.`
        : "Foot flare recovery is part of the day. Do not turn the later block into extra training.",
      href: "/mobility",
      signals,
    };
  }

  if (isStrengthDay && !workoutSummary.hasCompletedWorkoutToday) {
    return {
      title: "Start today's programmed session.",
      description: "No completed strength session is logged for the current training date. Run the programmed session before adding extra work.",
      href: "/workout",
      signals,
    };
  }

  if (!mobilityDone) {
    return {
      title: isStrengthDay ? "Complete the expected mobility prep." : "Log recovery mobility.",
      description: "The day is missing its expected mobility check-in. Keep it short, easy, and specific to the program.",
      href: "/mobility",
      signals,
    };
  }

  if (weightStale) {
    return {
      title: "Log bodyweight to keep the trend useful.",
      description: "The dashboard can only interpret pace when the weight trend has recent entries.",
      href: "/weight",
      signals,
    };
  }

  return {
    title: "Execute the plan and keep the ledger current.",
    description: "Training, movement, and recovery all have enough signal today. Keep logging without adding noise.",
    href: "/steps",
    signals,
  };
}

function daysSince(dateString: string) {
  const start = new Date(`${dateString}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start) / 86400000);
}

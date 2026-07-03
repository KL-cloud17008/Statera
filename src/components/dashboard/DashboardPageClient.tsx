"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Dumbbell,
  Footprints,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { DEFAULT_WORKOUT_PLAN, type DefaultWorkoutDay } from "@/lib/default-workout-plan";
import { calculateStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { isLoggableTrainingExercise } from "@/lib/training-session";
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

type WorkoutDayStatus = {
  planId: string;
  dayOfWeek: number;
  status: "start" | "resume" | "view";
  sessionId?: string;
};

const WEEKLY_RHYTHM = [
  { day: "MON", label: "Lower A — Single-Leg Press + Quad/Hamstring Strength", protocol: "Strength Protocol", dayOfWeek: 1 },
  { day: "TUE", label: "Upper A — Incline Push / Row / Trunk Stability", protocol: "Strength Protocol", dayOfWeek: 2 },
  { day: "WED", label: "Lower B — Accessory Legs + Hip Stability", protocol: "Strength Protocol", dayOfWeek: 3 },
  { day: "THU", label: "Upper B — Machine Press / Pull + Shoulders and Arms", protocol: "Strength Protocol", dayOfWeek: 4 },
  { day: "FRI", label: "Upper Accessory + Arms + Core", protocol: "Strength Protocol", dayOfWeek: 5 },
  { day: "SAT", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 6 },
  { day: "SUN", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 0 },
];

const NEXT_BY_DAY = [
  "Complete Rest",
  "Lower A — Single-Leg Press + Quad/Hamstring Strength",
  "Upper A — Incline Push / Row / Trunk Stability",
  "Lower B — Accessory Legs + Hip Stability",
  "Upper B — Machine Press / Pull + Shoulders and Arms",
  "Upper Accessory + Arms + Core",
  "Complete Rest",
];

export function DashboardPageClient({
  stepsEntries,
  todaySteps,
  weightStats,
  workoutSummary,
  workoutDayStatuses,
  mobilitySummary,
  latestWeightDate,
  timezone,
  trainingDayOfWeek,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  weightStats: WeightStats;
  workoutSummary: WorkoutSummary;
  workoutDayStatuses: WorkoutDayStatus[];
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
  const todayPlanDay = DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === trainingDayOfWeek) ?? null;
  const todayPlanStats = todayPlanDay ? buildPlanDayStats(todayPlanDay) : null;
  const decision = buildDecision({
    stepsEntries,
    todaySteps,
    stepGoal: settings.stepGoal,
    workoutSummary,
    mobilitySummary,
    latestWeightDate,
    trainingDayOfWeek,
  });
  const workoutStatusByDay = new Map(
    workoutDayStatuses.map((status) => [status.dayOfWeek, status])
  );

  const TrendIcon =
    weightStats.trend === "down"
      ? ArrowDown
      : weightStats.trend === "up"
        ? ArrowUp
        : ArrowRight;
  const recoveryFlagActive =
    mobilitySummary.footFlareLogged ||
    /foot-flare|High step load/i.test(decision.title);

  return (
    <div className="page-shell">
      <section className="command-deck p-5 sm:p-7 lg:p-8" data-animated="true">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.35fr)] xl:items-stretch">
          <div className="flex min-h-[28rem] flex-col justify-between gap-10">
            <div>
              <p className="eyebrow">{greeting}</p>
              <h1 className="mt-5 max-w-5xl">Private performance command.</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/66">
                Today&apos;s protocol, movement load, recovery flag, and bodyweight signal.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SignalTile icon={<Footprints className="h-4 w-4" />} label="Today status" value={`${stepCompletion}%`} detail={`${todaySteps.toLocaleString()} / ${settings.stepGoal.toLocaleString()}`} />
              <SignalTile icon={<ShieldCheck className="h-4 w-4" />} label="Readiness flag" value={recoveryFlagActive ? "Recovery" : "Clear"} detail={recoveryFlagActive ? "Foot load requires attention" : "No flare flag"} />
              <SignalTile icon={<Dumbbell className="h-4 w-4" />} label="Current phase" value={nextProtocol} detail={`${workoutSummary.weeklySessions} sessions this week`} />
              <SignalTile icon={<Scale className="h-4 w-4" />} label="Bodyweight" value={formatBodyweight(weightStats.currentWeight)} detail={getTrendCopy(weightStats.trend)} />
            </div>
          </div>

          <div className="black-glass flex flex-col justify-between gap-8 rounded-[var(--radius-panel)] p-5">
            <div>
              <p className="eyebrow">Today&apos;s Protocol</p>
              <p className="mt-4 text-4xl font-semibold leading-tight text-white">{nextProtocol}</p>
              <div className="copper-rule mt-5" />
              {todayPlanStats ? (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <p className="data-number text-2xl font-semibold leading-tight text-white">{todayPlanStats.exerciseCount}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Exercises</p>
                    </div>
                    <div>
                      <p className="data-number text-2xl font-semibold leading-tight text-white">~{todayPlanStats.estimatedMinutes}m</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Est. duration</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {todayPlanStats.topMovements.map((movement) => (
                      <li key={movement} className="flex items-center gap-2.5 text-sm leading-snug text-white/72">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--sky-accent)]" />
                        {movement}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mt-5 text-sm leading-relaxed text-white/66">
                {decision.title}
              </p>
            </div>
            <Link href={decision.href} className="inline-flex items-center justify-between gap-4 rounded-full border border-white/14 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-[color-mix(in_srgb,var(--sky-accent)_50%,transparent)] hover:bg-white/12">
              Open next action
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.66fr)_minmax(22rem,0.34fr)]">
        <div className="prime-panel p-6 sm:p-7">
          <p className="eyebrow">Step Progress</p>
          <div className="mt-6 grid items-center gap-7 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_16rem]">
            <div className="justify-self-center sm:justify-self-start">
              <StepsProgressRing current={todaySteps} goal={settings.stepGoal} size={176} />
            </div>
            <StepMiniBars entries={stepsEntries} goal={settings.stepGoal} />
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily movement</span>
                <span className="data-number font-semibold text-foreground">{stepCompletion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(7,17,31,0.08)]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--electric-blue),var(--sky-accent))]" style={{ width: `${stepCompletion}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="micro-panel">
                  <p className="eyebrow text-[10px]">Streak</p>
                  <p className="data-number mt-2 text-3xl font-semibold text-foreground">{stepStats.currentStreak}</p>
                </div>
                <div className="micro-panel">
                  <p className="eyebrow text-[10px]">Goal Days</p>
                  <p className="data-number mt-2 text-3xl font-semibold text-foreground">{stepStats.goalDaysTotal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prime-panel p-6 sm:p-7">
          <p className="eyebrow">Today&apos;s Decision</p>
          <h2 className="mt-3 text-3xl">{decision.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{decision.description}</p>
          <div className="mt-5 grid gap-2">
            {decision.signals.map((signal) => (
              <p key={signal} className="status-note flex items-start gap-2 px-3 py-2 text-xs leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/70" />
                <span>{signal}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="document-panel">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Weekly Rhythm</p>
            <h2 className="mt-2 text-3xl">5 Strength / 2 Full Rest.</h2>
          </div>
          <Link href="/workout/plan" className="text-link inline-flex items-center gap-2 text-sm font-semibold">
            Full plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-2 lg:grid-cols-7">
          {WEEKLY_RHYTHM.map((item) => {
            const isToday = item.dayOfWeek === trainingDayOfWeek;
            return (
              <div
                key={item.day}
                className={cn(
                  "interactive-row flex min-h-48 flex-col rounded-[var(--radius-card)] border border-[rgba(7,17,31,0.1)] bg-white/42 p-4",
                  isToday && "border-[rgba(79,124,255,0.36)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(224,239,255,0.78))] shadow-[var(--shadow-glow)]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="eyebrow text-[10px]">{item.day}</p>
                  {isToday ? (
                    <span className="rounded-full border border-[rgba(79,124,255,0.3)] bg-[rgba(79,124,255,0.08)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
                      Today
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-foreground">{item.label}</p>
                <p className="mt-5 inline-flex rounded-full border border-[rgba(7,17,31,0.11)] bg-white/54 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {item.protocol}
                </p>
                {item.protocol === "Strength Protocol" ? (
                  <div className="mt-auto pt-5">
                    <WorkoutSessionActionButton
                      planId={workoutStatusByDay.get(item.dayOfWeek)?.planId}
                      status={workoutStatusByDay.get(item.dayOfWeek)?.status ?? "start"}
                      prominent={isToday}
                      fullWidth
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="quiet-rule" />

        <div className="grid gap-4 lg:grid-cols-3">
          <Link href="/weight" className="surface-card interactive-row block rounded-[var(--radius-card)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Bodyweight Trend</p>
                <p className="data-number mt-4 text-4xl font-semibold text-foreground">{formatBodyweight(weightStats.currentWeight)}</p>
              </div>
              <TrendIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{getTrendCopy(weightStats.trend)}</p>
          </Link>

          <Link href="/workout/history" className="surface-card interactive-row block rounded-[var(--radius-card)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Training Output</p>
                <p className="data-number mt-4 text-4xl font-semibold text-foreground">{weeklyVolume}</p>
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{workoutSummary.weeklySessions} completed sessions this week.</p>
          </Link>

          <Link href="/mobility" className="surface-card interactive-row block rounded-[var(--radius-card)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Movement Quality</p>
                <p className="data-number mt-4 text-4xl font-semibold text-foreground">5+2</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Five training-day resets plus full rest on Saturday and Sunday.</p>
          </Link>
        </div>

        <div className="ledger-row pt-0">
          <div>
            <p className="eyebrow">Last Session</p>
          </div>
          {workoutSummary.lastWorkout ? (
            <>
              <div>
                <p className="text-2xl font-semibold text-foreground">{workoutSummary.lastWorkout.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{lastWorkoutDate}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground md:text-right">
                <p><span className="data-number text-foreground">{workoutSummary.lastWorkout.setCount}</span> sets logged</p>
                <p><span className="data-number text-foreground">{lastWorkoutVolume}</span> moved</p>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <p className="text-sm leading-relaxed text-muted-foreground">No completed training sessions yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SignalTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="black-glass min-h-32 rounded-[var(--radius-card)] p-4">
      <div className="flex items-center justify-between gap-3 text-white/68">
        <p className="eyebrow text-[10px]">{label}</p>
        {icon}
      </div>
      <p className="data-number mt-4 text-2xl font-semibold leading-tight text-white">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/58">{detail}</p>
    </div>
  );
}

function StepMiniBars({ entries, goal }: { entries: SerializedStepsEntry[]; goal: number }) {
  const recent = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  if (recent.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        No step entries logged yet. The last seven days chart here once entries exist.
      </p>
    );
  }

  const scaleMax = Math.max(goal, ...recent.map((entry) => entry.steps ?? 0), 1);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Last {recent.length === 1 ? "day" : `${recent.length} days`}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Goal {goal.toLocaleString()}
        </span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-2">
        {recent.map((entry) => {
          const steps = entry.steps ?? 0;
          const heightPercent = Math.max(6, Math.round((steps / scaleMax) * 100));
          const metGoal = goal > 0 && steps >= goal;
          return (
            <div
              key={entry.date}
              className="flex h-full flex-1 items-end"
              title={`${formatShortDate(entry.date)}: ${steps.toLocaleString()} steps`}
            >
              <div
                className={cn(
                  "w-full rounded-full",
                  metGoal
                    ? "bg-[linear-gradient(180deg,var(--sky-accent),var(--electric-blue))]"
                    : "bg-[rgba(7,17,31,0.12)]"
                )}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {recent.map((entry) => (
          <p key={entry.date} className="flex-1 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {formatWeekdayInitial(entry.date)}
          </p>
        ))}
      </div>
    </div>
  );
}

function buildPlanDayStats(day: DefaultWorkoutDay) {
  const loggable = day.exercises.filter(isLoggableTrainingExercise);
  const estimatedSeconds = loggable.reduce((sum, exercise) => {
    const sets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
    // ~45s of work per set plus the programmed rest between sets.
    return sum + sets * (45 + exercise.restSeconds);
  }, 0);
  const estimatedMinutes = Math.max(5, Math.round(estimatedSeconds / 60 / 5) * 5);
  const topMovements = loggable
    .slice(0, 3)
    .map((exercise) => exercise.exerciseName.replace(/^[A-Z]\d*\s+/, ""));

  return {
    exerciseCount: loggable.length,
    estimatedMinutes,
    topMovements,
  };
}

function formatWeekdayInitial(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "narrow",
  });
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
  const isStrengthDay = [1, 2, 3, 4, 5].includes(trainingDayOfWeek);
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

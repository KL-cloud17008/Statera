"use client";


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
import type { SerializedPainCheckIn } from "@/actions/pain";
import { PainCheckInCard } from "@/components/pain/PainCheckInCard";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDivider, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatBlock } from "@/components/ui/stat-block";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import {
  DAY_NAMES,
  buildPlanDayStats,
  findNextTrainingDay,
  getPlanDay,
} from "@/lib/plan-preview";
import { calculateStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { formatBodyweight, formatWorkoutVolume } from "@/lib/units";
import { cn } from "@/lib/utils";

type WeightStats = {
  currentWeight: number | null;
  trend: "down" | "up" | "stable";
};

type WorkoutSummary = {
  weeklyVolume: number;
  prevWeeklyVolume: number;
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
  { day: "MON", label: "Lower A — Leg Press + Quad/Hamstring Strength", protocol: "Strength Protocol", dayOfWeek: 1 },
  { day: "TUE", label: "Upper A — Incline Push / Row / Trunk Stability", protocol: "Strength Protocol", dayOfWeek: 2 },
  { day: "WED", label: "Lower B — Accessory Legs + Hip Stability", protocol: "Strength Protocol", dayOfWeek: 3 },
  { day: "THU", label: "Upper B — Chest Machine Press / Pull + Shoulders and Arms", protocol: "Strength Protocol", dayOfWeek: 4 },
  { day: "FRI", label: "Upper Accessory + Arms + Core", protocol: "Strength Protocol", dayOfWeek: 5 },
  { day: "SAT", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 6 },
  { day: "SUN", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 0 },
];

const NEXT_BY_DAY = [
  "Complete Rest",
  "Lower A — Leg Press + Quad/Hamstring Strength",
  "Upper A — Incline Push / Row / Trunk Stability",
  "Lower B — Accessory Legs + Hip Stability",
  "Upper B — Chest Machine Press / Pull + Shoulders and Arms",
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
  painCheckIn,
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
  painCheckIn: SerializedPainCheckIn | null;
}) {
  const { settings } = useAppSettings();
  const stepStats = calculateStepStats(stepsEntries, settings.stepGoal, { timezone });
  const greeting = getGreeting();
  const heroDateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const stepCompletion = settings.stepGoal > 0
    ? Math.min(100, Math.round((todaySteps / settings.stepGoal) * 100))
    : 0;
  const weeklyVolume = formatWorkoutVolume(workoutSummary.weeklyVolume);
  const volumeWeekOverWeek =
    workoutSummary.prevWeeklyVolume > 0
      ? Math.round(
          ((workoutSummary.weeklyVolume - workoutSummary.prevWeeklyVolume) /
            workoutSummary.prevWeeklyVolume) *
            100
        )
      : null;
  const lastWorkoutVolume = workoutSummary.lastWorkout
    ? formatWorkoutVolume(workoutSummary.lastWorkout.volume)
    : null;
  const lastWorkoutDate = workoutSummary.lastWorkout
    ? formatShortDate(workoutSummary.lastWorkout.trainingDate)
    : null;
  const nextProtocol = getNextProtocol(trainingDayOfWeek);
  const todayLocalDate = getTodayDateString(timezone);
  const todayFootPain =
    painCheckIn && painCheckIn.date === todayLocalDate ? painCheckIn.footPain : null;
  const todayBackPain =
    painCheckIn && painCheckIn.date === todayLocalDate
      ? (painCheckIn.lowerBackPain ?? null)
      : null;
  const todayPlanDay = getPlanDay(trainingDayOfWeek);
  const todayPlanStats = todayPlanDay ? buildPlanDayStats(todayPlanDay) : null;
  const nextTrainingDay = !todayPlanDay ? findNextTrainingDay(trainingDayOfWeek) : null;
  const nextTrainingStats = nextTrainingDay ? buildPlanDayStats(nextTrainingDay.day) : null;
  const decision = buildDecision({
    stepsEntries,
    todaySteps,
    stepGoal: settings.stepGoal,
    workoutSummary,
    mobilitySummary,
    latestWeightDate,
    trainingDayOfWeek,
    todayFootPain,
    todayBackPain,
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
    (todayFootPain != null && todayFootPain >= 5) ||
    /foot-flare|High step load|Sole pain/i.test(decision.title);
  // Rest / recovery days don't score steps against the goal (A-audit): steps
  // still display, but no failure framing.
  const stepGoalSuspended = !todayPlanDay || recoveryFlagActive;

  return (
    <div className="page-sections">
      {/* ── Masthead + today's decision ─────────────────────────────────── */}
      <SectionHeader
        eyebrow={`${greeting} · ${heroDateLabel}`}
        title={decision.title}
        description={decision.description}
        action={
          <Button asChild variant="primary" size="md">
            <Link href={decision.href}>
              Open next action
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-5 lg:grid-cols-4">
          <StatBlock
            label="Today status"
            value={stepGoalSuspended ? (!todayPlanDay ? "Rest" : "Recovery") : `${stepCompletion}%`}
            caption={
              stepGoalSuspended
                ? `Step goal suspended · ${todaySteps.toLocaleString()} steps logged`
                : `${todaySteps.toLocaleString()} / ${settings.stepGoal.toLocaleString()} steps`
            }
            icon={<Footprints className="size-4" aria-hidden />}
          />
          <StatBlock
            label="Readiness flag"
            value={recoveryFlagActive ? "Recovery" : "Clear"}
            caption={recoveryFlagActive ? "Foot load requires attention" : "No flare flag"}
            tone={recoveryFlagActive ? "attention" : "neutral"}
            icon={<ShieldCheck className="size-4" aria-hidden />}
          />
          <StatBlock
            label="Current phase"
            value={<span className="text-body font-semibold">{nextProtocol}</span>}
            caption={`${workoutSummary.weeklySessions} sessions this week`}
            icon={<Dumbbell className="size-4" aria-hidden />}
          />
          <StatBlock
            label="Bodyweight"
            value={formatBodyweight(weightStats.currentWeight)}
            caption={getTrendCopy(weightStats.trend)}
            icon={<Scale className="size-4" aria-hidden />}
          />
        </dl>
      </SectionHeader>

      {/* ── Today's protocol + decision signals + pain check-in ─────────── */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="min-w-0">
              <p className="text-micro uppercase text-tertiary">Today&apos;s protocol</p>
              <h2 className="mt-1 text-title text-primary">{nextProtocol}</h2>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {todayPlanStats ? (
              <>
                <dl className="grid grid-cols-2 gap-4">
                  <StatBlock label="Exercises" value={todayPlanStats.exerciseCount} />
                  <StatBlock label="Est. duration" value={`${todayPlanStats.estimatedMinutes}m`} />
                </dl>
                <ul className="mt-4 space-y-1.5">
                  {todayPlanStats.topMovements.map((movement) => (
                    <li key={movement} className="flex items-start gap-2 text-body text-secondary">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-pill bg-strong" />
                      {movement}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="text-micro uppercase text-tertiary">
                  {recoveryFlagActive ? "Recovery flag active" : "Full rest — recovery only"}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {getRestDayFocus(recoveryFlagActive).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body text-secondary">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-pill bg-strong" />
                      {item}
                    </li>
                  ))}
                </ul>
                {nextTrainingDay && nextTrainingStats ? (
                  <div className="mt-4 border-t border-hairline pt-4">
                    <p className="text-micro uppercase text-tertiary">
                      Next session ·{" "}
                      {nextTrainingDay.isTomorrow
                        ? "Tomorrow"
                        : DAY_NAMES[nextTrainingDay.dayOfWeek]}
                    </p>
                    <p className="mt-1.5 text-body font-medium text-primary">
                      {nextTrainingDay.day.sessionName}
                    </p>
                    <p className="mt-0.5 text-caption text-tertiary">
                      {nextTrainingStats.exerciseCount} exercises · ~
                      {nextTrainingStats.estimatedMinutes}m est.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2">
              {decision.signals.map((signal) => (
                <li key={signal} className="flex items-start gap-2 text-body text-secondary">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-tertiary" aria-hidden />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardDivider />
          <CardContent className="pt-4">
            <PainCheckInCard latest={painCheckIn} timezone={timezone} />
          </CardContent>
        </Card>
      </section>

      {/* ── Step progress ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-title text-primary">Step progress</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/steps">
              All steps
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_15rem]">
            <div className="justify-self-center md:justify-self-start">
              <StepsProgressRing current={todaySteps} goal={settings.stepGoal} size={148} />
            </div>

            <StepMiniBars
              entries={stepsEntries}
              goal={settings.stepGoal}
              todaySteps={todaySteps}
              timezone={timezone}
            />

            <div className="space-y-3 md:col-span-2 lg:col-span-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-label text-secondary">Daily movement</span>
                <span className="tabular text-data-sm font-medium text-primary">
                  {stepGoalSuspended ? "Suspended" : `${stepCompletion}%`}
                </span>
              </div>
              {stepGoalSuspended ? (
                <p className="text-caption text-tertiary">
                  Step goal suspended — recovery day. {todaySteps.toLocaleString()} steps logged,
                  not scored.
                </p>
              ) : (
                <div
                  className="h-1.5 overflow-hidden rounded-pill bg-chart-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stepCompletion}
                  aria-label="Daily step goal progress"
                >
                  <div className="h-full rounded-pill bg-chart-ink" style={{ width: `${stepCompletion}%` }} />
                </div>
              )}

              <dl className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-control bg-sunken p-3">
                  <StatBlock
                    label="Streak"
                    value={stepStats.currentStreak}
                    tone={stepStats.streakUnloggedDays > 0 ? "attention" : "neutral"}
                    action={
                      stepStats.streakUnloggedDays > 0 && stepStats.streakBackfillDate ? (
                        <Link
                          href={`/steps?backfill=${stepStats.streakBackfillDate}#quick-add`}
                          className="mt-1 text-caption font-medium text-attention underline-offset-2 hover:underline"
                        >
                          At risk — backfill {stepStats.streakUnloggedDays}{" "}
                          {stepStats.streakUnloggedDays === 1 ? "day" : "days"}
                        </Link>
                      ) : null
                    }
                  />
                </div>
                <div className="rounded-control bg-sunken p-3">
                  <StatBlock label="Goal days" value={stepStats.goalDaysTotal} />
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Weekly rhythm ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-title text-primary">Weekly rhythm</h2>
            <p className="mt-1 text-body text-secondary">5 Strength / 2 Full Rest.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/workout/plan">
              Full plan
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {WEEKLY_RHYTHM.map((item) => {
            const isToday = item.dayOfWeek === trainingDayOfWeek;
            return (
              <li key={item.day}>
                <Card
                  className={cn(
                    "flex h-full flex-col p-4",
                    isToday && "border-accent-border bg-accent-subtle"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-micro uppercase text-tertiary">{item.day}</span>
                    {isToday ? (
                      <span className="rounded-pill bg-accent px-2 py-0.5 text-micro uppercase text-on-accent">
                        Today
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-label font-medium text-primary">{item.label}</p>
                  <p className="mt-2 text-caption text-tertiary">{item.protocol}</p>
                  {item.protocol === "Strength Protocol" ? (
                    <div className="mt-auto pt-4">
                      <WorkoutSessionActionButton
                        planId={workoutStatusByDay.get(item.dayOfWeek)?.planId}
                        status={workoutStatusByDay.get(item.dayOfWeek)?.status ?? "start"}
                        prominent={isToday}
                        fullWidth
                      />
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Trend summary ───────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-title text-primary">Trends</h2>
        <ul className="grid gap-3 lg:grid-cols-3">
          <li>
            <Card interactive className="h-full">
              <Link href="/weight" className="block h-full p-5">
                <StatBlock
                  label="Bodyweight trend"
                  value={formatBodyweight(weightStats.currentWeight)}
                  size="lg"
                  caption={getTrendCopy(weightStats.trend)}
                  icon={<TrendIcon className="size-4" aria-hidden />}
                />
              </Link>
            </Card>
          </li>
          <li>
            <Card interactive className="h-full">
              <Link href="/workout/history" className="block h-full p-5">
                <StatBlock
                  label="Training output"
                  value={weeklyVolume}
                  size="lg"
                  caption={
                    <>
                      {volumeWeekOverWeek != null ? (
                        <span className="tabular">
                          {volumeWeekOverWeek >= 0 ? "+" : ""}
                          {volumeWeekOverWeek}% vs last week ·{" "}
                        </span>
                      ) : null}
                      {workoutSummary.weeklySessions} completed sessions this week
                    </>
                  }
                  icon={<Dumbbell className="size-4" aria-hidden />}
                />
              </Link>
            </Card>
          </li>
          <li>
            <Card interactive className="h-full">
              <Link href="/mobility" className="block h-full p-5">
                <StatBlock
                  label="Movement quality"
                  value={<span className="text-body font-semibold">5 train + 2 rest</span>}
                  size="lg"
                  caption="Five training-day resets plus full rest on Saturday and Sunday."
                  icon={<Activity className="size-4" aria-hidden />}
                />
              </Link>
            </Card>
          </li>
        </ul>
      </section>

      {/* ── Last session ────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-title text-primary">Last session</h2>
        <Card>
          {workoutSummary.lastWorkout ? (
            <CardContent className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-0">
                <p className="text-heading text-primary">{workoutSummary.lastWorkout.label}</p>
                <p className="mt-1 text-caption text-tertiary">{lastWorkoutDate}</p>
              </div>
              <dl className="flex gap-8">
                <StatBlock label="Sets logged" value={workoutSummary.lastWorkout.setCount} />
                <StatBlock label="Volume moved" value={lastWorkoutVolume} />
              </dl>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-body text-secondary">No completed training sessions yet.</p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link href="/workout">Start a session</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}

function StepMiniBars({
  entries,
  goal,
  todaySteps,
  timezone,
}: {
  entries: SerializedStepsEntry[];
  goal: number;
  todaySteps: number;
  timezone?: string;
}) {
  const barAreaPx = 88;
  const today = getTodayDateString(timezone);
  const stepsByDate = new Map(entries.map((entry) => [entry.date, entry.steps ?? 0]));
  // Always chart the last 7 consecutive calendar days ending today (user
  // timezone) — logged entries can have gaps, so days without an entry show
  // as zero-stubs instead of collapsing the axis. Today prefers the live
  // count so a missing or stale entry row can never hide it.
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateString(today, index - 6);
    const logged = stepsByDate.get(date) ?? 0;
    const steps = date === today ? Math.max(logged, todaySteps) : logged;
    return { date, steps };
  });
  const scaleMax = Math.max(goal, ...days.map((day) => day.steps), 1);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-label text-secondary">Last 7 days</span>
        <span className="text-micro uppercase text-tertiary">
          Goal {goal.toLocaleString()}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        {days.map(({ date, steps }) => {
          const isToday = date === today;
          const metGoal = goal > 0 && steps >= goal;
          const barHeight = steps > 0
            ? Math.max(6, Math.round((steps / scaleMax) * barAreaPx))
            : isToday
              ? 6
              : 3;
          return (
            <div key={date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="flex w-full items-end"
                style={{ height: barAreaPx }}
                title={`${formatShortDate(date)}${isToday ? " (today)" : ""}: ${steps.toLocaleString()} steps`}
              >
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    metGoal
                      ? "bg-chart-ink"
                      : isToday
                        ? "bg-chart-ink-muted"
                        : steps > 0
                          ? "bg-chart-ink-muted"
                          : "bg-chart-track"
                  )}
                  style={{ height: barHeight }}
                />
              </div>
              <p
                className={cn(
                  "text-micro uppercase",
                  isToday ? "text-primary" : "text-tertiary"
                )}
              >
                {formatWeekdayInitial(date)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRestDayFocus(recoveryFlagActive: boolean) {
  if (recoveryFlagActive) {
    return [
      "Required foot-flare recovery block applies",
      "Keep effort 1-3/10 — recovery, not training",
      "No gym walking, no step chasing",
    ];
  }

  return [
    "Optional easy mobility only if it improves comfort",
    "No make-up sets, no step chasing",
    "Start the next training day fresh",
  ];
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
  todayFootPain,
  todayBackPain,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  stepGoal: number;
  workoutSummary: WorkoutSummary;
  mobilitySummary: MobilitySummary;
  latestWeightDate: string | null;
  trainingDayOfWeek: number;
  todayFootPain: number | null;
  todayBackPain: number | null;
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
  const highFootPain = todayFootPain != null && todayFootPain >= 5;
  const stepGoalSuspendedForSignals =
    !isStrengthDay || mobilitySummary.footFlareLogged || highStepLoad || highFootPain;
  const signals = [
    stepGoalSuspendedForSignals
      ? `Step goal suspended — recovery day. ${todaySteps.toLocaleString()} steps logged.`
      : `${todaySteps.toLocaleString()} of ${stepGoal.toLocaleString()} steps logged today.`,
    "Nutrition is tracked externally in Cronometer.",
    mobilityDone ? "Expected mobility is logged." : "Expected mobility is still open.",
    todayFootPain == null
      ? "No foot-pain check-in logged yet today."
      : todayFootPain >= 5
        ? `Foot pain ${todayFootPain}/10 logged — recovery only, no gym walking, no step chasing.`
        : todayFootPain >= 3
          ? `Foot pain ${todayFootPain}/10 logged — reduce step load, split walking into smaller chunks, no gym walking.`
          : `Foot pain ${todayFootPain}/10 logged — normal controlled activity allowed.`,
  ];

  if (todayBackPain != null) {
    signals.push(
      todayBackPain >= 5
        ? `Lower-back pain ${todayBackPain}/10 logged — pain 5/10 or higher means stop that movement. Back hyperextensions and overhead press stay removed.`
        : todayBackPain >= 3
          ? `Lower-back pain ${todayBackPain}/10 logged — remove back hyperextensions and overhead press first.`
          : `Lower-back pain ${todayBackPain}/10 logged — 0-2/10 acceptable if stable.`
    );
  }

  if (highFootPain) {
    return {
      title: `Sole pain ${todayFootPain}/10 logged. Recovery only today.`,
      description:
        "Sole/plantar pain 5+/10: work-only walking if unavoidable, recovery only, no gym walking, no step chasing. Required Foot-Flare Recovery applies.",
      href: "/mobility",
      signals,
    };
  }

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

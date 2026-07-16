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
import type { SerializedPainCheckIn } from "@/actions/pain";
import { PainCheckInCard } from "@/components/pain/PainCheckInCard";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
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
  { day: "THU", label: "Upper B — Machine Press / Pull + Shoulders and Arms", protocol: "Strength Protocol", dayOfWeek: 4 },
  { day: "FRI", label: "Upper Accessory + Arms + Core", protocol: "Strength Protocol", dayOfWeek: 5 },
  { day: "SAT", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 6 },
  { day: "SUN", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 0 },
];

const NEXT_BY_DAY = [
  "Complete Rest",
  "Lower A — Leg Press + Quad/Hamstring Strength",
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
    <div className="page-shell">
      <section data-animated="true">
        <div>
          <p className="eyebrow">{greeting} — {heroDateLabel}</p>
          <h1 className="mt-6">Private performance command.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Today&apos;s protocol, movement load, recovery flag, and bodyweight signal.
          </p>
        </div>

        <div className="mt-10 border-t border-dashed border-[var(--hairline)] pt-8">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.34fr)] xl:items-start">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 xl:grid-cols-4">
              <SignalTile
                icon={<Footprints className="h-4 w-4" />}
                label="Today status"
                value={stepGoalSuspended ? (!todayPlanDay ? "Rest" : "Recovery") : `${stepCompletion}%`}
                detail={
                  stepGoalSuspended
                    ? `Step goal suspended · ${todaySteps.toLocaleString()} steps logged`
                    : `${todaySteps.toLocaleString()} / ${settings.stepGoal.toLocaleString()}`
                }
              />
              <SignalTile
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Readiness flag"
                value={recoveryFlagActive ? "Recovery" : "Clear"}
                detail={recoveryFlagActive ? "Foot load requires attention" : "No flare flag"}
                tone={recoveryFlagActive ? "attention" : "default"}
              />
              <SignalTile icon={<Dumbbell className="h-4 w-4" />} label="Current phase" value={nextProtocol} detail={`${workoutSummary.weeklySessions} sessions this week`} />
              <SignalTile icon={<Scale className="h-4 w-4" />} label="Bodyweight" value={formatBodyweight(weightStats.currentWeight)} detail={getTrendCopy(weightStats.trend)} />
            </div>

            <div className="surface-card flex flex-col justify-between gap-8 rounded-[var(--radius-panel)] p-6">
              <div>
                <p className="eyebrow">Today&apos;s Protocol</p>
                <p className="mt-4 [font-family:var(--font-display)] text-3xl font-[380] leading-[1.05] tracking-[-0.01em] text-[var(--cream)]">{nextProtocol}</p>
                <div className="copper-rule mt-5" />
                {todayPlanStats ? (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div>
                        <p className="data-number text-2xl font-medium leading-tight text-[var(--cream)]">{todayPlanStats.exerciseCount}</p>
                        <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">Exercises</p>
                      </div>
                      <div>
                        <p className="data-number text-2xl font-medium leading-tight text-[var(--cream)]">~{todayPlanStats.estimatedMinutes}m</p>
                        <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">Est. duration</p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-2">
                      {todayPlanStats.topMovements.map((movement) => (
                        <li key={movement} className="flex items-center gap-2.5 text-sm leading-snug text-[var(--cream-2)]">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--cream-3)]" />
                          {movement}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="mt-5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">
                      {recoveryFlagActive ? "Recovery flag active" : "Full rest — recovery only"}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {getRestDayFocus(recoveryFlagActive).map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm leading-snug text-[var(--cream-2)]">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--cream-3)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {nextTrainingDay && nextTrainingStats ? (
                      <div className="mt-5 border-t border-[var(--hairline)] pt-4">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">
                          Next session · {nextTrainingDay.isTomorrow ? "Tomorrow" : DAY_NAMES[nextTrainingDay.dayOfWeek]}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-snug text-[var(--cream)]">
                          {nextTrainingDay.day.sessionName}
                        </p>
                        <p className="mt-1 text-xs text-[var(--cream-3)]">
                          {nextTrainingStats.exerciseCount} exercises · ~{nextTrainingStats.estimatedMinutes}m est.
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
                <p className="mt-5 text-sm leading-relaxed text-[var(--cream-2)]">
                  {decision.title}
                </p>
              </div>
              <Link href={decision.href} className="group inline-flex items-center justify-between gap-4 rounded-full border border-[var(--hairline)] bg-[var(--veil-1)] px-4 py-3 text-sm font-semibold text-[var(--cream)] transition-[background-color,border-color,transform] duration-[var(--duration-fast)] hover:border-[var(--hairline-strong)] hover:bg-[var(--veil-2)] active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0">
                Open next action
                <ArrowRight className="h-4 w-4 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </Link>
            </div>
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
            <StepMiniBars entries={stepsEntries} goal={settings.stepGoal} todaySteps={todaySteps} timezone={timezone} />
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily movement</span>
                <span className="data-number font-semibold text-foreground">
                  {stepGoalSuspended ? "Suspended" : `${stepCompletion}%`}
                </span>
              </div>
              {stepGoalSuspended ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Step goal suspended — recovery day. {todaySteps.toLocaleString()} steps logged, not scored.
                </p>
              ) : (
                <div className="h-1.5 overflow-hidden rounded-full border border-[var(--hairline)] bg-[var(--veil-2)]">
                  <div className="track-fill h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--electric-blue),var(--sky-accent))]" style={{ width: `${stepCompletion}%` }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="micro-panel">
                  <p className="eyebrow text-[10px]">Streak</p>
                  <p className="data-number mt-2 text-3xl font-semibold text-foreground">{stepStats.currentStreak}</p>
                  {stepStats.streakUnloggedDays > 0 && stepStats.streakBackfillDate ? (
                    <Link
                      href={`/steps?backfill=${stepStats.streakBackfillDate}#quick-add`}
                      className="mt-1 block text-[11px] font-semibold leading-snug text-[var(--attention)] hover:underline"
                    >
                      At risk — backfill {stepStats.streakUnloggedDays}{" "}
                      {stepStats.streakUnloggedDays === 1 ? "day" : "days"}
                    </Link>
                  ) : null}
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
          <PainCheckInCard latest={painCheckIn} timezone={timezone} className="mt-5" />
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

        <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {WEEKLY_RHYTHM.map((item) => {
            const isToday = item.dayOfWeek === trainingDayOfWeek;
            return (
              <div
                key={item.day}
                className={cn(
                  "interactive-row flex min-h-48 flex-col rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--basalt-1)] p-4",
                  isToday && "border-[var(--hairline-strong)] bg-[var(--basalt-2)]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="eyebrow text-[10px]">{item.day}</p>
                  {isToday ? (
                    <span className="rounded-full border border-[rgba(79,124,255,0.3)] bg-[rgba(79,124,255,0.08)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
                      Today
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-foreground">{item.label}</p>
                <p className="mt-5 inline-flex rounded-full border border-[var(--hairline)] bg-[var(--veil-1)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cream-3)]">
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
                {volumeWeekOverWeek != null ? (
                  <p className="data-number mt-1 text-xs font-semibold text-muted-foreground">
                    {volumeWeekOverWeek >= 0 ? "+" : ""}
                    {volumeWeekOverWeek}% vs last week
                  </p>
                ) : null}
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{workoutSummary.weeklySessions} completed sessions this week.</p>
          </Link>

          <Link href="/mobility" className="surface-card interactive-row block rounded-[var(--radius-card)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Movement Quality</p>
                <p className="data-number mt-4 text-3xl font-semibold text-foreground">5 train + 2 rest</p>
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
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "attention";
}) {
  return (
    <div className="border-l border-[var(--hairline)] pl-5">
      <div className="flex items-center justify-between gap-3 pr-2 text-[var(--cream-3)]">
        <p className="eyebrow text-[10px]">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "data-number value-reveal mt-4 text-2xl font-medium leading-tight",
          tone === "attention" ? "text-[var(--attention)]" : "text-[var(--cream)]"
        )}
      >
        {value}
      </p>
      <p className="mt-2.5 text-xs leading-relaxed text-[var(--cream-3)]">{detail}</p>
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
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Last 7 days</span>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Goal {goal.toLocaleString()}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        {days.map(({ date, steps }, index) => {
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
                    "bar-rise w-full rounded-t-[0.3rem] rounded-b-[0.14rem]",
                    metGoal
                      ? "bg-[linear-gradient(180deg,var(--sky-accent),var(--electric-blue))]"
                      : isToday
                        ? "bg-[linear-gradient(180deg,var(--sky-accent),var(--electric-blue))] opacity-65"
                        : steps > 0
                          ? "bg-[rgba(7,17,31,0.16)]"
                          : "bg-[rgba(7,17,31,0.07)]"
                  )}
                  style={{ height: barHeight, animationDelay: `${index * 45}ms` }}
                />
              </div>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.1em]",
                  isToday ? "text-foreground" : "text-muted-foreground"
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
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  stepGoal: number;
  workoutSummary: WorkoutSummary;
  mobilitySummary: MobilitySummary;
  latestWeightDate: string | null;
  trainingDayOfWeek: number;
  todayFootPain: number | null;
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

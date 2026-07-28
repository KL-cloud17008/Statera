"use client";


import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { SerializedPainCheckIn } from "@/actions/pain";
import { PainCheckInCard } from "@/components/pain/PainCheckInCard";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Figure, Notice, Num, PageTitle, Row, Rows, Section, Sub } from "@/components/ui/ledger";
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
  { day: "MON", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 1 },
  { day: "TUE", label: "Lower A — Leg Press + Quad/Hamstring Strength", protocol: "Strength Protocol", dayOfWeek: 2 },
  { day: "WED", label: "Upper A — Incline Push / Row / Trunk Stability", protocol: "Strength Protocol", dayOfWeek: 3 },
  { day: "THU", label: "Lower B — Accessory Legs + Hip Stability", protocol: "Strength Protocol", dayOfWeek: 4 },
  { day: "FRI", label: "Upper B — Chest Machine Press / Pull + Shoulders and Arms", protocol: "Strength Protocol", dayOfWeek: 5 },
  { day: "SAT", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 6 },
  { day: "SUN", label: "Complete Rest", protocol: "Full Rest", dayOfWeek: 0 },
];

/* Indexed by calendar weekday (0=Sunday). Temporary week: Monday is rest and
   the four sessions sit Tuesday to Friday. */
const NEXT_BY_DAY = [
  "Complete Rest",
  "Complete Rest",
  "Lower A — Leg Press + Quad/Hamstring Strength",
  "Upper A — Incline Push / Row / Trunk Stability",
  "Lower B — Accessory Legs + Hip Stability",
  "Upper B — Chest Machine Press / Pull + Shoulders and Arms",
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

  const recoveryFlagActive =
    mobilitySummary.footFlareLogged ||
    (todayFootPain != null && todayFootPain >= 5) ||
    /foot-flare|High step load|Sole pain/i.test(decision.title);
  // Rest / recovery days don't score steps against the goal (A-audit): steps
  // still display, but no failure framing.
  const stepGoalSuspended = !todayPlanDay || recoveryFlagActive;

  return (
    <>
      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <PageTitle
        eyebrow={`${greeting} · ${heroDateLabel}`}
        title={decision.title}
        lead={decision.description}
        action={
          <Button asChild variant="primary" size="sm">
            <Link href={decision.href}>
              Open next action
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      {/* ── Summary strip: figures printed on the canvas, no tiles ───────── */}
      <div className="mt-6 border-t border-rule pt-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <Figure
            label="Today status"
            value={stepGoalSuspended ? (!todayPlanDay ? "Rest" : "Recovery") : `${stepCompletion}%`}
            detail={
              stepGoalSuspended
                ? `Step goal suspended · ${todaySteps.toLocaleString()} steps logged`
                : `${todaySteps.toLocaleString()} / ${settings.stepGoal.toLocaleString()} steps`
            }
          />
          <Figure
            label="Readiness"
            value={recoveryFlagActive ? "Recovery" : "Clear"}
            tone={recoveryFlagActive ? "ember" : "primary"}
            detail={recoveryFlagActive ? "Foot load requires attention" : "No flare flag"}
          />
          <Figure
            label="Bodyweight"
            value={formatBodyweight(weightStats.currentWeight)}
            detail={getTrendCopy(weightStats.trend)}
          />
          <Figure
            label="Training output"
            value={weeklyVolume}
            detail={
              <>
                {volumeWeekOverWeek != null ? (
                  <span className="num num-left">
                    {volumeWeekOverWeek >= 0 ? "+" : ""}
                    {volumeWeekOverWeek}% vs last week ·{" "}
                  </span>
                ) : null}
                {workoutSummary.weeklySessions} sessions this week
              </>
            }
          />
        </dl>
      </div>

      {/* ── Today's protocol ─────────────────────────────────────────────── */}
      <Section
        title="Today · Protocol"
        action={
          <Link
            href="/workout"
            className="text-caption text-secondary underline-offset-2 hover:text-primary hover:underline"
          >
            Open session
          </Link>
        }
      >
        <p className="text-body text-primary">{nextProtocol}</p>

        {todayPlanStats ? (
          <>
            <dl className="mt-4 flex gap-8">
              <Figure label="Exercises" value={todayPlanStats.exerciseCount} />
              <Figure label="Est. duration" value={`${todayPlanStats.estimatedMinutes}m`} />
            </dl>
            <Rows columns="minmax(0,1fr) auto" className="mt-4">
              {todayPlanStats.topMovements.map((movement) => (
                <Row key={movement} columns="minmax(0,1fr) auto">
                  <span className="truncate text-secondary">{movement}</span>
                </Row>
              ))}
            </Rows>
          </>
        ) : (
          <>
            <p className="mt-3 text-label uppercase text-tertiary">
              {recoveryFlagActive ? "Recovery flag active" : "Full rest — recovery only"}
            </p>
            <Rows columns="minmax(0,1fr)" className="mt-2">
              {getRestDayFocus(recoveryFlagActive).map((item) => (
                <Row key={item} columns="minmax(0,1fr)">
                  <span className="text-secondary">{item}</span>
                </Row>
              ))}
            </Rows>
            {nextTrainingDay && nextTrainingStats ? (
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-row">
                <span className="text-label uppercase text-tertiary">
                  Next ·{" "}
                  {nextTrainingDay.isTomorrow
                    ? "Tomorrow"
                    : DAY_NAMES[nextTrainingDay.dayOfWeek]}
                </span>
                <span className="text-primary">{nextTrainingDay.day.sessionName}</span>
                <span className="text-tertiary">
                  {nextTrainingStats.exerciseCount} exercises · ~
                  {nextTrainingStats.estimatedMinutes}m
                </span>
              </div>
            ) : null}
          </>
        )}
      </Section>

      {/* ── Signals + pain check-in ──────────────────────────────────────── */}
      <Section title="Signals">
        <Rows columns="minmax(0,1fr)">
          {decision.signals.map((signal) => (
            <Row key={signal} columns="auto minmax(0,1fr)">
              <CheckCircle2 className="size-3.5 text-tertiary" aria-hidden />
              <span className="text-secondary">{signal}</span>
            </Row>
          ))}
        </Rows>
        <div className="mt-5">
          <PainCheckInCard latest={painCheckIn} timezone={timezone} />
        </div>
      </Section>

      {/* ── Steps ────────────────────────────────────────────────────────── */}
      <Section
        title="Steps"
        action={
          <Link
            href="/steps"
            className="text-caption text-secondary underline-offset-2 hover:text-primary hover:underline"
          >
            All steps
          </Link>
        }
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <dl className="flex flex-wrap gap-8">
            <Figure
              label="Today"
              value={todaySteps.toLocaleString()}
              size="xl"
              detail={`of ${settings.stepGoal.toLocaleString()} · ${
                stepGoalSuspended ? "not scored" : `${stepCompletion}%`
              }`}
            />
            <Figure
              label="Streak"
              value={stepStats.currentStreak}
              size="lg"
              tone={stepStats.streakUnloggedDays > 0 ? "ember" : "primary"}
              detail={
                stepStats.streakUnloggedDays > 0 && stepStats.streakBackfillDate ? (
                  <Link
                    href={`/steps?backfill=${stepStats.streakBackfillDate}#quick-add`}
                    className="text-ember underline-offset-2 hover:underline"
                  >
                    At risk — backfill {stepStats.streakUnloggedDays}{" "}
                    {stepStats.streakUnloggedDays === 1 ? "day" : "days"}
                  </Link>
                ) : (
                  "Consecutive goal days"
                )
              }
            />
            <Figure label="Goal days" value={stepStats.goalDaysTotal} size="lg" />
          </dl>

          <StepMiniBars
            entries={stepsEntries}
            goal={settings.stepGoal}
            todaySteps={todaySteps}
            timezone={timezone}
          />
        </div>

        {stepGoalSuspended ? (
          <Notice className="mt-4">
            Step goal suspended — recovery day. {todaySteps.toLocaleString()} steps logged, not
            scored.
          </Notice>
        ) : (
          <div
            className="mt-4 h-1 overflow-hidden rounded-pill bg-chart-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stepCompletion}
            aria-label="Daily step goal progress"
          >
            <div className="h-full rounded-pill bg-chart-ink" style={{ width: `${stepCompletion}%` }} />
          </div>
        )}
      </Section>

      {/* ── Weekly rhythm as a ledger, not a 7-card grid ─────────────────── */}
      <Section
        title="Weekly rhythm"
        action={
          <Link
            href="/workout/plan"
            className="text-caption text-secondary underline-offset-2 hover:text-primary hover:underline"
          >
            Full plan
          </Link>
        }
      >
        <p className="mb-3 text-caption text-tertiary">4 Strength / 3 Full Rest.</p>
        <Rows
          columns={RHYTHM_COLUMNS_MOBILE}
          mdColumns={RHYTHM_COLUMNS}
          head={
            <>
              <span>Day</span>
              <span>Session</span>
              <span className="hidden md:block">Protocol</span>
              <span />
            </>
          }
        >
          {WEEKLY_RHYTHM.map((item) => {
            const isToday = item.dayOfWeek === trainingDayOfWeek;
            return (
              <Row
                key={item.day}
                columns={RHYTHM_COLUMNS_MOBILE}
                mdColumns={RHYTHM_COLUMNS}
                interactive
              >
                <span
                  className={cn(
                    "num num-left self-start pt-0.5 text-label uppercase md:self-center md:pt-0",
                    isToday ? "text-accent" : "text-tertiary"
                  )}
                >
                  {item.day}
                </span>
                <span className="min-w-0">
                  {/* Mobile shows the session name, which fits; the focus that
                      follows the dash moves to the fold line. Desktop keeps the
                      full label in one cell. */}
                  <span
                    className={cn(
                      "block truncate md:hidden",
                      isToday ? "text-primary" : "text-secondary"
                    )}
                  >
                    {splitSessionLabel(item.label).name}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate md:block",
                      isToday ? "text-primary" : "text-secondary"
                    )}
                  >
                    {item.label}
                  </span>
                  <Sub className="mt-0.5 block truncate">
                    {splitSessionLabel(item.label).focus ?? item.protocol}
                  </Sub>
                </span>
                <span className="hidden truncate text-tertiary md:block">{item.protocol}</span>
                <span className="justify-self-end">
                  {item.protocol === "Strength Protocol" ? (
                    <WorkoutSessionActionButton
                      planId={workoutStatusByDay.get(item.dayOfWeek)?.planId}
                      status={workoutStatusByDay.get(item.dayOfWeek)?.status ?? "start"}
                      prominent={isToday}
                    />
                  ) : (
                    <span className="text-caption text-tertiary">Rest</span>
                  )}
                </span>
              </Row>
            );
          })}
        </Rows>
      </Section>

      {/* ── Last session ─────────────────────────────────────────────────── */}
      <Section
        title="Last session"
        action={
          <Link
            href="/workout/history"
            className="text-caption text-secondary underline-offset-2 hover:text-primary hover:underline"
          >
            History
          </Link>
        }
      >
        {workoutSummary.lastWorkout ? (
          <Rows columns="minmax(0,1fr) auto auto">
            <Row columns="minmax(0,1fr) auto auto">
              <span className="truncate text-primary">{workoutSummary.lastWorkout.label}</span>
              <Num tone="secondary">{workoutSummary.lastWorkout.setCount} sets</Num>
              <Num>{lastWorkoutVolume}</Num>
            </Row>
            <Row columns="minmax(0,1fr) auto auto">
              <span className="text-tertiary">{lastWorkoutDate}</span>
            </Row>
          </Rows>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-body text-secondary">No completed training sessions yet.</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/workout">Start a session</Link>
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}

/* Mobile drops the Protocol column and folds it under the session name; the
   desktop ledger restores it as a real column. Authored separately rather
   than letting the four-column grid degrade into 390px. */
/* The action column is a fixed width, not `auto`: an auto column sizes from
   its own content, so the empty head cell collapsed to 0 and the SESSION
   label overhung the button column. A fixed track keeps head and rows on
   one grid — which is the whole point of a ledger. */
/* Display-only split of "Lower A — Leg Press + Quad/Hamstring Strength" into
   its name and focus. Purely presentational: the plan data is untouched. */
function splitSessionLabel(label: string): { name: string; focus?: string } {
  const [name, ...rest] = label.split(" — ");
  return { name, focus: rest.length > 0 ? rest.join(" — ") : undefined };
}

const RHYTHM_COLUMNS_MOBILE = "2.5rem minmax(0,1fr) 5.5rem";
const RHYTHM_COLUMNS = "3.5rem minmax(0,1fr) minmax(0,9rem) 7rem";

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
        <span className="text-label uppercase text-tertiary">
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
                  "text-label uppercase",
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
  const isStrengthDay = [2, 3, 4, 5].includes(trainingDayOfWeek);
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

"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";
import type { SerializedPainCheckIn } from "@/actions/pain";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle, Section } from "@/components/ui/ledger";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { getTodayDateString } from "@/lib/dates";
import { getMobilityProgram } from "@/lib/mobility";
import { getPainGuidance } from "@/lib/movement-guidance";
import { DAY_NAMES, buildPlanDayStats, getPlanDay } from "@/lib/plan-preview";
import { isLoggableTrainingExercise } from "@/lib/training-session";
import { formatSetPrescription } from "@/lib/workout-prescription";

type WorkoutDayStatus = { planId: string; dayOfWeek: number; status: "start" | "resume" | "view"; sessionId?: string };

export function DashboardPageClient({ workoutDayStatuses, mobilitySummary, timezone, trainingDayOfWeek, painCheckIn }: {
  workoutDayStatuses: WorkoutDayStatus[];
  mobilitySummary: { completedTypes: string[] };
  timezone?: string;
  trainingDayOfWeek: number;
  painCheckIn: SerializedPainCheckIn | null;
}) {
  const today = getTodayDateString(timezone);
  const dateLabel = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const active = workoutDayStatuses.find(day => day.status === "resume");
  const todayStatus = workoutDayStatuses.find(day => day.dayOfWeek === trainingDayOfWeek);
  const focusDay = active?.dayOfWeek ?? trainingDayOfWeek;
  const plan = getPlanDay(focusDay);
  const planStats = plan ? buildPlanDayStats(plan) : null;
  const exercises = plan?.exercises.filter(isLoggableTrainingExercise) ?? [];
  const status = active?.status ?? todayStatus?.status ?? "start";
  const guidance = getPainGuidance(painCheckIn?.date === today ? painCheckIn.footPain : null);
  const mobility = getMobilityProgram(focusDay);
  const mobilityCompleted = mobilitySummary.completedTypes.includes(mobility.logType);
  const recoveryCompleted = mobilitySummary.completedTypes.includes("POST_WORKOUT");

  return <>
    <PageTitle title="Dashboard" action={<p className="text-row text-tertiary">{dateLabel}</p>} />
    <div className="dashboard-grid">
      <section className="dashboard-training min-w-0" aria-label="Today's training" data-tone="training">
        <div className="command-surface training-overview">
          <div className="training-caption flex flex-wrap items-center justify-between gap-3 text-row text-tertiary">
            <span className="flex items-center gap-2"><Dumbbell className="size-4" aria-hidden />{active ? "Session in progress" : "Today's training"}</span>
            <span>{active ? DAY_NAMES[focusDay] : status === "view" ? "Completed" : plan ? DAY_NAMES[focusDay] : "Rest day"}</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-primary">{plan?.sessionName.split(" — ")[0] ?? "Complete Rest"}</h2>
          <p className="mt-2 text-body text-secondary">{plan?.sessionName.split(" — ").slice(1).join(" — ") ?? "No strength session scheduled today."}</p>
          {planStats ? <p className="mt-3 text-row text-tertiary">{planStats.exerciseCount} exercises · About {planStats.estimatedMinutes} min</p> : null}
          <div className="training-action mt-6 flex flex-wrap items-center gap-3">
            {plan ? <WorkoutSessionActionButton planId={active?.planId ?? todayStatus?.planId} sessionId={active?.sessionId ?? todayStatus?.sessionId} status={status} prominent className="min-h-touch px-5 text-body" /> : <Button asChild variant="secondary"><Link href="/workout/plan">View training plan</Link></Button>}
          </div>
        </div>
        {exercises.length > 0 ? <details className="mt-3 border-b border-rule">
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-2 text-row font-medium focus-visible:outline-2 focus-visible:outline-accent">
            View today&apos;s exercises <span className="text-caption text-tertiary">{exercises.length} exercises</span>
          </summary>
          <ol className="divide-y divide-rule" aria-label="Today's training exercises">
            {exercises.map((exercise, index) => <li key={exercise.exerciseName} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 px-2 py-3">
              <span className="pt-0.5 text-caption tabular-nums text-tertiary">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="text-row font-medium text-primary">{exercise.exerciseName}</p>
                <p className="mt-1 text-caption text-secondary">{formatSetPrescription(exercise)} × {exercise.reps}{exercise.targetRPE ? ` · RPE ${exercise.targetRPE}` : ""}</p>
              </div>
            </li>)}
          </ol>
        </details> : null}
        {guidance.attention ? <Notice className="mt-4">Foot pain {guidance.text}</Notice> : null}
      </section>

      <Section title="Today's mobility" tone="movement" className="dashboard-mobility">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-body-lg font-semibold text-primary">{mobility.sessionTitle}</h3>
            <p className="mt-1 text-row text-tertiary">{mobility.totalDuration}</p>
          </div>
          <p className="flex items-center gap-1.5 text-caption text-secondary">{mobilityCompleted ? <CheckCircle2 className="size-4 text-accent" aria-hidden /> : null}{mobilityCompleted ? "Logged today" : mobility.logType === "PRE_WORKOUT" ? "Before training" : "Optional recovery"}</p>
        </div>
        {active && focusDay !== trainingDayOfWeek ? <p className="mt-3 text-caption text-secondary">Matched to the {DAY_NAMES[focusDay]} session you are resuming.</p> : null}
        <ul className="mt-4 divide-y divide-rule border-y border-rule" aria-label="Today's mobility blocks">
          {mobility.blocks.map(block => <li key={block.id} className="flex items-baseline justify-between gap-3 py-3">
            <span className="min-w-0 text-row font-medium text-primary">{block.title}</span>
            <span className="shrink-0 text-caption text-tertiary">{block.duration}</span>
          </li>)}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary"><Link href="/mobility#session">{mobilityCompleted ? "Review mobility" : "Open mobility"}<ArrowRight className="size-4" aria-hidden /></Link></Button>
          {mobility.logType === "PRE_WORKOUT" ? <Link href="/mobility#later-recovery" className="inline-flex min-h-11 items-center text-caption text-secondary hover:underline">{recoveryCompleted ? "Recovery logged" : "Later recovery"}<ArrowRight className="ml-1.5 size-3.5" aria-hidden /></Link> : null}
        </div>
      </Section>
    </div>
  </>;
}

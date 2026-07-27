"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle, Section } from "@/components/ui/ledger";
import { BACK_PAIN_RULES } from "@/lib/default-workout-plan";
import { DAY_NAMES, buildPlanDayStats, findNextTrainingDay } from "@/lib/plan-preview";
import { SessionLogger } from "./SessionLogger";
import { WorkoutDayPreview } from "./WorkoutDayPreview";
import { CustomWorkoutBuilder } from "./CustomWorkoutBuilder";
import { WorkoutPlanResetButton } from "./WorkoutPlanResetButton";

type Exercise = {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string | null;
  restSeconds: number | null;
  targetRPE: string | null;
  cues: string | null;
  supersetGroup: string | null;
  exerciseType: string;
};

type TodayPlan = {
  id: string;
  sessionName: string;
  exercises: Exercise[];
} | null;

type SessionSet = {
  exerciseName: string;
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

type PrevSet = {
  exerciseName: string;
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
};

type ActiveSession = {
  id: string;
  sessionName: string;
  startTime: string;
  trainingDate: string;
  isStale: boolean;
  exercises: Exercise[];
  sets: SessionSet[];
  previousSets: PrevSet[];
} | null;

type DayGuidance = {
  title: string;
  eyebrow: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  details: string[];
};

export function WorkoutPageClient({
  todayPlan,
  activeSession,
  trainingDayOfWeek,
  todayBackPain = null,
}: {
  todayPlan: TodayPlan;
  activeSession: ActiveSession;
  trainingDayOfWeek: number;
  todayBackPain?: number | null;
}) {
  const dayGuidance = !todayPlan ? getDayGuidance(trainingDayOfWeek) : null;
  const backPainGateActive = todayBackPain != null && todayBackPain >= 3;
  const nextTrainingDay = dayGuidance ? findNextTrainingDay(trainingDayOfWeek) : null;
  const nextTrainingStats = nextTrainingDay ? buildPlanDayStats(nextTrainingDay.day) : null;

  return (
    <>
      {/* WorkoutDayPreview prints its own masthead, so the page-level title is
          suppressed in that branch rather than printing two. */}
      {todayPlan && !activeSession ? null : (
        <PageTitle
          eyebrow={
            activeSession
              ? "Session in progress"
              : /* On a rest day the eyebrow carries the "Full Rest" framing. */
                (dayGuidance?.eyebrow ?? "Training Ledger")
          }
          title={
            activeSession
              ? activeSession.sessionName
              : dayGuidance
                ? dayGuidance.title
                : "Custom training"
          }
          lead={
            activeSession
              ? "Log working sets only. Ramp-up sets stay outside the ledger."
              : dayGuidance
                ? dayGuidance.description
                : "Build or reuse a focused session."
          }
          action={
            <div className="flex flex-wrap items-center gap-2">
              <WorkoutPlanResetButton />
              <Button asChild variant="secondary" size="sm">
                <Link href="/workout/history">
                  <History className="size-4" />
                  History
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/workout/plan">
                  <ClipboardList className="size-4" />
                  Full plan
                </Link>
              </Button>
            </div>
          }
        />
      )}

      {/* Back-care block: the gate itself is enforced in the plan data; this
          states why, and escalates its wording at 5/10. */}
      {backPainGateActive ? (
        <Notice className="mt-6">
          <span className="font-medium">
            {todayBackPain != null && todayBackPain >= 5
              ? `Lower-back pain ${todayBackPain}/10 logged. Pain 5/10 or higher means stop that movement — back hyperextensions and overhead press stay removed.`
              : `Lower-back pain ${todayBackPain}/10 logged. Remove back hyperextensions and overhead press first.`}
          </span>
          <span className="mt-1 block text-caption">{BACK_PAIN_RULES[5]}</span>
        </Notice>
      ) : null}

      {activeSession ? (
        <SessionLogger
          sessionId={activeSession.id}
          sessionName={activeSession.sessionName}
          exercises={activeSession.exercises}
          existingSets={activeSession.sets}
          previousSets={activeSession.previousSets}
          startTime={activeSession.startTime}
          trainingDate={activeSession.trainingDate}
          isStale={activeSession.isStale}
        />
      ) : todayPlan ? (
        <>
          <WorkoutDayPreview plan={todayPlan} backPainGateActive={backPainGateActive} />
          <Section>
            <details className="group">
              <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <span>Custom session builder</span>
                <span className="text-label uppercase text-tertiary group-open:hidden">Open</span>
                <span className="hidden text-label uppercase text-tertiary group-open:inline">Close</span>
              </summary>
              <div className="mt-4">
                <CustomWorkoutBuilder hasActiveSession={false} compact />
              </div>
            </details>
          </Section>
        </>
      ) : dayGuidance ? (
        <>
          <Section className="mt-6">
            {dayGuidance.actionHref && dayGuidance.actionLabel ? (
              <Button asChild variant="secondary" className="mb-5 w-full sm:w-auto">
                <Link href={dayGuidance.actionHref}>
                  {dayGuidance.actionLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}

            <div className="ledger-rows border-t border-rule">
              {dayGuidance.details.map((detail) => (
                <p key={detail} className="py-3 text-row text-secondary">
                  {detail}
                </p>
              ))}
            </div>
          </Section>

          {nextTrainingDay && nextTrainingStats ? (
            <Section
              title={`Next session · ${nextTrainingDay.isTomorrow ? "Tomorrow" : DAY_NAMES[nextTrainingDay.dayOfWeek]}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-body font-medium text-primary">
                  {nextTrainingDay.day.sessionName}
                </span>
                <span className="num text-caption text-tertiary">
                  {nextTrainingStats.exerciseCount} exercises · ~{nextTrainingStats.estimatedMinutes}m
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-rule pt-3">
                {nextTrainingStats.topMovements.map((movement) => (
                  <span key={movement} className="text-caption text-tertiary">{movement}</span>
                ))}
              </div>
            </Section>
          ) : null}
        </>
      ) : (
        <Section className="mt-6">
          <p className="text-body text-secondary">
            No programmed session is queued. Use templates or compose a working session.
          </p>
          <div className="mt-6">
            <CustomWorkoutBuilder hasActiveSession={false} />
          </div>
        </Section>
      )}
    </>
  );
}

function getDayGuidance(dayOfWeek: number): DayGuidance | null {
  if (dayOfWeek === 6) {
    return {
      eyebrow: "Full Rest",
      title: "Complete Rest",
      description: "Rest at home. Use mobility only if it improves foot, ankle, hip, or lower-back comfort.",
      details: [
        "Optional recovery only if helpful: supported breathing, ankle pumps, ankle circles, and gentle calf stretches.",
        "No gym. No make-up sets. No step chasing.",
      ],
    };
  }

  if (dayOfWeek === 0) {
    return {
      eyebrow: "Full Rest",
      title: "Complete Rest",
      description: "Full rest. Keep the day deliberately empty.",
      details: ["No make-up training. Start the next week fresh."],
    };
  }

  return null;
}

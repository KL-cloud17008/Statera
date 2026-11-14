"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle, Section } from "@/components/ui/ledger";
import { LOWER_B_BACK_PAIN_READINESS_NOTE } from "@/lib/default-workout-plan";
import { DAY_NAMES, buildPlanDayStats, findNextTrainingDay } from "@/lib/plan-preview";
import { SessionLogger } from "./SessionLogger";
import { WorkoutDayPreview } from "./WorkoutDayPreview";
import { CustomWorkoutBuilder } from "./CustomWorkoutBuilder";
import { WorkoutPlanResetButton } from "./WorkoutPlanResetButton";
import { OfflineWorkoutControls } from "./OfflineWorkout";
import type { ActiveWorkout } from "@/lib/offline-workout";

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
  offlineAccountId,
  trainingDayOfWeek,
  todayBackPain = null,
  footPainGateActive = false,
}: {
  todayPlan: TodayPlan;
  activeSession: ActiveWorkout | null;
  offlineAccountId: string;
  trainingDayOfWeek: number;
  todayBackPain?: number | null;
  footPainGateActive?: boolean;
}) {
  const dayGuidance = !todayPlan ? getDayGuidance(trainingDayOfWeek) : null;
  const backPainGateActive = todayBackPain != null && todayBackPain >= 3;
  const nextTrainingDay = dayGuidance ? findNextTrainingDay(trainingDayOfWeek) : null;
  const nextTrainingStats = nextTrainingDay ? buildPlanDayStats(nextTrainingDay.day) : null;

  return (
    <>
      {/* WorkoutDayPreview prints its own masthead, so the page-level title is
          suppressed in that branch rather than printing two. */}
      {activeSession ? (
        <header className="border-b border-rule pb-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Training</h1>
            <nav aria-label="Training views" className="flex items-center gap-4 text-caption font-medium text-secondary">
              <Link href="/workout/history" className="inline-flex min-h-12 items-center underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">History</Link>
              <Link href="/workout/plan" className="inline-flex min-h-12 items-center underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Full plan</Link>
            </nav>
          </div>
          <p className="text-caption leading-relaxed text-secondary">{activeSession.sessionName}</p>
        </header>
      ) : todayPlan ? null : (
        <PageTitle
          eyebrow={dayGuidance?.eyebrow ?? "Training"}
          title={
            dayGuidance ? dayGuidance.title : "Custom training"
          }
          lead={
            dayGuidance ? dayGuidance.description : "Build or reuse a focused session."
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

      <nav aria-label="Training tools" className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm" className="min-h-11"><Link href="/workout/suggestions">Workout suggestions</Link></Button>
        <Button asChild variant="secondary" size="sm" className="min-h-11"><Link href="/workout/journal">Recovery &amp; supplements</Link></Button>
      </nav>

      <OfflineWorkoutControls accountId={offlineAccountId} session={activeSession} backPainGateActive={backPainGateActive} footPainGateActive={footPainGateActive} />

      {backPainGateActive ? (
        <Notice className="mt-6">
          <span className="font-medium">Lower-back pain {todayBackPain}/10 logged.</span>
          <span className="mt-1 block text-caption">{LOWER_B_BACK_PAIN_READINESS_NOTE}</span>
        </Notice>
      ) : null}
      {footPainGateActive ? (
        <Notice className="mt-6">
          Foot pain 3/10 or higher logged today. Skip loaded carries and seated calf raises.
        </Notice>
      ) : null}

      {activeSession ? (
        <SessionLogger
          key={activeSession.id}
          sessionId={activeSession.id}
          sessionName={activeSession.sessionName}
          exercises={activeSession.exercises}
          existingSets={activeSession.sets}
          previousSets={activeSession.previousSets}
          startTime={activeSession.startTime}
          trainingDate={activeSession.trainingDate}
          isStale={activeSession.isStale}
          backPainGateActive={backPainGateActive}
          footPainGateActive={footPainGateActive}
          offlineLogging
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
                <span className="num text-right text-caption text-tertiary">
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

  return null;
}

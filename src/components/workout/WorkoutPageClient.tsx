"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, History } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
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
}: {
  todayPlan: TodayPlan;
  activeSession: ActiveSession;
  trainingDayOfWeek: number;
}) {
  const dayGuidance = !todayPlan ? getDayGuidance(trainingDayOfWeek) : null;

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow={activeSession ? "Session in progress" : "Training Ledger"}
        title={
          activeSession
            ? activeSession.sessionName
            : todayPlan
              ? "Today's protocol"
              : dayGuidance
                ? dayGuidance.title
                : "Custom training"
        }
        description={
          activeSession
            ? "Log working sets only. Ramp-up sets stay outside the ledger."
            : todayPlan
              ? "Session prep is non-loggable. Working sets start the ledger."
              : dayGuidance
                ? dayGuidance.description
                : "Build or reuse a focused session."
        }
        action={
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <WorkoutPlanResetButton />
            <Button asChild variant="secondary">
              <Link href="/workout/history">
                <History className="h-4 w-4" />
                History
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/workout/plan">
                <ClipboardList className="h-4 w-4" />
                Full plan
              </Link>
            </Button>
          </div>
        }
      />

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
        <div className="grid gap-8">
          <WorkoutDayPreview plan={todayPlan} />
          <details className="group ledger-divider pt-6">
            <summary className="warm-pill flex cursor-pointer list-none items-center justify-between gap-4 rounded-full px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:text-foreground">
              <span>Custom session builder</span>
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:hidden">Open</span>
              <span className="hidden text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:inline">Close</span>
            </summary>
            <div className="mt-5">
              <CustomWorkoutBuilder hasActiveSession={false} compact />
            </div>
          </details>
        </div>
      ) : dayGuidance ? (
        <section className="document-panel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
            <div>
              <p className="eyebrow">{dayGuidance.eyebrow}</p>
              <h2 className="mt-3 text-3xl">{dayGuidance.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {dayGuidance.description}
              </p>
            </div>
            {dayGuidance.actionHref && dayGuidance.actionLabel ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href={dayGuidance.actionHref}>
                  {dayGuidance.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="mt-6 divide-y divide-border border-y border-border">
            {dayGuidance.details.map((detail) => (
              <p key={detail} className="py-3 text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>
            ))}
          </div>
        </section>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] xl:items-start">
          <section className="editorial-surface-quiet space-y-6">
            <p className="eyebrow">Today</p>
            <p className="text-3xl font-semibold tracking-normal">
              No programmed session is queued.
            </p>
            <p className="subtle-copy">Use templates or compose a working session.</p>
          </section>

          <CustomWorkoutBuilder hasActiveSession={false} />
        </div>
      )}
    </div>
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

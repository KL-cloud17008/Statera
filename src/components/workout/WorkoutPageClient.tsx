"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
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

export function WorkoutPageClient({
  todayPlan,
  activeSession,
}: {
  todayPlan: TodayPlan;
  activeSession: ActiveSession;
}) {
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow={activeSession ? "Session in progress" : "Workout"}
        title={
          activeSession
            ? activeSession.sessionName
            : todayPlan
              ? "Train with more focus, less interface."
              : "Build the session you actually need."
        }
        description={
          activeSession
            ? "Your session is already live. The page shifts into a logging ledger so previous numbers and rest timing stay close without turning into a wall of cards."
            : todayPlan
              ? "Today's programmed work is the primary sequence. Custom work stays available as a quieter secondary module below the protocol."
              : "No scheduled day is in the way, so the builder and saved templates take over the page."
        }
        action={
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <WorkoutPlanResetButton />
            <Link href="/workout/history" className="text-link inline-flex items-center gap-2">
              History
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/workout/plan" className="text-link inline-flex items-center gap-2">
              Full plan
              <ArrowRight className="h-4 w-4" />
            </Link>
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
          <details className="group border-t border-border pt-6">
            <summary className="warm-pill flex cursor-pointer list-none items-center justify-between gap-4 rounded-full px-5 py-3 text-sm font-medium text-foreground transition-colors hover:text-foreground">
              <span>Custom session builder</span>
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:hidden">Open</span>
              <span className="hidden text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:inline">Close</span>
            </summary>
            <div className="mt-5">
              <CustomWorkoutBuilder hasActiveSession={false} compact />
            </div>
          </details>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] xl:items-start">
          <section className="editorial-surface-quiet space-y-6">
            <p className="eyebrow">Today</p>
            <p className="text-3xl font-semibold tracking-normal">
              No programmed session is queued.
            </p>
            <p className="subtle-copy">
              Start from a template or build a session from scratch without switching views or
              hunting through another tabbed state.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Pull exercises from the library.</p>
              <p>Save what works as a reusable template.</p>
              <p>Start immediately when the session looks right.</p>
            </div>
          </section>

          <CustomWorkoutBuilder hasActiveSession={false} />
        </div>
      )}
    </div>
  );
}

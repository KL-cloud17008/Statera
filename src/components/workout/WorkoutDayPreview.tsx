"use client";

import Link from "next/link";
import { ClipboardList, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle, Section } from "@/components/ui/ledger";
import { SessionPrepStrip } from "@/components/workout/SessionPrepStrip";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE, isOverheadPressExercise } from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise } from "@/lib/training-session";
import { getIntroductorySets, formatSetPrescription } from "@/lib/workout-prescription";
import type { PlanExercise } from "./ExerciseCard";

type Plan = { id: string; sessionName: string; exercises: PlanExercise[] };

export function WorkoutDayPreview({ plan, hideHeader, backPainGateActive = false }: {
  plan: Plan; hideHeader?: boolean; backPainGateActive?: boolean;
}) {
  const exercises = plan.exercises.filter(isLoggableTrainingExercise);
  const totalSets = exercises.reduce((sum, exercise) => sum + getIntroductorySets(exercise), 0);
  const showReadiness = plan.sessionName === LOWER_B_BACK_SAFE_TITLE || /Lower A|Upper B/.test(plan.sessionName);
  return (
    <div>
      {!hideHeader ? <PageTitle eyebrow="Today" title="Training" lead={plan.sessionName} action={<div className="flex gap-2"><Button asChild variant="secondary" size="sm"><Link href="/workout/history"><History className="size-4" />History</Link></Button><Button asChild variant="secondary" size="sm"><Link href="/workout/plan"><ClipboardList className="size-4" />Full plan</Link></Button></div>} /> : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
        <p className="text-body text-secondary"><span className="font-medium tabular-nums text-primary">{exercises.length}</span> exercises <span aria-hidden className="px-2">·</span><span className="font-medium tabular-nums text-primary">{totalSets}</span> introductory sets (includes any primer)</p>
        <WorkoutSessionActionButton planId={plan.id} status="start" prominent fullWidth className="min-h-12 sm:w-auto sm:min-w-48" />
      </div>
      {showReadiness ? <Notice tone="accent" className="mt-5">{LOWER_B_BACK_PAIN_READINESS_NOTE}</Notice> : null}
      {/Lower B/.test(plan.sessionName) ? <Notice className="mt-4">Warm-up: Lying Leg Curl, 1-2 easy sets of 12-15. Not working hamstring volume.</Notice> : null}
      <Section title="Today's session">
        <div className="divide-y divide-rule">
          {exercises.map((exercise, index) => <div key={exercise.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
            <span className="pt-0.5 text-caption tabular-nums text-tertiary">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-body font-medium text-primary">{exercise.exerciseName}</p>
              <p className="mt-1 text-caption text-secondary">{formatSetPrescription(exercise)} × {exercise.reps}{exercise.targetRPE ? ` · RPE ${exercise.targetRPE}` : ""}{exercise.tempo ? ` · Tempo ${exercise.tempo}` : ""}</p>
              {backPainGateActive && isOverheadPressExercise(exercise.exerciseName) ? <p className="mt-2 text-caption text-ember">Removed — lower-back pain 3/10 or higher</p> : null}
              {exercise.cues ? <details className="mt-1"><summary className="flex min-h-10 cursor-pointer items-center text-caption text-secondary focus-visible:outline-2 focus-visible:outline-accent">Technique &amp; guidance</summary><p className="pb-2 text-caption leading-relaxed text-secondary">{exercise.cues}</p></details> : null}
            </div>
            <p className="col-start-2 text-caption text-secondary sm:col-start-auto sm:text-right">{exercise.supersetGroup ? `Block ${exercise.supersetGroup} · ` : ""}{exercise.restSeconds ? `${exercise.restSeconds}s rest` : ""}</p>
          </div>)}
        </div>
      </Section>
      <Section><details><summary className="flex min-h-12 cursor-pointer items-center text-body font-medium focus-visible:outline-2 focus-visible:outline-accent">Session preparation</summary><SessionPrepStrip note="Use controlled ramp-up sets before working sets. Stop short of failure." /></details></Section>
    </div>
  );
}

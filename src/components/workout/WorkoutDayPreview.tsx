"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { startWorkoutSession } from "@/actions/workout";
import { Button } from "@/components/ui/button";

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

type Plan = {
  id: string;
  sessionName: string;
  exercises: Exercise[];
};

export function WorkoutDayPreview({
  plan,
  hideHeader,
}: {
  plan: Plan;
  hideHeader?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const workingExercises = plan.exercises.filter(
    (exercise) => exercise.exerciseType === "WORKING"
  );
  const totalWorkingSets = workingExercises.reduce(
    (sum, exercise) => sum + exercise.sets,
    0
  );

  function handleStart() {
    startTransition(async () => {
      const result = await startWorkoutSession(plan.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.warning ?? "Workout started");
      router.refresh();
    });
  }

  return (
    <section className="editorial-surface space-y-8">
      {!hideHeader ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="eyebrow">Today&apos;s plan</p>
            <h2 className="mt-3">{plan.sessionName}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The programmed day sits as one sequence instead of breaking into separate cards. You
              can read the session at a glance, then start without another decision layer.
            </p>
          </div>

          <div className="space-y-4 lg:text-right">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{workingExercises.length} working exercises</p>
              <p>{totalWorkingSets} working sets</p>
            </div>
            <Button size="lg" type="button" onClick={handleStart} disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Session
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-0 border-t border-border/70">
        {plan.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="grid gap-4 border-b border-border/60 py-5 last:border-b-0 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:items-start"
          >
            <div className="pt-1 text-sm text-muted-foreground data-number">
              {exercise.supersetGroup ?? index + 1}
            </div>

            <div className="min-w-0">
              <p className="eyebrow">{getExerciseLabel(exercise, index)}</p>
              <h3 className="mt-2">{exercise.exerciseName}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {getExerciseMeta(exercise)}
              </p>
              {exercise.cues ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {exercise.cues}
                </p>
              ) : null}
            </div>

            <div className="pt-1 text-sm text-muted-foreground md:text-right">
              <p>{exercise.exerciseType === "FINISHER" ? "Single effort" : `${exercise.sets} sets`}</p>
              {exercise.restSeconds != null && exercise.restSeconds > 0 ? (
                <p className="mt-1">Rest {exercise.restSeconds}s</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getExerciseLabel(exercise: Exercise, index: number) {
  if (exercise.exerciseType === "WARMUP") {
    return "Warm-up";
  }
  if (exercise.exerciseType === "FINISHER") {
    return "Finisher";
  }
  if (exercise.supersetGroup) {
    return `Superset ${exercise.supersetGroup}`;
  }
  return `Exercise ${index + 1}`;
}

function getExerciseMeta(exercise: Exercise) {
  const parts = [exercise.reps];

  if (exercise.tempo) {
    parts.push(`Tempo ${exercise.tempo}`);
  }
  if (exercise.targetRPE) {
    parts.push(`RPE ${exercise.targetRPE}`);
  }
  if (exercise.restSeconds != null && exercise.restSeconds > 0) {
    parts.push(`Rest ${exercise.restSeconds}s`);
  }

  return parts.join(" • ");
}

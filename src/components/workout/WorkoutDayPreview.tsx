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
  const totalWorkingSets = workingExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const blockOrder = ["A", "B", "C"] as const;

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
              <p>RPE 6-7 • leave 2-4 reps in reserve</p>
              <p>Week 1-2: optional 2-round mode</p>
            </div>
            <Button size="lg" type="button" onClick={handleStart} disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Session
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-6 border-t border-border/70 pt-6">
        {blockOrder.map((block) => {
          const blockExercises = workingExercises.filter((exercise) => exercise.supersetGroup === block);
          if (blockExercises.length === 0) return null;
          const roundTarget = block === "C" ? "2 rounds" : "3 rounds";
          const restNote = blockExercises[blockExercises.length - 1]?.restSeconds ?? 90;

          return (
            <div key={block} className="rounded-[var(--radius-surface)] border border-border/70 bg-secondary/45 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow">Block {block}</p>
                <p className="text-sm text-muted-foreground">{roundTarget} • rest {restNote}s after circuit</p>
              </div>
              <div className="space-y-4">
                {blockExercises.map((exercise, i) => (
                  <div key={exercise.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                    <p className="eyebrow">{block}{i + 1}</p>
                    <h3 className="mt-2">{exercise.exerciseName}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{exercise.sets} sets • {exercise.reps}{exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}


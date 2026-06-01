"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { startWorkoutSession } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// data shape only; do not alter workout payloads
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
    <section className="editorial-surface space-y-9">
      {!hideHeader ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="eyebrow">Today&apos;s plan</p>
            <h2 className="mt-3 max-w-[10ch]">{plan.sessionName}</h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.75] text-muted-foreground">
              A single training sequence with measured density, restrained controls, and the work
              blocks kept close enough to scan before you start.
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-border/70 bg-background/38 p-4 shadow-[rgba(22,15,12,0.03)_0_0_0_1px_inset]">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="eyebrow text-[10px]">Exercises</p>
                <p className="data-number mt-2 text-2xl">{workingExercises.length}</p>
              </div>
              <div>
                <p className="eyebrow text-[10px]">Sets</p>
                <p className="data-number mt-2 text-2xl">{totalWorkingSets}</p>
              </div>
            </div>
            <div className="quiet-rule my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">RPE 6-7 · leave 2-4 reps in reserve</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Week 1-2: optional 2-round mode</p>
            <Button size="lg" type="button" onClick={handleStart} disabled={isPending} className="mt-5 w-full gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Session
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 border-t border-border/60 pt-6">
        {blockOrder.map((block) => {
          const blockExercises = workingExercises.filter((exercise) => exercise.supersetGroup === block);
          if (blockExercises.length === 0) return null;
          const roundTarget = block === "C" ? "2 rounds" : "3 rounds";
          const restNote = blockExercises[blockExercises.length - 1]?.restSeconds ?? 90;

          return (
            <article
              key={block}
              className="group grid gap-5 rounded-[1.35rem] border border-border/62 bg-secondary/35 p-4 transition-[background-color,border-color] duration-150 hover:border-border hover:bg-secondary/48 md:grid-cols-[5.5rem_minmax(0,1fr)] md:p-5"
            >
              <div className="flex items-start justify-between gap-3 md:block">
                <p className="eyebrow">Block {block}</p>
                <p className="mt-0 text-sm text-muted-foreground md:mt-3">{roundTarget}</p>
                <Badge variant="outline" className="md:mt-4">{restNote}s rest</Badge>
              </div>
              <div className="divide-y divide-border/58">
                {blockExercises.map((exercise, i) => (
                  <div key={exercise.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-start">
                    <p className="data-number text-xl text-muted-foreground/78">{block}{i + 1}</p>
                    <div>
                      <h3 className="text-[1.35rem] leading-tight">{exercise.exerciseName}</h3>
                      {exercise.cues ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground sm:text-right">
                      {exercise.sets} sets · {exercise.reps}
                      {exercise.targetRPE ? ` · RPE ${exercise.targetRPE}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

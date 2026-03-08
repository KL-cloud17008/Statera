"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { startWorkoutSession } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-4">
      {!hideHeader ? (
        <Card className="overflow-hidden">
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="eyebrow">Today&apos;s Plan</p>
                    <h2>{plan.sessionName}</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-muted/70 px-3 py-1.5">
                    {workingExercises.length} exercises
                  </span>
                  <span className="rounded-full bg-muted/70 px-3 py-1.5">
                    {totalWorkingSets} working sets
                  </span>
                </div>
              </div>
              <Button size="lg" type="button" onClick={handleStart} disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {plan.exercises.map((exercise, index) => (
          <Card
            key={exercise.id}
            className={
              exercise.exerciseType === "WARMUP"
                ? "bg-muted/30"
                : exercise.exerciseType === "FINISHER"
                  ? "bg-warning/8"
                  : ""
            }
          >
            <CardContent className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-muted-foreground data-number">
                {exercise.supersetGroup ?? index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {exercise.exerciseName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {exercise.reps}
                  {exercise.tempo ? ` • Tempo ${exercise.tempo}` : ""}
                  {exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}
                  {exercise.restSeconds ? ` • Rest ${exercise.restSeconds}s` : ""}
                </p>
              </div>
              {exercise.exerciseType === "WARMUP" ? (
                <Badge variant="secondary">Warm-up</Badge>
              ) : null}
              {exercise.exerciseType === "FINISHER" ? (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  Finisher
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startWorkoutSession } from "@/actions/workout";

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
    <div className="space-y-6">
      {!hideHeader ? (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Today&apos;s Workout
          </h1>
          <p className="text-muted-foreground">{plan.sessionName}</p>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{plan.sessionName}</p>
                <p className="text-xs text-muted-foreground">
                  {workingExercises.length} exercises · {totalWorkingSets} working
                  sets
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            type="button"
            onClick={handleStart}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start Session
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Exercise List
        </h2>
        {plan.exercises.map((exercise, index) => (
          <Card
            key={exercise.id}
            className={
              exercise.exerciseType === "WARMUP"
                ? "bg-muted/30"
                : exercise.exerciseType === "FINISHER"
                  ? "bg-orange-500/5"
                  : ""
            }
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {exercise.supersetGroup ?? index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {exercise.exerciseName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {exercise.reps}
                  {exercise.tempo ? ` · ${exercise.tempo}` : ""}
                  {exercise.targetRPE ? ` · RPE ${exercise.targetRPE}` : ""}
                </p>
              </div>
              {exercise.exerciseType === "WARMUP" ? (
                <Badge variant="secondary" className="text-[10px]">
                  Warm-up
                </Badge>
              ) : null}
              {exercise.exerciseType === "FINISHER" ? (
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-[10px] text-orange-400"
                >
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

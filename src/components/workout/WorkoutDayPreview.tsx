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
  dayOfWeek: number;
  exercises: Exercise[];
};

export function WorkoutDayPreview({ plan, hideHeader }: { plan: Plan; hideHeader?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const workingExercises = plan.exercises.filter(
    (e) => e.exerciseType === "WORKING"
  );
  const finisher = plan.exercises.find(
    (e) => e.exerciseType === "FINISHER"
  );
  const totalWorkingSets = workingExercises.reduce(
    (sum, e) => sum + e.sets,
    0
  );

  function handleStart() {
    startTransition(async () => {
      const result = await startWorkoutSession(plan.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Today&apos;s Workout
          </h1>
          <p className="text-muted-foreground">{plan.sessionName}</p>
        </div>
      )}

      {/* Summary card */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {plan.sessionName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {workingExercises.length} exercises &middot; {totalWorkingSets}{" "}
                  working sets &middot; ~45 min
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
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

      {/* Exercise list preview */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Exercise List
        </h2>
        {plan.exercises.map((ex, i) => (
          <Card
            key={ex.id}
            className={
              ex.exerciseType === "WARMUP"
                ? "bg-muted/30"
                : ex.exerciseType === "FINISHER"
                  ? "bg-orange-500/5"
                  : ""
            }
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {ex.supersetGroup ?? (i + 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {ex.exerciseName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ex.reps}
                  {ex.tempo ? ` · ${ex.tempo}` : ""}
                  {ex.targetRPE ? ` · RPE ${ex.targetRPE}` : ""}
                </p>
              </div>
              {ex.exerciseType === "WARMUP" && (
                <Badge variant="secondary" className="text-[10px]">
                  Warm-up
                </Badge>
              )}
              {ex.exerciseType === "FINISHER" && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-orange-500/20 text-orange-400"
                >
                  Finisher
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

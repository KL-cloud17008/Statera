"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer } from "./RestTimer";
import { completeSession } from "@/actions/workout";

type PlanExercise = {
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

export function SessionLogger({
  sessionId,
  sessionName,
  exercises,
  existingSets,
  previousSets,
  startTime,
}: {
  sessionId: string;
  sessionName: string;
  exercises: PlanExercise[];
  existingSets: SessionSet[];
  previousSets: PrevSet[];
  startTime: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [setCount, setSetCount] = useState(existingSets.length);

  // Track completed exercises and sets
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set()
  );
  // Key: "exerciseName:setNumber", tracks individual set completion
  const [completedSets, setCompletedSets] = useState<Set<string>>(
    () => new Set()
  );

  // Group exercises by superset
  const exerciseGroups: PlanExercise[][] = [];
  let currentGroup: PlanExercise[] = [];
  let currentSupersetGroup: string | null = null;

  for (const ex of exercises) {
    if (
      ex.supersetGroup &&
      ex.supersetGroup === currentSupersetGroup
    ) {
      currentGroup.push(ex);
    } else {
      if (currentGroup.length > 0) exerciseGroups.push(currentGroup);
      currentGroup = [ex];
      currentSupersetGroup = ex.supersetGroup;
    }
  }
  if (currentGroup.length > 0) exerciseGroups.push(currentGroup);

  // Progress calculation
  const totalExercises = exercises.length;
  const completedCount = completedExercises.size;
  const progressPercent = totalExercises > 0
    ? Math.round((completedCount / totalExercises) * 100)
    : 0;

  // Elapsed time
  const startDate = new Date(startTime);
  const elapsed = Math.floor((Date.now() - startDate.getTime()) / 60000);

  function handleSetCompleteChange(exerciseName: string, setNumber: number, complete: boolean) {
    setCompletedSets((prev) => {
      const next = new Set(prev);
      const key = `${exerciseName}:${setNumber}`;
      if (complete) {
        next.add(key);
      } else {
        next.delete(key);
      }

      // Check if all sets for this exercise are now complete
      const exercise = exercises.find((e) => e.exerciseName === exerciseName);
      if (exercise) {
        const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
        const exerciseSetKeys = Array.from({ length: totalSets }, (_, i) =>
          `${exerciseName}:${i + 1}`
        );
        const allComplete = exerciseSetKeys.every((k) => next.has(k));
        setCompletedExercises((prevEx) => {
          const nextEx = new Set(prevEx);
          if (allComplete) {
            nextEx.add(exerciseName);
          } else {
            nextEx.delete(exerciseName);
          }
          return nextEx;
        });
      }

      return next;
    });
  }

  function handleExerciseCompleteChange(exerciseName: string, complete: boolean) {
    const exercise = exercises.find((e) => e.exerciseName === exerciseName);
    if (!exercise) return;

    const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;

    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (complete) {
        next.add(exerciseName);
      } else {
        next.delete(exerciseName);
      }
      return next;
    });

    // Also toggle all sets for this exercise
    setCompletedSets((prev) => {
      const next = new Set(prev);
      for (let i = 1; i <= totalSets; i++) {
        const key = `${exerciseName}:${i}`;
        if (complete) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  }

  function getCompletedSetNumbers(exerciseName: string): Set<number> {
    const result = new Set<number>();
    completedSets.forEach((key) => {
      const [name, numStr] = key.split(":");
      if (name === exerciseName) {
        result.add(parseInt(numStr, 10));
      }
    });
    return result;
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeSession(sessionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Session complete!");
        router.push("/workout/history");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Session header with progress */}
      <Card>
        <CardContent className="py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">
                {sessionName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{elapsed} min</span>
                <Badge variant="secondary" className="text-[10px]">
                  {setCount} sets logged
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isPending}
              className="gap-1"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Finish
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedCount}/{totalExercises} exercises complete
              </span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Exercise groups */}
      {exerciseGroups.map((group, gi) => {
        const isSuperset = group.length > 1 && group[0].supersetGroup;
        const restSec = group[0].restSeconds ?? 90;

        return (
          <div key={gi} className="space-y-2">
            {isSuperset && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-bold"
                >
                  Superset {group[0].supersetGroup}
                </Badge>
                <RestTimer defaultSeconds={restSec} />
              </div>
            )}
            {group.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                sessionId={sessionId}
                loggedSets={existingSets
                  .filter((s) => s.exerciseName === exercise.exerciseName)
                  .map((s) => ({
                    setNumber: s.setNumber,
                    weightUsed: s.weightUsed,
                    repsCompleted: s.repsCompleted,
                    actualRPE: s.actualRPE,
                    notes: s.notes,
                  }))}
                previousSets={previousSets}
                onSetLogged={() => setSetCount((c) => c + 1)}
                exerciseComplete={completedExercises.has(exercise.exerciseName)}
                onExerciseCompleteChange={(complete) =>
                  handleExerciseCompleteChange(exercise.exerciseName, complete)
                }
                completedSetNumbers={getCompletedSetNumbers(exercise.exerciseName)}
                onSetCompleteChange={handleSetCompleteChange}
              />
            ))}
            {!isSuperset && group[0].restSeconds != null && group[0].restSeconds > 0 && (
              <div className="flex justify-end">
                <RestTimer defaultSeconds={group[0].restSeconds!} />
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom finish button */}
      <div className="pb-4">
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleComplete}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Complete Session
        </Button>
      </div>
    </div>
  );
}

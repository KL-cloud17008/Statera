"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { completeSession } from "@/actions/workout";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer } from "./RestTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateSessionVolume } from "@/lib/workout-stats";

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

function buildSavedSetKeys(sets: SessionSet[]) {
  return new Set(
    sets
      .filter((set) => set.weightUsed != null || set.repsCompleted != null || set.notes)
      .map((set) => `${set.exerciseName}:${set.setNumber}`)
  );
}

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
  const [savedSetKeys, setSavedSetKeys] = useState<Set<string>>(() => buildSavedSetKeys(existingSets));
  const [completedSets, setCompletedSets] = useState<Set<string>>(() => buildSavedSetKeys(existingSets));
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const updateElapsed = () => {
      setElapsedMinutes(Math.max(0, Math.floor((Date.now() - start) / 60000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  const exerciseGroups = useMemo(() => {
    const groups: PlanExercise[][] = [];
    let currentGroup: PlanExercise[] = [];
    let currentSupersetGroup: string | null = null;

    for (const exercise of exercises) {
      if (exercise.supersetGroup && exercise.supersetGroup === currentSupersetGroup) {
        currentGroup.push(exercise);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [exercise];
        currentSupersetGroup = exercise.supersetGroup;
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [exercises]);

  const completedExercises = useMemo(() => {
    const completed = new Set<string>();
    for (const exercise of exercises) {
      const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
      const allSaved = Array.from({ length: totalSets }, (_, index) => `${exercise.exerciseName}:${index + 1}`).every((key) => completedSets.has(key));
      if (allSaved) {
        completed.add(exercise.exerciseName);
      }
    }
    return completed;
  }, [completedSets, exercises]);

  const totalExercises = exercises.length;
  const completedCount = completedExercises.size;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const totalVolume = calculateSessionVolume(existingSets);

  function handleSetCompleteChange(exerciseName: string, setNumber: number, complete: boolean) {
    setCompletedSets((current) => {
      const next = new Set(current);
      const key = `${exerciseName}:${setNumber}`;
      if (complete) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function handleExerciseCompleteChange(exerciseName: string, complete: boolean) {
    const exercise = exercises.find((item) => item.exerciseName === exerciseName);
    if (!exercise) {
      return;
    }

    const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
    setCompletedSets((current) => {
      const next = new Set(current);
      for (let index = 1; index <= totalSets; index += 1) {
        const key = `${exerciseName}:${index}`;
        if (complete) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  }

  function getCompletedSetNumbers(exerciseName: string) {
    const result = new Set<number>();
    completedSets.forEach((key) => {
      const [name, numStr] = key.split(":");
      if (name === exerciseName) {
        result.add(Number.parseInt(numStr, 10));
      }
    });
    return result;
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeSession(sessionId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Session complete");
      router.push("/workout/history");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-primary/30 bg-[linear-gradient(180deg,rgba(68,227,157,0.12),transparent_55%),linear-gradient(180deg,rgba(20,29,44,0.9),rgba(13,20,32,0.9))]">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/16 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Active Session</p>
                  <h2 className="text-2xl">{sessionName}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="normal-case tracking-normal text-sm">
                  <Clock3 className="h-3.5 w-3.5" />
                  {elapsedMinutes} min elapsed
                </Badge>
                <Badge variant="secondary" className="normal-case tracking-normal text-sm">
                  {savedSetKeys.size} sets saved
                </Badge>
                <span>{Math.round(totalVolume).toLocaleString()} lbs volume</span>
              </div>
            </div>
            <Button type="button" size="lg" onClick={handleComplete} disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Complete Session
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{completedCount}/{totalExercises} exercises complete</span>
              <span className="data-number text-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {exerciseGroups.map((group, groupIndex) => {
        const isSuperset = group.length > 1 && group[0].supersetGroup;
        const restSeconds = group[0].restSeconds ?? 90;

        return (
          <div key={groupIndex} className="space-y-3">
            {isSuperset ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-border bg-muted/35 px-4 py-3">
                <Badge variant="outline">Superset {group[0].supersetGroup}</Badge>
                <RestTimer defaultSeconds={restSeconds} />
              </div>
            ) : null}
            {group.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                sessionId={sessionId}
                loggedSets={existingSets.filter((set) => set.exerciseName === exercise.exerciseName)}
                previousSets={previousSets}
                onSetLogged={(setKey) => {
                  setSavedSetKeys((current) => new Set([...current, setKey]));
                  setCompletedSets((current) => new Set([...current, setKey]));
                }}
                exerciseComplete={completedExercises.has(exercise.exerciseName)}
                onExerciseCompleteChange={(complete) => handleExerciseCompleteChange(exercise.exerciseName, complete)}
                completedSetNumbers={getCompletedSetNumbers(exercise.exerciseName)}
                onSetCompleteChange={handleSetCompleteChange}
              />
            ))}
            {!isSuperset && group[0].restSeconds != null && group[0].restSeconds > 0 ? (
              <div className="flex justify-end">
                <RestTimer defaultSeconds={group[0].restSeconds} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

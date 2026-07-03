"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { completeSession, discardWorkoutSession } from "@/actions/workout";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer } from "./RestTimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE } from "@/lib/default-workout-plan";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";

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
  trainingDate,
  isStale,
}: {
  sessionId: string;
  sessionName: string;
  exercises: PlanExercise[];
  existingSets: SessionSet[];
  previousSets: PrevSet[];
  startTime: string;
  trainingDate: string;
  isStale: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedSetKeys, setSavedSetKeys] = useState<Set<string>>(() => buildSavedSetKeys(existingSets));
  const [completedSets, setCompletedSets] = useState<Set<string>>(() => buildSavedSetKeys(existingSets));
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const loggableExercises = useMemo(
    () => exercises.filter(isLoggableTrainingExercise),
    [exercises]
  );

  // Signal the active session to the shell so the bottom app-nav hides
  // (see globals.css) and the session dock takes its place.
  useEffect(() => {
    document.body.dataset.activeWorkoutSession = "true";
    return () => {
      delete document.body.dataset.activeWorkoutSession;
    };
  }, []);

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

    for (const exercise of loggableExercises) {
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
  }, [loggableExercises]);

  const completedExercises = useMemo(() => {
    const completed = new Set<string>();
    for (const exercise of loggableExercises) {
      const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
      const allSaved = Array.from({ length: totalSets }, (_, index) => `${exercise.exerciseName}:${index + 1}`).every((key) => completedSets.has(key));
      if (allSaved) {
        completed.add(exercise.exerciseName);
      }
    }
    return completed;
  }, [completedSets, loggableExercises]);

  const currentTarget = findCurrentTarget(loggableExercises, completedSets);

  const totalExercises = loggableExercises.length;
  const completedCount = completedExercises.size;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const showLowerBReadiness = sessionName === LOWER_B_BACK_SAFE_TITLE || /Lower A/.test(sessionName);

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
    const exercise = loggableExercises.find((item) => item.exerciseName === exerciseName);
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

  function handleDiscard() {
    if (!window.confirm("Discard this incomplete workout session and its logged sets?")) {
      return;
    }

    startTransition(async () => {
      const result = await discardWorkoutSession(sessionId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Open session discarded");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="command-deck space-y-8 p-6 sm:p-8" data-animated="true">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] xl:items-end">
          <div>
            <p className="eyebrow">Live session</p>
            <h2 className="mt-3 text-4xl">{sessionName}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
              Log working sets only. Ramp-up sets stay outside the ledger.
            </p>
            {showLowerBReadiness ? (
              <p className="black-glass mt-4 inline-flex max-w-2xl px-4 py-3 text-sm font-semibold leading-relaxed text-white/78">
                {LOWER_B_BACK_PAIN_READINESS_NOTE}
              </p>
            ) : null}
            {isStale ? (
              <div className="black-glass mt-5 flex max-w-2xl items-start gap-3 rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed text-white/70">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                <p>
                  Resume previous open session from {formatSessionDate(trainingDate)}. Discard it to return to today&apos;s programmed session.
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-5 xl:text-right">
            <div className="grid gap-3 text-sm text-white/64 sm:grid-cols-3 xl:grid-cols-3">
              <div className="black-glass rounded-[var(--radius-card)] p-4">
                <p className="eyebrow">Elapsed</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal text-white data-number">
                  {elapsedMinutes}m
                </p>
              </div>
              <div className="black-glass rounded-[var(--radius-card)] p-4">
                <p className="eyebrow">Saved</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal text-white data-number">
                  {savedSetKeys.size}
                </p>
              </div>
              <div className="black-glass rounded-[var(--radius-card)] p-4">
                <p className="eyebrow">Complete</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal text-white data-number">
                  {completedCount}/{totalExercises}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              {isStale ? (
                <Button type="button" variant="outline" size="lg" onClick={handleDiscard} disabled={isPending} className="gap-2">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Discard old incomplete session
                </Button>
              ) : null}
              <Button type="button" size="lg" onClick={handleComplete} disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Complete session
              </Button>
            </div>
          </div>
        </div>

        <SessionPrepStrip />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/64">
            <span>{completedCount}/{totalExercises} exercises logged</span>
            <span className="data-number text-white">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="border-white/12 bg-white/10" />
        </div>
      </section>

      <section className="editorial-surface px-0 py-0">
        {exerciseGroups.map((group, groupIndex) => {
          const isGroupedBlock = group.length > 1 && group[0].supersetGroup;
          const restSeconds = group[0].restSeconds ?? 90;

          return (
            <div key={groupIndex} className="border-t border-border/70 px-6 py-8 first:border-t-0 sm:px-8">
              {isGroupedBlock ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Block</p>
                    <p className="mt-2 text-lg font-semibold tracking-normal">
                      Block {group[0].supersetGroup}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <RestTimer defaultSeconds={restSeconds} />
                  </div>
                </div>
              ) : null}

              <div className="space-y-8">
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
              </div>

              {!isGroupedBlock && group[0].restSeconds != null && group[0].restSeconds > 0 ? (
                <div className="mt-6 hidden justify-end md:flex">
                  <RestTimer defaultSeconds={group[0].restSeconds} />
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
        <div className="chrome-surface rounded-[var(--radius-panel)] border px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-normal text-white">
                {currentTarget ? currentTarget.exercise.exerciseName : "All sets logged"}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {currentTarget
                  ? `Set ${currentTarget.setNumber} of ${currentTarget.totalSets}`
                  : "Ready to complete session"}
              </p>
            </div>
            <RestTimer variant="bar" defaultSeconds={currentTarget?.exercise.restSeconds || 90} />
          </div>
          <Progress value={progressPercent} className="mt-2.5 h-1 border-white/12 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function SessionPrepStrip() {
  return (
    <div className="session-prep-strip">
      <div>
        <p className="eyebrow">Session prep</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Arrival only. No Weight/Reps/RPE rows.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {SESSION_PREP_ITEMS.map((item) => (
          <div key={item.label} className="border-t border-border/70 pt-3">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function findCurrentTarget(exercises: PlanExercise[], completedSets: Set<string>) {
  for (const exercise of exercises) {
    const totalSets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
    for (let setNumber = 1; setNumber <= totalSets; setNumber += 1) {
      if (!completedSets.has(`${exercise.exerciseName}:${setNumber}`)) {
        return { exercise, setNumber, totalSets };
      }
    }
  }
  return null;
}

function formatSessionDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

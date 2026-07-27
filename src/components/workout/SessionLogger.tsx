"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { completeSession, discardWorkoutSession } from "@/actions/workout";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer } from "./RestTimer";
import { SessionPrepStrip } from "./SessionPrepStrip";
import { Button } from "@/components/ui/button";
import { Figure, Notice, Section } from "@/components/ui/ledger";
import { Progress } from "@/components/ui/progress";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE } from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise } from "@/lib/training-session";

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
    <div>
      {/* The session name is already the page title above; repeating it here
          would put two mastheads on one screen. */}
      <Section>
        {isStale ? (
          <Notice className="mb-4 flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Resume previous open session from {formatSessionDate(trainingDate)}. Discard it to
              return to today&apos;s programmed session.
            </span>
          </Notice>
        ) : null}

        {showLowerBReadiness ? (
          <Notice tone="accent" className="mb-4">
            {LOWER_B_BACK_PAIN_READINESS_NOTE}
          </Notice>
        ) : null}

        <dl className="grid grid-cols-3 gap-4">
          <Figure label="Elapsed" value={`${elapsedMinutes}m`} size="lg" />
          <Figure label="Saved" value={savedSetKeys.size} size="lg" />
          <Figure
            label="Complete"
            value={`${completedCount}/${totalExercises}`}
            size="lg"
            tone={completedCount === totalExercises && totalExercises > 0 ? "accent" : "primary"}
          />
        </dl>

        <div className="mt-5 space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-caption text-tertiary">
              {completedCount}/{totalExercises} exercises logged
            </span>
            <span className="num text-caption text-secondary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" variant="primary" size="lg" onClick={handleComplete} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Complete session
          </Button>
          {isStale ? (
            <Button type="button" variant="secondary" size="lg" onClick={handleDiscard} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Discard old incomplete session
            </Button>
          ) : null}
        </div>
      </Section>

      <Section title="Session prep">
        <SessionPrepStrip note="Arrival only. No Weight/Reps/RPE rows." />
      </Section>

      {exerciseGroups.map((group, groupIndex) => {
        const isGroupedBlock = group.length > 1 && group[0].supersetGroup;
        const restSeconds = group[0].restSeconds ?? 90;

        return (
          <Section key={groupIndex}>
            {isGroupedBlock ? (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2>Block {group[0].supersetGroup}</h2>
                {/* On mobile the dock carries the timer, so it is not repeated
                    inline — it must stay visible while the page scrolls. */}
                <div className="hidden md:block">
                  <RestTimer defaultSeconds={restSeconds} />
                </div>
              </div>
            ) : null}

            <div className="space-y-6">
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
              <div className="mt-5 hidden justify-end md:flex">
                <RestTimer defaultSeconds={group[0].restSeconds} />
              </div>
            ) : null}
          </Section>
        );
      })}

      {/* The session dock. Ink chrome, and it replaces the app nav for the
          lifetime of the session (see globals.css) rather than stacking on it,
          so the rest timer stays reachable at every scroll position. */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-ink md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Progress
          value={progressPercent}
          className="h-0.5 rounded-none border-0 bg-ink-700 [&_[data-slot=progress-indicator]]:rounded-none [&_[data-slot=progress-indicator]]:bg-accent-bright"
        />
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-row font-medium text-ink-text">
              {currentTarget ? currentTarget.exercise.exerciseName : "All sets logged"}
            </p>
            <p className="mt-0.5 text-label uppercase text-ink-dim">
              {currentTarget
                ? `Set ${currentTarget.setNumber} of ${currentTarget.totalSets}`
                : "Ready to complete session"}
            </p>
          </div>
          <RestTimer variant="bar" defaultSeconds={currentTarget?.exercise.restSeconds || 90} />
        </div>
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

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SetInput } from "./SetInput";
import { isLoggableTrainingExercise } from "@/lib/training-session";
import { formatWorkoutLoad } from "@/lib/units";
import { cn } from "@/lib/utils";

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

type SetData = {
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

export function ExerciseCard({
  exercise,
  sessionId,
  loggedSets,
  previousSets,
  onSetLogged,
  exerciseComplete,
  onExerciseCompleteChange,
  completedSetNumbers,
  onSetCompleteChange,
}: {
  exercise: PlanExercise;
  sessionId: string;
  loggedSets: SetData[];
  previousSets: PrevSet[];
  onSetLogged: (setKey: string) => void;
  exerciseComplete: boolean;
  onExerciseCompleteChange: (complete: boolean) => void;
  completedSetNumbers: Set<number>;
  onSetCompleteChange: (exerciseName: string, setNumber: number, complete: boolean) => void;
}) {
  const [showCues, setShowCues] = useState(false);
  const [sessionPrefills, setSessionPrefills] = useState<Record<number, { weightUsed: number | null; repsCompleted: number | null }>>({});
  const [advanceTarget, setAdvanceTarget] = useState<number | null>(null);
  const isLoggable = isLoggableTrainingExercise(exercise);
  const isFinisher = exercise.exerciseType === "FINISHER";
  const setCount = isFinisher ? 1 : exercise.sets;
  const exercisePrevSets = previousSets.filter(
    (set) => set.exerciseName === exercise.exerciseName
  );

  if (!isLoggable) {
    return null;
  }

  return (
    <section>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={exerciseComplete}
          onCheckedChange={(checked) => onExerciseCompleteChange(!!checked)}
          className="mt-1"
          aria-label={`Mark ${exercise.exerciseName} complete`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <p className="text-label uppercase text-tertiary">{getExerciseLabel(exercise)}</p>
              <p
                className={cn(
                  "mt-1 text-body font-medium",
                  exerciseComplete ? "text-tertiary line-through" : "text-primary"
                )}
              >
                {exercise.exerciseName}
              </p>
              <p className="mt-0.5 text-caption text-tertiary">{getExerciseMeta(exercise)}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <span className="num text-right text-row text-secondary">
                {setCount} {setCount === 1 ? "set" : "sets"}
              </span>
              {exercise.cues ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowCues((current) => !current)}
                  className="gap-1 text-caption"
                  aria-expanded={showCues}
                >
                  {showCues ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  {showCues ? "Hide cues" : "Show cues"}
                </Button>
              ) : null}
            </div>
          </div>

          {showCues && exercise.cues ? (
            <p className="mt-3 max-w-2xl rounded-control border-l-2 border-rule-strong bg-sunken px-3 py-2 text-row text-secondary">
              {exercise.cues}
            </p>
          ) : null}

          {exercisePrevSets.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-label uppercase text-tertiary">Last session</span>
              {exercisePrevSets.map((set) => (
                <span key={set.setNumber} className="num text-right text-caption text-secondary">
                  S{set.setNumber} {formatWorkoutLoad(set.weightUsed)} x {set.repsCompleted ?? "--"}
                </span>
              ))}
            </div>
          ) : null}

          <div className="ledger-rows mt-3 border-t border-rule">
            {Array.from({ length: setCount }, (_, index) => {
              const setNum = index + 1;
              const logged = loggedSets.find((set) => set.setNumber === setNum);
              const previous = exercisePrevSets.find((set) => set.setNumber === setNum);

              return (
                <SetInput
                  key={setNum}
                  sessionId={sessionId}
                  planExerciseId={exercise.id}
                  exerciseName={exercise.exerciseName}
                  setNumber={setNum}
                  isFinisher={isFinisher}
                  logged={logged ?? null}
                  previous={previous ?? null}
                  prefill={sessionPrefills[setNum] ?? null}
                  shouldAdvance={advanceTarget === setNum}
                  onSaved={(setKey, values) => {
                    onSetLogged(setKey);
                    if (setNum < setCount) {
                      setSessionPrefills((current) => ({ ...current, [setNum + 1]: values }));
                      setAdvanceTarget(setNum + 1);
                    }
                  }}
                  completed={completedSetNumbers.has(setNum)}
                  onCompletedChange={(checked) => onSetCompleteChange(exercise.exerciseName, setNum, checked)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function getExerciseLabel(exercise: PlanExercise) {
  if (exercise.exerciseType === "ACCESSORY") {
    return "Low-dose accessory";
  }
  if (exercise.exerciseType === "FINISHER") {
    return "Finisher";
  }
  if (exercise.supersetGroup) {
    return `Superset ${exercise.supersetGroup}`;
  }
  return "Working sets";
}

function getExerciseMeta(exercise: PlanExercise) {
  const parts = [exercise.reps];

  if (exercise.tempo) {
    parts.push(`Tempo ${exercise.tempo}`);
  }
  if (exercise.restSeconds != null && exercise.restSeconds > 0) {
    parts.push(`Rest ${exercise.restSeconds}s`);
  }
  if (exercise.targetRPE) {
    parts.push(`RPE ${exercise.targetRPE}`);
  }

  return parts.join(" / ");
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { SetInput } from "./SetInput";
import { formatWeight } from "@/lib/units";
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
  const { settings } = useAppSettings();
  const isFinisher = exercise.exerciseType === "FINISHER";
  const setCount = isFinisher ? 1 : exercise.sets;
  const exercisePrevSets = previousSets.filter(
    (set) => set.exerciseName === exercise.exerciseName
  );

  return (
    <section className={cn("space-y-6", exerciseComplete && "opacity-65")}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={exerciseComplete}
          onCheckedChange={(checked) => onExerciseCompleteChange(!!checked)}
          className="mt-1"
        />

        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">{getExerciseLabel(exercise)}</p>
              <h3
                className={cn(
                  "tracking-[-0.05em]",
                  exerciseComplete ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {exercise.exerciseName}
              </h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {getExerciseMeta(exercise)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="data-number text-foreground/80">
                {setCount} {setCount === 1 ? "set" : "sets"}
              </span>
              {exercise.cues ? (
                <button
                  type="button"
                  onClick={() => setShowCues((current) => !current)}
                  className="text-link inline-flex items-center gap-1"
                >
                  {showCues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showCues ? "Hide cues" : "Show cues"}
                </button>
              ) : null}
            </div>
          </div>

          {showCues && exercise.cues ? (
            <p className="max-w-2xl border-l border-border/70 pl-4 text-sm leading-relaxed text-muted-foreground">
              {exercise.cues}
            </p>
          ) : null}

          {exercisePrevSets.length > 0 ? (
            <div className="space-y-3 border-t border-border/70 pt-4">
              <p className="eyebrow">Last session</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {exercisePrevSets.map((set) => (
                  <span key={set.setNumber}>
                    S{set.setNumber}: {set.weightUsed != null ? formatWeight(set.weightUsed, settings.weightUnit) : "--"} × {set.repsCompleted ?? "--"}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-0 border-t border-border/70">
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
                  onSaved={onSetLogged}
                  completed={completedSetNumbers.has(setNum)}
                  onCompletedChange={(checked) => onSetCompleteChange(exercise.exerciseName, setNum, checked)}
                  className={index === 0 ? "border-t-0 pt-0" : undefined}
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
  if (exercise.exerciseType === "WARMUP") {
    return "Warm-up";
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

  return parts.join(" • ");
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SetInput } from "./SetInput";
import { formatWeight } from "@/lib/units";

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
  const isWarmup = exercise.exerciseType === "WARMUP";
  const setCount = isFinisher ? 1 : exercise.sets;
  const exercisePrevSets = previousSets.filter(
    (set) => set.exerciseName === exercise.exerciseName
  );

  return (
    <Card
      className={
        exerciseComplete
          ? "border-primary/35 bg-primary/8"
          : isWarmup
            ? "bg-muted/28"
            : isFinisher
              ? "border-warning/30 bg-warning/8"
              : ""
      }
    >
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={exerciseComplete}
            onCheckedChange={(checked) => onExerciseCompleteChange(!!checked)}
            className="mt-1"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {exercise.supersetGroup ? (
                    <Badge variant="outline">Superset {exercise.supersetGroup}</Badge>
                  ) : null}
                  {isWarmup ? <Badge variant="secondary">Warm-up</Badge> : null}
                  {isFinisher ? (
                    <Badge variant="outline" className="border-warning/40 text-warning">
                      Finisher
                    </Badge>
                  ) : null}
                </div>
                <h3 className={`mt-2 text-lg font-semibold ${exerciseComplete ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {exercise.exerciseName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {exercise.reps}
                  {exercise.tempo ? ` • Tempo ${exercise.tempo}` : ""}
                  {exercise.restSeconds != null && exercise.restSeconds > 0 ? ` • Rest ${exercise.restSeconds}s` : ""}
                  {exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}
                </p>
              </div>
              {exercise.cues ? (
                <button
                  type="button"
                  onClick={() => setShowCues((current) => !current)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showCues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showCues ? "Hide cues" : "Show cues"}
                </button>
              ) : null}
            </div>

            {showCues && exercise.cues ? (
              <p className="rounded-[1rem] border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {exercise.cues}
              </p>
            ) : null}

            {exercisePrevSets.length > 0 ? (
              <div className="rounded-[1rem] border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Last session</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exercisePrevSets.map((set) => (
                    <span key={set.setNumber} className="rounded-full bg-background/70 px-3 py-1">
                      S{set.setNumber}: {set.weightUsed != null ? formatWeight(set.weightUsed, settings.weightUnit) : "--"} × {set.repsCompleted ?? "--"}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
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
                  />
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SetInput } from "./SetInput";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
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
  const exercisePrevSets = previousSets.filter((set) => set.exerciseName === exercise.exerciseName);

  return (
    <Card className={exerciseComplete ? "border-green-500/30 bg-green-500/5" : isWarmup ? "border-muted bg-muted/30" : isFinisher ? "border-orange-500/30 bg-orange-500/5" : ""}>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <Checkbox checked={exerciseComplete} onCheckedChange={(checked) => onExerciseCompleteChange(!!checked)} className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {exercise.supersetGroup ? <Badge variant="outline" className="px-1.5 py-0 text-xs font-bold">{exercise.supersetGroup}</Badge> : null}
                <h3 className={`text-sm font-semibold leading-tight ${exerciseComplete ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {exercise.exerciseName}
                </h3>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>{exercise.reps}</span>
                {exercise.tempo ? <span>Tempo: {exercise.tempo}</span> : null}
                {exercise.restSeconds != null && exercise.restSeconds > 0 ? <span>Rest: {exercise.restSeconds}s</span> : null}
                {exercise.targetRPE ? <span>RPE {exercise.targetRPE}</span> : null}
              </div>
            </div>
          </div>
          {isWarmup ? <Badge variant="secondary" className="shrink-0 text-xs">Warm-up</Badge> : null}
          {isFinisher ? <Badge variant="secondary" className="shrink-0 bg-orange-500/20 text-xs text-orange-400">Finisher</Badge> : null}
        </div>

        {exercise.cues ? (
          <button type="button" onClick={() => setShowCues(!showCues)} className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            {showCues ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showCues ? "Hide cues" : "Show cues"}
          </button>
        ) : null}
        {showCues && exercise.cues ? (
          <p className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground">{exercise.cues}</p>
        ) : null}

        {exercisePrevSets.length > 0 ? (
          <div className="rounded px-2 py-1 text-[10px] text-muted-foreground bg-muted/30">
            <span className="font-medium">Last session:</span>{" "}
            {exercisePrevSets.map((set) => (
              <span key={set.setNumber} className="mr-2">
                S{set.setNumber}: {set.weightUsed != null ? formatWeight(set.weightUsed, settings.weightUnit) : "--"} x {set.repsCompleted ?? "--"}
              </span>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="grid grid-cols-[1.5rem_1.5rem_1fr_1fr_3rem_2rem] gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span></span>
            <span>Set</span>
            <span>{isFinisher ? "Score" : `Weight (${settings.weightUnit})`}</span>
            <span>{isFinisher ? "Notes" : "Reps"}</span>
            <span>RPE</span>
            <span></span>
          </div>
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
      </CardContent>
    </Card>
  );
}

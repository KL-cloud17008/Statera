"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { logSet } from "@/actions/workout";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { convertWeight, toPounds } from "@/lib/units";

type SetData = {
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

type PrevSet = {
  weightUsed: number | null;
  repsCompleted: number | null;
};

export function SetInput({
  sessionId,
  planExerciseId,
  exerciseName,
  setNumber,
  isFinisher,
  logged,
  previous,
  onSaved,
  completed,
  onCompletedChange,
}: {
  sessionId: string;
  planExerciseId: string | null;
  exerciseName: string;
  setNumber: number;
  isFinisher: boolean;
  logged: SetData | null;
  previous: PrevSet | null;
  onSaved: (setKey: string) => void;
  completed: boolean;
  onCompletedChange: (checked: boolean) => void;
}) {
  const { settings } = useAppSettings();
  const [weight, setWeight] = useState(logged?.weightUsed != null ? convertWeight(logged.weightUsed, settings.weightUnit).toFixed(1) : "");
  const [reps, setReps] = useState(logged?.repsCompleted?.toString() ?? "");
  const [rpe, setRpe] = useState(logged?.actualRPE?.toString() ?? "");
  const [notes, setNotes] = useState(logged?.notes ?? "");
  const [saved, setSaved] = useState(!!logged);
  const [isPending, startTransition] = useTransition();

  function copyPrevious() {
    if (!previous) {
      return;
    }

    if (previous.weightUsed != null) {
      setWeight(convertWeight(previous.weightUsed, settings.weightUnit).toFixed(1));
    }
    if (previous.repsCompleted != null) {
      setReps(previous.repsCompleted.toString());
    }
  }

  function handleSave() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      if (planExerciseId) {
        formData.set("planExerciseId", planExerciseId);
      }
      formData.set("exerciseName", exerciseName);
      formData.set("setNumber", setNumber.toString());
      if (weight) {
        const parsedWeight = Number.parseFloat(weight);
        if (!Number.isNaN(parsedWeight)) {
          formData.set("weightUsed", toPounds(parsedWeight, settings.weightUnit).toString());
        }
      }
      if (!isFinisher && reps) {
        formData.set("repsCompleted", reps);
      }
      if (isFinisher && notes) {
        formData.set("notes", notes);
      } else if (!isFinisher && notes) {
        formData.set("notes", notes);
      }
      if (rpe) {
        formData.set("actualRPE", rpe);
      }

      const result = await logSet(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSaved(true);
      onSaved(`${exerciseName}:${setNumber}`);
    });
  }

  return (
    <div className={`grid items-center gap-2 ${isFinisher ? "grid-cols-[1.5rem_1.5rem_1fr_1fr_3rem_2rem]" : "grid-cols-[1.5rem_1.5rem_1fr_1fr_3rem_2rem]"} ${completed ? "opacity-60" : ""}`}>
      <Checkbox checked={completed} onCheckedChange={(checked) => onCompletedChange(!!checked)} className="h-4 w-4" />
      <span className="text-center text-xs font-medium text-muted-foreground">{setNumber}</span>
      <div className="relative">
        <input
          aria-label={`${exerciseName} set ${setNumber} weight`}
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder={previous?.weightUsed != null ? convertWeight(previous.weightUsed, settings.weightUnit).toFixed(1) : isFinisher ? "score" : settings.weightUnit}
          value={weight}
          onChange={(event) => {
            setWeight(event.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {previous && !weight && !saved ? (
          <button
            type="button"
            onClick={copyPrevious}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label={`Copy previous ${exerciseName} set ${setNumber}`}
          >
            <Copy className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      {isFinisher ? (
        <input
          aria-label={`${exerciseName} set ${setNumber} notes`}
          type="text"
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Notes"
        />
      ) : (
        <input
          aria-label={`${exerciseName} set ${setNumber} reps`}
          type="number"
          inputMode="numeric"
          placeholder={previous?.repsCompleted?.toString() ?? "reps"}
          value={reps}
          onChange={(event) => {
            setReps(event.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}
      <input
        aria-label={`${exerciseName} set ${setNumber} RPE`}
        type="number"
        inputMode="numeric"
        min="1"
        max="10"
        placeholder="RPE"
        value={rpe}
        onChange={(event) => {
          setRpe(event.target.value);
          setSaved(false);
        }}
        onBlur={handleSave}
        className="h-10 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex justify-center">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : saved ? <Check className="h-4 w-4 text-green-500" /> : null}
      </div>
    </div>
  );
}

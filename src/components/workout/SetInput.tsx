"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSet } from "@/actions/workout";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  const [weight, setWeight] = useState(
    logged?.weightUsed != null
      ? convertWeight(logged.weightUsed, settings.weightUnit).toFixed(1)
      : ""
  );
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
      if (notes) {
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
    <div className={`rounded-[1rem] border border-border bg-background/50 p-3 ${completed ? "opacity-70" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox checked={completed} onCheckedChange={(checked) => onCompletedChange(!!checked)} />
          <div>
            <p className="text-sm font-semibold text-foreground">Set {setNumber}</p>
            {previous ? (
              <p className="text-xs text-muted-foreground">
                Last: {previous.weightUsed != null ? convertWeight(previous.weightUsed, settings.weightUnit).toFixed(1) : "--"} × {previous.repsCompleted ?? "--"}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {previous ? (
            <button
              type="button"
              onClick={copyPrevious}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 transition-colors hover:bg-accent"
              aria-label={`Copy previous ${exerciseName} set ${setNumber}`}
            >
              <Copy className="h-4 w-4" />
            </button>
          ) : null}
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4 text-primary" /> : null}
        </div>
      </div>

      <div className={`grid gap-3 ${isFinisher ? "md:grid-cols-[1fr_0.35fr]" : "md:grid-cols-[1fr_1fr_0.5fr]"}`}>
        <Input
          aria-label={`${exerciseName} set ${setNumber} weight`}
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder={isFinisher ? "Score" : `Weight (${settings.weightUnit})`}
          value={weight}
          onChange={(event) => {
            setWeight(event.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="h-11"
        />
        {isFinisher ? (
          <Input
            aria-label={`${exerciseName} set ${setNumber} notes`}
            type="text"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            className="h-11"
            placeholder="Notes"
          />
        ) : (
          <Input
            aria-label={`${exerciseName} set ${setNumber} reps`}
            type="number"
            inputMode="numeric"
            placeholder="Reps"
            value={reps}
            onChange={(event) => {
              setReps(event.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            className="h-11"
          />
        )}
        <Input
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
          className="h-11"
        />
      </div>
      {!isFinisher ? (
        <Input
          aria-label={`${exerciseName} set ${setNumber} notes`}
          type="text"
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="mt-3 h-11"
          placeholder="Optional notes"
        />
      ) : null}
    </div>
  );
}

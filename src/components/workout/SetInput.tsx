"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { logSet } from "@/actions/workout";

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
  planExerciseId: string;
  exerciseName: string;
  setNumber: number;
  isFinisher: boolean;
  logged: SetData | null;
  previous: PrevSet | null;
  onSaved: () => void;
  completed: boolean;
  onCompletedChange: (checked: boolean) => void;
}) {
  const [weight, setWeight] = useState(
    logged?.weightUsed?.toString() ?? ""
  );
  const [reps, setReps] = useState(
    logged?.repsCompleted?.toString() ?? ""
  );
  const [rpe, setRpe] = useState(
    logged?.actualRPE?.toString() ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!logged);

  function copyPrevious() {
    if (!previous) return;
    if (previous.weightUsed != null) setWeight(previous.weightUsed.toString());
    if (previous.repsCompleted != null) setReps(previous.repsCompleted.toString());
  }

  function handleSave() {
    if (!weight && !reps) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.set("sessionId", sessionId);
      fd.set("planExerciseId", planExerciseId);
      fd.set("exerciseName", exerciseName);
      fd.set("setNumber", setNumber.toString());
      if (weight) fd.set("weightUsed", weight);
      if (reps) fd.set("repsCompleted", reps);
      if (rpe) fd.set("actualRPE", rpe);

      const result = await logSet(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSaved(true);
        onSaved();
      }
    });
  }

  return (
    <div
      className={`grid grid-cols-[1.5rem_1.5rem_1fr_1fr_3rem_2rem] gap-2 items-center ${
        completed ? "opacity-50" : ""
      }`}
    >
      {/* Completion checkbox */}
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => onCompletedChange(!!checked)}
        className="h-4 w-4"
      />

      {/* Set number */}
      <span className="text-xs font-medium text-muted-foreground text-center">
        {setNumber}
      </span>

      {/* Weight input */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder={previous?.weightUsed?.toString() ?? (isFinisher ? "Score" : "lbs")}
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value);
            setSaved(false);
          }}
          onBlur={handleSave}
          className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {previous && !weight && !saved && (
          <button
            type="button"
            onClick={copyPrevious}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            title="Copy previous"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Reps input */}
      <input
        type="text"
        inputMode="numeric"
        placeholder={previous?.repsCompleted?.toString() ?? (isFinisher ? "notes" : "reps")}
        value={reps}
        onChange={(e) => {
          setReps(e.target.value);
          setSaved(false);
        }}
        onBlur={handleSave}
        className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {/* RPE input */}
      <input
        type="text"
        inputMode="numeric"
        placeholder="RPE"
        value={rpe}
        onChange={(e) => {
          setRpe(e.target.value);
          setSaved(false);
        }}
        onBlur={handleSave}
        className="h-10 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {/* Status indicator */}
      <div className="flex justify-center">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : saved ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : null}
      </div>
    </div>
  );
}

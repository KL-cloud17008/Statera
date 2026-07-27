"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSet } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { WORKOUT_LOAD_UNIT } from "@/lib/units";
import { cn } from "@/lib/utils";

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
  prefill = null,
  shouldAdvance = false,
  onSaved,
  completed,
  onCompletedChange,
  className,
}: {
  sessionId: string;
  planExerciseId: string | null;
  exerciseName: string;
  setNumber: number;
  isFinisher: boolean;
  logged: SetData | null;
  previous: PrevSet | null;
  prefill?: PrevSet | null;
  shouldAdvance?: boolean;
  onSaved: (setKey: string, values: PrevSet) => void;
  completed: boolean;
  onCompletedChange: (checked: boolean) => void;
  className?: string;
}) {
  const [weight, setWeight] = useState(
    logged?.weightUsed != null ? logged.weightUsed.toFixed(1) : ""
  );
  const [reps, setReps] = useState(logged?.repsCompleted?.toString() ?? "");
  const [rpe, setRpe] = useState(logged?.actualRPE?.toString() ?? "");
  const [notes, setNotes] = useState(logged?.notes ?? "");
  const [showNotes, setShowNotes] = useState(!!logged?.notes);
  const [saved, setSaved] = useState(!!logged);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [appliedPrefill, setAppliedPrefill] = useState<PrevSet | null>(null);
  const hasLoggableValue =
    weight.trim().length > 0 ||
    (!isFinisher && reps.trim().length > 0) ||
    notes.trim().length > 0;

  // Prefill the values of the set saved just before this one, so the next
  // set can be logged with a single tap when nothing changed.
  if (prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    if (prefill && !saved && !weight.trim() && !reps.trim()) {
      if (prefill.weightUsed != null) {
        setWeight(prefill.weightUsed.toFixed(1));
      }
      if (prefill.repsCompleted != null) {
        setReps(prefill.repsCompleted.toString());
      }
    }
  }

  useEffect(() => {
    if (shouldAdvance) {
      containerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [shouldAdvance]);

  function copyPrevious() {
    if (!previous) {
      return;
    }

    if (previous.weightUsed != null) {
      setWeight(previous.weightUsed.toFixed(1));
    }
    if (previous.repsCompleted != null) {
      setReps(previous.repsCompleted.toString());
    }
  }

  function handleSave() {
    if (!hasLoggableValue || isPending) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      if (planExerciseId) {
        formData.set("planExerciseId", planExerciseId);
      }
      formData.set("exerciseName", exerciseName);
      formData.set("setNumber", setNumber.toString());
      let savedWeight: number | null = null;
      if (weight) {
        const parsedWeight = Number.parseFloat(weight);
        if (!Number.isNaN(parsedWeight)) {
          formData.set("weightUsed", parsedWeight.toString());
          savedWeight = parsedWeight;
        }
      }
      let savedReps: number | null = null;
      if (!isFinisher && reps) {
        formData.set("repsCompleted", reps);
        const parsedReps = Number.parseInt(reps, 10);
        if (!Number.isNaN(parsedReps)) {
          savedReps = parsedReps;
        }
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
      onSaved(`${exerciseName}:${setNumber}`, {
        weightUsed: savedWeight,
        repsCompleted: savedReps,
      });
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid gap-3 py-3 md:gap-4 md:py-4",
        /* A logged set stays fully legible — it recedes by losing the ink of
           its label, not by dropping the whole row's contrast. */
        completed && "opacity-90",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={completed} onCheckedChange={(checked) => onCompletedChange(!!checked)} className="mt-0.5" />
          <div>
            <p
              className={cn(
                "text-row font-medium",
                completed ? "text-secondary" : "text-primary"
              )}
            >
              Set {setNumber}
            </p>
            {previous ? (
              <p className="mt-0.5 text-caption text-tertiary">
                Last{" "}
                <span className="num">
                  {previous.weightUsed != null ? `${previous.weightUsed.toFixed(1)} ${WORKOUT_LOAD_UNIT}` : "--"}
                </span>{" "}
                x <span className="num">{previous.repsCompleted ?? "--"}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 text-caption text-tertiary">
          {previous ? (
            <Button type="button" variant="link" onClick={copyPrevious} className="text-caption">
              Copy last
            </Button>
          ) : null}
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <span className="inline-flex items-center gap-1 text-accent">
              <Check className="size-3.5" />
              Saved
            </span>
          ) : null}
        </div>
      </div>

      {/* Three columns at every width: weight, reps, and RPE are entered in one
          pass without scrolling between fields. */}
      <div className={cn("grid grid-cols-3 gap-2 md:gap-3", isFinisher ? "md:grid-cols-[1fr_1.2fr_0.55fr]" : "md:grid-cols-[1fr_1fr_0.5fr]")}>
        <label className="grid content-start gap-1">
          <span className="text-label uppercase text-tertiary">
            {isFinisher ? "Score" : WORKOUT_LOAD_UNIT}
          </span>
          <Input
            aria-label={`${exerciseName} set ${setNumber} weight`}
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={isFinisher ? "Score" : "0.0"}
            value={weight}
            onChange={(event) => {
              setWeight(event.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            className="h-11"
          />
        </label>
        {isFinisher ? (
          <label className="grid content-start gap-1">
            <span className="text-label uppercase text-tertiary">Notes</span>
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
          </label>
        ) : (
          <label className="grid content-start gap-1">
            <span className="text-label uppercase text-tertiary">Reps</span>
            <Input
              aria-label={`${exerciseName} set ${setNumber} reps`}
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={reps}
              onChange={(event) => {
                setReps(event.target.value);
                setSaved(false);
              }}
              onBlur={handleSave}
              className="h-11"
            />
          </label>
        )}
        <label className="grid content-start gap-1">
          <span className="text-label uppercase text-tertiary">RPE</span>
          <Input
            aria-label={`${exerciseName} set ${setNumber} RPE`}
            type="number"
            inputMode="numeric"
            min="1"
            max="10"
            placeholder="1-10"
            value={rpe}
            onChange={(event) => {
              setRpe(event.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            className="h-11"
          />
        </label>
      </div>

      {!isFinisher && showNotes ? (
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
          placeholder="Optional notes"
        />
      ) : null}

      <div className="flex items-center gap-4">
        {!isFinisher ? (
          <Button
            type="button"
            variant="link"
            onClick={() => setShowNotes((current) => !current)}
            className="whitespace-nowrap text-caption"
            aria-expanded={showNotes}
          >
            {showNotes ? "- note" : "+ note"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={saved ? "secondary" : "primary"}
          onClick={handleSave}
          disabled={!hasLoggableValue || isPending}
          className={cn("h-11 flex-1 md:flex-none md:min-w-36", isFinisher && "md:ml-auto")}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "Saved" : "Save set"}
        </Button>
      </div>
    </div>
  );
}

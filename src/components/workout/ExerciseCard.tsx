"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedEntry } from "@/lib/workout-entry-state";

export type PlanExercise = {
  id: string; exerciseName: string; sets: number; reps: string;
  tempo: string | null; restSeconds: number | null; targetRPE: string | null;
  cues: string | null; supersetGroup: string | null; exerciseType: string;
};

/** One scannable row; only the selected set has an entry form. */
export function ExerciseCard({ exercise, index, loggedSets, selectedSet, draftSetNumbers, disabled = false, onSelect }: {
  exercise: PlanExercise;
  index: number;
  loggedSets: (SavedEntry & { setNumber: number })[];
  selectedSet: number | null;
  draftSetNumbers: number[];
  disabled?: boolean;
  onSelect: (setNumber: number) => void;
}) {
  const count = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
  const complete = Array.from({ length: count }, (_, i) => i + 1).every((setNumber) => loggedSets.some((set) => set.setNumber === setNumber));
  const firstMissing = Array.from({ length: count }, (_, i) => i + 1).find((setNumber) => !loggedSets.some((set) => set.setNumber === setNumber)) ?? 1;
  return (
    <div className={cn("border-b border-rule py-3", selectedSet && "border-l-2 border-l-accent pl-3")}>
      <button type="button" disabled={disabled} onClick={() => onSelect(draftSetNumbers[0] ?? firstMissing)} aria-current={selectedSet ? "step" : undefined} className="flex min-h-12 w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-control text-caption tabular-nums", complete ? "bg-accent-subtle text-accent" : "bg-sunken text-secondary")}>
          {complete ? <Check className="size-4" /> : String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-row font-medium text-primary">{exercise.exerciseName}</span>
          <span className="mt-1 block text-caption text-secondary">{complete ? `${count} sets saved` : `${loggedSets.length}/${count} sets · ${exercise.reps}`}{draftSetNumbers.length ? " · Draft" : ""}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-tertiary" />
      </button>
      {selectedSet !== null ? <div className="mt-2 flex flex-wrap gap-2 pl-11" aria-label={`${exercise.exerciseName} sets`}>
        {Array.from({ length: count }, (_, i) => i + 1).map((number) => {
          const saved = loggedSets.find((set) => set.setNumber === number);
          return <button key={number} type="button" disabled={disabled} onClick={() => onSelect(number)} aria-pressed={selectedSet === number} className={cn("min-h-12 min-w-12 rounded-control border px-3 py-2 text-caption focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60", selectedSet === number ? "border-accent bg-accent-subtle text-accent" : "border-rule text-secondary hover:bg-sunken")}>
            {saved ? <Check className="mr-1 inline size-3.5" /> : null}Set {number}{draftSetNumbers.includes(number) ? " · Draft" : ""}
          </button>;
        })}
      </div> : null}
    </div>
  );
}

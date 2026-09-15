"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { logSet } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  acknowledgeSubmittedDraft, entryFields, isWorkoutStorageDurable, parseEntry, parseWorkoutDraft, readWorkoutStorage,
  subscribeWorkoutStorage, workoutDraftKey, writeWorkoutStorage,
  type EntryFields, type SavedEntry, type WorkoutDraft,
} from "@/lib/workout-entry-state";
import { cn } from "@/lib/utils";

type SetData = SavedEntry & { setNumber: number };
type PrevSet = { weightUsed: number | null; repsCompleted: number | null; actualRPE?: number | null };

export function SetInput({
  sessionId, planExerciseId, exerciseName, setNumber, isFinisher, logged, previous,
  prefill = null, shouldAdvance = false, disabled = false, onSaved, onPendingChange, className,
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
  disabled?: boolean;
  onSaved: (setKey: string, values: SavedEntry, advance?: boolean) => void;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
}) {
  const key = workoutDraftKey(sessionId, exerciseName, setNumber);
  const rawDraft = useSyncExternalStore(subscribeWorkoutStorage, () => readWorkoutStorage(key), () => null);
  const draft = parseWorkoutDraft(rawDraft);
  const fields = draft?.fields ?? entryFields(logged ?? (prefill ? { ...prefill, actualRPE: null, notes: null } : null));
  const [pending, setPending] = useState(false);
  const requestInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ savedSet: SavedEntry | null } | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(!isWorkoutStorageDurable(key));
  const [showNotes, setShowNotes] = useState(Boolean(fields.notes));
  const weightRef = useRef<HTMLInputElement>(null);
  const statusId = `set-status-${planExerciseId ?? "custom"}-${setNumber}`;
  const hasValue = Object.values(fields).some((value) => value.trim());
  const isSaved = Boolean(logged) && !draft;

  useEffect(() => {
    if (shouldAdvance) weightRef.current?.focus({ preventScroll: true });
  }, [shouldAdvance]);

  function store(next: WorkoutDraft) {
    setStorageUnavailable(!writeWorkoutStorage(key, JSON.stringify(next)));
  }

  function updateFields(next: EntryFields) {
    setError(null);
    setConflict(null);
    store({ version: 1, fields: next, baseline: draft ? draft.baseline : logged ? savedValues(logged) : null,
      revision: crypto.randomUUID(), status: "draft" });
  }

  async function handleSave(overrideBaseline?: SavedEntry | null) {
    if (requestInFlight.current || disabled) return;
    const parsed = parseEntry(fields, isFinisher);
    if ("error" in parsed) { setError(parsed.error); return; }
    const submitted: WorkoutDraft = {
      version: 1, fields, revision: draft?.revision ?? crypto.randomUUID(), status: "pending",
      baseline: overrideBaseline !== undefined ? overrideBaseline : draft ? draft.baseline : logged ? savedValues(logged) : null,
    };
    store(submitted);
    requestInFlight.current = true;
    onPendingChange?.(true);
    setPending(true);
    setError(null);
    setConflict(null);
    try {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      if (planExerciseId) formData.set("planExerciseId", planExerciseId);
      formData.set("exerciseName", exerciseName);
      formData.set("setNumber", setNumber.toString());
      formData.set("expectedSet", JSON.stringify(submitted.baseline));
      for (const [field, value] of Object.entries(parsed.values)) {
        if (value !== null) formData.set(field, String(value));
      }
      const result = await logSet(formData);
      if (result.error) {
        if (result.conflict) setConflict({ savedSet: result.savedSet ?? null });
        throw new Error(result.error);
      }
      const values = result.savedSet ?? parsed.values;
      // A second tab or a newer edit may have changed this draft while saving.
      const cleared = acknowledgeSubmittedDraft(key, submitted.revision, values);
      onSaved(`${exerciseName}:${setNumber}`, values, cleared);
      if (!cleared) setError("This set saved. Your newer draft is still here; review it before saving again.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Save interrupted. Your draft is still here. Retry when connected.";
      setError(message);
      const latest = parseWorkoutDraft(readWorkoutStorage(key));
      if (latest?.revision === submitted.revision) store({ ...submitted, status: "error", error: message });
    } finally {
      requestInFlight.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  }

  const statusText = pending ? "Saving…" : error ?? draft?.error ?? (draft?.status === "pending"
    ? "Save unconfirmed. Retry to check and save this draft."
    : draft ? "Draft saved on this device" : isSaved ? "Saved" : "Ready to log");

  return (
    <form className={cn("grid gap-4", className)} onSubmit={(event) => { event.preventDefault(); void handleSave(); }} aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
        <p className="text-caption text-secondary">
          {previous ? <>Previous: <span className="num font-medium text-primary">{previous.weightUsed ?? "—"} kg × {previous.repsCompleted ?? "—"}{previous.actualRPE != null ? ` · RPE ${previous.actualRPE}` : ""}</span></> : "No previous result"}
        </p>
        {previous ? <Button type="button" variant="link" className="min-h-10 text-caption" disabled={pending || disabled} onClick={() => updateFields({ ...fields, weight: previous.weightUsed?.toString() ?? "", reps: previous.repsCompleted?.toString() ?? "" })}>Use previous</Button> : null}
      </div>
      <fieldset disabled={pending || disabled} className="grid grid-cols-3 gap-3">
        <label className="grid gap-2 text-caption text-secondary">
          {isFinisher ? "Score" : "Weight · kg"}
          <Input ref={weightRef} aria-label={`${exerciseName} set ${setNumber} weight`} aria-describedby={statusId} type="number" inputMode="decimal" min="0" max="1500" step="any" value={fields.weight} placeholder="0" onChange={(event) => updateFields({ ...fields, weight: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
        <label className="grid gap-2 text-caption text-secondary">
          {isFinisher ? "Notes" : "Reps"}
          <Input aria-label={`${exerciseName} set ${setNumber} ${isFinisher ? "notes" : "reps"}`} type={isFinisher ? "text" : "number"} inputMode={isFinisher ? "text" : "numeric"} min="0" max="1000" maxLength={isFinisher ? 240 : undefined} step="1" value={isFinisher ? fields.notes : fields.reps} placeholder={isFinisher ? "Optional" : "0"} onChange={(event) => updateFields({ ...fields, [isFinisher ? "notes" : "reps"]: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
        <label className="grid gap-2 text-caption text-secondary">
          RPE
          <Input aria-label={`${exerciseName} set ${setNumber} RPE`} type="number" inputMode="numeric" min="1" max="10" step="1" value={fields.rpe} placeholder="1–10" onChange={(event) => updateFields({ ...fields, rpe: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
      </fieldset>
      {!isFinisher && (showNotes || fields.notes) ? <label className="grid gap-2 text-caption text-secondary">Notes<Input aria-label={`${exerciseName} set ${setNumber} notes`} value={fields.notes} disabled={pending || disabled} maxLength={240} onChange={(event) => updateFields({ ...fields, notes: event.target.value })} className="min-h-12" placeholder="Optional" /></label> : null}
      <div id={statusId} role="status" aria-live="polite" className={cn("text-caption", error || draft?.status === "error" ? "text-ember" : "text-secondary")}>
        {isSaved ? <Check className="mr-1 inline size-4 text-accent" /> : null}{statusText}
        {storageUnavailable ? <p className="mt-1 text-ember">Browser storage is unavailable. Keep this page open until the set is saved.</p> : null}
      </div>
      {conflict ? <div className="grid gap-2 border border-rule bg-sunken p-3 text-caption">
        <p>Saved elsewhere: {conflict.savedSet ? `${conflict.savedSet.weightUsed ?? "—"} kg × ${conflict.savedSet.repsCompleted ?? "—"}, RPE ${conflict.savedSet.actualRPE ?? "—"}` : "No saved set"}. Your draft is preserved.</p>
        <Button type="button" variant="secondary" disabled={pending || disabled} onClick={() => void handleSave(conflict.savedSet)}>Replace saved set with my draft</Button>
        <Button type="button" variant="link" disabled={pending || disabled} onClick={() => { writeWorkoutStorage(key, null); if (conflict.savedSet) onSaved(`${exerciseName}:${setNumber}`, conflict.savedSet, false); setConflict(null); setError(null); }}>Use saved set</Button>
      </div> : null}
      <div className="flex items-center gap-3">
        {!isFinisher && !showNotes && !fields.notes ? <Button type="button" variant="link" className="min-h-12 text-caption" disabled={pending || disabled} onClick={() => setShowNotes(true)}>Add note</Button> : null}
        <Button type="submit" variant="primary" disabled={!hasValue || pending || disabled || isSaved} className="min-h-12 flex-1 text-body">
          {pending ? <Loader2 className="size-4 animate-spin" /> : error || draft?.status === "pending" ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
          {pending ? "Saving…" : isSaved ? "Saved" : error || draft?.status === "pending" ? "Retry save" : logged ? "Save changes" : "Save set"}
        </Button>
      </div>
      {draft && !pending ? <Button type="button" variant="link" disabled={disabled} className="min-h-10 justify-self-start text-caption text-secondary" onClick={() => {
        if (!window.confirm("Discard this draft and return to the saved set?")) return;
        writeWorkoutStorage(key, null); setError(null); setConflict(null);
      }}>Discard draft</Button> : null}
    </form>
  );
}

function savedValues(entry: SavedEntry): SavedEntry {
  return { weightUsed: entry.weightUsed, repsCompleted: entry.repsCompleted, actualRPE: entry.actualRPE, notes: entry.notes };
}

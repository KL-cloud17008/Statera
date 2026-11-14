"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { logSet, saveCompletedWorkoutSet } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FRIDAY_TRICEPS_EXERCISE, FRIDAY_TRICEPS_VARIATIONS } from "@/lib/default-workout-plan";
import {
  acknowledgeSubmittedDraft, entryFields, isWorkoutStorageDurable, parseEntry, parseWorkoutDraft, readWorkoutStorage,
  subscribeWorkoutStorage, workoutDraftKey, workoutSetForm, writeWorkoutStorage,
  type EntryFields, type SavedEntry, type WorkoutDraft,
} from "@/lib/workout-entry-state";
import { cn } from "@/lib/utils";

type SetData = SavedEntry & { setNumber: number };
type PrevSet = Pick<SavedEntry, "weightUsed" | "repsCompleted" | "duration"> & { actualRPE?: number | null };

export function SetInput({
  sessionId, planExerciseId, exerciseName, setNumber, isFinisher, timed = false, logged, previous,
  prefill = null, shouldAdvance = false, disabled = false, saveMode = "live", showPrevious = true, offlineLogging = false, offlineMode = false,
  onSaved, onMissing, onPendingChange, className,
}: {
  sessionId: string;
  planExerciseId: string | null;
  exerciseName: string;
  setNumber: number;
  isFinisher: boolean;
  timed?: boolean;
  logged: SetData | null;
  previous: PrevSet | null;
  prefill?: (PrevSet & { notes?: string | null }) | null;
  shouldAdvance?: boolean;
  disabled?: boolean;
  saveMode?: "live" | "history";
  showPrevious?: boolean;
  offlineLogging?: boolean;
  offlineMode?: boolean;
  onSaved: (setKey: string, values: SavedEntry, advance?: boolean, queued?: boolean) => void;
  onMissing?: () => void;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
}) {
  const key = workoutDraftKey(sessionId, exerciseName, setNumber);
  const rawDraft = useSyncExternalStore(subscribeWorkoutStorage, () => readWorkoutStorage(key), () => null);
  const draft = parseWorkoutDraft(rawDraft);
  const hasVariationPicker = exerciseName === FRIDAY_TRICEPS_EXERCISE;
  const fields = draft?.fields ?? entryFields(logged ?? (prefill ? {
    ...prefill, duration: null, actualRPE: null,
    notes: hasVariationPicker ? tricepsSetNote(prefill.notes ?? "").variation : null,
  } : null), timed);
  const { variation, note } = hasVariationPicker ? tricepsSetNote(fields.notes) : { variation: "", note: fields.notes };
  const [pending, setPending] = useState(false);
  const requestInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [localConflict, setConflict] = useState<{ savedSet: SavedEntry | null } | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(!isWorkoutStorageDurable(key));
  const [showNotes, setShowNotes] = useState(Boolean(note));
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);
  const rpeRef = useRef<HTMLInputElement>(null);
  const statusId = `set-status-${planExerciseId ?? "custom"}-${setNumber}`;
  const hasValue = Object.values({ ...fields, notes: note }).some((value) => value.trim());
  const isSaved = Boolean(logged) && !draft;
  const queued = draft?.status === "queued";
  const conflict = localConflict ?? draft?.conflict;
  const weightLabel = isFinisher ? "Score" : timed && /farmer walk/i.test(exerciseName) ? "kg per hand" : "Weight · kg";
  const measurement = isFinisher ? "notes" : timed ? "duration" : "reps";
  const measurementLabel = isFinisher ? "Notes" : timed ? "Seconds" : "Reps";

  useEffect(() => {
    if (shouldAdvance) weightRef.current?.focus({ preventScroll: true });
  }, [shouldAdvance]);

  function store(next: WorkoutDraft) {
    const durable = writeWorkoutStorage(key, JSON.stringify(next));
    setStorageUnavailable(!durable);
    return durable;
  }

  function updateFields(next: EntryFields) {
    setError(null);
    setConflict(null);
    store({ version: 1, fields: next, baseline: draft ? draft.baseline : logged ? savedValues(logged, timed) : null,
      revision: crypto.randomUUID(), status: "draft" });
  }

  function updateNotes(nextVariation: string, nextNote: string) {
    updateFields({ ...fields, notes: [nextVariation, nextNote].filter(Boolean).join("\n") });
  }

  async function handleSave(overrideBaseline?: SavedEntry | null) {
    if (requestInFlight.current || disabled || queued || !hasValue) return;
    const parsed = parseEntry(fields, isFinisher, timed);
    if ("error" in parsed) { setError(parsed.error); return; }
    const submitted: WorkoutDraft = {
      version: 1, fields, revision: overrideBaseline === undefined ? draft?.revision ?? crypto.randomUUID() : crypto.randomUUID(), status: "pending",
      baseline: overrideBaseline !== undefined ? overrideBaseline : draft ? draft.baseline : logged ? savedValues(logged, timed) : null,
    };
    const setKey = `${exerciseName}:${setNumber}`;
    function queueForSync(values: SavedEntry) {
      if (store({ ...submitted, status: "queued", upload: values })) {
        onSaved(setKey, values, true, true);
      } else {
        store({ ...submitted, status: "error", error: "Browser storage is unavailable. Keep this page open and retry when connected." });
      }
    }
    setError(null);
    setConflict(null);
    if (offlineLogging && (offlineMode || navigator.onLine === false)) {
      queueForSync(parsed.values);
      return;
    }
    store(submitted);
    requestInFlight.current = true;
    onPendingChange?.(true);
    setPending(true);
    try {
      const formData = workoutSetForm(sessionId, exerciseName, setNumber, submitted, parsed.values, planExerciseId);
      const result = await (saveMode === "history" ? saveCompletedWorkoutSet : logSet)(formData);
      if (result.error) {
        const latest = parseWorkoutDraft(readWorkoutStorage(key));
        if (latest?.revision === submitted.revision) {
          store({ ...submitted, status: "error", error: result.error, conflict: result.conflict ? { savedSet: result.savedSet ?? null } : undefined });
        }
        setError(result.error);
        return;
      }
      const values = result.savedSet ?? parsed.values;
      // A second tab or a newer edit may have changed this draft while saving.
      const cleared = acknowledgeSubmittedDraft(key, submitted.revision, values);
      onSaved(setKey, values, cleared);
      if (!cleared) setError("This set saved. Your newer draft is still here; review it before saving again.");
    } catch (cause) {
      const latest = parseWorkoutDraft(readWorkoutStorage(key));
      if (offlineLogging && latest?.revision === submitted.revision) { queueForSync(parsed.values); return; }
      const message = cause instanceof Error ? cause.message : "Save interrupted. Your draft is still here. Retry when connected.";
      setError(message);
      if (latest?.revision === submitted.revision) store({ ...submitted, status: "error", error: message });
    } finally {
      requestInFlight.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  }

  const statusText = pending ? "Saving…" : queued ? "Saved on this device · waiting to sync" : error ?? draft?.error ?? (draft?.status === "pending"
    ? "Save unconfirmed. Retry to check and save this draft."
    : draft ? "Draft saved on this device" : isSaved ? "Saved" : "Ready to log");

  return (
    <form className={cn("grid gap-4", className)} onSubmit={(event) => { event.preventDefault(); void handleSave(); }} aria-busy={pending}>
      {showPrevious && !hasVariationPicker ? <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
        <p className="text-caption text-secondary">
          {previous ? <>Previous: <span className="num font-medium text-primary">{formatPerformance(previous, timed)}{previous.actualRPE != null ? ` · RPE ${previous.actualRPE}` : ""}</span></> : "No previous result"}
        </p>
        {previous ? <Button type="button" variant="link" className="min-h-10 text-caption" disabled={pending || disabled || queued} onClick={() => updateFields({ ...fields, weight: previous.weightUsed?.toString() ?? "", reps: previous.repsCompleted?.toString() ?? "" })}>{timed ? "Use previous weight" : "Use previous"}</Button> : null}
      </div> : null}
      {hasVariationPicker ? <label className="grid gap-2 text-caption text-secondary">
        Triceps variation
        <select value={variation} onChange={(event) => updateNotes(event.target.value, note)} disabled={pending || disabled || queued}
          className="h-12 min-w-0 rounded-control border border-control-border bg-raised px-3 text-row text-primary">
          <option value="">Choose an attachment or movement</option>
          {FRIDAY_TRICEPS_VARIATIONS.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label> : null}
      <fieldset disabled={pending || disabled || queued} className="grid grid-cols-3 gap-3">
        <label className="grid gap-2 text-caption text-secondary">
          {weightLabel}
          <Input ref={weightRef} enterKeyHint="next" onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); repsRef.current?.focus(); } }} aria-label={`${exerciseName} set ${setNumber} weight`} aria-describedby={statusId} type="number" inputMode="decimal" min="0" max="1500" step="any" value={fields.weight} placeholder="0" onChange={(event) => updateFields({ ...fields, weight: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
        <label className="grid gap-2 text-caption text-secondary">
          {measurementLabel}
          <Input ref={repsRef} enterKeyHint="next" onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); rpeRef.current?.focus(); } }} aria-label={`${exerciseName} set ${setNumber} ${measurement}`} type={isFinisher ? "text" : "number"} inputMode={isFinisher ? "text" : "numeric"} min={timed ? 1 : 0} max={timed ? 7200 : 1000} maxLength={isFinisher ? 240 : undefined} step="1" value={fields[measurement] ?? ""} placeholder={isFinisher ? "Optional" : timed ? "60" : "0"} onChange={(event) => updateFields({ ...fields, [measurement]: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
        <label className="grid gap-2 text-caption text-secondary">
          RPE
          <Input ref={rpeRef} enterKeyHint="done" aria-label={`${exerciseName} set ${setNumber} RPE`} type="number" inputMode="numeric" min="1" max="10" step="1" value={fields.rpe} placeholder="1–10" onChange={(event) => updateFields({ ...fields, rpe: event.target.value })} className="h-14 min-w-0 px-3 text-xl font-medium tabular-nums" />
        </label>
      </fieldset>
      {!isFinisher && (showNotes || note) ? <label className="grid gap-2 text-caption text-secondary">Notes<Input aria-label={`${exerciseName} set ${setNumber} notes`} value={note} disabled={pending || disabled || queued} maxLength={variation ? 239 - variation.length : 240} onChange={(event) => updateNotes(variation, event.target.value)} className="min-h-12" placeholder="Optional" /></label> : null}
      <div id={statusId} role="status" aria-live="polite" className={cn("text-caption", error || draft?.status === "error" ? "text-ember" : "text-secondary")}>
        {isSaved ? <Check className="mr-1 inline size-4 text-accent" /> : null}{statusText}
        {storageUnavailable ? <p className="mt-1 text-ember">Browser storage is unavailable. Keep this page open until the set is saved.</p> : null}
      </div>
      {conflict ? <div className="grid gap-2 border border-rule bg-sunken p-3 text-caption">
        <p>Saved elsewhere: {conflict.savedSet ? `${formatPerformance(conflict.savedSet, timed)}, RPE ${conflict.savedSet.actualRPE ?? "—"}` : "No saved set"}. Your draft is preserved.</p>
        {hasVariationPicker && conflict.savedSet?.notes ? <p>{conflict.savedSet.notes}</p> : null}
        <Button type="button" variant="secondary" disabled={pending || disabled} onClick={() => void handleSave(conflict.savedSet)}>Replace saved set with my draft</Button>
        <Button type="button" variant="link" disabled={pending || disabled} onClick={() => { writeWorkoutStorage(key, null); if (conflict.savedSet) onSaved(`${exerciseName}:${setNumber}`, conflict.savedSet, false); else onMissing?.(); setConflict(null); setError(null); }}>Use saved set</Button>
      </div> : null}
      {queued ? <Button type="button" variant="secondary" disabled={disabled} onClick={() => updateFields(fields)}>Edit queued set</Button> : <div className="flex items-center gap-3">
        {!isFinisher && !showNotes && !note ? <Button type="button" variant="link" className="min-h-12 text-caption" disabled={pending || disabled} onClick={() => setShowNotes(true)}>Add note</Button> : null}
        <Button type="submit" variant="primary" disabled={!hasValue || pending || disabled || isSaved} className="min-h-12 flex-1 text-body">
          {pending ? <Loader2 className="size-4 animate-spin" /> : error || draft?.status === "pending" ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
          {pending ? "Saving…" : isSaved ? "Saved" : error || draft?.status === "pending" ? "Retry save" : logged ? "Save changes" : `Save set ${setNumber}`}
        </Button>
      </div>}
      {draft && !pending ? <Button type="button" variant="link" disabled={disabled} className="min-h-10 justify-self-start text-caption text-secondary" onClick={() => {
        if (!window.confirm("Discard this draft and return to the saved set?")) return;
        writeWorkoutStorage(key, null); setError(null); setConflict(null);
      }}>{queued ? "Discard queued set" : "Discard draft"}</Button> : null}
    </form>
  );
}

function tricepsSetNote(text: string) {
  for (const variation of FRIDAY_TRICEPS_VARIATIONS) {
    if (text === variation) return { variation, note: "" };
    if (text.startsWith(`${variation}\n`)) return { variation, note: text.slice(variation.length + 1) };
  }
  return { variation: "", note: text };
}

function savedValues(entry: SavedEntry, timed: boolean): SavedEntry {
  return { weightUsed: entry.weightUsed, repsCompleted: entry.repsCompleted, actualRPE: entry.actualRPE, notes: entry.notes, ...(timed ? { duration: entry.duration ?? null } : {}) };
}

function formatPerformance(entry: PrevSet, timed: boolean) {
  return `${entry.weightUsed ?? "—"} kg × ${timed ? `${entry.duration ?? "—"}s` : entry.repsCompleted ?? "—"}`;
}

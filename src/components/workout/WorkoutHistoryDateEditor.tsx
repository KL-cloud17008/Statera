"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateCompletedWorkoutDate } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTodayDateString, isValidISODateString } from "@/lib/dates";
import { isWorkoutStorageDurable, readWorkoutStorage, subscribeWorkoutStorage, writeWorkoutStorage } from "@/lib/workout-entry-state";

type DateDraft = { value: string; baseline: string; revision: string };

function parseDraft(raw: string | null): DateDraft | null {
  try {
    const draft = raw ? JSON.parse(raw) as DateDraft : null;
    return draft && typeof draft.value === "string" && (draft.value === "" || isValidISODateString(draft.value)) &&
      typeof draft.baseline === "string" && isValidISODateString(draft.baseline) && typeof draft.revision === "string" ? draft : null;
  } catch { return null; }
}

export function WorkoutHistoryDateEditor({ sessionId, trainingDate, maxDate = getTodayDateString(), disabled = false, onPendingChange }: {
  sessionId: string;
  trainingDate: string;
  maxDate?: string;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const router = useRouter();
  const key = `athanor:history-date:${encodeURIComponent(sessionId)}`;
  const raw = useSyncExternalStore(subscribeWorkoutStorage, () => readWorkoutStorage(key), () => null);
  const draft = parseDraft(raw);
  const [savedDate, setSavedDate] = useState(trainingDate);
  const [previousDate, setPreviousDate] = useState(trainingDate);
  const [dateConflict, setDateConflict] = useState<{ raw: string | null; date: string } | null>(null);
  if (previousDate !== trainingDate) {
    setPreviousDate(trainingDate);
    setSavedDate(trainingDate);
    setDateConflict(draft && draft.value !== trainingDate && draft.baseline !== trainingDate ? { raw, date: trainingDate } : null);
  }
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef(false);
  const value = draft?.value ?? savedDate;
  const conflict = dateConflict?.raw === raw ? dateConflict.date : null;
  const hasDraft = Boolean(draft);

  useEffect(() => {
    if (!hasDraft) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [hasDraft]);

  async function saveDate(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current || disabled || value === savedDate) return;
    if (!isValidISODateString(value) || value > maxDate) {
      setError("Choose today or a valid past date.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    onPendingChange?.(true);
    setError(null);
    setNotice(null);
    try {
      const data = new FormData();
      data.set("sessionId", sessionId);
      data.set("trainingDate", value);
      data.set("expectedTrainingDate", conflict ?? draft?.baseline ?? savedDate);
      const result = await updateCompletedWorkoutDate(data);
      if (result.conflict && result.trainingDate) {
        setSavedDate(result.trainingDate);
        setDateConflict({ raw, date: result.trainingDate });
      }
      if (result.error) throw new Error(result.error);
      if (result.trainingDate !== value) throw new Error("Could not confirm the saved date. Try again.");
      // Preserve a newer date selection made in another tab during this request.
      const currentRaw = readWorkoutStorage(key);
      const currentDraft = parseDraft(currentRaw);
      if (currentRaw === raw) writeWorkoutStorage(key, null);
      else {
        if (currentDraft) writeWorkoutStorage(key, JSON.stringify({ ...currentDraft, baseline: value }));
      }
      setSavedDate(value);
      setDateConflict(null);
      setNotice(currentRaw !== raw && currentDraft && currentDraft.value !== value
        ? "Training date saved. Your newer selection is still unsaved." : "Training date saved.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the date. Try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return <div className="mt-4">
    <form onSubmit={saveDate} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:max-w-md">
      <label htmlFor="history-training-date" className="grid min-w-0 gap-1.5 text-caption font-medium text-primary">
        Training date
        <Input id="history-training-date" aria-label="Training date" type="date" required max={maxDate} value={value} disabled={pending || disabled}
          aria-describedby="history-date-status" className="min-h-11 min-w-0 w-full" onChange={(event) => {
            if (inFlight.current || disabled) return;
            const next = event.target.value;
            writeWorkoutStorage(key, next === savedDate ? null : JSON.stringify({ value: next, baseline: conflict ?? draft?.baseline ?? savedDate, revision: crypto.randomUUID() }));
            setDateConflict(null);
            setError(null);
            setNotice(null);
          }} />
      </label>
      <Button type="submit" variant="secondary" className="min-h-11 px-3" disabled={pending || disabled || value === savedDate}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}{pending ? "Saving…" : conflict ? "Save my date" : "Save date"}
      </Button>
    </form>
    <div id="history-date-status" className="mt-2 text-caption">
      {error ? <p role="alert" className="text-critical">{error}</p> : null}
      {conflict ? <p className="mt-1 text-secondary">Saved date: {conflict}. Review before saving your selection.</p> : null}
      {draft ? <Button type="button" variant="link" className="min-h-11 px-0" disabled={pending || disabled} onClick={() => {
        writeWorkoutStorage(key, null); setDateConflict(null); setError(null); setNotice(null);
        if (savedDate !== trainingDate) router.refresh();
      }}>{conflict ? "Use saved date" : "Cancel date change"}</Button> : null}
      {draft && !isWorkoutStorageDurable(key) ? <p className="text-ember">This date selection cannot survive a page refresh. Keep this page open until you save.</p> : null}
      <p role="status" className="text-accent">{notice}</p>
    </div>
  </div>;
}

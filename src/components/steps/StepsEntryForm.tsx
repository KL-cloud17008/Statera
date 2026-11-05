"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSteps, updateStepsEntry } from "@/actions/steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTodayDateString } from "@/lib/dates";

type StepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function StepsEntryForm({
  editEntry,
  onDone,
  timezone,
  initialDate,
  entries = [],
  selectedDate,
  onDateChange,
  focusRequest = 0,
  onPendingChange,
}: {
  editEntry?: StepsEntry;
  onDone?: () => void;
  timezone?: string;
  initialDate?: string;
  entries?: StepsEntry[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  focusRequest?: number;
  onPendingChange?: (pending: boolean) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const stepsRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ date: string; error?: string; saved?: string } | null>(null);
  const today = getTodayDateString(timezone);
  const [localDate, setLocalDate] = useState(editEntry?.date ?? initialDate ?? today);
  const date = selectedDate ?? localDate;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editSteps, setEditSteps] = useState(String(editEntry?.steps ?? ""));
  const existing = entries.find((entry) => entry.date === date);
  const steps = editEntry ? editSteps : drafts[date] ?? String(existing?.steps ?? "");
  const error = feedback?.date === date ? feedback.error : null;
  const saved = feedback?.date === date ? feedback.saved : null;

  useEffect(() => {
    if (!focusRequest) return;
    formRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    stepsRef.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  async function handleSubmit(formData: FormData) {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsPending(true);
    onPendingChange?.(true);
    setFeedback(null);
    const submittedDate = String(formData.get("date"));
    if (editEntry) {
      formData.set("id", editEntry.id);
      formData.set("originalSteps", String(editEntry.steps));
      formData.set("originalDate", editEntry.date);
    }
    try {
      const result = await (editEntry ? updateStepsEntry(formData) : logSteps(formData));
      if (result.error) {
        setFeedback({ date: submittedDate, error: result.error });
        return;
      }
      const message = `${Number(formData.get("steps")).toLocaleString()} steps saved for ${formData.get("date")}`;
      setFeedback({ date: submittedDate, saved: message });
      toast.success(message);
      onDone?.();
    } catch {
      setFeedback({ date: submittedDate, error: "Save could not be confirmed. Your entry is still here; check your connection and retry." });
    } finally {
      setIsPending(false);
      savingRef.current = false;
      onPendingChange?.(false);
    }
  }

  /* No card. When editing inline the form replaces a ledger row, so it sits
     on the canvas and is marked by an accent edge rather than a panel. */
  return (
    <div className={editEntry ? "border-l-2 border-accent pl-3" : ""}>
      <form ref={formRef} onSubmit={(event) => { event.preventDefault(); void handleSubmit(new FormData(event.currentTarget)); }} aria-busy={isPending}>
        <fieldset disabled={isPending} className="measurement-fields grid min-w-0 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}>Date</Label>
            <Input
              id={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              name="date"
              type="date"
              value={date}
              max={today}
              onChange={(event) => {
                setLocalDate(event.target.value);
                onDateChange?.(event.target.value);
                setFeedback(null);
              }}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}>Steps</Label>
            <Input
              id={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}
              ref={stepsRef}
              name="steps"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="200000"
              placeholder="12000"
              enterKeyHint="done"
              value={steps}
              onChange={(event) => {
                const value = event.target.value;
                if (editEntry) setEditSteps(value);
                else setDrafts(current => ({ ...current, [date]: value }));
                setFeedback(null);
              }}
              required
              className="h-12"
            />
          </div>
          <div className="flex gap-2 md:justify-end">
            {editEntry ? (
              <Button type="button" variant="secondary" onClick={onDone}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" variant="primary" className="w-full min-w-32 md:w-auto" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isPending ? "Saving…" : editEntry ? "Save changes" : existing ? "Update steps" : "Save steps"}
            </Button>
          </div>
        </fieldset>
        {!editEntry && existing && !saved ? <p className="mt-3 text-caption text-secondary">Replaces the saved total of {(existing.steps ?? 0).toLocaleString()} steps for this date.</p> : null}
        {error ? <p role="alert" className="mt-3 text-sm text-critical">{error}</p> : null}
        {saved ? <p role="status" className="mt-3 text-sm text-accent">{saved}</p> : null}
      </form>
    </div>
  );
}

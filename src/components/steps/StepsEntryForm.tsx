"use client";

import { useRef, useState } from "react";
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
}: {
  editEntry?: StepsEntry;
  onDone?: () => void;
  timezone?: string;
  initialDate?: string;
  entries?: StepsEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const today = getTodayDateString(timezone);
  const [date, setDate] = useState(editEntry?.date ?? initialDate ?? today);
  const [steps, setSteps] = useState(String(editEntry?.steps ?? entries.find((entry) => entry.date === (initialDate ?? today))?.steps ?? ""));
  const existing = entries.find((entry) => entry.date === date);

  async function handleSubmit(formData: FormData) {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsPending(true);
    setError(null);
    setSaved(null);
    if (editEntry) {
      formData.set("id", editEntry.id);
      formData.set("originalSteps", String(editEntry.steps));
      formData.set("originalDate", editEntry.date);
    }
    try {
      const result = await (editEntry ? updateStepsEntry(formData) : logSteps(formData));
      if (result.error) {
        setError(result.error);
        return;
      }
      const message = `${Number(formData.get("steps")).toLocaleString()} steps saved for ${formData.get("date")}`;
      setSaved(message);
      toast.success(message);
      onDone?.();
    } catch {
      setError("Save could not be confirmed. Your entry is still here; check your connection and retry.");
    } finally {
      setIsPending(false);
      savingRef.current = false;
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
                setDate(event.target.value);
                if (!editEntry) setSteps(String(entries.find((entry) => entry.date === event.target.value)?.steps ?? ""));
                setSaved(null);
              }}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}>Steps</Label>
            <Input
              id={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}
              name="steps"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="200000"
              placeholder="8500"
              value={steps}
              onChange={(event) => { setSteps(event.target.value); setSaved(null); }}
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
            <Button type="submit" variant="primary" className="min-w-32" disabled={isPending}>
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

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
}: {
  editEntry?: StepsEntry;
  onDone?: () => void;
  timezone?: string;
  initialDate?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const today = getTodayDateString(timezone);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    if (editEntry) {
      formData.set("id", editEntry.id);
    }

    const result = await (editEntry ? updateStepsEntry(formData) : logSteps(formData));
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(editEntry ? "Steps updated" : "Steps logged");
    if (!editEntry) {
      formRef.current?.reset();
    }
    onDone?.();
  }

  /* No card. When editing inline the form replaces a ledger row, so it sits
     on the canvas and is marked by an accent edge rather than a panel. */
  return (
    <div className={editEntry ? "border-l-2 border-accent pl-3" : ""}>
      {editEntry ? null : (
        <p className="mb-3 text-caption text-tertiary">Log today or add a past day.</p>
      )}
      <form ref={formRef} action={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}>Date</Label>
            <Input
              id={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              name="date"
              type="date"
              defaultValue={editEntry?.date ?? initialDate ?? today}
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
              min="0"
              max="200000"
              placeholder="e.g. 8,500"
              defaultValue={editEntry?.steps ?? ""}
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
              {editEntry ? "Save changes" : "Save steps"}
            </Button>
          </div>
        </form>
    </div>
  );
}

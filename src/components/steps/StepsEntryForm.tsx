"use client";

import { useRef, useState } from "react";
import { Footprints, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSteps, updateStepsEntry } from "@/actions/steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}: {
  editEntry?: StepsEntry;
  onDone?: () => void;
  timezone?: string;
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

  return (
    <Card className={editEntry ? "border-primary/35" : ""}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] bg-primary/12 text-primary">
            <Footprints className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Quick Add</p>
            <CardTitle>{editEntry ? "Edit step entry" : "Log today or backfill a day"}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}>Date</Label>
            <Input
              id={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              name="date"
              type="date"
              defaultValue={editEntry?.date ?? today}
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
              <Button type="button" variant="outline" onClick={onDone}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" className="min-w-32" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editEntry ? "Save changes" : "Save steps"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

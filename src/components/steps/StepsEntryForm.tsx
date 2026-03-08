"use client";

import { useRef, useState } from "react";
import { Footprints, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSteps, updateStepsEntry } from "@/actions/steps";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function StepsEntryForm({
  editEntry,
  onDone,
}: {
  editEntry?: StepsEntry;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const { settings } = useAppSettings();
  const today = new Date().toISOString().split("T")[0];

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
    <Card className={cn(editEntry ? "border-primary/25" : "rounded-[1.75rem]")}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Footprints className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">{editEntry ? "Edit Entry" : "Quick Add"}</p>
              <CardTitle className="mt-2">
                {editEntry ? "Adjust a recorded day" : "Log today or backfill a day"}
              </CardTitle>
              <p className="mt-3 supporting-copy">
                Keep the history clean by logging exact day totals instead of rough estimates.
              </p>
            </div>
          </div>
          <div className="rounded-full bg-white/8 px-3 py-1.5 text-sm text-muted-foreground">
            Goal {settings.stepGoal.toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={handleSubmit}
          className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
        >
          <div className="space-y-2">
            <Label
              htmlFor={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
            >
              Date
            </Label>
            <Input
              id={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              name="date"
              type="date"
              defaultValue={editEntry?.date ?? today}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}
              className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
            >
              Steps
            </Label>
            <Input
              id={editEntry ? `edit-steps-${editEntry.id}` : "steps-value"}
              name="steps"
              type="number"
              min="0"
              max="200000"
              inputMode="numeric"
              placeholder="e.g. 8500"
              defaultValue={editEntry?.steps ?? ""}
              required
              className="h-11"
            />
          </div>
          <div className="flex gap-2 lg:justify-end">
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

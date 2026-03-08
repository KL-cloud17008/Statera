"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logSteps, updateStepsEntry } from "@/actions/steps";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">
          {editEntry ? "Edit Step Entry" : "Log Steps"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}>Date</Label>
            <Input
              id={editEntry ? `edit-date-${editEntry.id}` : "steps-date"}
              name="date"
              type="date"
              defaultValue={editEntry?.date ?? today}
              required
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
              placeholder="e.g. 8500"
              defaultValue={editEntry?.steps ?? ""}
              required
            />
          </div>
          <div className="flex gap-2 sm:justify-end">
            {editEntry ? (
              <Button type="button" variant="outline" onClick={onDone}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editEntry ? "Save" : "Log"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

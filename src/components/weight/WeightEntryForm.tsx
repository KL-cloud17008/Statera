"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addWeightEntry, updateWeightEntry } from "@/actions/weight";
import type { SerializedWeightEntry } from "@/lib/weight";
import { getTodayDateString } from "@/lib/dates";
import { formatBodyweightConversion } from "@/lib/units";

type Props = {
  editEntry?: SerializedWeightEntry;
  onDone?: () => void;
  timezone?: string;
};

export function WeightEntryForm({ editEntry, onDone, timezone }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [showMore, setShowMore] = useState(!!editEntry?.bodyFatPercent || !!editEntry?.notes);
  const [status, setStatus] = useState<string>(editEntry?.status ?? "NORMAL");

  const today = getTodayDateString(timezone);
  const displayedWeight = editEntry?.weight != null ? editEntry.weight.toFixed(1) : "";
  const [weightValue, setWeightValue] = useState(displayedWeight);
  const bodyweightConversion = formatBodyweightConversion(weightValue);

  async function handleSubmit(formData: FormData) {
    formData.set("status", status);

    setIsPending(true);
    try {
      const action = editEntry ? updateWeightEntry : addWeightEntry;
      if (editEntry) {
        formData.set("id", editEntry.id);
      }
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(editEntry ? "Entry updated" : "Weight logged");
        if (!editEntry) {
          formRef.current?.reset();
          setStatus("NORMAL");
          setShowMore(false);
          setWeightValue("");
        }
        onDone?.();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    /* No card. Editing inline replaces a ledger row, so the form is marked
       by an accent edge on the canvas rather than a nested panel. */
    <div className={editEntry ? "border-l-2 border-accent py-2 pl-3" : ""}>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] xl:items-start">
            <div className="space-y-1.5">
              <Label htmlFor="weight-date" className="text-xs">Date</Label>
              <Input id="weight-date" name="date" type="date" defaultValue={editEntry?.date ?? today} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight-value" className="text-xs">
                Weight (lb)
              </Label>
              <Input
                id="weight-value"
                name="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="50"
                max="999"
                value={weightValue}
                onChange={(event) => setWeightValue(event.target.value)}
                placeholder="325.0"
                required
                className="h-10"
              />
              {bodyweightConversion ? (
                <p className="mt-1.5 text-caption text-tertiary">{bodyweightConversion}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="FASTING">Fasting</SelectItem>
                  <SelectItem value="BASELINE">Baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-10 w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editEntry ? "Update" : "Log"}
              </Button>
            </div>
          </div>

          {!editEntry ? (
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMore ? "Less options" : "More options"}
            </button>
          ) : null}

          {(showMore || editEntry) ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="weight-bf" className="text-xs">Body Fat %</Label>
                <Input id="weight-bf" name="bodyFatPercent" type="number" inputMode="decimal" step="0.1" min="1" max="70" defaultValue={editEntry?.bodyFatPercent ?? ""} placeholder="Optional" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight-notes" className="text-xs">Notes</Label>
                <Textarea id="weight-notes" name="notes" rows={1} defaultValue={editEntry?.notes ?? ""} placeholder="Optional" className="min-h-10 resize-none" />
              </div>
            </div>
          ) : null}

          {editEntry ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDone} className="text-xs text-muted-foreground">
              Cancel
            </Button>
          ) : null}
        </form>
    </div>
  );
}

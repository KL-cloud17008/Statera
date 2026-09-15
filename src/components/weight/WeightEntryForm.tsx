"use client";

import { useId, useRef, useState } from "react";
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
  const fieldId = useId();
  const savingRef = useRef(false);
  const requestIdRef = useRef<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(!!editEntry?.bodyFatPercent || !!editEntry?.notes);
  const [status, setStatus] = useState<string>(editEntry?.status ?? "NORMAL");

  const today = getTodayDateString(timezone);
  const displayedWeight = editEntry?.weight != null ? editEntry.weight.toFixed(1) : "";
  const [weightValue, setWeightValue] = useState(displayedWeight);
  const bodyweightConversion = formatBodyweightConversion(weightValue);

  async function handleSubmit(formData: FormData) {
    if (savingRef.current) return;
    savingRef.current = true;
    formData.set("status", status);
    setError(null);
    setSaved(null);
    setIsPending(true);
    try {
      const action = editEntry ? updateWeightEntry : addWeightEntry;
      if (editEntry) {
        formData.set("id", editEntry.id);
      } else {
        requestIdRef.current ??= crypto.randomUUID();
        formData.set("requestId", requestIdRef.current);
      }
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        const message = `${formatBodyweightConversion(String(formData.get("weight")))} saved`;
        setSaved(message);
        toast.success(message);
        requestIdRef.current = null;
        if (!editEntry) {
          formRef.current?.reset();
          setStatus("NORMAL");
          setShowMore(false);
          setWeightValue("");
        }
        onDone?.();
      }
    } catch {
      setError("Save could not be confirmed. Your weigh-in is still here; check your connection and retry.");
    } finally {
      setIsPending(false);
      savingRef.current = false;
    }
  }

  return (
    /* No card. Editing inline replaces a ledger row, so the form is marked
       by an accent edge on the canvas rather than a nested panel. */
    <div className={editEntry ? "border-l-2 border-accent py-2 pl-3" : ""}>
        <form ref={formRef} onSubmit={(event) => { event.preventDefault(); void handleSubmit(new FormData(event.currentTarget)); }} className="space-y-4" aria-busy={isPending}>
          <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <div className="measurement-fields grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-start">
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-date`}>Date</Label>
              <Input id={`${fieldId}-date`} name="date" type="date" max={today} defaultValue={editEntry?.date ?? today} required className="h-12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-value`}>
                Weight (lb)
              </Label>
              <Input
                id={`${fieldId}-value`}
                name="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="50"
                max="999"
                value={weightValue}
                onChange={(event) => { setWeightValue(event.target.value); setSaved(null); }}
                placeholder="270.0"
                required
                className="h-12"
              />
              {bodyweightConversion ? (
                <p className="mt-1.5 text-caption text-tertiary">{bodyweightConversion}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldId}-status`}>Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={isPending}>
                <SelectTrigger id={`${fieldId}-status`} className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="FASTING">Fasting</SelectItem>
                  <SelectItem value="BASELINE">Baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end self-start sm:pt-6">
              <Button type="submit" variant="primary" className="h-12 w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isPending ? "Saving…" : editEntry ? "Save changes" : "Save weight"}
              </Button>
            </div>
          </div>

          {!editEntry ? (
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMore ? "Hide optional details" : "Add body fat or notes"}
            </button>
          ) : null}

          {(showMore || editEntry) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-bf`}>Body fat (%)</Label>
                <Input id={`${fieldId}-bf`} name="bodyFatPercent" type="number" inputMode="decimal" step="0.1" min="1" max="70" defaultValue={editEntry?.bodyFatPercent ?? ""} placeholder="Optional" className="h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-notes`}>Notes</Label>
                <Textarea id={`${fieldId}-notes`} name="notes" rows={1} maxLength={2000} defaultValue={editEntry?.notes ?? ""} placeholder="Optional" className="min-h-12 resize-none" />
              </div>
            </div>
          ) : null}

          {editEntry ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDone} className="text-muted-foreground">
              Cancel
            </Button>
          ) : null}
          </fieldset>
          {error ? <p role="alert" className="text-sm text-critical">{error}</p> : null}
          {saved ? <p role="status" className="text-sm text-accent">{saved}</p> : null}
        </form>
    </div>
  );
}

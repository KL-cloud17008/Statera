"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addWeightEntry, updateWeightEntry } from "@/actions/weight";
import type { SerializedWeightEntry } from "@/lib/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { convertWeight, toPounds } from "@/lib/units";

type Props = {
  editEntry?: SerializedWeightEntry;
  onDone?: () => void;
};

export function WeightEntryForm({ editEntry, onDone }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [showMore, setShowMore] = useState(!!editEntry?.bodyFatPercent || !!editEntry?.notes);
  const [status, setStatus] = useState<string>(editEntry?.status ?? "NORMAL");
  const { settings } = useAppSettings();

  const today = new Date().toISOString().split("T")[0];
  const displayedWeight = editEntry?.weight != null ? convertWeight(editEntry.weight, settings.weightUnit).toFixed(1) : "";

  async function handleSubmit(formData: FormData) {
    formData.set("status", status);
    const weightValue = formData.get("weight") as string;
    if (weightValue) {
      const parsed = Number.parseFloat(weightValue);
      if (!Number.isNaN(parsed)) {
        formData.set("weight", toPounds(parsed, settings.weightUnit).toString());
      }
    }

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">
          {editEntry ? "Edit Entry" : "Log Weight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="weight-date" className="text-xs">Date</Label>
              <Input id="weight-date" name="date" type="date" defaultValue={editEntry?.date ?? today} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight-value" className="text-xs">
                Weight ({settings.weightUnit})
              </Label>
              <Input
                id="weight-value"
                name="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={settings.weightUnit === "kg" ? "22" : "50"}
                max={settings.weightUnit === "kg" ? "453" : "999"}
                defaultValue={displayedWeight}
                placeholder={settings.weightUnit === "kg" ? "147.4" : "325.0"}
                required
                className="h-10"
              />
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
      </CardContent>
    </Card>
  );
}

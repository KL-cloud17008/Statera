"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addWeightEntry, updateWeightEntry } from "@/actions/weight";
import type { SerializedWeightEntry } from "@/lib/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { convertWeight, toPounds } from "@/lib/units";
import { cn } from "@/lib/utils";

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
  const displayedWeight =
    editEntry?.weight != null
      ? convertWeight(editEntry.weight, settings.weightUnit).toFixed(1)
      : "";

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
    <Card className={cn(editEntry ? "border-primary/25" : "rounded-[1.75rem]")}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{editEntry ? "Edit Entry" : "Weight Capture"}</p>
            <CardTitle className="mt-2 text-foreground">
              {editEntry ? "Adjust a saved weigh-in" : "Log weight without breaking flow"}
            </CardTitle>
            <p className="mt-3 supporting-copy">
              Save the date, status, and optional notes in one pass. The timeline and chart refresh
              immediately after submission.
            </p>
          </div>
          <div className="rounded-full bg-white/8 px-3 py-1.5 text-sm text-muted-foreground">
            Unit {settings.weightUnit}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.05fr_1.05fr_0.9fr_auto] xl:items-end">
            <div className="space-y-2">
              <Label
                htmlFor="weight-date"
                className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
              >
                Date
              </Label>
              <Input
                id="weight-date"
                name="date"
                type="date"
                defaultValue={editEntry?.date ?? today}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="weight-value"
                className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
              >
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
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 w-full">
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
              <Button type="submit" className="h-11 w-full min-w-28" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editEntry ? "Update" : "Log"}
              </Button>
            </div>
          </div>

          {!editEntry ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="justify-start px-0 text-xs text-muted-foreground"
            >
              {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMore ? "Less options" : "More options"}
            </Button>
          ) : null}

          {showMore || editEntry ? (
            <div className="grid gap-4 rounded-[1.35rem] border border-border/80 bg-background/35 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="weight-bf"
                  className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Body Fat %
                </Label>
                <Input
                  id="weight-bf"
                  name="bodyFatPercent"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="1"
                  max="70"
                  defaultValue={editEntry?.bodyFatPercent ?? ""}
                  placeholder="Optional"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="weight-notes"
                  className="text-xs uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Notes
                </Label>
                <Textarea
                  id="weight-notes"
                  name="notes"
                  rows={2}
                  defaultValue={editEntry?.notes ?? ""}
                  placeholder="Optional"
                  className="min-h-11 resize-none"
                />
              </div>
            </div>
          ) : null}

          {editEntry ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDone}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

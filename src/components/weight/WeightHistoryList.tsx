"use client";

import { useState } from "react";
import { CalendarClock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWeightEntry } from "@/actions/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { WeightEntryForm } from "@/components/weight/WeightEntryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerializedWeightEntry } from "@/lib/weight";
import { formatWeight } from "@/lib/units";

const statusVariant = {
  BASELINE: "default",
  FASTING: "secondary",
  NORMAL: "outline",
} as const;

const statusLabel = {
  BASELINE: "Baseline",
  FASTING: "Fasting",
  NORMAL: "Normal",
};

export function WeightHistoryList({ entries }: { entries: SerializedWeightEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { settings } = useAppSettings();

  async function handleDelete() {
    if (!deleteId) {
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.set("id", deleteId);
      const result = await deleteWeightEntry(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Entry deleted");
        setDeleteId(null);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

  const grouped = new Map<string, SerializedWeightEntry[]>();
  for (const entry of entries) {
    const bucket = grouped.get(entry.date) ?? [];
    bucket.push(entry);
    grouped.set(entry.date, bucket);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <p className="eyebrow">Archive</p>
            <CardTitle className="mt-2">Entry history</CardTitle>
            <p className="mt-3 supporting-copy">
              Review the timeline, make corrections, or remove noisy data points that do not belong.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No weigh-ins yet"
              description="Add your first entry to unlock trend analysis, BMI, and projected goal pacing."
              className="border-none bg-transparent px-0 py-6 shadow-none"
            />
          ) : (
            <div className="max-h-[42rem] space-y-6 overflow-y-auto pr-1">
              {Array.from(grouped.entries()).map(([date, dateEntries]) => (
                <div key={date} className="space-y-2">
                  <div className="sticky top-0 z-10 -mx-2 rounded-full bg-background/88 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-md">
                    {formatGroupDate(date)}
                  </div>
                  <div className="space-y-3">
                    {dateEntries.map((entry) =>
                      editingId === entry.id ? (
                        <WeightEntryForm
                          key={entry.id}
                          editEntry={entry}
                          onDone={() => setEditingId(null)}
                        />
                      ) : (
                        <div
                          key={entry.id}
                          className="focus-surface group flex items-start justify-between gap-3 rounded-[1.45rem] border border-border/80 bg-background/35 p-4 sm:p-5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[1.35rem] font-semibold text-foreground data-number">
                                {formatWeight(entry.weight, settings.weightUnit)}
                              </span>
                              <Badge variant={statusVariant[entry.status]}>
                                {statusLabel[entry.status]}
                              </Badge>
                              {entry.bodyFatPercent != null ? (
                                <span className="text-xs text-muted-foreground">
                                  {entry.bodyFatPercent}% bf
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                              <span>Entry saved</span>
                              <span>{date}</span>
                            </div>
                            {entry.notes ? (
                              <p className="mt-3 text-sm text-muted-foreground">{entry.notes}</p>
                            ) : null}
                          </div>
                          <div className="flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => setEditingId(entry.id)}
                              aria-label={`Edit weight entry for ${date}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteId(entry.id)}
                              aria-label={`Delete weight entry for ${date}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatGroupDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

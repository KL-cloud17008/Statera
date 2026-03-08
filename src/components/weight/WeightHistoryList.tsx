"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteWeightEntry } from "@/actions/weight";
import { WeightEntryForm } from "./WeightEntryForm";
import type { SerializedWeightEntry } from "@/lib/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
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
          <CardTitle className="text-foreground">History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No weight entries yet. Log your first entry above.
            </p>
          ) : (
            <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
              {Array.from(grouped.entries()).map(([date, dateEntries]) => (
                <div key={date}>
                  <div className="sticky top-0 z-10 bg-card pb-1.5 text-xs font-medium text-muted-foreground">
                    {formatGroupDate(date)}
                  </div>
                  <div className="space-y-2">
                    {dateEntries.map((entry) =>
                      editingId === entry.id ? (
                        <WeightEntryForm key={entry.id} editEntry={entry} onDone={() => setEditingId(null)} />
                      ) : (
                        <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">{formatWeight(entry.weight, settings.weightUnit)}</span>
                              <Badge variant={statusVariant[entry.status]}>{statusLabel[entry.status]}</Badge>
                              {entry.bodyFatPercent != null ? (
                                <span className="text-xs text-muted-foreground">{entry.bodyFatPercent}% bf</span>
                              ) : null}
                            </div>
                            {entry.notes ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.notes}</p> : null}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingId(entry.id)} aria-label={`Edit weight entry for ${date}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(entry.id)} aria-label={`Delete weight entry for ${date}`}>
                              <Trash2 className="h-3.5 w-3.5" />
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
              {isDeleting ? "Deleting..." : "Delete"}
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

"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteStepsEntry } from "@/actions/steps";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarRange } from "lucide-react";

type StepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function StepsHistoryList({ entries }: { entries: StepsEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) {
      return;
    }

    setIsDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteId);
    const result = await deleteStepsEntry(formData);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setDeleteId(null);
    toast.success("Step entry deleted");
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No logged step entries"
        description="Start with today’s total or backfill past days to build a movement history."
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry) => {
            const label = new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return editingId === entry.id ? (
              <StepsEntryForm
                key={entry.id}
                editEntry={entry}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div
                key={entry.id}
                className="warm-row group flex items-center justify-between rounded-[1.25rem] px-4 py-4 transition-colors hover:bg-accent/70"
              >
                <div>
                  <p className="text-lg font-semibold text-foreground data-number">
                    {(entry.steps ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                <div className="flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setEditingId(entry.id)}
                    aria-label={`Edit ${label} step entry`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(entry.id)}
                    aria-label={`Delete ${label} step entry`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this step entry?</DialogTitle>
            <DialogDescription>
              This removes the recorded step count for that day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

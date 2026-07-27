"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteStepsEntry } from "@/actions/steps";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { Button } from "@/components/ui/button";
import { Num, Row, Rows } from "@/components/ui/ledger";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarRange } from "lucide-react";

/* Date, steps, controls. The controls track is fixed so the column head and
   the rows resolve to the same grid. */
const HISTORY_COLUMNS = "minmax(0,1fr) minmax(0,6rem) 4.5rem";

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
        description="Start with today's total or backfill past days to build a movement history."
      />
    );
  }

  return (
    <>
      <Rows
        columns={HISTORY_COLUMNS}
        head={
          <>
            <span>Date</span>
            <span className="text-right">Steps</span>
            <span />
          </>
        }
      >
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
            <Row key={entry.id} columns={HISTORY_COLUMNS} interactive className="group">
              <span className="truncate text-secondary">{label}</span>
              <Num>{(entry.steps ?? 0).toLocaleString()}</Num>
              {/* Controls stay reachable on touch, where there is no hover. */}
              <span className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 motion-reduce:transition-none">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingId(entry.id)}
                  aria-label={`Edit ${label} step entry`}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-critical hover:text-critical"
                  onClick={() => setDeleteId(entry.id)}
                  aria-label={`Delete ${label} step entry`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </span>
            </Row>
          );
        })}
      </Rows>

      <Dialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this step entry?</DialogTitle>
            <DialogDescription>
              This removes the recorded step count for that day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="critical" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

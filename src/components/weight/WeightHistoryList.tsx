"use client";

import { useState } from "react";
import { CalendarClock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWeightEntry } from "@/actions/weight";
import { WeightEntryForm } from "@/components/weight/WeightEntryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Num, Row, Rows, Sub } from "@/components/ui/ledger";

/* Entry, status, weight, controls. Fixed control track keeps head and rows
   on one grid; mobile drops the status column into the entry cell. */
const ENTRY_COLUMNS_MOBILE = "minmax(0,1fr) minmax(0,6rem) 4.5rem";
const ENTRY_COLUMNS = "minmax(0,1fr) minmax(0,8rem) minmax(0,8rem) 4.5rem";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerializedWeightEntry } from "@/lib/weight";
import { formatBodyweight } from "@/lib/units";

const statusVariant = {
  BASELINE: "accent",
  FASTING: "secondary",
  NORMAL: "outline",
} as const;

const statusLabel = {
  BASELINE: "Baseline",
  FASTING: "Fasting",
  NORMAL: "Normal",
};

export function WeightHistoryList({
  entries,
  timezone,
}: {
  entries: SerializedWeightEntry[];
  timezone?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // An entry is a "new low" when it undercuts every earlier weigh-in.
  const newLowIds = new Set<string>();
  const chronological = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );
  let runningMin = Number.POSITIVE_INFINITY;
  for (const entry of chronological) {
    if (runningMin !== Number.POSITIVE_INFINITY && entry.weight < runningMin) {
      newLowIds.add(entry.id);
    }
    runningMin = Math.min(runningMin, entry.weight);
  }

  return (
    <>
      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No weigh-ins yet"
          description="Add your first entry to unlock trend analysis, BMI, and projected goal pacing."
        />
      ) : (
        <Rows
          columns={ENTRY_COLUMNS_MOBILE}
          mdColumns={ENTRY_COLUMNS}
          head={
            <>
              <span>Entry</span>
              <span className="hidden md:block">Status</span>
              <span className="text-right">Weight</span>
              <span />
            </>
          }
        >
          {Array.from(grouped.entries()).flatMap(([date, dateEntries]) => [
            /* The date is a rule-level marker in the run, not a pill floating
               over its own scroll container. */
            <div key={`group-${date}`} className="bg-sunken px-2 py-1 text-label uppercase text-tertiary">
              {formatGroupDate(date)}
            </div>,
            ...dateEntries.map((entry) =>
              editingId === entry.id ? (
                <WeightEntryForm
                  key={entry.id}
                  editEntry={entry}
                  onDone={() => setEditingId(null)}
                  timezone={timezone}
                />
              ) : (
                <Row
                  key={entry.id}
                  columns={ENTRY_COLUMNS_MOBILE}
                  mdColumns={ENTRY_COLUMNS}
                  interactive
                  className="group"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[entry.status]}>
                        {statusLabel[entry.status]}
                      </Badge>
                      {newLowIds.has(entry.id) ? (
                        <span className="text-label uppercase text-ember">New low</span>
                      ) : null}
                      {entry.bodyFatPercent != null ? (
                        <span className="text-caption text-tertiary">
                          {entry.bodyFatPercent}% bf
                        </span>
                      ) : null}
                    </span>
                    {entry.notes ? (
                      <Sub hideOnDesktop={false} className="mt-1 block truncate">
                        {entry.notes}
                      </Sub>
                    ) : null}
                  </span>
                  <span className="hidden truncate text-tertiary md:block">
                    {statusLabel[entry.status]}
                  </span>
                  <Num>{formatBodyweight(entry.weight)}</Num>
                  <span className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 motion-reduce:transition-none">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingId(entry.id)}
                      aria-label={`Edit weight entry for ${date}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-critical hover:text-critical"
                      onClick={() => setDeleteId(entry.id)}
                      aria-label={`Delete weight entry for ${date}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </Row>
              )
            ),
          ])}
        </Rows>
      )}

      <Dialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="critical" onClick={handleDelete} disabled={isDeleting}>
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

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
const ENTRY_COLUMNS_MOBILE = "minmax(0,1fr) 6rem";
const ENTRY_COLUMNS = "minmax(0,1fr) minmax(0,8rem) minmax(0,12rem) 6rem";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerializedWeightEntry } from "@/lib/weight";
import { formatBodyweight, formatBodyweightSecondary } from "@/lib/units";

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
    if (!deleteId || isDeleting) {
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
      toast.error("Delete could not be confirmed. Check your connection and retry.");
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
          description="Save a weigh-in to start your history."
        />
      ) : (
        <Rows
          columns={ENTRY_COLUMNS_MOBILE}
          mdColumns={ENTRY_COLUMNS}
          head={
            <>
              <span className="hidden md:block">Entry</span>
              <span className="hidden md:block">Status</span>
              <span className="md:text-right">Weight</span>
              <span />
            </>
          }
        >
          {Array.from(grouped.entries()).flatMap(([date, dateEntries]) => [
            /* The date is a rule-level marker in the run, not a pill floating
               over its own scroll container. */
            <div key={`group-${date}`} className="border-t border-rule bg-sunken px-3 py-2 text-label text-secondary">
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
                  <span className="hidden min-w-0 md:block">
                    <span className="flex flex-wrap items-center gap-2">
                      {newLowIds.has(entry.id) ? (
                        <span className="text-label text-secondary">New low</span>
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
                  <span className="min-w-0 md:text-right">
                    <Num className="block text-left md:text-right">{formatBodyweight(entry.weight)}</Num>
                    <Sub hideOnDesktop={false} className="mt-0.5 block whitespace-normal leading-tight">
                      {formatBodyweightSecondary(entry.weight)}
                    </Sub>
                    <span className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                      <Badge variant={statusVariant[entry.status]}>{statusLabel[entry.status]}</Badge>
                      {entry.bodyFatPercent != null ? <span className="text-caption text-secondary">{entry.bodyFatPercent}% body fat</span> : null}
                      {newLowIds.has(entry.id) ? <span className="text-caption text-secondary">New low</span> : null}
                    </span>
                    {entry.notes ? <Sub hideOnDesktop className="mt-1 block whitespace-normal">{entry.notes}</Sub> : null}
                  </span>
                  <span className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      onClick={() => setEditingId(entry.id)}
                      aria-label={`Edit weight entry for ${date}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11 text-critical hover:text-critical"
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

      <Dialog open={deleteId != null} onOpenChange={() => !isDeleting && setDeleteId(null)}>
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

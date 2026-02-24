"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteStepsEntry } from "@/actions/steps";

type StepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function StepsHistoryList({ entries }: { entries: StepsEntry[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteStepsEntry(formData);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Entry deleted");
    }
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => {
            const d = new Date(entry.date + "T00:00:00");
            const label = d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {(entry.steps ?? 0).toLocaleString()} steps
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                >
                  {deletingId === entry.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

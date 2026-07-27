"use client";

import Link from "next/link";
import { Download, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportWeightCSV } from "@/actions/weight";
import { Button } from "@/components/ui/button";

export function WeightPageActions() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportWeightCSV();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const blob = new Blob([result.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `athanor-weight-${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" type="button" onClick={handleExport} disabled={exporting}>
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Export CSV
      </Button>
      <Button variant="secondary" asChild>
        <Link href="/weight/import">
          <Upload className="h-4 w-4" />
          Import CSV
        </Link>
      </Button>
    </div>
  );
}

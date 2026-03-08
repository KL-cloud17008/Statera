"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportWeightCSV } from "@/actions/weight";

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
      anchor.download = `fittrack-weight-${new Date().toISOString().split("T")[0]}.csv`;
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
    <div className="flex gap-2">
      <Button variant="outline" size="sm" type="button" onClick={handleExport} disabled={exporting}>
        {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
        Export
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/weight/import">
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Import
        </Link>
      </Button>
    </div>
  );
}

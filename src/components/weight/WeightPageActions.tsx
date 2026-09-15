"use client";

import Link from "next/link";
import { Download, Loader2, MoreHorizontal, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportWeightCSV } from "@/actions/weight";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
      <Button asChild><Link href="#quick-add"><Plus className="size-4" />Log weight</Link></Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" aria-label="More weight actions" disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />} More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="min-h-12" onSelect={() => void handleExport()}><Download />Export CSV</DropdownMenuItem>
          <DropdownMenuItem className="min-h-12" asChild><Link href="/weight/import"><Upload />Import CSV</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

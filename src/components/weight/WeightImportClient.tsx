"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { importWeightCSV } from "@/actions/weight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { getDataRows, getHeaders, parseCSV } from "@/lib/csv";
import { parseCSVDate } from "@/lib/weight";

type ParsedRow = {
  status: string;
  date: string;
  parsedDate: string;
  weight: number;
  bodyFatPercent: number | null;
  valid: boolean;
  error?: string;
};

type ImportState =
  | { step: "idle" }
  | { step: "preview"; rows: ParsedRow[]; rawCsv: string; fileName: string }
  | { step: "importing" }
  | { step: "done"; imported: number; errors: string[] };

export function WeightImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ step: "idle" });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) {
        toast.error("Could not read file");
        return;
      }

      const rows = parseCSV(text);
      const headers = getHeaders(rows);
      const dataRows = getDataRows(rows);

      const headerLower = headers.map((h) => h.toLowerCase());
      const statusCol = headerLower.findIndex((h) => h.includes("status"));
      const dateCol = headerLower.findIndex((h) => h.includes("date"));
      const weightCol = headerLower.findIndex((h) => h.includes("weight"));
      const bfCol = headerLower.findIndex((h) => h.includes("body fat"));

      if (dateCol === -1 || weightCol === -1) {
        toast.error("CSV must have Date and Weight columns");
        return;
      }

      const parsed: ParsedRow[] = dataRows.map((row, i) => {
        const rawDate = row[dateCol]?.trim() ?? "";
        const parsedDate = parseCSVDate(rawDate);
        const rawWeight = row[weightCol]?.trim() ?? "";
        const weight = parseFloat(rawWeight);

        let status = "NORMAL";
        if (statusCol !== -1) {
          const raw = row[statusCol]?.trim().toUpperCase() ?? "";
          if (raw === "BASELINE" || raw === "FASTING" || raw === "NORMAL") {
            status = raw;
          }
        }

        let bodyFatPercent: number | null = null;
        if (bfCol !== -1) {
          const rawBf = row[bfCol]?.trim() ?? "";
          if (rawBf) {
            const bf = parseFloat(rawBf);
            if (!Number.isNaN(bf) && bf > 0 && bf < 100) {
              bodyFatPercent = bf;
            }
          }
        }

        const valid = !!parsedDate && !Number.isNaN(weight) && weight > 0;

        return {
          status,
          date: rawDate,
          parsedDate: parsedDate ?? "",
          weight: Number.isNaN(weight) ? 0 : weight,
          bodyFatPercent,
          valid,
          error: !valid ? `Row ${i + 2}: ${!parsedDate ? "Invalid date" : "Invalid weight"}` : undefined,
        };
      });

      setState({
        step: "preview",
        rows: parsed,
        rawCsv: text,
        fileName: file.name,
      });
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (state.step !== "preview") return;

    const previewState = state;
    setState({ step: "importing" });
    try {
      const formData = new FormData();
      formData.set("csv", previewState.rawCsv);
      const result = await importWeightCSV(formData);

      if (result.error) {
        toast.error(result.error);
        setState(previewState);
        return;
      }

      setState({
        step: "done",
        imported: result.imported,
        errors: result.errors,
      });
      toast.success(`Imported ${result.imported} entries`);
    } catch {
      toast.error("Import failed");
      setState(previewState);
    }
  }

  const validCount = state.step === "preview" ? state.rows.filter((r) => r.valid).length : 0;
  const errorCount = state.step === "preview" ? state.rows.filter((r) => !r.valid).length : 0;

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Weight Import"
        title="Bring in past weigh-ins"
        description="Preview parsed rows before they touch the timeline so the import feels deliberate instead of risky."
        action={
          <Link href="/weight">
            <Button variant="outline" size="lg" className="gap-2 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to weight
            </Button>
          </Link>
        }
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">CSV import</span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            Status, Date, Weight, optional Body Fat %
          </span>
        </div>
      </SectionHeader>

      {state.step === "idle" ? (
        <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[1.6rem] border border-dashed border-border/80 bg-background/35 p-8 text-center sm:p-10">
              <FileText className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                Choose a CSV file
              </h2>
              <p className="mt-3 supporting-copy">
                Drag a file here or browse from your device. Nothing is imported until you confirm the preview.
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Button className="mt-6" size="lg" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Choose file
              </Button>
            </div>

            <div className="rounded-[1.6rem] border border-border/80 bg-background/35 p-6">
              <p className="eyebrow">Expected Format</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Prepare the file once, import with confidence</h2>
              <div className="section-rule mt-5" />
              <div className="mt-5 grid gap-3">
                <FormatRow label="Date" value="M/D/YYYY" />
                <FormatRow label="Weight" value="Required numeric value" />
                <FormatRow label="Status" value="NORMAL, FASTING, or BASELINE" />
                <FormatRow label="Body Fat %" value="Optional numeric value" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {state.step === "preview" ? (
        <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Preview</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{state.fileName}</h2>
              <p className="mt-3 supporting-copy">
                Review the table below, then import only after the valid row count looks correct.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{validCount} valid</Badge>
              {errorCount > 0 ? <Badge variant="destructive">{errorCount} invalid</Badge> : null}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-border/80 bg-background/35">
            <div className="grid grid-cols-4 gap-2 border-b border-border/80 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <span>Date</span>
              <span>Weight</span>
              <span>Status</span>
              <span>Body Fat</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {state.rows.map((row, index) => (
                <div
                  key={`${row.date}-${index}`}
                  className={`grid grid-cols-4 gap-2 border-t border-border/70 px-4 py-3 text-sm ${!row.valid ? "bg-destructive/8 text-destructive" : "text-foreground"}`}
                >
                  <span className="truncate">{row.date}</span>
                  <span>{row.valid ? `${row.weight} lbs` : "Invalid"}</span>
                  <span className="truncate">{row.status}</span>
                  <span>{row.bodyFatPercent != null ? `${row.bodyFatPercent}%` : "-"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setState({ step: "idle" });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Choose different file
            </Button>
            <Button onClick={handleImport} disabled={validCount === 0}>
              Import {validCount} entries
            </Button>
          </div>
        </section>
      ) : null}

      {state.step === "importing" ? (
        <section className="editorial-panel px-6 py-12 text-center sm:px-7">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Importing entries</h2>
          <p className="mt-3 supporting-copy">
            Writing valid rows into the weight timeline.
          </p>
          <Progress className="mx-auto mt-6 max-w-xs" value={66} />
        </section>
      ) : null}

      {state.step === "done" ? (
        <section className="editorial-panel px-6 py-12 text-center sm:px-7">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Import complete</h2>
          <p className="mt-3 supporting-copy">
            Successfully imported {state.imported} entries into the weight timeline.
          </p>
          {state.errors.length > 0 ? (
            <div className="mx-auto mt-6 max-w-lg rounded-[1.4rem] border border-border/80 bg-background/35 p-4 text-left">
              <p className="eyebrow">Skipped Rows</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {state.errors.slice(0, 10).map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
                {state.errors.length > 10 ? <li>...and {state.errors.length - 10} more</li> : null}
              </ul>
            </div>
          ) : null}
          <Button className="mt-6" onClick={() => router.push("/weight")}>
            View weight data
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-border/80 bg-background/35 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

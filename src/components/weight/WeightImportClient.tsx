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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTitle } from "@/components/ui/ledger";
import { parseCSV, getDataRows, getHeaders } from "@/lib/csv";
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
    <>
      <PageTitle
        eyebrow="Weight Import"
        title="Bring in past weigh-ins"
        lead="Preview the parsed rows before importing so you can confirm dates, status, and body-fat data."
        action={
          <Link href="/weight">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to weight
            </Button>
          </Link>
        }
        className="mb-6"
      />

      {state.step === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose CSV file</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-row text-secondary">
              Expected columns: Status, Date (M/D/YYYY), Weight, and optional Body Fat %.
            </p>
            <div className="rounded-panel border border-dashed border-control-border p-10 text-center">
              <FileText className="mx-auto size-8 text-faint" />
              <p className="mt-4 text-row text-secondary">Drag a file here or browse from your device.</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Button className="mt-5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.step === "preview" && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Preview: {state.fileName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{validCount} valid</Badge>
                {errorCount > 0 ? <Badge variant="critical">{errorCount} invalid</Badge> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-80 overflow-auto rounded-control border border-rule">
              <div className="min-w-[34rem]">
                <div className="sticky top-0 grid grid-cols-4 gap-2 bg-sunken px-4 py-2.5 text-label uppercase text-tertiary">
                  <span>Date</span>
                  <span>Weight</span>
                  <span>Status</span>
                  <span>Body Fat</span>
                </div>
                {state.rows.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-4 gap-2 border-t border-rule px-4 py-2.5 text-row ${!row.valid ? "bg-critical-surface text-critical" : "text-primary"}`}
                  >
                    <span className="truncate">{row.date}</span>
                    <span>{row.valid ? `${row.weight} lb` : "Invalid"}</span>
                    <span className="truncate">{row.status}</span>
                    <span>{row.bodyFatPercent != null ? `${row.bodyFatPercent}%` : "-"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setState({ step: "idle" });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Choose Different File
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Entries
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.step === "importing" && (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-row text-secondary">Importing entries...</p>
            <Progress className="mx-auto max-w-xs" value={66} />
          </CardContent>
        </Card>
      )}

      {state.step === "done" && (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <div>
              <p className="text-body font-medium text-primary">Import complete</p>
              <p className="text-row text-secondary">Successfully imported {state.imported} entries.</p>
            </div>
            {state.errors.length > 0 ? (
              <div className="mx-auto max-w-lg rounded-control bg-sunken p-4 text-left">
                <p className="text-label uppercase text-tertiary">Skipped Rows</p>
                <ul className="mt-2 space-y-1 text-caption text-secondary">
                  {state.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {state.errors.length > 10 ? <li>...and {state.errors.length - 10} more</li> : null}
                </ul>
              </div>
            ) : null}
            <Button onClick={() => router.push("/weight")}>View Weight Data</Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

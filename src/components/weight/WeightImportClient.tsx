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
import { Badge } from "@/components/ui/badge";
import { PageTitle, Section } from "@/components/ui/ledger";
import { parseCSV, getDataRows, getHeaders } from "@/lib/csv";
import { parseCSVDate } from "@/lib/weight";
import { formatBodyweightWithConversions } from "@/lib/units";

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
  const [visibleCount, setVisibleCount] = useState(30);

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

      setVisibleCount(30);
      setState({
        step: "preview",
        rows: parsed,
        rawCsv: text,
        fileName: file.name,
      });
    };
    reader.onerror = () => toast.error("Could not read this file. Choose it again or try another CSV.");
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
          <Button asChild variant="secondary" className="gap-2">
            <Link href="/weight">
              <ArrowLeft className="h-4 w-4" />
              Back to weight
            </Link>
          </Button>
        }
        className="mb-6"
      />

      {state.step === "idle" && (
        <Section>
          <div className="mb-4 border-b border-rule pb-4">
            <h2 className="text-body font-medium text-primary">Choose CSV file</h2>
          </div>
          <div className="space-y-4">
            <p className="text-row text-secondary">
              Expected columns: Date (M/D/YYYY), Weight in lb, and optional Status and Body Fat %.
            </p>
            <div className="rounded-panel border border-dashed border-control-border p-10 text-center">
              <FileText className="mx-auto size-8 text-faint" />
              <p className="mt-4 text-row text-secondary">Choose a CSV from your device. Review the dates and pounds before importing.</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Button className="mt-5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>
          </div>
        </Section>
      )}

      {state.step === "preview" && (
        <Section>
          <div className="mb-4 border-b border-rule pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-body font-medium text-primary">Preview: {state.fileName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{validCount} valid</Badge>
                {errorCount > 0 ? <Badge variant="critical">{errorCount} invalid</Badge> : null}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="max-h-80 overflow-auto rounded-control border border-rule">
              <div className="min-w-0">
                <div className="sticky top-0 z-10 grid grid-cols-2 gap-2 bg-sunken px-4 py-2.5 text-label text-tertiary md:grid-cols-4">
                  <span>Date</span>
                  <span>Weight</span>
                  <span className="hidden md:block">Status</span>
                  <span className="hidden md:block">Body fat</span>
                </div>
                {state.rows.slice(0, visibleCount).map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 gap-2 border-t border-rule px-4 py-2.5 text-row md:grid-cols-4 ${!row.valid ? "bg-critical-surface text-critical" : "text-primary"}`}
                  >
                    <span className="min-w-0">{row.parsedDate || row.date}</span>
                    <span>
                      {row.valid ? formatBodyweightWithConversions(row.weight) : "Invalid"}
                    </span>
                    <span className="text-caption md:text-row">{row.status}</span>
                    <span className="text-caption md:text-row">{row.bodyFatPercent != null ? `${row.bodyFatPercent}% body fat` : "—"}</span>
                    {row.error ? <span className="col-span-full text-caption">{row.error}</span> : null}
                  </div>
                ))}
              </div>
            </div>

            {state.rows.length > visibleCount ? <Button type="button" variant="secondary" onClick={() => setVisibleCount(count => count + 30)}>Show more preview rows ({state.rows.length - visibleCount} remaining)</Button> : null}
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
          </div>
        </Section>
      )}

      {state.step === "importing" && (
        <Section>
          <div className="space-y-4 py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p role="status" className="text-row text-secondary">Importing entries… Keep this page open until the result is confirmed.</p>
          </div>
        </Section>
      )}

      {state.step === "done" && (
        <Section>
          <div className="space-y-4 py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <div>
              <p className="text-body font-medium text-primary">Import complete</p>
              <p className="text-row text-secondary">Successfully imported {state.imported} entries.</p>
            </div>
            {state.errors.length > 0 ? (
              <div className="mx-auto max-w-lg rounded-control bg-sunken p-4 text-left">
                <p className="text-label text-tertiary">Skipped Rows</p>
                <ul className="mt-2 space-y-1 text-caption text-secondary">
                  {state.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {state.errors.length > 10 ? <li>...and {state.errors.length - 10} more</li> : null}
                </ul>
              </div>
            ) : null}
            <Button onClick={() => router.push("/weight")}>View Weight Data</Button>
          </div>
        </Section>
      )}
    </>
  );
}

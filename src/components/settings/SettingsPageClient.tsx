"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Palette,
  Paintbrush,
  ShieldAlert,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  clearAllUserData,
  exportUserData,
  importUserData,
  updateUserProfile,
} from "@/actions/user";
import { exportWeightCSV } from "@/actions/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { MAX_BACKUP_FILE_BYTES, analyzeBackupPayload, unwrapBackupEnvelope, type BackupPreview } from "@/lib/backup";
import { normalizeGoalTargetDate, parseAppSettings } from "@/lib/app-settings";
import { BODYWEIGHT_UNIT, WORKOUT_LOAD_UNIT, formatBodyweightConversion, inchesToCm } from "@/lib/units";

type SettingsPageClientProps = {
  profile: {
    heightInches: number | null;
    startWeight: number | null;
    goalWeight: number | null;
    timezone: string;
  };
};

type PendingImport = {
  fileName: string;
  json: string;
  localSettings: unknown;
  preview: BackupPreview;
};

function downloadTextFile(filename: string, text: string, mimeType: string) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SettingsPageClient({ profile }: SettingsPageClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const goalDateInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importConfirmation, setImportConfirmation] = useState("");
  const { settings, updateSettings, resetSettings } = useAppSettings();
  const [startWeightValue, setStartWeightValue] = useState(profile.startWeight != null ? String(profile.startWeight) : "");
  const [goalWeightValue, setGoalWeightValue] = useState(profile.goalWeight != null ? String(profile.goalWeight) : "");
  const [stepGoalValue, setStepGoalValue] = useState(String(settings.stepGoal));
  const [stepGoalStatus, setStepGoalStatus] = useState<{
    type: "saved" | "error";
    message: string;
  } | null>(null);
  const [goalDateValue, setGoalDateValue] = useState(settings.weightGoalTargetDate ?? "");
  const [goalDateStatus, setGoalDateStatus] = useState<{
    type: "saved" | "error";
    message: string;
  } | null>(null);
  const startWeightConversion = formatBodyweightConversion(startWeightValue);
  const goalWeightConversion = formatBodyweightConversion(goalWeightValue);

  useEffect(() => {
    setStepGoalValue(String(settings.stepGoal));
  }, [settings.stepGoal]);

  useEffect(() => {
    setGoalDateValue(settings.weightGoalTargetDate ?? "");
  }, [settings.weightGoalTargetDate]);

  async function handleProfileSave(formData: FormData) {
    setIsSaving(true);
    const result = await updateUserProfile(formData);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Profile updated");
  }

  async function handleExportJson() {
    setIsExporting(true);
    try {
      const result = await exportUserData();
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      const payload = JSON.stringify(
        {
          serverData: result.payload,
          localSettings: settings,
        },
        null,
        2
      );
      downloadTextFile(
        `athanor-backup-${new Date().toISOString().split("T")[0]}.json`,
        payload,
        "application/json"
      );
      toast.success("JSON backup exported");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportCsv() {
    setIsExporting(true);
    try {
      const [allData, weightCsv] = await Promise.all([
        exportUserData(),
        exportWeightCSV(),
      ]);

      if ("error" in allData && allData.error) {
        toast.error(allData.error);
        return;
      }

      const csv = allData.csv;
      if (!csv) {
        toast.error("Export failed");
        return;
      }

      if (weightCsv.error) {
        toast.error(weightCsv.error);
        return;
      }

      downloadTextFile("athanor-weight.csv", weightCsv.csv, "text/csv;charset=utf-8;");
      downloadTextFile("athanor-steps.csv", csv.steps, "text/csv;charset=utf-8;");
      downloadTextFile("athanor-workouts.csv", csv.workouts, "text/csv;charset=utf-8;");
      downloadTextFile("athanor-nutrition.csv", csv.nutrition, "text/csv;charset=utf-8;");
      downloadTextFile("athanor-pain.csv", csv.pain, "text/csv;charset=utf-8;");
      toast.success("CSV exports downloaded");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setIsImporting(true);
    try {
      if (file.size > MAX_BACKUP_FILE_BYTES) {
        toast.error(`Backup file must be smaller than ${formatBytes(MAX_BACKUP_FILE_BYTES)}`);
        return;
      }

      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const { payload, localSettings } = unwrapBackupEnvelope(parsed);
      const analysis = analyzeBackupPayload(payload);

      if (!analysis.valid) {
        toast.error(`Backup validation failed: ${analysis.errors.slice(0, 2).join(" ")}`);
        return;
      }

      setPendingImport({
        fileName: file.name,
        json: JSON.stringify(payload),
        localSettings,
        preview: analysis.preview,
      });
      setImportConfirmation("");
    } catch {
      toast.error("Import preview failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleConfirmImport() {
    if (!pendingImport) {
      return;
    }
    if (importConfirmation !== "REPLACE") {
      toast.error("Type REPLACE to confirm the import.");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.set("json", pendingImport.json);
      const result = await importUserData(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (pendingImport.localSettings) {
        updateSettings((current) =>
          parseAppSettings(JSON.stringify({ ...current, ...toRecord(pendingImport.localSettings) }))
        );
      }

      toast.success("Backup imported");
      setPendingImport(null);
      setImportConfirmation("");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleClearAllData() {
    setIsClearing(true);
    const result = await clearAllUserData();
    setIsClearing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    resetSettings();
    setIsClearOpen(false);
    toast.success("All tracker data cleared");
  }

  function handleStepGoalSave() {
    const next = Number.parseInt(stepGoalValue, 10);
    if (Number.isNaN(next) || next < 1000 || next > 50000) {
      setStepGoalStatus({
        type: "error",
        message: "Daily step goal must be between 1,000 and 50,000.",
      });
      return;
    }

    updateSettings((current) => ({
      ...current,
      stepGoal: next,
    }));
    setStepGoalValue(String(next));
    setStepGoalStatus({
      type: "saved",
      message: `Daily goal saved at ${next.toLocaleString()} steps.`,
    });
  }

  function handleGoalDateSave() {
    if (goalDateInputRef.current && !goalDateInputRef.current.validity.valid) {
      setGoalDateStatus({
        type: "error",
        message: "Enter a valid target date in YYYY-MM-DD format, such as 2027-10-22.",
      });
      return;
    }

    const normalizedDate = normalizeGoalTargetDate(goalDateValue);
    if (goalDateValue.trim() && !normalizedDate) {
      setGoalDateStatus({
        type: "error",
        message: "Enter a valid target date in YYYY-MM-DD format, such as 2027-10-22.",
      });
      return;
    }

    updateSettings((current) => ({
      ...current,
      weightGoalTargetDate: normalizedDate,
    }));
    setGoalDateValue(normalizedDate ?? "");
    setGoalDateStatus({
      type: "saved",
      message: normalizedDate
        ? `Goal target date saved for ${normalizedDate}.`
        : "Goal target date cleared.",
    });
  }

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Settings"
        title="Control panel."
        description="Profile values, unit locks, goals, backup, and data safety."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleProfileSave} className="grid gap-4 md:grid-cols-2">
            <Field label="Height (cm)" htmlFor="heightCm">
              <Input id="heightCm" name="heightCm" type="number" min="91" max="244" step="0.1" placeholder="175" defaultValue={profile.heightInches != null ? inchesToCm(profile.heightInches) : ""} className="h-12" />
            </Field>
            <Field label="Timezone" htmlFor="timezone">
              <Input id="timezone" name="timezone" type="text" defaultValue={profile.timezone} className="h-12" />
            </Field>
            <Field label="Start Weight (lb)" htmlFor="startWeight">
              <Input
                id="startWeight"
                name="startWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                value={startWeightValue}
                onChange={(event) => setStartWeightValue(event.target.value)}
                className="h-12"
              />
              {startWeightConversion ? (
                <p className="text-xs text-muted-foreground">{startWeightConversion}</p>
              ) : null}
            </Field>
            <Field label="Goal Weight (lb)" htmlFor="goalWeight">
              <Input
                id="goalWeight"
                name="goalWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                value={goalWeightValue}
                onChange={(event) => setGoalWeightValue(event.target.value)}
                className="h-12"
              />
              {goalWeightConversion ? (
                <p className="text-xs text-muted-foreground">{goalWeightConversion}</p>
              ) : null}
            </Field>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-secondary-foreground">
                <Paintbrush className="h-5 w-5" />
              </div>
              <CardTitle>Units & Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="warm-row rounded-[var(--radius-card)] p-4 text-sm leading-relaxed text-muted-foreground">
              Local preferences. JSON backup includes them.
            </div>
            <Field label="Daily Step Goal" htmlFor="stepGoal">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  id="stepGoal"
                  type="number"
                  min="1000"
                  max="50000"
                  inputMode="numeric"
                  value={stepGoalValue}
                  className="h-12"
                  aria-invalid={stepGoalStatus?.type === "error"}
                  aria-describedby={stepGoalStatus ? "stepGoalStatus" : undefined}
                  onChange={(event) => {
                    setStepGoalValue(event.target.value);
                    setStepGoalStatus(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleStepGoalSave();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleStepGoalSave} className="h-12">
                  Save Goal
                </Button>
              </div>
              {stepGoalStatus ? (
                <p
                  id="stepGoalStatus"
                  role={stepGoalStatus.type === "error" ? "alert" : "status"}
                  className={`status-note ${stepGoalStatus.type === "error" ? "status-note-error" : "status-note-success"} flex items-start gap-2 px-3 py-2 text-xs`}
                >
                  {stepGoalStatus.type === "saved" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}
                  <span>{stepGoalStatus.message}</span>
                </p>
              ) : null}
            </Field>
            <Field label="Goal Target Date" htmlFor="goalDate">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  id="goalDate"
                  ref={goalDateInputRef}
                  type="date"
                  value={goalDateValue}
                  className="h-12"
                  aria-invalid={goalDateStatus?.type === "error"}
                  aria-describedby={goalDateStatus ? "goalDateStatus" : undefined}
                  onChange={(event) => {
                    setGoalDateValue(event.target.value);
                    setGoalDateStatus(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleGoalDateSave();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleGoalDateSave} className="h-12">
                  Save Date
                </Button>
              </div>
              {goalDateStatus ? (
                <p
                  id="goalDateStatus"
                  role={goalDateStatus.type === "error" ? "alert" : "status"}
                  className={`status-note ${goalDateStatus.type === "error" ? "status-note-error" : "status-note-success"} flex items-start gap-2 px-3 py-2 text-xs`}
                >
                  {goalDateStatus.type === "saved" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}
                  <span>{goalDateStatus.message}</span>
                </p>
              ) : null}
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Bodyweight Unit" htmlFor="bodyweightUnit">
                <Input id="bodyweightUnit" value={`Pounds (${BODYWEIGHT_UNIT})`} readOnly className="h-12" />
              </Field>
              <Field label="Training Load Unit" htmlFor="workoutLoadUnit">
                <Input id="workoutLoadUnit" value={`Kilograms (${WORKOUT_LOAD_UNIT})`} readOnly className="h-12" />
              </Field>
              <Field label="Distance Unit" htmlFor="distanceUnit">
                <Select
                  value={settings.distanceUnit}
                  onValueChange={(value) => {
                    updateSettings((current) => ({
                      ...current,
                      distanceUnit: value === "km" ? "km" : "mi",
                    }));
                  }}
                >
                  <SelectTrigger id="distanceUnit" className="h-12 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mi">Miles</SelectItem>
                    <SelectItem value="km">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Appearance is fixed to the Athanor ledger system for visual consistency.
            </p>
            <div className="warm-row rounded-[var(--radius-card)] p-4 text-sm leading-relaxed text-muted-foreground">
              Obsidian command navigation, sky-mist surfaces, glacier accents, and restrained copper remain consistent across the app.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={handleExportJson} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export JSON Backup
            </Button>
            <Button type="button" variant="outline" onClick={handleExportCsv} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV Files
            </Button>
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import JSON Backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportFile(file);
                }
              }}
            />
          </div>

          <div className="warm-row rounded-[var(--radius-card)] border-l-2 border-l-[color-mix(in_srgb,var(--ember)_52%,var(--border)_48%)] p-4 text-sm text-muted-foreground">
            JSON includes tracker data and local preferences. CSV exports split weight, steps, and training sessions.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Private performance ledger for movement, bodyweight, training volume, and recovery.</p>
            <p>Backups preserve tracker data and local preferences.</p>
        </CardContent>
      </Card>

        <Card className="border-destructive/30 bg-[color-mix(in_srgb,var(--basalt-1)_90%,var(--destructive)_10%)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] bg-destructive/12 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <CardTitle>Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="destructive" onClick={() => setIsClearOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Clear All Tracker Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!pendingImport} onOpenChange={(open) => !open && setPendingImport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview destructive import</DialogTitle>
            <DialogDescription>
              This backup will replace existing tracker data after confirmation. Review the counts before continuing.
            </DialogDescription>
          </DialogHeader>
          {pendingImport ? (
            <div className="space-y-4">
              <div className="warm-row rounded-[var(--radius-card)] p-4 text-sm">
                <p className="font-semibold text-foreground">{pendingImport.fileName}</p>
                <p className="mt-1 text-muted-foreground">
                  Version {pendingImport.preview.version ?? "unknown"} / {pendingImport.preview.exportedAt ? new Date(pendingImport.preview.exportedAt).toLocaleString() : "export date unavailable"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Date range: {pendingImport.preview.dateRange ? `${pendingImport.preview.dateRange.start} to ${pendingImport.preview.dateRange.end}` : "no dated records"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <ImportCount label="Weight" value={pendingImport.preview.counts.weightEntries} />
                <ImportCount label="Steps" value={pendingImport.preview.counts.dailyLogs} />
                <ImportCount label="Training sessions" value={pendingImport.preview.counts.workoutSessions} />
                <ImportCount label="Mobility" value={pendingImport.preview.counts.mobilityLogs} />
                <ImportCount label="Nutrition" value={pendingImport.preview.counts.nutritionDays} />
                <ImportCount label="Saved foods" value={pendingImport.preview.counts.savedFoods} />
                <ImportCount label="Pain check-ins" value={pendingImport.preview.counts.painCheckIns} />
              </div>

              <div className="status-note status-note-error px-4 py-3 text-sm leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>This import replaces steps, weight entries, training sessions, mobility logs, nutrition records, saved foods, saved meals, progress photos, and pain check-ins.</p>
                </div>
              </div>

              <Field label="Type REPLACE to import" htmlFor="import-confirmation">
                <Input
                  id="import-confirmation"
                  value={importConfirmation}
                  onChange={(event) => setImportConfirmation(event.target.value)}
                  className="h-12"
                  autoComplete="off"
                />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingImport(null)} disabled={isImporting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmImport} disabled={isImporting || importConfirmation !== "REPLACE"}>
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Replace and import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This deletes steps, weight entries, training sessions, mobility logs, nutrition records, and saved items. Your account stays intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsClearOpen(false)} disabled={isClearing}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleClearAllData} disabled={isClearing}>
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ImportCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-panel">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="data-number mt-1 text-2xl text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}


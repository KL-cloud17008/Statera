"use client";

import { useRef, useState, type ReactNode } from "react";
import {
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
import { parseAppSettings, type AppSettings } from "@/lib/app-settings";
import { inchesToCm } from "@/lib/units";

type SettingsPageClientProps = {
  profile: {
    heightInches: number | null;
    startWeight: number | null;
    goalWeight: number | null;
    timezone: string;
  };
};

type BackupEnvelope = {
  serverData?: unknown;
  localSettings?: Partial<AppSettings>;
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
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const { settings, updateSettings, resetSettings } = useAppSettings();

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
      toast.success("CSV exports downloaded");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupEnvelope;

      const formData = new FormData();
      formData.set("json", JSON.stringify(parsed.serverData ?? parsed));
      const result = await importUserData(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (parsed.localSettings) {
        updateSettings((current) =>
          parseAppSettings(JSON.stringify({ ...current, ...parsed.localSettings }))
        );
      }

      toast.success("Backup imported");
    } catch {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Settings"
        title="Profile, preferences, and data safety"
        description="Manage units, goals, backups, and the profile values that power BMI and goal projections."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-2xl text-primary">
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
            <Field label="Start Weight (lbs)" htmlFor="startWeight">
              <Input id="startWeight" name="startWeight" type="number" step="0.1" min="50" max="999" defaultValue={profile.startWeight ?? ""} className="h-12" />
            </Field>
            <Field label="Goal Weight (lbs)" htmlFor="goalWeight">
              <Input id="goalWeight" name="goalWeight" type="number" step="0.1" min="50" max="999" defaultValue={profile.goalWeight ?? ""} className="h-12" />
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
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-2xl text-secondary-foreground">
                <Paintbrush className="h-5 w-5" />
              </div>
              <CardTitle>Units & Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Daily Step Goal" htmlFor="stepGoal">
              <Input
                id="stepGoal"
                type="number"
                min="1000"
                max="50000"
                value={settings.stepGoal}
                className="h-12"
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value || "0", 10);
                  updateSettings((current) => ({
                    ...current,
                    stepGoal: Number.isNaN(next)
                      ? current.stepGoal
                      : Math.min(50000, Math.max(1000, next)),
                  }));
                }}
              />
            </Field>
            <Field label="Goal Target Date" htmlFor="goalDate">
              <Input
                id="goalDate"
                type="date"
                value={settings.weightGoalTargetDate ?? ""}
                className="h-12"
                onChange={(event) => {
                  updateSettings((current) => ({
                    ...current,
                    weightGoalTargetDate: event.target.value || null,
                  }));
                }}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Weight Unit" htmlFor="weightUnit">
                <Select
                  value={settings.weightUnit}
                  onValueChange={(value) => {
                    updateSettings((current) => ({
                      ...current,
                      weightUnit: value === "kg" ? "kg" : "lb",
                    }));
                  }}
                >
                  <SelectTrigger id="weightUnit" className="h-12 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">Pounds</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-2xl text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Appearance is fixed to the Duna-inspired light system for visual consistency.
            </p>
            <div className="warm-row rounded-[1.25rem] p-4 text-sm leading-relaxed text-muted-foreground">
              Cream canvas, Bone surfaces, Mist inputs, and Aubergine Ink remain consistent across the app.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
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

          <div className="warm-row rounded-[1.25rem] p-4 text-sm text-muted-foreground">
            JSON backups include tracker data plus local app preferences. CSV exports produce separate weight, steps, and workout files for spreadsheet use.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Athanor is a fitness tracker for movement, bodyweight, training volume, and recovery — all in one place.</p>
            <p>Backups include server-side tracker data and local presentation preferences so the app can be restored without rebuilding your setup.</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/25">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
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

      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This deletes steps, weight entries, workouts, mobility logs, nutrition records, and saved items. Your account stays intact.
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


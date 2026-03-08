"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Loader2, Trash2, Upload } from "lucide-react";
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
import type { AppSettings } from "@/lib/app-settings";

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
  const { theme, setTheme } = useTheme();

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
        `fittrack-backup-${new Date().toISOString().split("T")[0]}.json`,
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

      downloadTextFile(
        "fittrack-weight.csv",
        weightCsv.csv,
        "text/csv;charset=utf-8;"
      );
      downloadTextFile(
        "fittrack-steps.csv",
        csv.steps,
        "text/csv;charset=utf-8;"
      );
      downloadTextFile(
        "fittrack-workouts.csv",
        csv.workouts,
        "text/csv;charset=utf-8;"
      );
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
        updateSettings((current) => ({
          ...current,
          ...parsed.localSettings,
        }));
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage profile details, units, goals, theme, and backups.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleProfileSave} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heightInches">Height (inches)</Label>
              <Input
                id="heightInches"
                name="heightInches"
                type="number"
                min="36"
                max="96"
                defaultValue={profile.heightInches ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                name="timezone"
                type="text"
                defaultValue={profile.timezone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startWeight">Start Weight (lbs)</Label>
              <Input
                id="startWeight"
                name="startWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                defaultValue={profile.startWeight ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
              <Input
                id="goalWeight"
                name="goalWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                defaultValue={profile.goalWeight ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stepGoal">Daily Step Goal</Label>
              <Input
                id="stepGoal"
                type="number"
                min="1000"
                max="50000"
                value={settings.stepGoal}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalDate">Goal Target Date</Label>
              <Input
                id="goalDate"
                type="date"
                value={settings.weightGoalTargetDate ?? ""}
                onChange={(event) => {
                  updateSettings((current) => ({
                    ...current,
                    weightGoalTargetDate: event.target.value || null,
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightUnit">Weight Unit</Label>
              <select
                id="weightUnit"
                value={settings.weightUnit}
                onChange={(event) => {
                  updateSettings((current) => ({
                    ...current,
                    weightUnit: event.target.value === "kg" ? "kg" : "lb",
                  }));
                }}
                className="border-input h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="lb">Pounds</option>
                <option value="kg">Kilograms</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distanceUnit">Distance Unit</Label>
              <select
                id="distanceUnit"
                value={settings.distanceUnit}
                onChange={(event) => {
                  updateSettings((current) => ({
                    ...current,
                    distanceUnit: event.target.value === "km" ? "km" : "mi",
                  }));
                }}
                className="border-input h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="mi">Miles</option>
                <option value="km">Kilometers</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                >
                  System
                </Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportJson}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export JSON Backup
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export CSV Files
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
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

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            JSON backups include tracker data plus local app preferences. CSV
            exports download separate weight, steps, and workout files for
            spreadsheet use.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsClearOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Tracker Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This deletes your steps, weight entries, workouts, mobility logs,
              nutrition records, and saved items. Your account stays intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearAllData}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

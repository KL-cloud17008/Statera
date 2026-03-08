"use client";

import { useRef, useState, type ReactNode } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import type { AppSettings } from "@/lib/app-settings";
import { cn } from "@/lib/utils";

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
      const [allData, weightCsv] = await Promise.all([exportUserData(), exportWeightCSV()]);

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

      downloadTextFile("fittrack-weight.csv", weightCsv.csv, "text/csv;charset=utf-8;");
      downloadTextFile("fittrack-steps.csv", csv.steps, "text/csv;charset=utf-8;");
      downloadTextFile("fittrack-workouts.csv", csv.workouts, "text/csv;charset=utf-8;");
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
    <div className="page-shell">
      <SectionHeader
        eyebrow="Settings"
        title="Quiet control over profile, preferences, and data"
        description="Everything here is tuned to feel calm and deliberate: profile inputs, unit choices, theme behavior, and backup controls without the usual dashboard noise."
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">{profile.timezone}</span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            {settings.weightUnit.toUpperCase()} / {settings.distanceUnit.toUpperCase()}
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            Goal {settings.stepGoal.toLocaleString()} steps
          </span>
        </div>
      </SectionHeader>

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <Panel
          eyebrow="Profile"
          title="Body metrics and account context"
          description="These values power BMI, goal comparisons, and date calculations across the app."
        >
          <form action={handleProfileSave} className="grid gap-4 sm:grid-cols-2">
            <Field label="Height (inches)" htmlFor="heightInches">
              <Input
                id="heightInches"
                name="heightInches"
                type="number"
                min="36"
                max="96"
                defaultValue={profile.heightInches ?? ""}
                className="h-11"
              />
            </Field>
            <Field label="Timezone" htmlFor="timezone">
              <Input
                id="timezone"
                name="timezone"
                type="text"
                defaultValue={profile.timezone}
                className="h-11"
              />
            </Field>
            <Field label="Start Weight (lbs)" htmlFor="startWeight">
              <Input
                id="startWeight"
                name="startWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                defaultValue={profile.startWeight ?? ""}
                className="h-11"
              />
            </Field>
            <Field label="Goal Weight (lbs)" htmlFor="goalWeight">
              <Input
                id="goalWeight"
                name="goalWeight"
                type="number"
                step="0.1"
                min="50"
                max="999"
                defaultValue={profile.goalWeight ?? ""}
                className="h-11"
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>
            </div>
          </form>
        </Panel>

        <div className="page-stack">
          <Panel
            eyebrow="Preferences"
            title="Units, goals, and presentation"
            description="Use a single place for measurement rules and appearance so every page stays coherent."
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Field label="Daily Step Goal" htmlFor="stepGoal">
                <Input
                  id="stepGoal"
                  type="number"
                  min="1000"
                  max="50000"
                  value={settings.stepGoal}
                  className="h-11"
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
                  className="h-11"
                  onChange={(event) => {
                    updateSettings((current) => ({
                      ...current,
                      weightGoalTargetDate: event.target.value || null,
                    }));
                  }}
                />
              </Field>

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
                  <SelectTrigger id="weightUnit" className="h-11">
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
                  <SelectTrigger id="distanceUnit" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mi">Miles</SelectItem>
                    <SelectItem value="km">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="section-rule mt-6" />

            <div className="mt-6 space-y-3">
              <div>
                <p className="eyebrow">Theme</p>
                <p className="mt-3 supporting-copy">
                  Default dark for the main visual system, or switch to light/system without changing layout behavior.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <ThemeOption
                  label="Dark"
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                />
                <ThemeOption
                  label="Light"
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                />
                <ThemeOption
                  label="System"
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                />
              </div>
            </div>
          </Panel>

          <Panel
            eyebrow="Data Management"
            title="Backups, exports, and restore"
            description="JSON keeps app settings with server data. CSV gives you separate tracker files for spreadsheet work."
          >
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleExportJson} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export JSON backup
              </Button>
              <Button type="button" variant="outline" onClick={handleExportCsv} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export CSV files
              </Button>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import JSON backup
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

            <div className="mt-6 rounded-[1.35rem] border border-border/80 bg-background/35 px-4 py-4 text-sm text-muted-foreground">
              JSON restores both tracker data and local preferences. CSV export produces separate
              weight, steps, and workout files for portability.
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          eyebrow="About"
          title="What ATHANOR is optimizing for"
          description="A local-first fitness operating system that keeps movement, bodyweight, training volume, and recovery within the same editorial interface."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuietNote title="Consistency first">
              The app is designed to favor repeat daily use over overbuilt configuration.
            </QuietNote>
            <QuietNote title="Portable by default">
              Backups include server-side tracker data and local presentation preferences.
            </QuietNote>
          </div>
        </Panel>

        <Panel
          eyebrow="Danger Zone"
          title="Clear tracker data"
          description="This removes the logged fitness records but leaves the account itself intact."
          tone="danger"
        >
          <Button type="button" variant="destructive" onClick={() => setIsClearOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Clear all tracker data
          </Button>
        </Panel>
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
              Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={cn(
        "editorial-panel-quiet px-6 py-6 sm:px-7 sm:py-7",
        tone === "danger" ? "border-destructive/25 bg-destructive/[0.04]" : ""
      )}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-3 supporting-copy">{description}</p>
      </div>
      <div className="section-rule mt-6" />
      <div className="mt-6">{children}</div>
    </section>
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
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ThemeOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-surface rounded-[1.25rem] border px-4 py-3 text-left transition-colors focus-visible:outline-none",
        active
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border/80 bg-background/35 text-muted-foreground hover:text-foreground"
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em]">
        {active ? "Active" : "Select"}
      </p>
    </button>
  );
}

function QuietNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-border/80 bg-background/35 px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

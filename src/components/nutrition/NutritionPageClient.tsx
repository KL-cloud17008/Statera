"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Apple, CalendarDays, CheckCircle2, Loader2, Pencil, Target, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
import {
  addNutritionEntry,
  deleteNutritionEntry,
  updateNutritionEntry,
  updateNutritionTargets,
} from "@/actions/nutrition";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { calculateNutritionTotals, getTargetPercent, hasNutritionTargets, type NutritionTarget } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

type NutritionEntry = {
  id: string;
  mealLabel: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string | null;
  sortOrder: number;
  createdAt: string;
};

type NutritionPageClientProps = {
  date: string;
  entries: NutritionEntry[];
  targets: NutritionTarget;
};

const MEAL_OPTIONS = ["Meal 1", "Meal 2", "Meal 3", "Snack", "Post-workout"];

export function NutritionPageClient({
  date,
  entries,
  targets,
}: NutritionPageClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<NutritionEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(date);
  const totals = useMemo(() => calculateNutritionTotals(entries), [entries]);
  const targetExists = hasNutritionTargets(targets);

  function refreshForDate(nextDate: string) {
    setSelectedDate(nextDate);
    router.push(`/nutrition?date=${nextDate}`);
  }

  function handleAdd(formData: FormData) {
    formData.set("date", selectedDate);
    startTransition(async () => {
      const result = await addNutritionEntry(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      formRef.current?.reset();
      toast.success("Food logged");
      router.refresh();
    });
  }

  function handleUpdate(entryId: string, formData: FormData) {
    formData.set("entryId", entryId);
    startTransition(async () => {
      const result = await updateNutritionEntry(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setEditingEntryId(null);
      toast.success("Food entry updated");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteEntry) {
      return;
    }

    const formData = new FormData();
    formData.set("entryId", deleteEntry.id);
    startTransition(async () => {
      const result = await deleteNutritionEntry(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setDeleteEntry(null);
      toast.success("Food entry deleted");
      router.refresh();
    });
  }

  function handleTargetsSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateNutritionTargets(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Nutrition targets saved");
      router.refresh();
    });
  }

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Nutrition"
        title="Daily calorie and macro ledger"
        description="Log food, compare the day against targets, and keep aggressive-cut adherence visible without turning this into medical advice."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="warm-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatReadableDate(selectedDate)}
          </span>
          <span className="warm-pill rounded-full px-3 py-1.5">
            Use this as an adherence ledger, not medical advice.
          </span>
        </div>
      </SectionHeader>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-primary">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Quick log</p>
                <CardTitle>Log food for the day</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={handleAdd} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <Field label="Date" htmlFor="nutrition-date">
                  <Input
                    id="nutrition-date"
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => refreshForDate(event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field label="Meal" htmlFor="nutrition-meal">
                  <MealSelect id="nutrition-meal" name="mealLabel" />
                </Field>
              </div>

              <Field label="Food" htmlFor="nutrition-food">
                <Input
                  id="nutrition-food"
                  name="foodName"
                  type="text"
                  placeholder="Chicken breast, rice, Greek yogurt..."
                  required
                  maxLength={120}
                  className="h-12"
                  enterKeyHint="next"
                />
              </Field>

              <MacroInputs idPrefix="nutrition-add" />

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Field label="Serving or time" htmlFor="nutrition-serving">
                  <Input
                    id="nutrition-serving"
                    name="servingSize"
                    type="text"
                    maxLength={80}
                    placeholder="250g, 1 bowl, 8:30 AM"
                    className="h-12"
                  />
                </Field>
                <Button type="submit" disabled={isPending} className="h-12 sm:min-w-36">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Log food
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="duna-mark-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] text-secondary-foreground">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Daily totals</p>
                <CardTitle>Target comparison</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <TotalCell label="Calories" value={Math.round(totals.calories).toLocaleString()} target={targets.calories} />
              <TotalCell label="Protein" value={`${totals.protein.toFixed(1)} g`} target={targets.protein} />
              <TotalCell label="Carbs" value={`${totals.carbs.toFixed(1)} g`} target={targets.carbs} />
              <TotalCell label="Fat" value={`${totals.fat.toFixed(1)} g`} target={targets.fat} />
            </div>

            {targetExists ? (
              <div className="space-y-3">
                <TargetBar label="Calories" value={totals.calories} target={targets.calories} />
                <TargetBar label="Protein" value={totals.protein} target={targets.protein} suffix="g" />
                <TargetBar label="Carbs" value={totals.carbs} target={targets.carbs} suffix="g" />
                <TargetBar label="Fat" value={totals.fat} target={targets.fat} suffix="g" />
              </div>
            ) : (
              <div className="warm-empty-panel rounded-[var(--radius-card)] p-4 text-sm leading-relaxed text-muted-foreground">
                No nutrition targets are set yet. Add targets below when you want adherence comparisons.
              </div>
            )}

            <details className="group border-t border-border pt-4">
              <summary className="text-link flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                Set calorie and macro targets
                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:hidden">Open</span>
                <span className="hidden text-xs uppercase tracking-[0.12em] text-muted-foreground group-open:inline">Close</span>
              </summary>
              <form action={handleTargetsSave} className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Calories" htmlFor="target-calories">
                  <Input id="target-calories" name="caloricTarget" type="number" min="800" max="8000" defaultValue={targets.calories ?? ""} className="h-11" />
                </Field>
                <Field label="Protein (g)" htmlFor="target-protein">
                  <Input id="target-protein" name="proteinTarget" type="number" min="0" max="1000" defaultValue={targets.protein ?? ""} className="h-11" />
                </Field>
                <Field label="Carbs (g)" htmlFor="target-carbs">
                  <Input id="target-carbs" name="carbTarget" type="number" min="0" max="1000" defaultValue={targets.carbs ?? ""} className="h-11" />
                </Field>
                <Field label="Fat (g)" htmlFor="target-fat">
                  <Input id="target-fat" name="fatTarget" type="number" min="0" max="1000" defaultValue={targets.fat ?? ""} className="h-11" />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="outline" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save targets
                  </Button>
                </div>
              </form>
            </details>
          </CardContent>
        </Card>
      </section>

      <section className="document-panel">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Food entries</p>
            <h2 className="mt-2 text-3xl">Today&apos;s ledger</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {entries.length === 1 ? "1 entry" : `${entries.length} entries`}
          </p>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="Start the nutrition ledger"
            description="Add the first food you ate today, then keep meals moving through the quick log as the day unfolds."
            className="warm-empty-panel rounded-[var(--radius-card)] border-t-0 p-6"
          />
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {entries.map((entry) => {
              const isEditing = editingEntryId === entry.id;
              return (
                <div key={entry.id} className="py-5">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="warm-pill rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                          {entry.mealLabel}
                        </span>
                        {entry.servingSize ? (
                          <span className="text-xs text-muted-foreground">{entry.servingSize}</span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-xl font-semibold tracking-normal text-foreground">{entry.foodName}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {Math.round(entry.calories).toLocaleString()} cal / {entry.protein.toFixed(1)}g protein / {entry.carbs.toFixed(1)}g carbs / {entry.fat.toFixed(1)}g fat
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingEntryId(isEditing ? null : entry.id)}>
                        <Pencil className="h-4 w-4" />
                        {isEditing ? "Close" : "Edit"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteEntry(entry)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <form action={(formData) => handleUpdate(entry.id, formData)} className="mt-5 grid gap-3 rounded-[var(--radius-card)] border border-border bg-[color-mix(in_srgb,var(--bone)_60%,var(--cream-paper)_40%)] p-4">
                      <input type="hidden" name="date" value={selectedDate} />
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
                        <Field label="Food" htmlFor={`edit-food-${entry.id}`}>
                          <Input id={`edit-food-${entry.id}`} name="foodName" defaultValue={entry.foodName} required maxLength={120} className="h-11" />
                        </Field>
                        <Field label="Meal" htmlFor={`edit-meal-${entry.id}`}>
                          <MealSelect id={`edit-meal-${entry.id}`} name="mealLabel" defaultValue={entry.mealLabel} />
                        </Field>
                      </div>
                      <MacroInputs idPrefix={`edit-${entry.id}`} entry={entry} compact />
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                        <Field label="Serving or time" htmlFor={`edit-serving-${entry.id}`}>
                          <Input id={`edit-serving-${entry.id}`} name="servingSize" defaultValue={entry.servingSize ?? ""} maxLength={80} className="h-11" />
                        </Field>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Save
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditingEntryId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!deleteEntry} onOpenChange={(open) => !open && setDeleteEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete food entry?</DialogTitle>
            <DialogDescription>
              This removes {deleteEntry?.foodName ?? "this food"} from the selected day. Your other nutrition entries stay intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteEntry(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete entry
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

function MealSelect({
  id,
  name,
  defaultValue = "Meal 1",
}: {
  id: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className="refined-select h-12">
      {MEAL_OPTIONS.map((meal) => (
        <option key={meal} value={meal}>
          {meal}
        </option>
      ))}
    </select>
  );
}

function MacroInputs({
  idPrefix,
  entry,
  compact,
}: {
  idPrefix: string;
  entry?: Partial<NutritionEntry>;
  compact?: boolean;
}) {
  const inputClassName = compact ? "h-11" : "h-12";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Field label="Calories" htmlFor={`${idPrefix}-calories`}>
        <Input
          id={`${idPrefix}-calories`}
          name="calories"
          type="number"
          inputMode="numeric"
          min="0"
          max="10000"
          defaultValue={entry?.calories ?? ""}
          placeholder="0"
          className={inputClassName}
        />
      </Field>
      <Field label="Protein (g)" htmlFor={`${idPrefix}-protein`}>
        <Input
          id={`${idPrefix}-protein`}
          name="protein"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="1000"
          defaultValue={entry?.protein ?? ""}
          placeholder="0"
          className={inputClassName}
        />
      </Field>
      <Field label="Carbs (g)" htmlFor={`${idPrefix}-carbs`}>
        <Input
          id={`${idPrefix}-carbs`}
          name="carbs"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="1000"
          defaultValue={entry?.carbs ?? ""}
          placeholder="0"
          className={inputClassName}
        />
      </Field>
      <Field label="Fat (g)" htmlFor={`${idPrefix}-fat`}>
        <Input
          id={`${idPrefix}-fat`}
          name="fat"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="1000"
          defaultValue={entry?.fat ?? ""}
          placeholder="0"
          className={inputClassName}
        />
      </Field>
    </div>
  );
}

function TotalCell({
  label,
  value,
  target,
}: {
  label: string;
  value: string;
  target: number | null;
}) {
  return (
    <div className="metric-panel">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="data-number mt-2 text-2xl text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {target != null ? `Target ${target.toLocaleString()}${label === "Calories" ? "" : " g"}` : "No target set"}
      </p>
    </div>
  );
}

function TargetBar({
  label,
  value,
  target,
  suffix = "",
}: {
  label: string;
  value: number;
  target: number | null;
  suffix?: string;
}) {
  const percent = getTargetPercent(value, target);
  if (percent == null || target == null) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="data-number text-foreground">
          {Math.round(value).toLocaleString()}{suffix} / {target.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--bone)_62%,var(--border)_38%)]">
        <div
          className={cn(
            "h-full rounded-full",
            percent > 110
              ? "bg-destructive/70"
              : "bg-[color-mix(in_srgb,var(--ember)_70%,var(--foreground)_30%)]"
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{percent}% of target</p>
    </div>
  );
}

function formatReadableDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

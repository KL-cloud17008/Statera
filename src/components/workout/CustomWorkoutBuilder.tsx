"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Play, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { startCustomWorkoutSession } from "@/actions/workout";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  makeCustomExerciseId,
  type MuscleGroup,
  type WorkoutTemplateExercise,
} from "@/lib/exercise-library";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Full Body",
];

export function CustomWorkoutBuilder({ hasActiveSession }: { hasActiveSession: boolean }) {
  const router = useRouter();
  const { settings, updateSettings, allExercises } = useAppSettings();
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("Custom Session");
  const [selectedExerciseId, setSelectedExerciseId] = useState(allExercises[0]?.id ?? "");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutTemplateExercise[]>([]);
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState<MuscleGroup>("Full Body");

  const groupedLibrary = useMemo(() => {
    const groups = new Map<MuscleGroup, typeof allExercises>();
    for (const exercise of allExercises) {
      const bucket = groups.get(exercise.muscleGroup) ?? [];
      bucket.push(exercise);
      groups.set(exercise.muscleGroup, bucket);
    }
    return groups;
  }, [allExercises]);

  function addExercise(exerciseId: string) {
    const match = allExercises.find((exercise) => exercise.id === exerciseId);
    if (!match) {
      return;
    }

    setSelectedExercises((current) => [
      ...current,
      {
        exerciseId: match.id,
        name: match.name,
        muscleGroup: match.muscleGroup,
        sets: match.defaultSets,
        reps: match.defaultReps,
        restSeconds: match.defaultRestSeconds,
        notes: match.notes,
      },
    ]);
  }

  function saveCustomExercise() {
    const trimmed = customName.trim();
    if (!trimmed) {
      toast.error("Custom exercise name is required");
      return;
    }

    updateSettings((current) => {
      const nextExercise = {
        id: makeCustomExerciseId(trimmed),
        name: trimmed,
        muscleGroup: customGroup,
        defaultSets: 3,
        defaultReps: "8-12",
        defaultRestSeconds: 90,
        source: "custom" as const,
      };

      const withoutDuplicate = current.customExercises.filter((exercise) => exercise.id !== nextExercise.id);
      return {
        ...current,
        customExercises: [...withoutDuplicate, nextExercise],
      };
    });

    setCustomName("");
    toast.success("Custom exercise saved to library");
  }

  function saveTemplate() {
    if (selectedExercises.length === 0) {
      toast.error("Add at least one exercise before saving a template");
      return;
    }

    updateSettings((current) => ({
      ...current,
      workoutTemplates: [
        {
          id: `${Date.now()}`,
          name: label.trim() || "Custom Template",
          exercises: selectedExercises,
          createdAt: new Date().toISOString(),
        },
        ...current.workoutTemplates,
      ],
    }));
    toast.success("Template saved");
  }

  function startSession(source: "free" | "template") {
    if (selectedExercises.length === 0) {
      toast.error("Add at least one exercise before starting a session");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("label", label.trim() || "Custom Session");
      formData.set("source", source);
      formData.set("exercises", JSON.stringify(selectedExercises));
      const result = await startCustomWorkoutSession(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.warning ?? "Custom session started");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom-session-label">Session name</Label>
              <Input id="custom-session-label" value={label} onChange={(event) => setLabel(event.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-select">Exercise library</Label>
              <div className="flex gap-2">
                <select
                  id="library-select"
                  value={selectedExerciseId}
                  onChange={(event) => setSelectedExerciseId(event.target.value)}
                  className="h-11 flex-1 rounded-2xl border border-border bg-input px-4 text-sm text-foreground transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-focus"
                >
                  {Array.from(groupedLibrary.entries()).map(([group, exercises]) => (
                    <optgroup key={group} label={group}>
                      {exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={() => addExercise(selectedExerciseId)}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[--radius-card] border border-border bg-muted/25 p-4">
            <p className="eyebrow">Custom Exercise</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
              <Input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Exercise name" className="h-11" />
              <Select value={customGroup} onValueChange={(value) => setCustomGroup(value as MuscleGroup)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" onClick={saveCustomExercise}>Save</Button>
            </div>
          </div>

          <div className="space-y-3">
            {selectedExercises.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="Build a session"
                description="Add exercises from the library, adjust sets and reps, then save the workout as a reusable template."
              />
            ) : (
              selectedExercises.map((exercise, index) => (
                <div key={`${exercise.exerciseId}-${index}`} className="grid gap-3 rounded-[--radius-card] border border-border bg-muted/25 p-4 md:grid-cols-[1.4fr_repeat(3,minmax(0,0.72fr))_auto]">
                  <div>
                    <p className="font-semibold text-foreground">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
                  </div>
                  <Input type="number" min="1" max="10" value={exercise.sets} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sets: Number.parseInt(event.target.value || "1", 10) || 1 } : item))} className="h-11" />
                  <Input value={exercise.reps} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, reps: event.target.value } : item))} className="h-11" />
                  <Input type="number" min="0" max="600" value={exercise.restSeconds} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, restSeconds: Number.parseInt(event.target.value || "0", 10) || 0 } : item))} className="h-11" />
                  <Button type="button" variant="ghost" onClick={() => setSelectedExercises((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${exercise.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={saveTemplate} disabled={selectedExercises.length === 0}>
              <Save className="h-4 w-4" />
              Save Template
            </Button>
            <Button type="button" onClick={() => startSession("free")} disabled={hasActiveSession || isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Custom Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.workoutTemplates.length === 0 ? (
            <EmptyState
              icon={Save}
              title="No saved templates"
              description="Save a custom workout once and it will appear here for quick reuse."
            />
          ) : (
            settings.workoutTemplates.map((template) => (
              <div key={template.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[--radius-card] border border-border bg-muted/25 p-4">
                <div>
                  <p className="font-semibold text-foreground">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.exercises.length} exercises</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setLabel(template.name); setSelectedExercises(template.exercises); }}>
                    Load
                  </Button>
                  <Button type="button" onClick={() => { setLabel(template.name); setSelectedExercises(template.exercises); startSession("template"); }} disabled={hasActiveSession || isPending}>
                    Start
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

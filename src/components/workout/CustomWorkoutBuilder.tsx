"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Loader2, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { makeCustomExerciseId, type MuscleGroup, type WorkoutTemplateExercise } from "@/lib/exercise-library";
import { startCustomWorkoutSession } from "@/actions/workout";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Session Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom-session-label">Session Name</Label>
              <Input id="custom-session-label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-select">Exercise Library</Label>
              <div className="flex gap-2">
                <select
                  id="library-select"
                  value={selectedExerciseId}
                  onChange={(event) => setSelectedExerciseId(event.target.value)}
                  className="border-input h-9 flex-1 rounded-md border bg-background px-3 text-sm"
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
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Create Custom Exercise</p>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_auto]">
              <Input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Exercise name" />
              <select value={customGroup} onChange={(event) => setCustomGroup(event.target.value as MuscleGroup)} className="border-input h-9 rounded-md border bg-background px-3 text-sm">
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <Button type="button" variant="outline" onClick={saveCustomExercise}>Save</Button>
            </div>
          </div>

          <div className="space-y-3">
            {selectedExercises.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Add exercises from the library to build a custom session.
              </div>
            ) : (
              selectedExercises.map((exercise, index) => (
                <div key={`${exercise.exerciseId}-${index}`} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1.5fr_repeat(3,minmax(0,0.8fr))_auto]">
                  <div>
                    <p className="font-medium text-foreground">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                  </div>
                  <Input type="number" min="1" max="10" value={exercise.sets} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sets: Number.parseInt(event.target.value || "1", 10) || 1 } : item))} />
                  <Input value={exercise.reps} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, reps: event.target.value } : item))} />
                  <Input type="number" min="0" max="600" value={exercise.restSeconds} onChange={(event) => setSelectedExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, restSeconds: Number.parseInt(event.target.value || "0", 10) || 0 } : item))} />
                  <Button type="button" variant="ghost" onClick={() => setSelectedExercises((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${exercise.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={saveTemplate} disabled={selectedExercises.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
            <Button type="button" onClick={() => startSession("free")} disabled={hasActiveSession || isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
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
            <p className="text-sm text-muted-foreground">Saved templates will appear here.</p>
          ) : (
            settings.workoutTemplates.map((template) => (
              <div key={template.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.exercises.length} exercises</p>
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

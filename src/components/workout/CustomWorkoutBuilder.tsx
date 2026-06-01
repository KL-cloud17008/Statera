"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { startCustomWorkoutSession } from "@/actions/workout";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  makeCustomExerciseId,
  type MuscleGroup,
  type WorkoutTemplateExercise,
} from "@/lib/exercise-library";
import { cn } from "@/lib/utils";

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

export function CustomWorkoutBuilder({
  hasActiveSession,
  compact = false,
}: {
  hasActiveSession: boolean;
  compact?: boolean;
}) {
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

  function startSession(
    source: "free" | "template",
    exercises = selectedExercises,
    nextLabel = label
  ) {
    if (exercises.length === 0) {
      toast.error("Add at least one exercise before starting a session");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("label", nextLabel.trim() || "Custom Session");
      formData.set("source", source);
      formData.set("exercises", JSON.stringify(exercises));
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
    <section className={cn(compact ? "editorial-surface-quiet" : "editorial-surface", "space-y-8")}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="eyebrow">{compact ? "Custom session" : "Builder"}</p>
          <h2 className="mt-3">
            {compact ? "Shape a session beside the programmed day." : "Compose a session from scratch."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pull from the exercise library, save your own movements, then either store the session
            as a template or start training immediately.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={saveTemplate} disabled={selectedExercises.length === 0}>
            <Save className="h-4 w-4" />
            Save Template
          </Button>
          <Button type="button" onClick={() => startSession("free")} disabled={hasActiveSession || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start Session
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="custom-session-label" className="eyebrow text-[11px] tracking-[0.18em] text-muted-foreground">
            Session name
          </Label>
          <Input
            id="custom-session-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="library-select" className="eyebrow text-[11px] tracking-[0.18em] text-muted-foreground">
            Exercise library
          </Label>
          <div className="flex gap-2">
            <select
              id="library-select"
              value={selectedExerciseId}
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              className="refined-select h-12 flex-1"
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

      <div className="grid gap-4 border-t border-border/70 pt-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="custom-exercise-name" className="eyebrow text-[11px] tracking-[0.18em] text-muted-foreground">
            Custom exercise
          </Label>
          <Input
            id="custom-exercise-name"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            placeholder="Exercise name"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-exercise-group" className="eyebrow text-[11px] tracking-[0.18em] text-muted-foreground">
            Muscle group
          </Label>
          <select
            id="custom-exercise-group"
            value={customGroup}
            onChange={(event) => setCustomGroup(event.target.value as MuscleGroup)}
            className="refined-select h-12"
          >
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <Button type="button" variant="secondary" onClick={saveCustomExercise} className="md:mb-[1px]">
          Save
        </Button>
      </div>

      <div className="space-y-5 border-t border-border/70 pt-8">
        <div className="labelled-row flex-col gap-2 sm:flex-row">
          <div>
            <p className="eyebrow">Selected exercises</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust the working details directly in the list.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{selectedExercises.length} queued</p>
        </div>

        {selectedExercises.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Build a session"
            description="Add exercises from the library, tune sets and reps, then save the result if you want it again."
            className="border-t-0 py-2"
          />
        ) : (
          <div className="space-y-0 border-t border-border/70">
            {selectedExercises.map((exercise, index) => (
              <div
                key={`${exercise.exerciseId}-${index}`}
                className="grid gap-3 border-b border-border/52 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_5rem_5.4rem_5.8rem_auto] md:items-center"
              >
                <div>
                  <p className="font-semibold tracking-[-0.03em] text-foreground">{exercise.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{exercise.muscleGroup}</p>
                </div>

                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={exercise.sets}
                  onChange={(event) =>
                    setSelectedExercises((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, sets: Number.parseInt(event.target.value || "1", 10) || 1 }
                          : item
                      )
                    )
                  }
                  className="h-11 rounded-xl"
                  aria-label={`${exercise.name} sets`}
                />
                <Input
                  value={exercise.reps}
                  onChange={(event) =>
                    setSelectedExercises((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, reps: event.target.value } : item
                      )
                    )
                  }
                  className="h-11 rounded-xl"
                  aria-label={`${exercise.name} reps`}
                />
                <Input
                  type="number"
                  min="0"
                  max="600"
                  value={exercise.restSeconds}
                  onChange={(event) =>
                    setSelectedExercises((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, restSeconds: Number.parseInt(event.target.value || "0", 10) || 0 }
                          : item
                      )
                    )
                  }
                  className="h-11 rounded-xl"
                  aria-label={`${exercise.name} rest seconds`}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setSelectedExercises((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  aria-label={`Remove ${exercise.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5 border-t border-border/70 pt-8">
        <div className="labelled-row flex-col gap-2 sm:flex-row">
          <div>
            <p className="eyebrow">Saved templates</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reuse the sessions that deserve to come back.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{settings.workoutTemplates.length} saved</p>
        </div>

        {settings.workoutTemplates.length === 0 ? (
          <EmptyState
            icon={Save}
            title="No saved templates"
            description="Save a custom workout once and it will stay here for quick reuse."
            className="border-t-0 py-2"
          />
        ) : (
          <div className="space-y-0 border-t border-border/70">
            {settings.workoutTemplates.map((template) => (
              <div
                key={template.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border/52 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-semibold tracking-[-0.03em] text-foreground">{template.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {template.exercises.length} exercises
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLabel(template.name);
                      setSelectedExercises(template.exercises);
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setLabel(template.name);
                      setSelectedExercises(template.exercises);
                      startSession("template", template.exercises, template.name);
                    }}
                    disabled={hasActiveSession || isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

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
import { Row, Rows } from "@/components/ui/ledger";
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
    <div>
      <div className={cn(compact ? "" : "mb-6")}>
        {!compact ? (
          <>
            <p className="text-label uppercase text-tertiary">Builder</p>
            <p className="mt-1 text-body font-medium text-primary">
              Compose a session from scratch.
            </p>
          </>
        ) : null}
        <p className={cn("max-w-2xl text-row text-secondary", !compact && "mt-2")}>
          Pull from the exercise library, save your own movements, then either store the session
          as a template or start training immediately.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={() => startSession("free")} disabled={hasActiveSession || isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Start session
          </Button>
          <Button type="button" variant="secondary" onClick={saveTemplate} disabled={selectedExercises.length === 0}>
            <Save className="size-4" />
            Save template
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-t border-rule pt-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="custom-session-label" className="text-label uppercase text-tertiary">
            Session name
          </Label>
          <Input
            id="custom-session-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="library-select" className="text-label uppercase text-tertiary">
            Exercise library
          </Label>
          <div className="flex gap-2">
            <select
              id="library-select"
              value={selectedExerciseId}
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              className={cn(SELECT_CLASS, "flex-1")}
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
            <Button type="button" variant="secondary" onClick={() => addExercise(selectedExerciseId)}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-rule pt-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="custom-exercise-name" className="text-label uppercase text-tertiary">
            Custom exercise
          </Label>
          <Input
            id="custom-exercise-name"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            placeholder="Exercise name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="custom-exercise-group" className="text-label uppercase text-tertiary">
            Muscle group
          </Label>
          <select
            id="custom-exercise-group"
            value={customGroup}
            onChange={(event) => setCustomGroup(event.target.value as MuscleGroup)}
            className={SELECT_CLASS}
          >
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <Button type="button" variant="secondary" onClick={saveCustomExercise}>
          Save
        </Button>
      </div>

      <div className="mt-6 border-t border-rule pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3>Selected exercises</h3>
          <span className="num text-caption text-tertiary">{selectedExercises.length} queued</span>
        </div>
        <p className="mt-1 text-caption text-tertiary">
          Adjust the working details directly in the list.
        </p>

        {selectedExercises.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Build a session"
            description="Add exercises from the library, tune sets and reps, then save the result if you want it again."
            className="border-t-0 py-2"
          />
        ) : (
          <Rows
            className="mt-4"
            columns={BUILDER_COLUMNS}
            mdColumns={BUILDER_COLUMNS_MD}
            head={
              <>
                <span>Exercise</span>
                <span className="text-right">Sets</span>
                <span className="text-right">Reps</span>
                <span className="hidden text-right md:block">Rest</span>
                <span />
              </>
            }
          >
            {selectedExercises.map((exercise, index) => (
              <Row
                key={`${exercise.exerciseId}-${index}`}
                columns={BUILDER_COLUMNS}
                mdColumns={BUILDER_COLUMNS_MD}
              >
                <div className="min-w-0">
                  <p className="truncate text-row font-medium text-primary">{exercise.name}</p>
                  <p className="text-caption text-tertiary">{exercise.muscleGroup}</p>
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
                  className="h-9 px-2 text-right"
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
                  className="h-9 px-2 text-right"
                  aria-label={`${exercise.name} reps`}
                />
                {/* Rest is the least-used field, so it is the one that leaves
                    the mobile row rather than shrinking all four to nothing. */}
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
                  className="hidden h-9 px-2 text-right md:block"
                  aria-label={`${exercise.name} rest seconds`}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="justify-self-end text-critical hover:text-critical"
                  onClick={() =>
                    setSelectedExercises((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  aria-label={`Remove ${exercise.name}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </Row>
            ))}
          </Rows>
        )}
      </div>

      <div className="mt-6 border-t border-rule pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3>Saved templates</h3>
          <span className="num text-caption text-tertiary">
            {settings.workoutTemplates.length} saved
          </span>
        </div>
        <p className="mt-1 text-caption text-tertiary">
          Reuse the sessions that deserve to come back.
        </p>

        {settings.workoutTemplates.length === 0 ? (
          <EmptyState
            icon={Save}
            title="No saved templates"
            description="Save a custom workout once and it will stay here for quick reuse."
            className="border-t-0 py-2"
          />
        ) : (
          <div className="ledger-rows mt-4 border-t border-rule">
            {settings.workoutTemplates.map((template) => (
              <div
                key={template.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-row font-medium text-primary">{template.name}</p>
                  <p className="num num-left text-caption text-tertiary">
                    {template.exercises.length} exercises
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setLabel(template.name);
                      setSelectedExercises(template.exercises);
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setLabel(template.name);
                      setSelectedExercises(template.exercises);
                      startSession("template", template.exercises, template.name);
                    }}
                    disabled={hasActiveSession || isPending}
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Exercise, sets, reps, [rest], remove. Rest joins the row from 768px up. */
const BUILDER_COLUMNS = "minmax(0,1fr) 4rem 4.5rem 2rem";
const BUILDER_COLUMNS_MD = "minmax(0,1fr) 4.5rem 5rem 5rem 2rem";

/* These remain native <select> elements — they carry <optgroup>, which the
   Radix Select in ui/select.tsx has no equivalent for. Styled to match Input
   so they do not read as unstyled browser chrome. */
const SELECT_CLASS = [
  "h-11 w-full min-w-0 rounded-control border border-control-border bg-raised px-3",
  "text-body text-primary",
  "transition-colors duration-(--duration-fast) ease-(--ease-out)",
  "hover:border-tertiary",
  "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
  "motion-reduce:transition-none",
].join(" ");

import type {
  FreeWorkoutSessionDraft,
  LibraryExercise,
  WorkoutTemplate,
} from "@/lib/exercise-library";
import { isValidISODateString } from "@/lib/dates";

export type WeightUnit = "lb" | "kg";
export type DistanceUnit = "mi" | "km";

export type AppSettings = {
  stepGoal: number;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  weightGoalTargetDate: string | null;
  customExercises: LibraryExercise[];
  workoutTemplates: WorkoutTemplate[];
  activeWorkoutDrafts: Record<string, FreeWorkoutSessionDraft>;
};

export const APP_SETTINGS_STORAGE_KEY = "fittrack.app-settings.v1";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  stepGoal: 10000,
  weightUnit: "lb",
  distanceUnit: "mi",
  weightGoalTargetDate: null,
  customExercises: [],
  workoutTemplates: [],
  activeWorkoutDrafts: {},
};

const MUSCLE_GROUPS = new Set([
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Full Body",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCustomExercises(value: unknown): LibraryExercise[] {
  if (!Array.isArray(value)) {
    return DEFAULT_APP_SETTINGS.customExercises;
  }

  return value
    .filter(isRecord)
    .filter(
      (exercise) =>
        typeof exercise.id === "string" &&
        typeof exercise.name === "string" &&
        typeof exercise.defaultSets === "number" &&
        typeof exercise.defaultReps === "string" &&
        typeof exercise.defaultRestSeconds === "number" &&
        typeof exercise.muscleGroup === "string" &&
        MUSCLE_GROUPS.has(exercise.muscleGroup)
    )
    .map((exercise) => ({
      id: exercise.id as string,
      name: exercise.name as string,
      muscleGroup: exercise.muscleGroup as LibraryExercise["muscleGroup"],
      defaultSets: Math.min(20, Math.max(1, exercise.defaultSets as number)),
      defaultReps: exercise.defaultReps as string,
      defaultRestSeconds: Math.min(7200, Math.max(0, exercise.defaultRestSeconds as number)),
      notes: typeof exercise.notes === "string" ? exercise.notes : undefined,
      source: "custom",
    }));
}

function parseWorkoutTemplates(value: unknown): WorkoutTemplate[] {
  if (!Array.isArray(value)) {
    return DEFAULT_APP_SETTINGS.workoutTemplates;
  }

  return value
    .filter(isRecord)
    .map((template, templateIndex) => {
      const exercises = Array.isArray(template.exercises)
        ? template.exercises
            .filter(isRecord)
            .filter(
              (exercise) =>
                typeof exercise.exerciseId === "string" &&
                typeof exercise.name === "string" &&
                typeof exercise.muscleGroup === "string" &&
                MUSCLE_GROUPS.has(exercise.muscleGroup) &&
                typeof exercise.sets === "number" &&
                typeof exercise.reps === "string" &&
                typeof exercise.restSeconds === "number"
            )
            .map((exercise) => ({
              exerciseId: exercise.exerciseId as string,
              name: exercise.name as string,
              muscleGroup: exercise.muscleGroup as LibraryExercise["muscleGroup"],
              sets: Math.min(20, Math.max(1, exercise.sets as number)),
              reps: exercise.reps as string,
              restSeconds: Math.min(7200, Math.max(0, exercise.restSeconds as number)),
              notes: typeof exercise.notes === "string" ? exercise.notes : undefined,
            }))
        : [];

      return {
        id: typeof template.id === "string" ? template.id : `imported-template-${templateIndex}`,
        name: typeof template.name === "string" && template.name.trim() ? template.name : "Imported Template",
        exercises,
        createdAt: typeof template.createdAt === "string" ? template.createdAt : new Date().toISOString(),
      };
    })
    .filter((template) => template.exercises.length > 0);
}

export function normalizeGoalTargetDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return isValidISODateString(trimmed) ? trimmed : null;
}

export function parseAppSettings(value: string | null | undefined): AppSettings {
  if (!value) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AppSettings>;

    return {
      stepGoal:
        typeof parsed.stepGoal === "number" && parsed.stepGoal >= 1000 && parsed.stepGoal <= 50000
          ? parsed.stepGoal
          : DEFAULT_APP_SETTINGS.stepGoal,
      weightUnit: parsed.weightUnit === "kg" ? "kg" : "lb",
      distanceUnit: parsed.distanceUnit === "km" ? "km" : "mi",
      weightGoalTargetDate: normalizeGoalTargetDate(parsed.weightGoalTargetDate),
      customExercises: parseCustomExercises(parsed.customExercises),
      workoutTemplates: parseWorkoutTemplates(parsed.workoutTemplates),
      activeWorkoutDrafts:
        parsed.activeWorkoutDrafts && typeof parsed.activeWorkoutDrafts === "object"
          ? parsed.activeWorkoutDrafts
          : DEFAULT_APP_SETTINGS.activeWorkoutDrafts,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function serializeAppSettings(settings: AppSettings) {
  return JSON.stringify({
    ...settings,
    weightGoalTargetDate: normalizeGoalTargetDate(settings.weightGoalTargetDate),
  });
}

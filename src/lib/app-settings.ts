import type {
  FreeWorkoutSessionDraft,
  LibraryExercise,
  WorkoutTemplate,
} from "@/lib/exercise-library";

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
      weightGoalTargetDate:
        typeof parsed.weightGoalTargetDate === "string" && parsed.weightGoalTargetDate.length > 0
          ? parsed.weightGoalTargetDate
          : null,
      customExercises: Array.isArray(parsed.customExercises)
        ? parsed.customExercises
        : DEFAULT_APP_SETTINGS.customExercises,
      workoutTemplates: Array.isArray(parsed.workoutTemplates)
        ? parsed.workoutTemplates
        : DEFAULT_APP_SETTINGS.workoutTemplates,
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
  return JSON.stringify(settings);
}

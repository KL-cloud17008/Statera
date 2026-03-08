import type { WorkoutTemplateExercise } from "@/lib/exercise-library";

export type WorkoutSessionMeta = {
  label: string;
  source: "plan" | "template" | "free";
  exercises?: WorkoutTemplateExercise[];
};

export function serializeWorkoutSessionMeta(meta: WorkoutSessionMeta) {
  return JSON.stringify(meta);
}

export function parseWorkoutSessionMeta(notes: string | null | undefined): WorkoutSessionMeta | null {
  if (!notes) {
    return null;
  }

  try {
    const parsed = JSON.parse(notes) as WorkoutSessionMeta;
    if (!parsed?.label || !parsed?.source) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

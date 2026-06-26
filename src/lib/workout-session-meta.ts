import type { WorkoutTemplateExercise } from "@/lib/exercise-library";
import { WORKOUT_LOAD_UNIT, type WorkoutLoadUnit } from "@/lib/units";

export type WorkoutSessionMeta = {
  label: string;
  source: "plan" | "template" | "free";
  exercises?: WorkoutTemplateExercise[];
  loadUnit?: WorkoutLoadUnit;
  planTemplateVersion?: string;
  planContentHash?: string;
  generatedAt?: string;
  dayOfWeek?: number;
  workoutPlanId?: string;
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

    return {
      ...parsed,
      loadUnit: parsed.loadUnit === WORKOUT_LOAD_UNIT ? WORKOUT_LOAD_UNIT : parsed.loadUnit === "lb" ? "lb" : undefined,
      planTemplateVersion:
        typeof parsed.planTemplateVersion === "string" ? parsed.planTemplateVersion : undefined,
      planContentHash:
        typeof parsed.planContentHash === "string" ? parsed.planContentHash : undefined,
      generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : undefined,
      dayOfWeek: typeof parsed.dayOfWeek === "number" ? parsed.dayOfWeek : undefined,
      workoutPlanId: typeof parsed.workoutPlanId === "string" ? parsed.workoutPlanId : undefined,
    };
  } catch {
    return null;
  }
}

export function getWorkoutSessionLoadUnit(notes: string | null | undefined): WorkoutLoadUnit {
  const meta = parseWorkoutSessionMeta(notes);
  return meta?.loadUnit === WORKOUT_LOAD_UNIT ? WORKOUT_LOAD_UNIT : "lb";
}

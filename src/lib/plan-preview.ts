import { DEFAULT_WORKOUT_PLAN, type DefaultWorkoutDay } from "@/lib/default-workout-plan";
import { parseDate } from "@/lib/dates";
import { isLoggableTrainingExercise } from "@/lib/training-session";

export type PlanDayStats = {
  exerciseCount: number;
  estimatedMinutes: number;
  topMovements: string[];
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getPlanDay(dayOfWeek: number): DefaultWorkoutDay | null {
  return DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === dayOfWeek) ?? null;
}

/**
 * The plan-day arm of `stepGoalSuspended`, resolved for an arbitrary date
 * rather than only today: a date the plan gives no session has no step goal.
 *
 * One definition shared by both step cards. It deliberately reuses `getPlanDay`
 * rather than testing for Saturday/Sunday, so a plan whose rest days move stays
 * consistent. It does NOT cover the recovery arm — see `isGoalSuspended` in
 * lib/steps.ts for why that cannot be resolved for a past date.
 */
export function isStepGoalSuspendedByPlan(date: string): boolean {
  return getPlanDay(parseDate(date).getDay()) == null;
}

export function buildPlanDayStats(day: DefaultWorkoutDay): PlanDayStats {
  const loggable = day.exercises.filter(isLoggableTrainingExercise);
  const estimatedSeconds = loggable.reduce((sum, exercise) => {
    const sets = exercise.exerciseType === "FINISHER" ? 1 : exercise.sets;
    // ~45s of work per set plus the programmed rest between sets.
    return sum + sets * (45 + exercise.restSeconds);
  }, 0);
  const estimatedMinutes = Math.max(5, Math.round(estimatedSeconds / 60 / 5) * 5);
  const topMovements = loggable
    .slice(0, 3)
    .map((exercise) => exercise.exerciseName.replace(/^[A-Z]\d*\s+/, ""));

  return {
    exerciseCount: loggable.length,
    estimatedMinutes,
    topMovements,
  };
}

export function findNextTrainingDay(fromDayOfWeek: number): {
  day: DefaultWorkoutDay;
  dayOfWeek: number;
  isTomorrow: boolean;
} | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const dayOfWeek = (fromDayOfWeek + offset) % 7;
    const day = getPlanDay(dayOfWeek);
    if (day) {
      return { day, dayOfWeek, isTomorrow: offset === 1 };
    }
  }
  return null;
}

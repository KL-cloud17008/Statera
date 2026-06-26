import {
  DEFAULT_WORKOUT_PLAN,
  type DefaultWorkoutDay,
  type DefaultPlanExercise,
} from "@/lib/default-workout-plan";

type WorkoutPlanExerciseForHash = {
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string | null;
  restSeconds: number | null;
  targetRPE: string | null;
  cues: string | null;
  supersetGroup: string | null;
  exerciseType: string;
  sortOrder?: number | null;
};

export type WorkoutPlanForHash = {
  dayOfWeek: number;
  sessionName: string;
  exercises: WorkoutPlanExerciseForHash[];
};

function normalizeDefaultDay(day: DefaultWorkoutDay): WorkoutPlanForHash {
  return {
    dayOfWeek: day.dayOfWeek,
    sessionName: day.sessionName,
    exercises: day.exercises.map((exercise, index) => normalizeExercise(exercise, index)),
  };
}

function normalizeExercise(
  exercise: WorkoutPlanExerciseForHash | DefaultPlanExercise,
  fallbackSortOrder: number
) {
  return {
    exerciseName: exercise.exerciseName.trim(),
    sets: exercise.sets,
    reps: exercise.reps.trim(),
    tempo: exercise.tempo ?? null,
    restSeconds: exercise.restSeconds ?? null,
    targetRPE: exercise.targetRPE ?? null,
    cues: exercise.cues?.trim() ?? null,
    supersetGroup: exercise.supersetGroup ?? null,
    exerciseType: exercise.exerciseType,
    order: "sortOrder" in exercise && exercise.sortOrder != null ? exercise.sortOrder : fallbackSortOrder,
  };
}

export function getCanonicalWorkoutDay(dayOfWeek: number) {
  return DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === dayOfWeek) ?? null;
}

export function getWorkoutPlanExerciseNames(plan: WorkoutPlanForHash) {
  return plan.exercises
    .map((exercise, index) => normalizeExercise(exercise, index))
    .sort((a, b) => a.order - b.order || a.exerciseName.localeCompare(b.exerciseName))
    .map((exercise) => exercise.exerciseName);
}

export function getWorkoutPlanContentHash(plan: WorkoutPlanForHash) {
  const exercises = plan.exercises
    .map((exercise, index) => normalizeExercise(exercise, index))
    .sort((a, b) => a.order - b.order || a.exerciseName.localeCompare(b.exerciseName))
    .map((exercise) => ({
      exerciseName: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.reps,
      tempo: exercise.tempo,
      restSeconds: exercise.restSeconds,
      targetRPE: exercise.targetRPE,
      cues: exercise.cues,
      supersetGroup: exercise.supersetGroup,
      exerciseType: exercise.exerciseType,
    }));

  return stableHash(
    JSON.stringify({
      dayOfWeek: plan.dayOfWeek,
      sessionName: plan.sessionName.trim(),
      exercises,
    })
  );
}

export function getCanonicalWorkoutPlanContentHash(dayOfWeek: number) {
  const day = getCanonicalWorkoutDay(dayOfWeek);
  return day ? getWorkoutPlanContentHash(normalizeDefaultDay(day)) : null;
}

export function isCurrentWorkoutPlanContent(plan: WorkoutPlanForHash) {
  return getWorkoutPlanContentHash(plan) === getCanonicalWorkoutPlanContentHash(plan.dayOfWeek);
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

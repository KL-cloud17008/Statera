export const SESSION_PREP_ITEMS = [
  {
    label: "Walk to gym",
    detail: "General warm-up",
  },
  {
    label: "First lift/machine",
    detail: "1-2 ramp-up sets",
  },
  {
    label: "Main work",
    detail: "RPE 5-7",
  },
  {
    label: "Required later recovery",
    detail: "Separate block",
  },
] as const;

export function isAtHomePrimerExerciseName(name: string | null | undefined) {
  const normalized = name?.trim() ?? "";
  return /mobility primer/i.test(normalized) || (/at[\s-]?home/i.test(normalized) && /primer/i.test(normalized));
}

export function isLoggableTrainingExercise(exercise: {
  exerciseName?: string | null;
  exerciseType?: string | null;
}) {
  return exercise.exerciseType !== "WARMUP" && !isAtHomePrimerExerciseName(exercise.exerciseName);
}

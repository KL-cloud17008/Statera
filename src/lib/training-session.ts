export const SESSION_PREP_ITEMS = [
  {
    label: "Walk to gym",
    detail: "General warm-up only if foot load is tolerable. If foot/ankle pain rises above 3/10, use transport or reduce walking.",
  },
  {
    label: "First lift/machine",
    detail: "Ramp set 1: very easy x 8-10, RPE 3-4. Set 2: easy/moderate x 5-8, RPE 4-5 only if needed",
  },
  {
    label: "Session ledger",
    detail: "Prescribed sets; Monday's easy primer is separate from working curls. Wednesday warm-up stays outside the ledger.",
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

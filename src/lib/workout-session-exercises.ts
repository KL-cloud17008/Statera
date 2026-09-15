export type SessionExercise = {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string | null;
  restSeconds: number | null;
  targetRPE: string | null;
  cues: string | null;
  supersetGroup: string | null;
  exerciseType: string;
};

/** Show retained entries even when the current plan removed or reduced an exercise. */
export function mergeSavedSessionExercises(
  exercises: SessionExercise[],
  sets: Array<{ exerciseName: string; setNumber: number }>
): SessionExercise[] {
  const savedCounts = new Map<string, number>();
  for (const set of sets) savedCounts.set(set.exerciseName, Math.max(savedCounts.get(set.exerciseName) ?? 0, set.setNumber));
  const result = exercises.map((exercise) => ({
    ...exercise, sets: Math.max(exercise.sets, savedCounts.get(exercise.exerciseName) ?? 0),
  }));
  const names = new Set(exercises.map((exercise) => exercise.exerciseName));
  for (const [exerciseName, count] of savedCounts) {
    if (names.has(exerciseName)) continue;
    result.push({
      id: `retained-${result.length}`, exerciseName, sets: count, reps: "Logged sets",
      tempo: null, restSeconds: null, targetRPE: null, cues: "Saved before the plan changed.",
      supersetGroup: null, exerciseType: "WORKING",
    });
  }
  return result;
}

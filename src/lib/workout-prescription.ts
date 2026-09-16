type Prescription = { exerciseName: string; sets: number; cues?: string | null };

/** Only the revised working curl slots have a voluntary final target set. */
export function getIntroductorySets(exercise: Prescription) {
  if (exercise.cues?.includes("Introduction:")) {
    if (exercise.exerciseName === "E1 Seated Leg Curl — Working Sets") return 2;
    if (exercise.exerciseName === "C2 Seated Leg Curl") return 3;
  }
  return exercise.sets;
}

export function formatSetPrescription(exercise: Prescription) {
  const intro = getIntroductorySets(exercise);
  return intro < exercise.sets ? `${intro} intro / ${exercise.sets} target` : String(exercise.sets);
}

/** History display only: never use this to reassign saved sets or drafts. */
export function previousPerformanceIdentity(name: string) {
  return name.replace(/^[A-Z]\d+\s+/, "")
    .replace(/^Leg Extension$/, "Seated Leg Extension")
    .replace(/^Lying Leg Curl — Easy Primer$/, "Lying Leg Curl");
}

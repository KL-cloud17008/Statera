export type SavedWorkoutSet = {
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

export function sameSavedWorkoutSet(a: SavedWorkoutSet | null, b: SavedWorkoutSet | null) {
  if (!a || !b) return a === b;
  return a.weightUsed === b.weightUsed && a.repsCompleted === b.repsCompleted &&
    a.actualRPE === b.actualRPE && (a.notes || null) === (b.notes || null);
}

export function parseWorkoutSetTarget(formData: FormData) {
  const sessionId = formData.get("sessionId");
  const exerciseName = formData.get("exerciseName");
  const rawSetNumber = formData.get("setNumber");
  if (typeof sessionId !== "string" || !sessionId.trim()) return { error: "Session is required" };
  if (typeof exerciseName !== "string" || !exerciseName.trim() || exerciseName.trim().length > 240) {
    return { error: "Enter a valid exercise name" };
  }
  const setNumber = typeof rawSetNumber === "string" && /^\d+$/.test(rawSetNumber.trim()) ? Number(rawSetNumber) : NaN;
  if (!Number.isInteger(setNumber) || setNumber < 1 || setNumber > 50) {
    return { error: "Set number must be a whole number between 1 and 50" };
  }
  return { value: { sessionId: sessionId.trim(), exerciseName: exerciseName.trim(), setNumber } };
}

export function parseWorkoutSetBaseline(formData: FormData): { expectedSet?: SavedWorkoutSet | null; error?: string } {
  if (!formData.has("expectedSet")) return {};
  try {
    const raw = formData.get("expectedSet");
    if (typeof raw !== "string") throw new Error("Invalid baseline");
    const expectedSet = JSON.parse(raw);
    if (expectedSet !== null && (!expectedSet ||
      !["weightUsed", "repsCompleted", "actualRPE"].every((key) => {
        const value = expectedSet[key];
        return value === null || (typeof value === "number" && Number.isFinite(value));
      }) || !(expectedSet.notes === null || typeof expectedSet.notes === "string"))) {
      throw new Error("Invalid baseline");
    }
    return { expectedSet };
  } catch {
    return { error: "Invalid saved-set baseline. Refresh and try again." };
  }
}

export function parseWorkoutSetInput(formData: FormData) {
  const target = parseWorkoutSetTarget(formData);
  if (!target.value) return { error: target.error };
  const { sessionId, exerciseName, setNumber } = target.value;
  const string = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const number = (name: string) => {
    const value = string(name);
    if (!value) return null;
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : Number.NaN;
  };
  const weightUsed = number("weightUsed");
  const repsCompleted = number("repsCompleted");
  const actualRPE = number("actualRPE");
  const duration = number("duration");
  const notes = string("notes") || null;
  const isAMRAP = string("isAMRAP") === "true";
  for (const [value, maximum, label, integer, minimum] of [
    [weightUsed, 1500, "Weight", false, 0],
    [repsCompleted, 1000, "Reps", true, 0],
    [actualRPE, 10, "RPE", true, 1],
    [duration, 7200, "Duration", true, 0],
  ] as const) {
    if (value !== null && (!Number.isFinite(value) || (integer && !Number.isInteger(value)) || value < minimum || value > maximum)) {
      return { error: `${label} must be ${integer ? "a whole number " : ""}between ${minimum} and ${maximum}${label === "Weight" ? " kg" : label === "Duration" ? " seconds" : ""}` };
    }
  }
  if (notes && notes.length > 240) return { error: "Notes must be 240 characters or fewer" };
  if (weightUsed === null && repsCompleted === null && duration === null && !notes) {
    return { error: "Enter at least one training value before saving" };
  }
  const baseline = parseWorkoutSetBaseline(formData);
  if (baseline.error) return { error: baseline.error };
  const { expectedSet } = baseline;
  return { value: { sessionId, exerciseName, setNumber, weightUsed, repsCompleted, actualRPE, duration, notes, isAMRAP, expectedSet,
    hasDuration: formData.has("duration"), hasAMRAP: formData.has("isAMRAP") } };
}

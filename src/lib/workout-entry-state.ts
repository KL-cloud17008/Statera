export type SavedEntry = {
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

export type EntryFields = { weight: string; reps: string; rpe: string; notes: string };
export type WorkoutDraft = {
  version: 1;
  fields: EntryFields;
  baseline: SavedEntry | null;
  revision: string;
  status: "draft" | "pending" | "error";
  error?: string;
};
export type RestState = { duration: number; deadline: number | null };

export const WORKOUT_STORAGE_EVENT = "athanor-workout-storage";
// A null entry is a tombstone: a failed remove must not expose the old value.
const memoryFallback = new Map<string, string | null>();

export function sessionDraftPrefix(sessionId: string) {
  return `athanor:workout-draft:${encodeURIComponent(sessionId)}:`;
}

export function workoutDraftKey(sessionId: string, exerciseName: string, setNumber: number) {
  return `${sessionDraftPrefix(sessionId)}${encodeURIComponent(exerciseName)}:${setNumber}`;
}

export function entryFields(entry?: SavedEntry | null): EntryFields {
  return {
    weight: entry?.weightUsed?.toString() ?? "",
    reps: entry?.repsCompleted?.toString() ?? "",
    rpe: entry?.actualRPE?.toString() ?? "",
    notes: entry?.notes ?? "",
  };
}

export function parseEntry(fields: EntryFields, isFinisher = false): { values: SavedEntry } | { error: string } {
  const parseNumber = (value: string) => value.trim() === "" ? null : /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) ? Number(value) : NaN;
  const weightUsed = parseNumber(fields.weight);
  const repsCompleted = isFinisher ? null : parseNumber(fields.reps);
  const actualRPE = parseNumber(fields.rpe);
  if (weightUsed !== null && (!Number.isFinite(weightUsed) || weightUsed < 0 || weightUsed > 1500)) {
    return { error: "Enter a weight from 0 to 1,500 kg." };
  }
  if (repsCompleted !== null && (!Number.isInteger(repsCompleted) || repsCompleted < 0 || repsCompleted > 1000)) {
    return { error: "Enter a whole number of reps from 0 to 1,000." };
  }
  if (actualRPE !== null && (!Number.isInteger(actualRPE) || actualRPE < 1 || actualRPE > 10)) {
    return { error: "Enter a whole-number RPE from 1 to 10." };
  }
  const notes = fields.notes.trim() || null;
  if (notes && notes.length > 240) return { error: "Keep notes to 240 characters or fewer." };
  if (weightUsed === null && repsCompleted === null && !notes) {
    return { error: "Enter your set before saving." };
  }
  return { values: { weightUsed, repsCompleted, actualRPE, notes } };
}

export function parseWorkoutDraft(raw: string | null): WorkoutDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WorkoutDraft;
    if (parsed.version !== 1 || !parsed.fields || typeof parsed.revision !== "string") return null;
    if (!["weight", "reps", "rpe", "notes"].every((field) => typeof parsed.fields[field as keyof EntryFields] === "string")) return null;
    return parsed;
  } catch { return null; }
}

export function readWorkoutStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (memoryFallback.has(key)) return memoryFallback.get(key) ?? null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

/** Returns false when only memory is available; the UI must disclose refresh risk. */
export function writeWorkoutStorage(key: string, value: string | null): boolean {
  let persisted = true;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    memoryFallback.delete(key);
  } catch {
    persisted = false;
    memoryFallback.set(key, value);
  }
  window.dispatchEvent(new Event(WORKOUT_STORAGE_EVENT));
  return persisted;
}

export function acknowledgeSubmittedDraft(key: string, submittedRevision: string, savedSet: SavedEntry): boolean {
  const current = parseWorkoutDraft(readWorkoutStorage(key));
  if (current?.revision !== submittedRevision) {
    // Keep newer input, with the value that this request actually saved as its
    // baseline. A subsequent server edit will still produce a conflict.
    if (current) writeWorkoutStorage(key, JSON.stringify({ ...current, baseline: savedSet }));
    return false;
  }
  writeWorkoutStorage(key, null);
  return true;
}

export function isWorkoutStorageDurable(key: string): boolean { return !memoryFallback.has(key); }

export function subscribeWorkoutStorage(onChange: () => void) {
  window.addEventListener(WORKOUT_STORAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(WORKOUT_STORAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function sessionDraftSnapshot(sessionId: string): string {
  if (typeof window === "undefined") return "[]";
  const keys = new Set(memoryFallback.keys());
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (key) keys.add(key);
    }
  } catch { /* Memory drafts remain visible when browser storage is unavailable. */ }
  return JSON.stringify([...keys].filter((key) => key.startsWith(sessionDraftPrefix(sessionId)))
    .sort().flatMap((key) => parseWorkoutDraft(readWorkoutStorage(key)) ? [key] : []));
}

export function restStorageKey(sessionId: string) { return `athanor:rest:${encodeURIComponent(sessionId)}`; }

export function parseRestState(raw: string | null): RestState | null {
  try {
    const state = raw ? JSON.parse(raw) as RestState : null;
    return state && Number.isFinite(state.duration) && state.duration >= 15 &&
      (state.deadline === null || Number.isFinite(state.deadline)) ? state : null;
  } catch { return null; }
}

export function restSecondsRemaining(state: RestState, now: number): number {
  return state.deadline === null ? state.duration : Math.max(0, Math.ceil((state.deadline - now) / 1000));
}

export function startSessionRest(sessionId: string, duration: number, now = Date.now()) {
  writeWorkoutStorage(restStorageKey(sessionId), JSON.stringify({ duration, deadline: now + duration * 1000 }));
}

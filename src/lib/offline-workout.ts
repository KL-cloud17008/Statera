import type { PlanExercise } from "@/components/workout/ExerciseCard";
import { isWorkoutStorageDurable, readWorkoutStorage, sessionDraftSnapshot, writeWorkoutStorage, type SavedEntry } from "@/lib/workout-entry-state";

export type ActiveWorkout = {
  id: string;
  sessionName: string;
  startTime: string;
  trainingDate: string;
  isStale: boolean;
  exercises: PlanExercise[];
  sets: (SavedEntry & { exerciseName: string; setNumber: number })[];
  previousSets: { exerciseName: string; setNumber: number; weightUsed: number | null; repsCompleted: number | null; actualRPE?: number | null; duration?: number | null }[];
};

type OfflineWorkout = { accountId: string; session: ActiveWorkout; backPainGateActive: boolean; footPainGateActive?: boolean };
const accountKey = "athanor:offline-workout-account";
const workoutKey = "athanor:offline-workout:v1";

export function bindOfflineWorkoutAccount(accountId: string | null) {
  if (readWorkoutStorage(accountKey) !== accountId) writeWorkoutStorage(accountKey, accountId);
}

export function readOfflineWorkoutSnapshot() {
  const accountId = readWorkoutStorage(accountKey);
  if (!accountId || !isWorkoutStorageDurable(workoutKey)) return null;
  const raw = readWorkoutStorage(workoutKey);
  return parseOfflineWorkout(raw)?.accountId === accountId ? raw : null;
}

export function parseOfflineWorkout(raw: string | null): OfflineWorkout | null {
  if (!raw) return null;
  try {
    const snapshot = JSON.parse(raw) as OfflineWorkout;
    return snapshot?.accountId && snapshot.session?.id && Array.isArray(snapshot.session.exercises) &&
      Array.isArray(snapshot.session.sets) && Array.isArray(snapshot.session.previousSets) ? snapshot : null;
  } catch { return null; }
}

export function rememberOfflineWorkout(snapshot: OfflineWorkout) {
  if (readWorkoutStorage(accountKey) !== snapshot.accountId || !isWorkoutStorageDurable(accountKey)) return false;
  const raw = JSON.stringify(snapshot);
  return readWorkoutStorage(workoutKey) === raw && isWorkoutStorageDurable(workoutKey) || writeWorkoutStorage(workoutKey, raw);
}

export function rememberOfflineSets(sessionId: string, sets: ActiveWorkout["sets"]) {
  const snapshot = parseOfflineWorkout(readOfflineWorkoutSnapshot());
  if (snapshot?.session.id === sessionId) rememberOfflineWorkout({ ...snapshot, session: { ...snapshot.session, sets } });
}

export function forgetOfflineWorkout(sessionId?: string) {
  const snapshot = parseOfflineWorkout(readOfflineWorkoutSnapshot());
  if (!snapshot || (sessionId && snapshot.session.id !== sessionId)) return;
  writeWorkoutStorage(workoutKey, null);
}

export function clearOfflineWorkout() {
  const snapshot = parseOfflineWorkout(readOfflineWorkoutSnapshot());
  if (snapshot) {
    const drafts: string[] = JSON.parse(sessionDraftSnapshot(snapshot.session.id));
    for (const key of drafts) writeWorkoutStorage(key, null);
    forgetOfflineWorkout(snapshot.session.id);
  }
}

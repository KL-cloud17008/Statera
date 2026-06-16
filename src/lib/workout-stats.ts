import { parseWorkoutSessionMeta } from "@/lib/workout-session-meta";
import { WORKOUT_LOAD_UNIT, workoutLoadToKg, type WorkoutLoadUnit } from "@/lib/units";

type SessionSetLike = {
  exerciseName: string;
  weightUsed: number | null;
  repsCompleted: number | null;
  setNumber: number;
};

type SessionLike = {
  id: string;
  trainingDate: Date;
  notes: string | null;
  workoutPlan?: { sessionName: string } | null;
  sets: SessionSetLike[];
};

export function calculateSetVolume(
  weightUsed: number | null,
  repsCompleted: number | null,
  sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT
) {
  if (weightUsed == null || repsCompleted == null) {
    return 0;
  }

  return (workoutLoadToKg(weightUsed, sourceUnit) ?? 0) * repsCompleted;
}

export function calculateSessionVolume(
  sets: SessionSetLike[],
  sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT
) {
  return sets.reduce((sum, set) => sum + calculateSetVolume(set.weightUsed, set.repsCompleted, sourceUnit), 0);
}

export function getSessionLabel(session: Pick<SessionLike, "notes" | "workoutPlan">) {
  const meta = parseWorkoutSessionMeta(session.notes);
  return meta?.label || session.workoutPlan?.sessionName || "Free Session";
}

export function computeExercisePRs(
  sets: SessionSetLike[],
  sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT
) {
  const prs = new Map<string, { bestWeight: number; bestVolume: number }>();

  for (const set of sets) {
    const current = prs.get(set.exerciseName) ?? { bestWeight: 0, bestVolume: 0 };
    const weight = workoutLoadToKg(set.weightUsed, sourceUnit) ?? 0;
    const volume = calculateSetVolume(set.weightUsed, set.repsCompleted, sourceUnit);
    prs.set(set.exerciseName, {
      bestWeight: Math.max(current.bestWeight, weight),
      bestVolume: Math.max(current.bestVolume, volume),
    });
  }

  return prs;
}

export function buildWorkoutCalendar(
  sessions: Array<Pick<SessionLike, "id" | "trainingDate" | "notes" | "workoutPlan" | "sets">>,
  monthDate = new Date()
) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const byDate = new Map<string, typeof sessions>();

  for (const session of sessions) {
    const key = session.trainingDate.toISOString().split("T")[0];
    const bucket = byDate.get(key) ?? [];
    bucket.push(session);
    byDate.set(key, bucket);
  }

  return Array.from({ length: lastDay.getDate() }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    const key = date.toISOString().split("T")[0];
    return {
      date: key,
      day,
      weekday: date.getDay(),
      sessions: byDate.get(key) ?? [],
      isToday: key === new Date().toISOString().split("T")[0],
      isInCurrentMonth: date >= firstDay && date <= lastDay,
    };
  });
}

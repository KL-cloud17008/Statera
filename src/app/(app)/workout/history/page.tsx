import type { Metadata } from "next";
import { getRecentSessions } from "@/actions/workout";
import { WorkoutHistoryClient } from "@/components/workout/WorkoutHistoryClient";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getWorkoutSessionLoadUnit } from "@/lib/workout-session-meta";
import { calculateSessionVolume, calculateSetVolume, getSessionLabel } from "@/lib/workout-stats";
import { workoutLoadToKg } from "@/lib/units";

export const metadata: Metadata = {
  title: "Workout History | Athanor",
  description: "Review your completed sessions with a workout calendar, volume totals, and PR counts.",
};

export default async function WorkoutHistoryPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const sessions = await getRecentSessions(user.id, 120);
  const sortedAsc = [...sessions].sort((a, b) => a.trainingDate.getTime() - b.trainingDate.getTime());
  const prState = new Map<string, { bestWeight: number; bestVolume: number }>();

  const serialized = sortedAsc.map((session) => {
    const sessionPrs = new Set<string>();
    const loadUnit = getWorkoutSessionLoadUnit(session.notes);
    for (const set of session.sets) {
      const current = prState.get(set.exerciseName) ?? { bestWeight: 0, bestVolume: 0 };
      const weight = workoutLoadToKg(set.weightUsed, loadUnit) ?? 0;
      const volume = calculateSetVolume(set.weightUsed, set.repsCompleted, loadUnit);
      if (weight > current.bestWeight || volume > current.bestVolume) {
        sessionPrs.add(set.exerciseName);
      }
      prState.set(set.exerciseName, {
        bestWeight: Math.max(current.bestWeight, weight),
        bestVolume: Math.max(current.bestVolume, volume),
      });
    }

    return {
      id: session.id,
      trainingDate: session.trainingDate.toISOString().split("T")[0],
      label: getSessionLabel(session),
      setCount: session.sets.length,
      volume: calculateSessionVolume(session.sets, loadUnit),
      durationMinutes:
        session.startTime && session.endTime
          ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
          : null,
      prCount: sessionPrs.size,
      exercises: Array.from(new Set(session.sets.map((set) => set.exerciseName))).sort(),
    };
  }).reverse();

  return <WorkoutHistoryClient sessions={serialized} />;
}

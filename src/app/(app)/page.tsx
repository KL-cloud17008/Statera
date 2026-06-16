import type { Metadata } from "next";
import { getStepsEntries, getTodaySteps } from "@/actions/steps";
import { getWeightEntries } from "@/actions/weight";
import { getRecentSessions } from "@/actions/workout";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { calculateSessionVolume, getSessionLabel } from "@/lib/workout-stats";
import { getWorkoutSessionLoadUnit } from "@/lib/workout-session-meta";
import { computeWeightStats } from "@/lib/weight";

export const metadata: Metadata = {
  title: "Dashboard | Athanor",
  description: "See your daily steps, current weight trend, recent training volume, and active streaks in one place.",
};

export default async function DashboardPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const [stepsEntries, todaySteps, weightEntries, recentSessions] = await Promise.all([
    getStepsEntries(user.id, 180, user.timezone),
    getTodaySteps(user.id, user.timezone),
    getWeightEntries(user.id),
    getRecentSessions(user.id, 20),
  ]);

  const serializedSteps = stepsEntries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString().split("T")[0],
    steps: entry.steps,
  }));
  const serializedWeights = weightEntries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    date: entry.date.toISOString().split("T")[0],
    weight: entry.weight,
    bodyFatPercent: entry.bodyFatPercent,
    status: entry.status,
    timeOfDay: entry.timeOfDay,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
  }));

  const weightStats = computeWeightStats(serializedWeights, {
    startWeight: user.startWeight,
    heightInches: user.heightInches,
    goalWeight: user.goalWeight,
  });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weeklySessions = recentSessions.filter((session) => session.trainingDate >= startOfWeek);
  const weeklyVolume = weeklySessions.reduce(
    (sum, session) => sum + calculateSessionVolume(session.sets, getWorkoutSessionLoadUnit(session.notes)),
    0
  );
  const lastWorkout = recentSessions[0]
    ? {
        label: getSessionLabel(recentSessions[0]),
        trainingDate: recentSessions[0].trainingDate.toISOString().split("T")[0],
        volume: calculateSessionVolume(recentSessions[0].sets, getWorkoutSessionLoadUnit(recentSessions[0].notes)),
        setCount: recentSessions[0].sets.length,
      }
    : null;

  return (
    <DashboardPageClient
      stepsEntries={serializedSteps}
      todaySteps={todaySteps ?? 0}
      weightStats={{
        currentWeight: weightStats.currentWeight,
        trend: weightStats.trend,
      }}
      workoutSummary={{
        weeklyVolume,
        weeklySessions: weeklySessions.length,
        lastWorkout,
      }}
      timezone={user.timezone}
    />
  );
}

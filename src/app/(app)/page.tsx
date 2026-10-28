import type { Metadata } from "next";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { getLatestPainCheckIn } from "@/actions/pain";
import { getWorkoutPlanDayStatuses } from "@/actions/workout";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTrainingDayOfWeek } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Dashboard | Athanor",
  description: "Today's training programme and mobility routine.",
};

export default async function DashboardPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const trainingDayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);
  const [todayMobilityLogs, workoutDayStatuses, painCheckIn] = await Promise.all([
    getTodayMobilityLogs(user.id, user.timezone),
    getWorkoutPlanDayStatuses(user.id, user.timezone),
    getLatestPainCheckIn(user.id),
  ]);

  return (
    <DashboardPageClient
      workoutDayStatuses={workoutDayStatuses}
      mobilitySummary={{ completedTypes: todayMobilityLogs.map((log) => log.type) }}
      timezone={user.timezone}
      trainingDayOfWeek={trainingDayOfWeek}
      painCheckIn={painCheckIn}
    />
  );
}

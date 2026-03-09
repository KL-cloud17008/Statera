import type { Metadata } from "next";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { MobilityPageClient } from "@/components/mobility/MobilityPageClient";
import { getTrainingDayNumber } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Mobility | Athanor",
  description: "Run pre-workout, post-workout, and undo-sitting mobility flows and log completion.",
};

export default async function MobilityPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const trainingDayNum = getTrainingDayNumber(new Date(), user.timezone);
  const schemaDow = trainingDayNum ?? 6;
  const isTrainingDay = trainingDayNum !== null;
  const logs = await getTodayMobilityLogs(user.id, user.timezone);
  const completedTypes = logs.map((log) => log.type);

  return (
    <MobilityPageClient
      dayOfWeek={schemaDow}
      isTrainingDay={isTrainingDay}
      completedTypes={completedTypes}
    />
  );
}

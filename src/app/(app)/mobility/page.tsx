import type { Metadata } from "next";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { MobilityPageClient } from "@/components/mobility/MobilityPageClient";
import { getTrainingDayOfWeek } from "@/lib/dates";
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

  const dayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);
  const logs = await getTodayMobilityLogs(user.id, user.timezone);
  const completedTypes = logs.map((log) => log.type);

  return (
    <MobilityPageClient
      dayOfWeek={dayOfWeek}
      completedTypes={completedTypes}
    />
  );
}

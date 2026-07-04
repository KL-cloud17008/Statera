import type { Metadata } from "next";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { getLatestPainCheckIn } from "@/actions/pain";
import { getStepsEntries } from "@/actions/steps";
import { MobilityPageClient } from "@/components/mobility/MobilityPageClient";
import { getTodayDateString, getTrainingDayOfWeek } from "@/lib/dates";
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
  const [logs, recentSteps, painCheckIn] = await Promise.all([
    getTodayMobilityLogs(user.id, user.timezone),
    getStepsEntries(user.id, 3, user.timezone),
    getLatestPainCheckIn(user.id),
  ]);
  const completedTypes = logs.map((log) => log.type);
  const recentStepTotal = recentSteps.reduce((sum, entry) => sum + (entry.steps ?? 0), 0);
  const highStepLoad = recentStepTotal > 20000;
  const todayFootPain =
    painCheckIn && painCheckIn.date === getTodayDateString(user.timezone)
      ? painCheckIn.footPain
      : null;

  return (
    <MobilityPageClient
      dayOfWeek={dayOfWeek}
      completedTypes={completedTypes}
      highStepLoad={highStepLoad}
      recentStepTotal={recentStepTotal}
      painCheckIn={painCheckIn}
      todayFootPain={todayFootPain}
      timezone={user.timezone}
    />
  );
}

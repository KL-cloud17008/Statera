import type { Metadata } from "next";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { getLatestPainCheckIn } from "@/actions/pain";
import { getStepsEntries } from "@/actions/steps";
import { MobilityPageClient } from "@/components/mobility/MobilityPageClient";
import { getTodayDateString, getTrainingDate, getTrainingDayOfWeek } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { resolveActiveTrainingSession } from "@/lib/active-training-session";
import { getMobilityProgramDay } from "@/lib/mobility";

export const metadata: Metadata = {
  title: "Mobility | Athanor",
  description: "Run pre-workout, post-workout, and undo-sitting mobility flows and log completion.",
};

export default async function MobilityPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const calendarDayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);
  const currentTrainingDate = getTrainingDate(new Date(), user.timezone);

  // The protocol follows the session being started or resumed, never the
  // calendar weekday — otherwise resuming an earlier session, or a week whose
  // training days have moved, serves a protocol for a different workout.
  const activeSession = await resolveActiveTrainingSession(
    user.id,
    user.timezone,
    currentTrainingDate
  );
  const dayOfWeek = getMobilityProgramDay(activeSession.sessionKey, calendarDayOfWeek);

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

  const calendarDayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: user.timezone || undefined,
  }).format(new Date());

  return (
    <MobilityPageClient
      dayOfWeek={dayOfWeek}
      dayLabel={calendarDayName}
      sessionName={activeSession.sessionName}
      isResumedSession={activeSession.isResumed}
      completedTypes={completedTypes}
      highStepLoad={highStepLoad}
      recentStepTotal={recentStepTotal}
      painCheckIn={painCheckIn}
      todayFootPain={todayFootPain}
      timezone={user.timezone}
    />
  );
}

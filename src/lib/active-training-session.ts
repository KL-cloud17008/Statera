import { prisma } from "@/lib/db";
import { getTrainingDayNumber } from "@/lib/dates";
import { getTrainingSessionKey, type TrainingSessionKey } from "@/lib/mobility";
import { isCurrentPlanBackedWorkoutSession } from "@/lib/workout-session-state";

/**
 * Which training session the app should currently be talking about.
 *
 * The workout page resolves this from an open session first and only then from
 * today's plan; the mobility page used to ignore both and read the calendar
 * weekday instead. That is the whole bug: resume Tuesday's session on Thursday
 * and the session was Lower A while mobility served Thursday's protocol.
 *
 * Resolution order, deliberately the same one the session logger uses:
 *   1. an open, current-plan-backed session — the one being resumed
 *   2. today's programmed plan — the one about to be started
 *   3. rest
 */
export type ActiveTrainingSession = {
  sessionKey: TrainingSessionKey;
  sessionName: string | null;
  /** The plan's dayOfWeek, not the calendar weekday. Null on a rest day. */
  planDayOfWeek: number | null;
  source: "open-session" | "today-plan" | "rest";
  /** True when the open session was started on an earlier training date. */
  isResumed: boolean;
};

export async function resolveActiveTrainingSession(
  userId: string,
  timezone: string | undefined,
  currentTrainingDate: Date
): Promise<ActiveTrainingSession> {
  const openSessions = await prisma.workoutSession.findMany({
    where: { userId, completed: false },
    include: {
      workoutPlan: { include: { exercises: { orderBy: { sortOrder: "asc" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const openSession = openSessions.find(isCurrentPlanBackedWorkoutSession) ?? null;
  const openPlan = openSession?.workoutPlan ?? null;

  if (openSession && openPlan) {
    return {
      sessionKey: getTrainingSessionKey(openPlan.sessionName),
      sessionName: openPlan.sessionName,
      planDayOfWeek: openPlan.dayOfWeek,
      source: "open-session",
      isResumed:
        openSession.trainingDate.getTime() !== currentTrainingDate.getTime(),
    };
  }

  const trainingDayNum = getTrainingDayNumber(new Date(), timezone);
  if (trainingDayNum != null) {
    const todayPlan = await prisma.workoutPlan.findFirst({
      where: { userId, dayOfWeek: trainingDayNum, isActive: true },
    });

    if (todayPlan) {
      return {
        sessionKey: getTrainingSessionKey(todayPlan.sessionName),
        sessionName: todayPlan.sessionName,
        planDayOfWeek: todayPlan.dayOfWeek,
        source: "today-plan",
        isResumed: false,
      };
    }
  }

  // No open session and nothing programmed today: a rest day, including a
  // weekday whose session was dropped from the current week.
  return {
    sessionKey: "REST",
    sessionName: null,
    planDayOfWeek: null,
    source: "rest",
    isResumed: false,
  };
}

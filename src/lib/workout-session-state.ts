import { DEFAULT_WORKOUT_PLAN_VERSION } from "@/lib/default-workout-plan";
import {
  getWorkoutPlanContentHash,
  isCurrentWorkoutPlanContent,
  type WorkoutPlanForHash,
} from "@/lib/workout-plan-version";
import { parseWorkoutSessionMeta } from "@/lib/workout-session-meta";

type SessionWithOptionalPlan = {
  id: string;
  workoutPlanId: string | null;
  notes: string | null;
  workoutPlan?: (WorkoutPlanForHash & { isActive: boolean }) | null;
};

export function isCurrentPlanBackedWorkoutSession(session: SessionWithOptionalPlan) {
  if (!session.workoutPlanId) {
    return true;
  }

  const plan = session.workoutPlan;
  if (!plan?.isActive || !isCurrentWorkoutPlanContent(plan)) {
    return false;
  }

  const meta = parseWorkoutSessionMeta(session.notes);
  if (!meta?.planTemplateVersion && !meta?.planContentHash) {
    return true;
  }

  return (
    meta.planTemplateVersion === DEFAULT_WORKOUT_PLAN_VERSION &&
    meta.planContentHash === getWorkoutPlanContentHash(plan)
  );
}

export function getStaleOpenPlanSessionIds(sessions: SessionWithOptionalPlan[]) {
  return sessions
    .filter((session) => session.workoutPlanId && !isCurrentPlanBackedWorkoutSession(session))
    .map((session) => session.id);
}

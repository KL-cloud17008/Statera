import type { Prisma, PrismaClient } from "@prisma/client";
import {
  DEFAULT_WORKOUT_PLAN,
  DEFAULT_WORKOUT_PLAN_VERSION,
} from "@/lib/default-workout-plan";
import {
  getWorkoutPlanContentHash,
  isCurrentWorkoutPlanContent,
} from "@/lib/workout-plan-version";
import { parseWorkoutSessionMeta, serializeWorkoutSessionMeta } from "@/lib/workout-session-meta";
import { isCurrentPlanBackedWorkoutSession } from "@/lib/workout-session-state";
import { withWorkoutTransaction } from "@/lib/workout-transaction";

type WorkoutPlanClient = PrismaClient | Prisma.TransactionClient;
type WorkoutPlanWithExercises = Prisma.WorkoutPlanGetPayload<{
  include: { exercises: true };
}>;
type OpenSessionWithPlan = Prisma.WorkoutSessionGetPayload<{
  include: { workoutPlan: { include: { exercises: true } } };
}>;

function buildCurrentPlanSessionNotes(
  session: OpenSessionWithPlan,
  plan: WorkoutPlanWithExercises
) {
  const meta = parseWorkoutSessionMeta(session.notes);

  return serializeWorkoutSessionMeta({
    label: plan.sessionName,
    source: "plan",
    // Untagged legacy sessions contain pounds; relinking must not relabel them kg.
    loadUnit: meta?.loadUnit ?? "lb",
    planTemplateVersion: DEFAULT_WORKOUT_PLAN_VERSION,
    planContentHash: getWorkoutPlanContentHash(plan),
    generatedAt: meta?.generatedAt ?? session.createdAt.toISOString(),
    dayOfWeek: plan.dayOfWeek,
    workoutPlanId: plan.id,
    // Keep old identities authorized for recoverable device-local drafts.
    retainedExerciseNames: [...new Set([
      ...(meta?.retainedExerciseNames ?? []),
      ...(session.workoutPlan?.exercises.map((exercise) => exercise.exerciseName) ?? []),
    ])],
  });
}

export async function createDefaultWorkoutPlans(prisma: WorkoutPlanClient, userId: string) {
  for (const [dayIndex, day] of DEFAULT_WORKOUT_PLAN.entries()) {
    await prisma.workoutPlan.create({
      data: {
        userId,
        dayOfWeek: day.dayOfWeek,
        sessionName: day.sessionName,
        weekNumber: 1,
        isActive: true,
        exercises: {
          create: day.exercises.map((exercise, exerciseIndex) => ({
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            tempo: exercise.tempo,
            restSeconds: exercise.restSeconds,
            targetRPE: exercise.targetRPE,
            cues: exercise.cues,
            supersetGroup: exercise.supersetGroup,
            exerciseType: exercise.exerciseType,
            sortOrder: dayIndex * 100 + exerciseIndex,
          })),
        },
      },
    });
  }
}

export async function ensureDefaultWorkoutPlans(prisma: WorkoutPlanClient, userId: string): Promise<boolean> {
  if ("$transaction" in prisma) {
    return withWorkoutTransaction(prisma, userId, (tx) => ensureDefaultWorkoutPlans(tx, userId));
  }
  const activePlans = await prisma.workoutPlan.findMany({
    where: { userId, isActive: true },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });

  const hasCurrentActivePlan =
    activePlans.length === DEFAULT_WORKOUT_PLAN.length &&
    new Set(activePlans.map((plan) => plan.dayOfWeek)).size === DEFAULT_WORKOUT_PLAN.length &&
    DEFAULT_WORKOUT_PLAN.every((day) =>
      activePlans.some((plan) => plan.dayOfWeek === day.dayOfWeek)
    ) &&
    activePlans.every((plan) => isCurrentWorkoutPlanContent(plan));

  if (hasCurrentActivePlan) {
    const openPlanSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        completed: false,
        workoutPlanId: { not: null },
      },
      include: {
        workoutPlan: {
          include: { exercises: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    return refreshOpenPlanSessions(prisma, openPlanSessions, activePlans);
  }

  const rotatePlans = async (tx: WorkoutPlanClient) => {
    const openPlanSessions = await tx.workoutSession.findMany({
      where: {
        userId,
        completed: false,
        workoutPlanId: { not: null },
      },
      include: {
        workoutPlan: {
          include: { exercises: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    await tx.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await createDefaultWorkoutPlans(tx, userId);

    if (openPlanSessions.length === 0) {
      return;
    }

    const newActivePlans = await tx.workoutPlan.findMany({
      where: { userId, isActive: true },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });

    await refreshOpenPlanSessions(tx, openPlanSessions, newActivePlans);
  };

  await rotatePlans(prisma);

  return true;
}

async function refreshOpenPlanSessions(
  tx: WorkoutPlanClient,
  sessions: OpenSessionWithPlan[],
  plans: WorkoutPlanWithExercises[]
) {
  let refreshed = false;
  for (const session of sessions) {
    if (session.completed) continue;
    const dayOfWeek = session.workoutPlan?.dayOfWeek ?? parseWorkoutSessionMeta(session.notes)?.dayOfWeek;
    const plan = plans.find((candidate) => candidate.dayOfWeek === dayOfWeek);
    // An unmatched session is retained for recovery, never deleted on a read.
    if (!plan) continue;
    if (session.workoutPlanId === plan.id && isCurrentPlanBackedWorkoutSession(session)) continue;
    await tx.workoutSession.update({
      where: { id: session.id, userId: session.userId, completed: false },
      data: { workoutPlanId: plan.id, notes: buildCurrentPlanSessionNotes(session, plan) },
    });
    refreshed = true;
  }
  return refreshed;
}

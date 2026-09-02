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
import { WORKOUT_LOAD_UNIT } from "@/lib/units";

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
    loadUnit: meta?.loadUnit ?? WORKOUT_LOAD_UNIT,
    planTemplateVersion: DEFAULT_WORKOUT_PLAN_VERSION,
    planContentHash: getWorkoutPlanContentHash(plan),
    generatedAt: meta?.generatedAt ?? session.createdAt.toISOString(),
    dayOfWeek: plan.dayOfWeek,
    workoutPlanId: plan.id,
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

export async function ensureDefaultWorkoutPlans(prisma: WorkoutPlanClient, userId: string) {
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
    const staleOpenSessionIds = openPlanSessions
      .filter((session) => !isCurrentPlanBackedWorkoutSession(session))
      .map((session) => session.id);

    if (staleOpenSessionIds.length > 0) {
      await prisma.workoutSession.deleteMany({
        where: { id: { in: staleOpenSessionIds } },
      });
    }

    return staleOpenSessionIds.length > 0;
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
    const preservableOpenSessions = openPlanSessions.filter(
      isCurrentPlanBackedWorkoutSession
    );
    const preservableSessionIds = new Set(preservableOpenSessions.map((session) => session.id));
    const staleOpenSessionIds = openPlanSessions
      .filter((session) => !preservableSessionIds.has(session.id))
      .map((session) => session.id);

    if (staleOpenSessionIds.length > 0) {
      await tx.workoutSession.deleteMany({
        where: { id: { in: staleOpenSessionIds } },
      });
    }

    await tx.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await createDefaultWorkoutPlans(tx, userId);

    if (preservableOpenSessions.length === 0) {
      return;
    }

    const newActivePlans = await tx.workoutPlan.findMany({
      where: { userId, isActive: true },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });

    for (const session of preservableOpenSessions) {
      const newPlan = newActivePlans.find(
        (plan) =>
          plan.dayOfWeek === session.workoutPlan?.dayOfWeek &&
          isCurrentWorkoutPlanContent(plan)
      );

      if (!newPlan) {
        await tx.workoutSession.delete({ where: { id: session.id } });
        continue;
      }

      await tx.workoutSession.update({
        where: { id: session.id },
        data: {
          workoutPlanId: newPlan.id,
          notes: buildCurrentPlanSessionNotes(session, newPlan),
        },
      });
    }
  };

  if ("$transaction" in prisma) {
    await prisma.$transaction(rotatePlans);
  } else {
    await rotatePlans(prisma);
  }

  return true;
}

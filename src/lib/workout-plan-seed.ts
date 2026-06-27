import type { Prisma, PrismaClient } from "@prisma/client";
import { DEFAULT_WORKOUT_PLAN } from "@/lib/default-workout-plan";
import { isCurrentWorkoutPlanContent } from "@/lib/workout-plan-version";

type WorkoutPlanClient = PrismaClient | Prisma.TransactionClient;

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
    activePlans.every((plan) => isCurrentWorkoutPlanContent(plan));

  if (hasCurrentActivePlan) {
    return false;
  }

  if (activePlans.length === 0) {
    await createDefaultWorkoutPlans(prisma, userId);
    return true;
  }

  const rotatePlans = async (tx: WorkoutPlanClient) => {
    await tx.workoutSession.deleteMany({
      where: {
        userId,
        completed: false,
        workoutPlanId: { not: null },
      },
    });

    await tx.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await createDefaultWorkoutPlans(tx, userId);
  };

  if ("$transaction" in prisma) {
    await prisma.$transaction(rotatePlans);
  } else {
    await rotatePlans(prisma);
  }

  return true;
}

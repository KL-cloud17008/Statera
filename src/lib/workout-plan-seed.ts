import type { Prisma, PrismaClient } from "@prisma/client";
import { DEFAULT_WORKOUT_PLAN } from "@/lib/default-workout-plan";

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
  const activePlanCount = await prisma.workoutPlan.count({
    where: { userId, isActive: true },
  });

  if (activePlanCount > 0) {
    return false;
  }

  await createDefaultWorkoutPlans(prisma, userId);
  return true;
}

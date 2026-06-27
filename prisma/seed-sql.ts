import { PrismaClient } from "@prisma/client";
import { DEFAULT_WORKOUT_PLAN } from "../src/lib/default-workout-plan";

const prisma = new PrismaClient();

/**
 * Compatibility seed entrypoint for the active next-week 5-day taper workout plan.
 * Run with: npx tsx prisma/seed-sql.ts <supabaseUserId>
 *
 * The script deactivates that user's current workout plans, preserves completed
 * workout history, closes any incomplete sessions, and creates the current plan.
 */

async function main() {
  const supabaseUserId = process.argv[2];

  if (!supabaseUserId) {
    console.error("Usage: npx tsx prisma/seed-sql.ts <supabaseUserId>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
  });

  if (!user) {
    console.error(`User not found for supabaseUserId: ${supabaseUserId}`);
    process.exit(1);
  }

  console.log(`Seeding next-week 5-day taper workout plan for ${user.email} (${user.id})`);

  await prisma.$transaction(async (tx) => {
    await tx.workoutSession.updateMany({
      where: { userId: user.id, completed: false },
      data: { completed: true, endTime: new Date() },
    });

    await tx.workoutPlan.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    for (const [dayIndex, day] of DEFAULT_WORKOUT_PLAN.entries()) {
      await tx.workoutPlan.create({
        data: {
          userId: user.id,
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

      console.log(`  ${day.sessionName} — ${day.exercises.length} exercises`);
    }
  });

  console.log("Done! Active workout data now uses the next-week 5-day taper plan.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

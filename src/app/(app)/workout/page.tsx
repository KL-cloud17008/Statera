import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getTrainingDayNumber } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { parseWorkoutSessionMeta } from "@/lib/workout-session-meta";
import { getPreviousSessionSets, getWorkoutPlans } from "@/actions/workout";
import { WorkoutPageClient } from "@/components/workout/WorkoutPageClient";

export const metadata: Metadata = {
  title: "Workout | Athanor",
  description: "Run today’s programmed session, build custom workouts, save templates, and log every set.",
};

export default async function WorkoutPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const plans = await getWorkoutPlans(user.id);
  const trainingDayNum = getTrainingDayNumber(new Date(), user.timezone);
  const todayPlan = trainingDayNum ? plans.find((plan) => plan.dayOfWeek === trainingDayNum) ?? null : null;

  const openSession = await prisma.workoutSession.findFirst({
    where: {
      userId: user.id,
      completed: false,
    },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      workoutPlan: {
        include: {
          exercises: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let activeSession = null;
  if (openSession) {
    const meta = parseWorkoutSessionMeta(openSession.notes);
    const exercises = openSession.workoutPlan?.exercises ?? meta?.exercises?.map((exercise, index) => ({
      id: `${exercise.exerciseId}-${index}`,
      exerciseName: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      tempo: null,
      restSeconds: exercise.restSeconds,
      targetRPE: null,
      cues: exercise.notes ?? null,
      supersetGroup: null,
      exerciseType: "WORKING",
    })) ?? [];

    const previousSets = openSession.workoutPlanId
      ? await getPreviousSessionSets(user.id, openSession.workoutPlanId)
      : [];

    activeSession = {
      id: openSession.id,
      sessionName: meta?.label || openSession.workoutPlan?.sessionName || "Custom Session",
      startTime: openSession.startTime?.toISOString() ?? new Date().toISOString(),
      exercises,
      sets: openSession.sets.map((set) => ({
        exerciseName: set.exerciseName,
        setNumber: set.setNumber,
        weightUsed: set.weightUsed,
        repsCompleted: set.repsCompleted,
        actualRPE: set.actualRPE,
        notes: set.notes,
      })),
      previousSets,
    };
  }

  return (
    <WorkoutPageClient
      todayPlan={todayPlan ? {
        id: todayPlan.id,
        sessionName: todayPlan.sessionName,
        exercises: todayPlan.exercises,
      } : null}
      activeSession={activeSession}
    />
  );
}

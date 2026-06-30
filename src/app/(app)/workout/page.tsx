import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getTrainingDate, getTrainingDayNumber, getTrainingDayOfWeek } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getWorkoutSessionLoadUnit, parseWorkoutSessionMeta } from "@/lib/workout-session-meta";
import { workoutLoadToKg } from "@/lib/units";
import { getPreviousSessionSets, getWorkoutPlans } from "@/actions/workout";
import { WorkoutPageClient } from "@/components/workout/WorkoutPageClient";
import { isCurrentPlanBackedWorkoutSession } from "@/lib/workout-session-state";
import { isAtHomePrimerExerciseName, isLoggableTrainingExercise } from "@/lib/training-session";

export const metadata: Metadata = {
  title: "Training | Athanor",
  description: "Run today's programmed training session, build custom sessions, save templates, and log every set.",
};

export default async function WorkoutPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const plans = await getWorkoutPlans(user.id);
  const currentTrainingDate = getTrainingDate(new Date(), user.timezone);
  const trainingDayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);
  const trainingDayNum = getTrainingDayNumber(new Date(), user.timezone);
  const todayPlan = trainingDayNum ? plans.find((plan) => plan.dayOfWeek === trainingDayNum) ?? null : null;

  const openSessions = await prisma.workoutSession.findMany({
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
  const openSession = openSessions.find(isCurrentPlanBackedWorkoutSession) ?? null;

  let activeSession = null;
  if (openSession) {
    const meta = parseWorkoutSessionMeta(openSession.notes);
    const loadUnit = getWorkoutSessionLoadUnit(openSession.notes);
    const exercises = (
      openSession.workoutPlan?.exercises ??
      meta?.exercises?.map((exercise, index) => ({
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
      })) ??
      []
    ).filter(isLoggableTrainingExercise);

    const previousSets = openSession.workoutPlanId
      ? await getPreviousSessionSets(user.id, openSession.workoutPlanId)
      : [];

    activeSession = {
      id: openSession.id,
      sessionName: meta?.label || openSession.workoutPlan?.sessionName || "Custom Session",
      startTime: openSession.startTime?.toISOString() ?? new Date().toISOString(),
      trainingDate: openSession.trainingDate.toISOString().split("T")[0],
      isStale: openSession.trainingDate.getTime() !== currentTrainingDate.getTime(),
      exercises,
      sets: openSession.sets
        .filter((set) => !isAtHomePrimerExerciseName(set.exerciseName))
        .map((set) => ({
          exerciseName: set.exerciseName,
          setNumber: set.setNumber,
          weightUsed: workoutLoadToKg(set.weightUsed, loadUnit),
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
        exercises: todayPlan.exercises.filter(isLoggableTrainingExercise),
      } : null}
      activeSession={activeSession}
      trainingDayOfWeek={trainingDayOfWeek}
    />
  );
}

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getTrainingDate, getTrainingDayNumber } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import {
  getWorkoutSessionLoadUnit,
  parseWorkoutSessionMeta,
  serializeWorkoutSessionMeta,
  type WorkoutSessionMeta,
} from "@/lib/workout-session-meta";
import { createDefaultWorkoutPlans, ensureDefaultWorkoutPlans } from "@/lib/workout-plan-seed";
import { WORKOUT_LOAD_UNIT, poundsToKg, workoutLoadToKg } from "@/lib/units";
import type { WorkoutTemplateExercise } from "@/lib/exercise-library";

type WorkoutSessionActionResult = {
  error?: string;
  warning?: string;
  sessionId?: string;
};

type WorkoutMutationResult = {
  error?: string;
};

export async function getWorkoutPlans(userId: string) {
  await ensureDefaultWorkoutPlans(prisma, userId);

  return prisma.workoutPlan.findMany({
    where: { userId, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function getTodaysPlan(userId: string, timezone?: string) {
  const dayNum = getTrainingDayNumber(new Date(), timezone);
  if (!dayNum) {
    return null;
  }

  return prisma.workoutPlan.findFirst({
    where: { userId, dayOfWeek: dayNum, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
  });
}

async function getOpenSession(userId: string) {
  return prisma.workoutSession.findFirst({
    where: {
      userId,
      completed: false,
    },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      workoutPlan: {
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function resetCurrentWorkoutPlan(): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.workoutSession.updateMany({
      where: { userId: user.id, completed: false },
      data: {
        completed: true,
        endTime: new Date(),
      },
    });

    await tx.workoutPlan.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    await createDefaultWorkoutPlans(tx, user.id);
  });

  revalidatePath("/workout");
  revalidatePath("/workout/plan");
  revalidatePath("/workout/history");
  revalidatePath("/");
  return {};
}

export async function startWorkoutSession(
  planId: string
): Promise<WorkoutSessionActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const existingOpen = await getOpenSession(user.id);
  if (existingOpen) {
    return { sessionId: existingOpen.id, warning: "Resumed existing session" };
  }

  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: user.id },
  });
  if (!plan) {
    return { error: "Plan not found" };
  }

  const now = new Date();
  const trainingDate = getTrainingDate(now, user.timezone);

  const existing = await prisma.workoutSession.findFirst({
    where: {
      userId: user.id,
      workoutPlanId: planId,
      trainingDate,
      completed: false,
    },
  });

  if (existing) {
    return { sessionId: existing.id, warning: "Resumed existing session" };
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      workoutPlanId: planId,
      date: now,
      trainingDate,
      startTime: now,
      weekNumber: 1,
      notes: serializeWorkoutSessionMeta({
        label: plan.sessionName,
        source: "plan",
        loadUnit: WORKOUT_LOAD_UNIT,
      }),
    },
  });

  revalidatePath("/workout");
  revalidatePath("/");
  return { sessionId: session.id };
}

export async function startCustomWorkoutSession(
  formData: FormData
): Promise<WorkoutSessionActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const label = ((formData.get("label") as string) || "Custom Session").trim();
  const exercisesJson = formData.get("exercises") as string;
  const source = ((formData.get("source") as string) || "free") as
    | "template"
    | "free";

  let exercises: WorkoutTemplateExercise[] = [];
  try {
    exercises = JSON.parse(exercisesJson) as WorkoutTemplateExercise[];
  } catch {
    return { error: "Invalid workout definition" };
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return { error: "Add at least one exercise before starting a session" };
  }

  const existingOpen = await getOpenSession(user.id);
  if (existingOpen) {
    return { sessionId: existingOpen.id, warning: "Resumed existing session" };
  }

  const now = new Date();
  const trainingDate = getTrainingDate(now, user.timezone);

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      date: now,
      trainingDate,
      startTime: now,
      weekNumber: 1,
      notes: serializeWorkoutSessionMeta({
        label,
        source,
        loadUnit: WORKOUT_LOAD_UNIT,
        exercises: exercises.map((exercise) => ({
          exerciseId:
            exercise.exerciseId ||
            exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),
      }),
    },
  });

  revalidatePath("/workout");
  revalidatePath("/");
  return { sessionId: session.id };
}

export async function logSet(
  formData: FormData
): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const sessionId = formData.get("sessionId") as string;
  const planExerciseId = (formData.get("planExerciseId") as string) || null;
  const exerciseName = (formData.get("exerciseName") as string)?.trim();
  const setNumber = Number.parseInt(formData.get("setNumber") as string, 10);
  const weightUsedValue = formData.get("weightUsed") as string;
  const repsValue = formData.get("repsCompleted") as string;
  const rpeValue = formData.get("actualRPE") as string;
  const durationValue = formData.get("duration") as string;
  const notes = ((formData.get("notes") as string) || null)?.trim() ?? null;
  const isAMRAP = formData.get("isAMRAP") === "true";

  if (!exerciseName) {
    return { error: "Exercise name is required" };
  }
  if (Number.isNaN(setNumber) || setNumber < 1 || setNumber > 50) {
    return { error: "Set number must be between 1 and 50" };
  }

  const weightUsed = weightUsedValue ? Number.parseFloat(weightUsedValue) : null;
  const repsCompleted = repsValue ? Number.parseInt(repsValue, 10) : null;
  const actualRPE = rpeValue ? Number.parseInt(rpeValue, 10) : null;
  const duration = durationValue ? Number.parseInt(durationValue, 10) : null;

  if (
    weightUsed != null &&
    (Number.isNaN(weightUsed) || weightUsed < 0 || weightUsed > 1500)
  ) {
    return { error: "Weight must be between 0 and 1500 kg" };
  }
  if (
    repsCompleted != null &&
    (Number.isNaN(repsCompleted) || repsCompleted < 0 || repsCompleted > 1000)
  ) {
    return { error: "Reps must be between 0 and 1000" };
  }
  if (
    actualRPE != null &&
    (Number.isNaN(actualRPE) || actualRPE < 1 || actualRPE > 10)
  ) {
    return { error: "RPE must be between 1 and 10" };
  }
  if (
    duration != null &&
    (Number.isNaN(duration) || duration < 0 || duration > 7200)
  ) {
    return { error: "Duration must be between 0 and 7200 seconds" };
  }
  if (notes && notes.length > 240) {
    return { error: "Notes must be 240 characters or fewer" };
  }
  if (weightUsed == null && repsCompleted == null && duration == null && !notes) {
    return { error: "Enter at least one training value before saving" };
  }

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      sets: true,
      workoutPlan: true,
    },
  });
  if (!session) {
    return { error: "Session not found" };
  }

  const sessionMeta = parseWorkoutSessionMeta(session.notes);
  if (sessionMeta?.loadUnit !== WORKOUT_LOAD_UNIT && !session.completed) {
    const normalizedMeta: WorkoutSessionMeta = sessionMeta
      ? { ...sessionMeta, loadUnit: WORKOUT_LOAD_UNIT }
      : {
          label: session.workoutPlan?.sessionName || session.notes || "Free Session",
          source: session.workoutPlanId ? "plan" : "free",
          loadUnit: WORKOUT_LOAD_UNIT,
        };

    // Older workout sets were stored as implicit pounds. Open legacy sessions are normalized
    // before accepting new kg input so one session never mixes raw lb and kg values.
    await prisma.$transaction([
      ...session.sets
        .filter((set) => set.weightUsed != null)
        .map((set) =>
          prisma.sessionSet.update({
            where: { id: set.id },
            data: { weightUsed: poundsToKg(set.weightUsed) },
          })
        ),
      prisma.workoutSession.update({
        where: { id: session.id },
        data: { notes: serializeWorkoutSessionMeta(normalizedMeta) },
      }),
    ]);
  }

  const existingSet = await prisma.sessionSet.findFirst({
    where: {
      workoutSessionId: sessionId,
      exerciseName,
      setNumber,
    },
  });

  if (existingSet) {
    await prisma.sessionSet.update({
      where: { id: existingSet.id },
      data: { weightUsed, repsCompleted, actualRPE, duration, isAMRAP, notes },
    });
  } else {
    await prisma.sessionSet.create({
      data: {
        workoutSessionId: sessionId,
        planExerciseId,
        exerciseName,
        setNumber,
        weightUsed,
        repsCompleted,
        actualRPE,
        duration,
        isAMRAP,
        notes,
      },
    });
  }

  revalidatePath("/workout");
  revalidatePath("/workout/history");
  revalidatePath("/");
  return {};
}

export async function completeSession(
  sessionId: string
): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { sets: true },
  });
  if (!session) {
    return { error: "Session not found" };
  }
  if (session.sets.length === 0) {
    return { error: "Log at least one set before completing the session" };
  }

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { completed: true, endTime: new Date() },
  });

  revalidatePath("/workout");
  revalidatePath("/workout/history");
  revalidatePath("/");
  return {};
}

export async function getSessionWithSets(sessionId: string) {
  return prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      workoutPlan: {
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function getRecentSessions(userId: string, limit = 30) {
  return prisma.workoutSession.findMany({
    where: { userId, completed: true },
    include: {
      sets: true,
      workoutPlan: true,
    },
    orderBy: { trainingDate: "desc" },
    take: limit,
  });
}

export async function getPreviousSessionSets(
  userId: string,
  planId: string
): Promise<
  Array<{
    exerciseName: string;
    setNumber: number;
    weightUsed: number | null;
    repsCompleted: number | null;
  }>
> {
  const prevSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      workoutPlanId: planId,
      completed: true,
    },
    orderBy: { trainingDate: "desc" },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
    },
  });

  if (!prevSession) {
    return [];
  }

  const loadUnit = getWorkoutSessionLoadUnit(prevSession.notes);
  return prevSession.sets.map((set) => ({
    exerciseName: set.exerciseName,
    setNumber: set.setNumber,
    weightUsed: workoutLoadToKg(set.weightUsed, loadUnit),
    repsCompleted: set.repsCompleted,
  }));
}

export async function getExerciseHistory(userId: string, exerciseName: string) {
  return prisma.sessionSet.findMany({
    where: {
      exerciseName,
      workoutSession: { userId },
    },
    include: {
      workoutSession: {
        select: { trainingDate: true, date: true, notes: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

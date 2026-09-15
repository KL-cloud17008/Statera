"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getTrainingDate, getTrainingDayNumber } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { DEFAULT_WORKOUT_PLAN_VERSION } from "@/lib/default-workout-plan";
import {
  getWorkoutPlanContentHash,
  isCurrentWorkoutPlanContent,
} from "@/lib/workout-plan-version";
import { isCurrentPlanBackedWorkoutSession } from "@/lib/workout-session-state";
import {
  getWorkoutSessionLoadUnit,
  parseWorkoutSessionMeta,
  serializeWorkoutSessionMeta,
  type WorkoutSessionMeta,
} from "@/lib/workout-session-meta";
import { createDefaultWorkoutPlans, ensureDefaultWorkoutPlans } from "@/lib/workout-plan-seed";
import { isAtHomePrimerExerciseName, isLoggableTrainingExercise } from "@/lib/training-session";
import { WORKOUT_LOAD_UNIT, poundsToKg, workoutLoadToKg } from "@/lib/units";
import type { WorkoutTemplateExercise } from "@/lib/exercise-library";
import { withWorkoutTransaction } from "@/lib/workout-transaction";
import { parseWorkoutSetInput, sameSavedWorkoutSet, type SavedWorkoutSet } from "@/lib/workout-set-input";

type WorkoutSessionActionResult = {
  error?: string;
  warning?: string;
  sessionId?: string;
};

type WorkoutMutationResult = {
  error?: string;
  conflict?: boolean;
  savedSet?: SavedWorkoutSet | null;
};

export type WorkoutPlanDaySessionStatus = {
  planId: string;
  dayOfWeek: number;
  status: "start" | "resume" | "view";
  sessionId?: string;
};

type PlanStatusMatch = {
  id: string;
  dayOfWeek: number;
  sessionName: string;
  exercises: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    tempo: string | null;
    restSeconds: number | null;
    targetRPE: string | null;
    cues: string | null;
    supersetGroup: string | null;
    exerciseType: string;
    sortOrder?: number | null;
  }>;
};

type CompletedPlanSessionForStatus = {
  id: string;
  workoutPlanId: string | null;
  notes: string | null;
  workoutPlan: PlanStatusMatch | null;
};

const WORKOUT_RESET_REVALIDATION_PATHS = [
  "/",
  "/workout",
  "/workout/plan",
  "/workout/history",
  "/mobility",
  "/flexibility-balance",
  "/steps",
  "/weight",
  "/settings",
] as const;

function revalidateWorkoutResetPaths() {
  for (const path of WORKOUT_RESET_REVALIDATION_PATHS) {
    revalidatePath(path);
  }
}

function revalidateWorkoutSessionPaths() {
  for (const path of ["/", "/workout", "/workout/plan", "/workout/history", "/mobility", "/flexibility-balance"]) {
    revalidatePath(path);
  }
}

function completedSessionMatchesCurrentPlan(
  session: CompletedPlanSessionForStatus,
  plan: PlanStatusMatch
) {
  if (session.workoutPlanId === plan.id) {
    return true;
  }

  const meta = parseWorkoutSessionMeta(session.notes);
  const sessionDayOfWeek = meta?.dayOfWeek ?? session.workoutPlan?.dayOfWeek;
  if (sessionDayOfWeek !== plan.dayOfWeek) {
    return false;
  }

  if (meta?.planContentHash === getWorkoutPlanContentHash(plan)) {
    return true;
  }

  return false;
}

export async function getWorkoutPlans(userId: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  await ensureDefaultWorkoutPlans(prisma, userId);

  const plans = await prisma.workoutPlan.findMany({
    where: { userId, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { dayOfWeek: "asc" },
  });

  return plans.map((plan) => ({
    ...plan,
    exercises: plan.exercises.filter(isLoggableTrainingExercise),
  }));
}

export async function getWorkoutPlanDayStatuses(
  userId: string,
  timezone?: string
): Promise<WorkoutPlanDaySessionStatus[]> {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  await ensureDefaultWorkoutPlans(prisma, userId);

  const plans = await prisma.workoutPlan.findMany({
    where: { userId, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { dayOfWeek: "asc" },
  });
  const planIds = plans.map((plan) => plan.id);
  if (planIds.length === 0) {
    return [];
  }

  const currentTrainingDate = getTrainingDate(new Date(), user.timezone ?? timezone);
  const startOfWeek = new Date(currentTrainingDate);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - (startOfWeek.getUTCDay() + 6) % 7);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const [openSessions, completedSessions] = await Promise.all([
    prisma.workoutSession.findMany({
      where: {
        userId,
        workoutPlanId: { in: planIds },
        completed: false,
      },
      include: {
        workoutPlan: {
          include: { exercises: { orderBy: { sortOrder: "asc" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workoutSession.findMany({
      where: {
        userId,
        workoutPlanId: { not: null },
        completed: true,
        trainingDate: { gte: startOfWeek },
      },
      include: {
        workoutPlan: {
          include: { exercises: { orderBy: { sortOrder: "asc" } } },
        },
      },
      orderBy: { trainingDate: "desc" },
    }),
  ]);

  return plans.map((plan) => {
    const openSession = openSessions.find(
      (session) =>
        session.workoutPlanId === plan.id &&
        isCurrentPlanBackedWorkoutSession(session)
    );
    if (openSession) {
      return {
        planId: plan.id,
        dayOfWeek: plan.dayOfWeek,
        status: "resume" as const,
        sessionId: openSession.id,
      };
    }

    const completedSession = completedSessions.find((session) =>
      completedSessionMatchesCurrentPlan(session, plan)
    );
    return {
      planId: plan.id,
      dayOfWeek: plan.dayOfWeek,
      status: completedSession ? "view" as const : "start" as const,
      sessionId: completedSession?.id,
    };
  });
}

export async function getTodaysPlan(userId: string, timezone?: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return null;
  await ensureDefaultWorkoutPlans(prisma, userId);

  const dayNum = getTrainingDayNumber(new Date(), user.timezone ?? timezone);
  if (!dayNum) {
    return null;
  }

  const plan = await prisma.workoutPlan.findFirst({
    where: { userId, dayOfWeek: dayNum, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
  });

  return plan
    ? {
        ...plan,
        exercises: plan.exercises.filter(isLoggableTrainingExercise),
      }
    : null;
}

export async function resetCurrentWorkoutPlan(): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const result = await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const open = await tx.workoutSession.findFirst({ where: { userId: user.id, completed: false } });
    if (open) return { error: "Finish or discard your open session before starting a new plan." };
    await tx.workoutPlan.updateMany({ where: { userId: user.id, isActive: true }, data: { isActive: false } });
    await createDefaultWorkoutPlans(tx, user.id);
    return {};
  });
  if (!result.error) revalidateWorkoutResetPaths();
  return result;
}

export async function startWorkoutSession(planId: string): Promise<WorkoutSessionActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const result = await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const plan = await tx.workoutPlan.findFirst({
      where: { id: planId, userId: user.id, isActive: true },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });
    if (!plan) return { error: "Plan not found. Refresh Training and try again." };
    // Resume takes precedence even if a plan update occurred during the session.
    const existing = await tx.workoutSession.findFirst({
      where: { userId: user.id, completed: false }, orderBy: { createdAt: "desc" },
    });
    if (existing) return {
      sessionId: existing.id,
      warning: existing.workoutPlanId === plan.id ? "Resumed existing session" : "Another session is already in progress; resumed it",
    };
    if (!isCurrentWorkoutPlanContent(plan)) return { error: "This saved plan is out of date. Refresh Training and try again." };
    const now = new Date();
    const session = await tx.workoutSession.create({
      data: {
        userId: user.id, workoutPlanId: plan.id, date: now,
        trainingDate: getTrainingDate(now, user.timezone), startTime: now, weekNumber: 1,
        notes: serializeWorkoutSessionMeta({
          label: plan.sessionName, source: "plan", loadUnit: WORKOUT_LOAD_UNIT,
          planTemplateVersion: DEFAULT_WORKOUT_PLAN_VERSION,
          planContentHash: getWorkoutPlanContentHash(plan), generatedAt: now.toISOString(),
          dayOfWeek: plan.dayOfWeek, workoutPlanId: plan.id,
        }),
      },
    });
    return { sessionId: session.id };
  });
  if (!result.error) revalidateWorkoutSessionPaths();
  return result;
}

export async function startCustomWorkoutSession(formData: FormData): Promise<WorkoutSessionActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const rawLabel = formData.get("label");
  const label = (typeof rawLabel === "string" ? rawLabel.trim() : "") || "Custom Session";
  const source = formData.get("source") || "free";
  if (label.length > 120 || (source !== "template" && source !== "free")) return { error: "Invalid workout definition" };
  let exercises: WorkoutTemplateExercise[];
  try { exercises = JSON.parse(String(formData.get("exercises"))); }
  catch { return { error: "Invalid workout definition" }; }
  if (!Array.isArray(exercises) || exercises.length < 1 || exercises.length > 50 || exercises.some((exercise) =>
    !exercise || typeof exercise.name !== "string" || !exercise.name.trim() || exercise.name.length > 240 ||
    isAtHomePrimerExerciseName(exercise.name) || !Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 50 ||
    typeof exercise.reps !== "string" || !exercise.reps.trim() || exercise.reps.length > 80 ||
    !Number.isInteger(exercise.restSeconds) || exercise.restSeconds < 0 || exercise.restSeconds > 7200 ||
    (exercise.notes != null && (typeof exercise.notes !== "string" || exercise.notes.length > 2000))
  ) || new Set(exercises.map((exercise) => exercise.name.trim())).size !== exercises.length) {
    return { error: "Add valid exercises, sets, reps and rest times before starting a session" };
  }
  const result = await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const existing = await tx.workoutSession.findFirst({ where: { userId: user.id, completed: false }, orderBy: { createdAt: "desc" } });
    if (existing) return { sessionId: existing.id, warning: "Resumed existing session" };
    const now = new Date();
    const session = await tx.workoutSession.create({ data: {
      userId: user.id, date: now, trainingDate: getTrainingDate(now, user.timezone), startTime: now, weekNumber: 1,
      notes: serializeWorkoutSessionMeta({ label, source, loadUnit: WORKOUT_LOAD_UNIT,
        exercises: exercises.map((exercise) => ({
          exerciseId: typeof exercise.exerciseId === "string" ? exercise.exerciseId : exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: exercise.name.trim(), muscleGroup: exercise.muscleGroup,
          sets: exercise.sets, reps: exercise.reps.trim(), restSeconds: exercise.restSeconds, notes: exercise.notes,
        })),
      }),
    } });
    return { sessionId: session.id };
  });
  revalidateWorkoutSessionPaths();
  return result;
}

export async function logSet(formData: FormData): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = parseWorkoutSetInput(formData);
  if (!parsed.value) return { error: parsed.error };
  const { sessionId, exerciseName, setNumber, weightUsed, repsCompleted, actualRPE, duration, notes, isAMRAP, expectedSet, hasDuration, hasAMRAP } = parsed.value;
  if (isAtHomePrimerExerciseName(exerciseName)) return { error: "Session prep is not a loggable training exercise" };
  const result = await withWorkoutTransaction(prisma, user.id, async (tx): Promise<WorkoutMutationResult> => {
    const session = await tx.workoutSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: { sets: true, workoutPlan: { include: { exercises: true } } },
    });
    if (!session) return { error: "Session not found" };
    if (session.completed) return { error: "This session is complete. Saved history has not been changed." };
    const meta = parseWorkoutSessionMeta(session.notes);
    const planExercise = session.workoutPlan?.exercises.find((exercise) => exercise.exerciseName === exerciseName);
    const existingSet = session.sets.find((set) => set.exerciseName === exerciseName && set.setNumber === setNumber);
    // Derive the foreign key from the owned session. Never trust a submitted planExerciseId.
    if (!planExercise && !meta?.exercises?.some((exercise) => exercise.name === exerciseName) && !session.sets.some((set) => set.exerciseName === exerciseName)) {
      return { error: "Exercise not found in this session. Refresh Training and try again." };
    }
    const loadUnit = getWorkoutSessionLoadUnit(session.notes);
    const current: SavedWorkoutSet | null = existingSet ? {
      weightUsed: workoutLoadToKg(existingSet.weightUsed, loadUnit), repsCompleted: existingSet.repsCompleted,
      actualRPE: existingSet.actualRPE, notes: existingSet.notes,
    } : null;
    const savedSet = { weightUsed, repsCompleted, actualRPE, notes };
    const savedDuration = hasDuration ? duration : existingSet?.duration ?? null;
    const savedAMRAP = hasAMRAP ? isAMRAP : existingSet?.isAMRAP ?? false;
    const identical = sameSavedWorkoutSet(current, savedSet) && existingSet?.duration === savedDuration && existingSet.isAMRAP === savedAMRAP;
    // A retry after a lost response is successful; a different edit from another tab requires review.
    if (identical) return { savedSet };
    if (expectedSet !== undefined && !sameSavedWorkoutSet(current, expectedSet)) {
      return { error: "This set changed in another tab or device. Review the saved values before replacing them.", conflict: true, savedSet: current };
    }
    if (loadUnit !== WORKOUT_LOAD_UNIT) {
      const normalizedMeta: WorkoutSessionMeta = meta ? { ...meta, loadUnit: WORKOUT_LOAD_UNIT } : {
        label: session.workoutPlan?.sessionName || session.notes || "Free Session", source: session.workoutPlanId ? "plan" : "free", loadUnit: WORKOUT_LOAD_UNIT,
      };
      for (const set of session.sets) {
        if (set.weightUsed != null) await tx.sessionSet.update({ where: { id: set.id }, data: { weightUsed: poundsToKg(set.weightUsed) } });
      }
      await tx.workoutSession.update({ where: { id: session.id }, data: { notes: serializeWorkoutSessionMeta(normalizedMeta) } });
    }
    const data = { weightUsed, repsCompleted, actualRPE, duration: savedDuration, isAMRAP: savedAMRAP, notes };
    if (existingSet) await tx.sessionSet.update({ where: { id: existingSet.id }, data });
    else await tx.sessionSet.create({ data: { workoutSessionId: session.id, planExerciseId: planExercise?.id ?? null, exerciseName, setNumber, ...data } });
    return { savedSet };
  });
  if (!result.error) revalidateWorkoutSessionPaths();
  return result;
}

export async function completeSession(sessionId: string): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const result = await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const session = await tx.workoutSession.findFirst({ where: { id: sessionId, userId: user.id }, include: { _count: { select: { sets: true } } } });
    if (!session) return { error: "Session not found" };
    if (session.completed) return {};
    if (session._count.sets === 0) return { error: "Log at least one set before completing the session" };
    await tx.workoutSession.update({ where: { id: sessionId }, data: { completed: true, endTime: new Date() } });
    return {};
  });
  if (!result.error) revalidateWorkoutSessionPaths();
  return result;
}

export async function discardWorkoutSession(sessionId: string): Promise<WorkoutMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const result = await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const session = await tx.workoutSession.findFirst({ where: { id: sessionId, userId: user.id } });
    // Already discarded is also a successful retry; completed history is never discarded here.
    if (!session) return {};
    if (session.completed) return { error: "Completed sessions cannot be discarded here" };
    await tx.workoutSession.delete({ where: { id: sessionId } });
    return {};
  });
  if (!result.error) revalidateWorkoutSessionPaths();
  return result;
}

export async function getSessionWithSets(sessionId: string) {
  const user = await getOrCreateCurrentUser();
  if (!user) return null;
  return prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      workoutPlan: {
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function getRecentSessions(userId: string, limit = 30) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  return prisma.workoutSession.findMany({
    where: { userId, completed: true },
    include: {
      sets: true,
      workoutPlan: true,
    },
    orderBy: { trainingDate: "desc" },
    take: Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 30,
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
    actualRPE: number | null;
  }>
> {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  const plan = await prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
  if (!plan) return [];
  const prevSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      workoutPlan: { userId, dayOfWeek: plan.dayOfWeek },
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
  return prevSession.sets
    .filter((set) => !isAtHomePrimerExerciseName(set.exerciseName))
    .map((set) => ({
      exerciseName: set.exerciseName,
      setNumber: set.setNumber,
      weightUsed: workoutLoadToKg(set.weightUsed, loadUnit),
      repsCompleted: set.repsCompleted,
      actualRPE: set.actualRPE,
    }));
}

export async function getExerciseHistory(userId: string, exerciseName: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
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

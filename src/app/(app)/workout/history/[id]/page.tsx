import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionWithSets } from "@/actions/workout";
import { WorkoutHistoryEditor } from "@/components/workout/WorkoutHistoryEditor";
import { getWorkoutSessionLoadUnit, parseWorkoutSessionMeta } from "@/lib/workout-session-meta";
import { mergeSavedSessionExercises } from "@/lib/workout-session-exercises";
import { getSessionLabel } from "@/lib/workout-stats";
import { isAtHomePrimerExerciseName, isLoggableTrainingExercise } from "@/lib/training-session";
import { workoutLoadToKg } from "@/lib/units";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTodayDateString } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Edit Training Session | Athanor",
  description: "Correct a workout's training date, add missed sets, and edit saved values.",
};

export default async function EditWorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, user] = await Promise.all([getSessionWithSets(id), getOrCreateCurrentUser()]);
  if (!session || !user) notFound();
  if (!session.completed) redirect("/workout");

  const meta = parseWorkoutSessionMeta(session.notes);
  const loadUnit = getWorkoutSessionLoadUnit(session.notes);
  // Use this session's retained plan, never today's template or plan seeding.
  const exercises = (session.workoutPlan?.exercises ?? meta?.exercises?.map((exercise, index) => ({
    id: `custom-${index}`, exerciseName: exercise.name, sets: exercise.sets, reps: exercise.reps,
    tempo: null, restSeconds: exercise.restSeconds, targetRPE: null, cues: exercise.notes ?? null,
    supersetGroup: null, exerciseType: "WORKING",
  })) ?? []).filter(isLoggableTrainingExercise);
  const sets = session.sets.filter((set) => !isAtHomePrimerExerciseName(set.exerciseName));

  return <WorkoutHistoryEditor
    sessionId={session.id}
    sessionName={getSessionLabel(session)}
    trainingDate={session.trainingDate.toISOString().split("T")[0]}
    todayDate={getTodayDateString(user.timezone)}
    exercises={mergeSavedSessionExercises(exercises, sets)}
    existingSets={sets.map((set) => ({
      exerciseName: set.exerciseName, setNumber: set.setNumber,
      weightUsed: workoutLoadToKg(set.weightUsed, loadUnit),
      repsCompleted: set.repsCompleted, actualRPE: set.actualRPE, notes: set.notes,
      duration: set.duration, isAMRAP: set.isAMRAP,
    }))}
  />;
}

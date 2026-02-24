import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import {
  getWorkoutPlans,
  getPreviousSessionSets,
} from "@/actions/workout";
import { getTrainingDate } from "@/lib/dates";
import { WorkoutPageClient } from "@/components/workout/WorkoutPageClient";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!dbUser) return null;

  const plans = await getWorkoutPlans(dbUser.id);

  // Determine today's training day
  const trainingDate = getTrainingDate(new Date(), dbUser.timezone);
  const jsDay = trainingDate.getDay(); // 0=Sun...6=Sat
  const schemaDow = jsDay === 0 ? 7 : jsDay;
  const todayPlan = plans.find((p) => p.dayOfWeek === schemaDow) ?? null;
  const todayDayOfWeek = todayPlan ? schemaDow : null;

  // Fetch today's session if there's a plan
  let todaySession = null;
  let previousSets: { exerciseName: string; setNumber: number; weightUsed: number | null; repsCompleted: number | null }[] = [];

  if (todayPlan) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        userId: dbUser.id,
        workoutPlanId: todayPlan.id,
        trainingDate,
      },
      include: {
        sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      },
    });

    if (session) {
      todaySession = {
        id: session.id,
        completed: session.completed,
        startTime: session.startTime?.toISOString() ?? null,
        sets: session.sets.map((s) => ({
          exerciseName: s.exerciseName,
          setNumber: s.setNumber,
          weightUsed: s.weightUsed,
          repsCompleted: s.repsCompleted,
          actualRPE: s.actualRPE,
          notes: s.notes,
        })),
      };
    }

    if (session && !session.completed) {
      previousSets = await getPreviousSessionSets(dbUser.id, todayPlan.id);
    }
  }

  return (
    <WorkoutPageClient
      plans={plans.map((p) => ({
        id: p.id,
        sessionName: p.sessionName,
        dayOfWeek: p.dayOfWeek,
        exercises: p.exercises,
      }))}
      todayDayOfWeek={todayDayOfWeek}
      todaySession={todaySession}
      todayPlanId={todayPlan?.id ?? null}
      previousSets={previousSets}
    />
  );
}

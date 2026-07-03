/**
 * Seed workout plans via Supabase REST API (no direct Postgres needed).
 * Run: npx tsx prisma/seed-via-api.ts [supabaseUserId]
 */

import "dotenv/config";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_WORKOUT_PLAN } from "../src/lib/default-workout-plan";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceKey);

function cuid(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c${ts}${rand}`;
}

async function main() {
  const supabaseUserId = process.argv[2];
  const userQuery = supabase.from("User").select("id, email, supabaseUserId").limit(1);
  const { data: users, error: userError } = supabaseUserId
    ? await userQuery.eq("supabaseUserId", supabaseUserId)
    : await userQuery;

  if (userError) {
    throw new Error(`Error fetching user: ${userError.message}`);
  }

  const user = users?.[0];
  if (!user) {
    throw new Error(supabaseUserId ? `User not found: ${supabaseUserId}` : "No users found.");
  }

  console.log(`Seeding next-week progressive overload workout plan for ${user.email} (${user.id})`);

  const { error: closeSessionsError } = await supabase
    .from("WorkoutSession")
    .update({ completed: true, endTime: new Date().toISOString() })
    .eq("userId", user.id)
    .eq("completed", false);

  if (closeSessionsError) {
    throw new Error(`Error closing incomplete sessions: ${closeSessionsError.message}`);
  }

  const { error: deactivatePlansError } = await supabase
    .from("WorkoutPlan")
    .update({ isActive: false })
    .eq("userId", user.id)
    .eq("isActive", true);

  if (deactivatePlansError) {
    throw new Error(`Error deactivating active plans: ${deactivatePlansError.message}`);
  }

  for (const [dayIndex, day] of DEFAULT_WORKOUT_PLAN.entries()) {
    const planId = cuid();
    const { error: planError } = await supabase.from("WorkoutPlan").insert({
      id: planId,
      userId: user.id,
      dayOfWeek: day.dayOfWeek,
      sessionName: day.sessionName,
      weekNumber: 1,
      isActive: true,
    });

    if (planError) {
      throw new Error(`Error creating ${day.sessionName}: ${planError.message}`);
    }

    const exercises = day.exercises.map((exercise, exerciseIndex) => ({
      id: `${cuid()}${exerciseIndex}`,
      workoutPlanId: planId,
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
    }));

    const { error: exerciseError } = await supabase.from("PlanExercise").insert(exercises);

    if (exerciseError) {
      throw new Error(`Error creating exercises for ${day.sessionName}: ${exerciseError.message}`);
    }

    console.log(`  ${day.sessionName} — ${day.exercises.length} exercises`);
  }

  console.log("Done! Active workout data now uses the next-week progressive overload plan.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Seed workout plans via Supabase REST API (no direct Postgres needed).
 * Run: npx tsx prisma/seed-via-api.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  // Try .env.local
  require("dotenv").config({ path: ".env.local" });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ExerciseSeed = {
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string;
  restSeconds: number;
  targetRPE: string;
  cues: string;
  supersetGroup: string | null;
  exerciseType: string;
};

const DAY_1: ExerciseSeed[] = [
  { exerciseName: "Machine Chest Press (warm-up)", sets: 2, reps: "12, 8", tempo: "2-0-1", restSeconds: 60, targetRPE: "3-4", cues: "1×12 lightest setting, 1×8 at ~50% working weight.", supersetGroup: null, exerciseType: "WARMUP" },
  { exerciseName: "Machine Chest Press", sets: 3, reps: "1×8 (top), 2×10 (back-off)", tempo: "3-1-1", restSeconds: 90, targetRPE: "Top: 8, Back-offs: 7", cues: "Seat so handles at mid-chest (nipple line). Feet flat. Shoulder blades squeezed against pad. Full ROM to chest stretch, press to just short of lockout.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Seated Cable Row (close-grip)", sets: 3, reps: "1×8 (top), 2×10 (back-off)", tempo: "2-2-1", restSeconds: 90, targetRPE: "Top: 8, Back-offs: 7", cues: "Sit tall, slight knee bend, feet on plate. Elbows straight back, squeeze blades for full 2 seconds at contraction. Let shoulders protract on return for lat stretch. The 2-sec squeeze is critical for posture.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Dumbbell Incline Press", sets: 3, reps: "10", tempo: "3-1-1", restSeconds: 60, targetRPE: "7", cues: "Bench at 30°. Feet flat, back driven into pad. Lower to outer chest, press up without clanking.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Cable Face Pull (rope)", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 60, targetRPE: "7", cues: "Cable at upper chest height. Pull rope to face, split to sides of head, elbows high. 1-sec squeeze. Posture exercise — own every rep.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Machine Pec Deck", sets: 2, reps: "12", tempo: "3-1-1", restSeconds: 45, targetRPE: "7", cues: "Handles at shoulder height. Slight arm bend throughout. Squeeze together, return slowly. No stack slam.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Cable Straight-Arm Pulldown", sets: 2, reps: "12", tempo: "2-1-2", restSeconds: 45, targetRPE: "7", cues: "Arms nearly straight, push bar down in arc toward thighs. Squeeze lats at bottom, slow return. Core braced.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "4-Min AMRAP: Chest Press × 8 / Cable Row × 8", sets: 1, reps: "AMRAP 4 min", tempo: "1-0-1", restSeconds: 0, targetRPE: "8-9", cues: "Machine chest press × 8 (60% of top set), Seated cable row × 8 (60% of top set). Repeat continuously. Rest only as needed. Record total rounds + extra reps.", supersetGroup: null, exerciseType: "FINISHER" },
];

const DAY_2: ExerciseSeed[] = [
  { exerciseName: "Leg Press (warm-up)", sets: 2, reps: "12, 8", tempo: "2-0-1", restSeconds: 60, targetRPE: "3-4", cues: "1×12 lightest load, 1×8 at ~50% working weight.", supersetGroup: null, exerciseType: "WARMUP" },
  { exerciseName: "Leg Press (quad focus)", sets: 3, reps: "1×10 (top), 2×12 (back-off)", tempo: "3-1-1", restSeconds: 120, targetRPE: "Top: 8, Back-offs: 7", cues: "Entire back flat on pad — never rounds. Feet centered, shoulder-width. Lower to ~90° knee bend (not deeper if back lifts). Press through whole foot.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Seated Calf Raise Machine", sets: 3, reps: "15", tempo: "2-2-1", restSeconds: 60, targetRPE: "7", cues: "Balls of feet on plate, knees under pad. Full ROM — heels drop low, then drive up and hold 2 sec at top.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Leg Extension", sets: 3, reps: "12", tempo: "3-1-2", restSeconds: 60, targetRPE: "7", cues: "Knee joint aligns with machine pivot. Ankle pad on lower shin. Full extension with quad squeeze 1 sec at top. 3-sec eccentric is where the work lives.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Hip Adduction Machine", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 45, targetRPE: "6-7", cues: "Back against pad. Comfortable starting width (don't force max). Squeeze together, 1-sec hold, slow return.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Leg Press (glute emphasis)", sets: 3, reps: "12", tempo: "3-1-1", restSeconds: 90, targetRPE: "7", cues: "Feet HIGH on platform (heels near top), WIDE (wider than shoulders), toes angled out ~30°. Shifts to glutes and inner thighs.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Standing Calf Raise Machine", sets: 2, reps: "12", tempo: "3-2-1", restSeconds: 60, targetRPE: "7", cues: "Balls of feet on plate, shoulders under pads. Full ROM. At 325 lbs: Start with machine resistance only.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Leg Extension Dropset Ladder", sets: 1, reps: "4 drops to failure", tempo: "2-0-1", restSeconds: 0, targetRPE: "10", cues: "Working weight: max reps → Drop 20%: max reps (no rest) → Drop 20%: max reps → Drop 20%: max reps. Record total reps.", supersetGroup: null, exerciseType: "FINISHER" },
];

const DAY_3: ExerciseSeed[] = [
  { exerciseName: "Lat Pulldown (warm-up)", sets: 2, reps: "12, 8", tempo: "2-0-1", restSeconds: 60, targetRPE: "3-4", cues: "1×12 lightest, 1×8 at ~50% working weight.", supersetGroup: null, exerciseType: "WARMUP" },
  { exerciseName: "Lat Pulldown (wide grip)", sets: 3, reps: "1×8 (top), 2×10 (back-off)", tempo: "3-1-1", restSeconds: 90, targetRPE: "Top: 8, Back-offs: 7", cues: "Thigh pad snug. Grip wide (just outside shoulders). Pull to upper chest, elbows down and back, 1-sec lat squeeze. No momentum. Never behind neck.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Machine Shoulder Press", sets: 3, reps: "1×8 (top), 2×10 (back-off)", tempo: "3-1-1", restSeconds: 90, targetRPE: "Top: 8, Back-offs: 7", cues: "Handles start at ~ear height. Feet flat. Press to just short of lockout. Back against pad.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Close-Grip Lat Pulldown (V-bar)", sets: 3, reps: "12", tempo: "2-1-1", restSeconds: 60, targetRPE: "7", cues: "V-bar or close-grip handle. Chest up, elbows to ribcage, squeeze. More lower lat.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Dumbbell Lateral Raise", sets: 3, reps: "12", tempo: "2-1-2", restSeconds: 60, targetRPE: "7", cues: "Raise to shoulder height (not higher), lead with elbows, slight forward lean. 2-sec negative.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Rear Delt Fly Machine", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 45, targetRPE: "7", cues: "Face into pad. Drive arms back, squeeze blades, 1-sec hold. Directly combats rounded shoulders.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Cable Tricep Pushdown (rope)", sets: 3, reps: "12", tempo: "2-1-1", restSeconds: 45, targetRPE: "7", cues: "Rope at high position. Push down and split rope at bottom. Elbows pinned to sides.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "4-Min EMOM: Pulldown × 10 / Shoulder Press × 10", sets: 1, reps: "EMOM 4 min", tempo: "1-0-1", restSeconds: 0, targetRPE: "8-9", cues: "Min 1: Lat pulldown × 10 (60%). Min 2: Shoulder press × 10 (60%). Min 3: Pulldown × 10. Min 4: Shoulder press × 10.", supersetGroup: null, exerciseType: "FINISHER" },
];

const DAY_4: ExerciseSeed[] = [
  { exerciseName: "Seated Leg Curl (warm-up)", sets: 2, reps: "12, 8", tempo: "2-0-1", restSeconds: 60, targetRPE: "3-4", cues: "1×12 lightest, 1×8 at ~50% working weight.", supersetGroup: null, exerciseType: "WARMUP" },
  { exerciseName: "Seated Leg Curl", sets: 3, reps: "1×8 (top), 2×10 (back-off)", tempo: "3-1-1", restSeconds: 90, targetRPE: "Top: 8, Back-offs: 7", cues: "Knee aligns with machine pivot. Curl heels toward glutes, 1-sec squeeze, 3-sec resist on return.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Cable Pull-Through (rope)", sets: 3, reps: "12", tempo: "2-1-2", restSeconds: 90, targetRPE: "7", cues: "Face away from low cable, rope between legs. Hinge at hips, drive forward squeezing glutes. 1-sec lockout hold.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Lying Leg Curl", sets: 3, reps: "10", tempo: "3-1-1", restSeconds: 60, targetRPE: "7", cues: "Face-down, ankle pad above heels. Hips stay pressed to pad.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Hip Abduction Machine", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 45, targetRPE: "7", cues: "Press knees apart, 1-sec hold at full spread, slow return. Glute medius — critical for hip stability.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Leg Press (ham/glute bias)", sets: 3, reps: "10", tempo: "3-1-1", restSeconds: 90, targetRPE: "7-8", cues: "Feet hip-width or narrower, LOW on platform. Biases glutes/hamstrings through deeper hip flexion.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Seated Calf Raise", sets: 2, reps: "15", tempo: "2-2-1", restSeconds: 60, targetRPE: "7", cues: "Full ROM, 2-sec squeeze at top.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Glute Burner Circuit (4 min)", sets: 1, reps: "AMRAP 4 min", tempo: "1-0-1", restSeconds: 0, targetRPE: "8-9", cues: "Cable pull-through × 10 (60%), Hip abduction × 15 (working weight). Rest 30 sec → Repeat. Record total rounds.", supersetGroup: null, exerciseType: "FINISHER" },
];

const DAY_5_UNUSED: ExerciseSeed[] = [
  { exerciseName: "Machine Chest Press (warm-up)", sets: 1, reps: "12", tempo: "2-0-1", restSeconds: 60, targetRPE: "3-4", cues: "1×12 at light weight.", supersetGroup: null, exerciseType: "WARMUP" },
  { exerciseName: "Machine Chest Press", sets: 3, reps: "15", tempo: "2-0-1", restSeconds: 45, targetRPE: "6-7", cues: "Lighter than Day 1. Constant tension — no lockout, no pause.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Lat Pulldown (medium grip)", sets: 3, reps: "15", tempo: "2-0-1", restSeconds: 45, targetRPE: "6-7", cues: "Smooth continuous reps. Squeeze bottom, stretch top.", supersetGroup: "A", exerciseType: "WORKING" },
  { exerciseName: "Leg Press (moderate stance)", sets: 3, reps: "15", tempo: "2-0-1", restSeconds: 60, targetRPE: "7", cues: "Lighter than Days 2/4. Blood flow and volume.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Seated Cable Row", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 45, targetRPE: "6-7", cues: "Still hold 1-sec contraction. Posture work doesn't get a day off.", supersetGroup: "B", exerciseType: "WORKING" },
  { exerciseName: "Machine Shoulder Press", sets: 3, reps: "12", tempo: "2-0-1", restSeconds: 45, targetRPE: "7", cues: "Lighter than Day 3. Controlled reps.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "Leg Curl (seated or lying)", sets: 3, reps: "15", tempo: "2-1-1", restSeconds: 45, targetRPE: "6-7", cues: "Pick seated or lying — whichever is available.", supersetGroup: "C", exerciseType: "WORKING" },
  { exerciseName: "The Circuit (5 min)", sets: 1, reps: "1 round", tempo: "2-0-1", restSeconds: 0, targetRPE: "8-9", cues: "Leg extension × 15, Cable face pull × 15, Machine chest fly × 12, Hip abduction × 15, Cable tricep pushdown × 12. Move continuously. Record total time.", supersetGroup: null, exerciseType: "FINISHER" },
];

const DAYS = [
  { dayOfWeek: 1, sessionName: "Upper A — Push/Pull Foundation", exercises: DAY_1 },
  { dayOfWeek: 2, sessionName: "Lower A — Stable Lower Body", exercises: DAY_2 },
  { dayOfWeek: 4, sessionName: "Upper B — Back/Shoulder Emphasis", exercises: DAY_3 },
  { dayOfWeek: 5, sessionName: "Lower B — Hips/Posterior Chain", exercises: DAY_4 },
];

function cuid(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c${ts}${rand}`;
}

async function main() {
  // Find user
  const { data: users, error: userErr } = await supabase
    .from("User")
    .select("id, email, supabaseUserId")
    .limit(5);

  if (userErr) {
    console.error("Error fetching users:", userErr.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error("No users found in database.");
    process.exit(1);
  }

  // Use first user
  const user = users[0];
  console.log(`Seeding workout plans for: ${user.email} (${user.id})`);

  // Delete existing plans
  const { data: existingPlans } = await supabase
    .from("WorkoutPlan")
    .select("id")
    .eq("userId", user.id);

  if (existingPlans && existingPlans.length > 0) {
    const planIds = existingPlans.map((p: any) => p.id);
    // Delete exercises first (cascade doesn't work via REST)
    await supabase
      .from("PlanExercise")
      .delete()
      .in("workoutPlanId", planIds);
    await supabase
      .from("WorkoutPlan")
      .delete()
      .eq("userId", user.id);
    console.log("Cleared existing workout plans.");
  }

  // Create plans and exercises
  for (const day of DAYS) {
    const planId = cuid();
    const { error: planErr } = await supabase.from("WorkoutPlan").insert({
      id: planId,
      userId: user.id,
      dayOfWeek: day.dayOfWeek,
      sessionName: day.sessionName,
      weekNumber: 1,
      isActive: true,
    });

    if (planErr) {
      console.error(`Error creating plan for day ${day.dayOfWeek}:`, planErr.message);
      continue;
    }

    const exercises = day.exercises.map((ex, i) => ({
      id: cuid() + i,
      workoutPlanId: planId,
      exerciseName: ex.exerciseName,
      sets: ex.sets,
      reps: ex.reps,
      tempo: ex.tempo,
      restSeconds: ex.restSeconds,
      targetRPE: ex.targetRPE,
      cues: ex.cues,
      supersetGroup: ex.supersetGroup,
      exerciseType: ex.exerciseType,
      sortOrder: i,
    }));

    const { error: exErr } = await supabase
      .from("PlanExercise")
      .insert(exercises);

    if (exErr) {
      console.error(`Error creating exercises for day ${day.dayOfWeek}:`, exErr.message);
      continue;
    }

    console.log(
      `  Day ${day.dayOfWeek}: ${day.sessionName} — ${day.exercises.length} exercises`
    );
  }

  console.log("\nDone! 4-day beginner circuit workout plans seeded successfully.");
  console.log("Mobility checklists are built into the app code (src/lib/mobility.ts) — no DB seeding needed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

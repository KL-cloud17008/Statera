export type DefaultPlanExercise = {
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

export type DefaultWorkoutDay = {
  dayOfWeek: number;
  sessionName: string;
  exercises: DefaultPlanExercise[];
};

export const DEFAULT_WORKOUT_PLAN_VERSION = "4-day-scaled-pillars-balance-v10";

export const LOWER_B_BACK_SAFE_TITLE = "Lower B — Back-Safe Machine Lower Body";

export const LOWER_B_BACK_PAIN_READINESS_NOTE =
  "Back-pain rule: use the reduced set plan if lower-back pain is present. Skip heavy work if pain increases.";

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  "Scaled restart block for a 312 lb detrained male in week 2 after months away from training.",
  "Five pillars: strength, low-intensity walking only, mobility/flexibility, supported balance, and recovery / injury prevention.",
  "Four gym strength days stay in place: Upper A, Lower A, Upper B, and Lower B.",
  "Walking to and from the gym is the only planned cardio. Do not add machine-cardio warm-ups, intervals, finishers, or extra conditioning circuits.",
  "Use machine, seated, cable, dumbbell, and supported free-weight exercises where programmed to keep setup simple and stable.",
  "Use the listed RPE targets: most working sets are RPE 5-7 with 2-4 reps in reserve. No failure training.",
  "Use double progression: when every set reaches the top of the rep range at target RPE with clean form, add the smallest available load next time.",
  "If RPE exceeds 7, form degrades, or joint pain appears, keep load the same or reduce.",
  "Weeks 1-2 may use optional 2-round mode: complete two rounds per block instead of all listed sets.",
  "Rest as listed after each pair, single-exercise block, or full circuit, not between paired exercises unless needed for safety.",
  "Session prep is non-loggable: walking to the gym is the general warm-up, then start with 1-2 easy ramp-up sets on the first programmed lift or machine before the first working circuit.",
  "Overhead pressing can return later as a progression once breathing, bracing, and shoulder tolerance improve.",
];

const PLAN_CUE_PREFIX =
  "Scaled strength block: move smoothly, stop 2-4 reps before failure, stay around RPE 5-7, and use optional 2-round mode in weeks 1-2. ";

const UPPER_A_CUE_PREFIX =
  "Supported upper-body strength block: move smoothly, stop 2-4 reps before failure, stay around RPE 5-7, and use optional 2-round mode in weeks 1-2. ";

function formSource(label: string, url: string) {
  return `Form source: ${label} (${url}).`;
}

export const DEFAULT_WORKOUT_PLAN: DefaultWorkoutDay[] = [
  {
    dayOfWeek: 1,
    sessionName: "Upper A - Free-Weight Push/Pull + Low-Stress Shoulder Circuit",
    exercises: [
      {
        exerciseName: "A1 Incline Dumbbell Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${UPPER_A_CUE_PREFIX}${formSource("Incline Dumbbell Press - Muscle & Strength", "https://www.muscleandstrength.com/exercises/incline-dumbbell-bench-press.html")} Bench around 30-45 degrees, set shoulder blades back and down, keep elbows slightly tucked, control the bottom, stop 2-4 reps before failure, do not bounce dumbbells together at the top, stop if shoulder pain or front-shoulder pinch appears, keep the transition unrushed, and rest 90-120 seconds after A2.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 One-Arm Dumbbell Row",
        sets: 3,
        reps: "8-12 per side",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${UPPER_A_CUE_PREFIX}${formSource("One-Arm Dumbbell Row - Muscle & Strength", "https://www.muscleandstrength.com/exercises/one-arm-dumbbell-row.html")} Brace hard, keep torso square, pull elbow toward hip/ribs, do not twist the body to cheat the rep, control the lowering phase, use bench support if needed, and rest 90-120 seconds after A2. If breathing is not recovered, rest longer. This is controlled strength work, not conditioning.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 2,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${UPPER_A_CUE_PREFIX}Lat pulldown plus lateral raise circuit: controlled strength practice, not conditioning. Pull handles to the upper chest, keep ribs down, do not lean far back, let shoulder blades rise on the return, control the stretch at the top, no yanking, stop before form breaks or breathing spikes too hard, and leave 2-4 reps in reserve. Progress to RPE 6-7 only when conditioning improves.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Plate Lateral Raise / Dumbbell Lateral Raise",
        sets: 2,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${UPPER_A_CUE_PREFIX}Use light plates or dumbbells, start with 5 lb plates if using imperial plates or about 2-2.5 kg per hand when logging in kg, raise to shoulder height or slightly below, keep elbows slightly bent, do not shrug, do not swing, stop before shoulder pinch, and leave 3-4 reps in reserve. Rest 2-3 minutes after B2 if needed, with a 90-second minimum. The longer rest is intentional because work capacity is currently low.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Rope Triceps Pressdown",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Pin elbows to your sides, finish without leaning over the cable, and move directly to C2.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Cable Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Keep shoulders quiet, curl without swinging, and use a load that stays smooth through the full range.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Face Pull",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Pull the rope toward eye level with elbows high, keep the neck relaxed, then rest 90-120 seconds after C3.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 2,
    sessionName: "Lower A - Machine Lower Body Foundation",
    exercises: [
      {
        exerciseName: "A1 Single-Leg Leg Press",
        sets: 3,
        reps: "8-12 per side",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Use a comfortable stance, keep the low back against the pad, move one side at a time with the knee tracking over the foot, and stop depth before the pelvis tucks. Complete as a single-exercise Block A and rest 120 seconds after each set.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Lunges / Walking Lunges",
        sets: 2,
        reps: "6-10 steps per leg",
        tempo: "controlled steps",
        restSeconds: 300,
        targetRPE: "5-6",
        cues: "Low-dose unilateral practice, not conditioning. Use bodyweight first, take controlled steps with a tall torso, and hold support if needed. Rest 3-5 minutes. Stop if feet, knees, or balance do not tolerate the movement. Use load only when stable and pain-free.",
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Leg Extension",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Lift under control, pause briefly near the top, and lower without letting the stack slam.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Lying Leg Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Keep hips heavy on the pad, curl smoothly, pause gently, and return slowly before resting after the circuit.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Wall Sit",
        sets: 1,
        reps: "10-30 sec hold; optional second set only if pain-free",
        tempo: "steady hold",
        restSeconds: 180,
        targetRPE: "4-6",
        cues: "Low-dose leg tolerance accessory, not conditioning and not a max hold. Back supported against the wall, feet flat, knees tracking over the middle toes, and start with a high wall-sit angle instead of a deep position. Breathe steadily, stop before leg shaking becomes excessive, keep pain 0-2/10 maximum, and rest 90-180 seconds before any optional second hold. Scale down with a higher wall-sit angle, a shorter hold, one set only, or skip if knees, feet, or lower back are irritated that day.",
        supersetGroup: null,
        exerciseType: "ACCESSORY",
      },
    ],
  },
  {
    dayOfWeek: 4,
    sessionName: "Upper B - Machine Back/Shoulder Emphasis",
    exercises: [
      {
        exerciseName: "A1 Incline Machine Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 90,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Set the seat so the handles track upper chest, keep the back supported, and rest 90 seconds after A2.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Seated Cable Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Sit tall with feet planted, row handles to the lower ribs, pause, and return under control before resting after the pair.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Lat Pulldown Variation",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Use a grip that feels natural, pull to the upper chest, and keep the ribs stacked over the pelvis.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Machine Lateral Raise",
        sets: 3,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Use the pads for support, raise only through a comfortable range, and keep the neck relaxed before resting after B2.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Reverse Pec Deck",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Lead with elbows, keep the chest supported, and move directly to C2.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Rope Triceps Pressdown",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Keep elbows pinned, finish with control, and avoid using bodyweight to move the stack.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Cable Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${PLAN_CUE_PREFIX}Curl smoothly without swinging, keep shoulders quiet, then rest 120 seconds after the circuit.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 5,
    sessionName: LOWER_B_BACK_SAFE_TITLE,
    exercises: [
      {
        exerciseName: "A1 Leg Press",
        sets: 3,
        reps: "8-10",
        tempo: "3-1-1",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${PLAN_CUE_PREFIX}Block A primary lower-body strength. Standard: 3 sets of 8-10 reps at RPE 5-6 with 2-3 minutes rest. Low-readiness/back-pain: 2 sets of 8-10 at RPE 5. Start lighter than expected, keep the full foot on the platform, knees track over middle toes, hips and lower back stay stable against the pad, control the lowering, and do not chase deep range if hips tuck or lower back rounds. Stop 2-4 reps before failure. Do not use as conditioning. Pain 0-2/10 is acceptable if stable; if back, hip, or knee pain rises above 3/10, reduce range/load or stop.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Seated Hamstring Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${PLAN_CUE_PREFIX}Block B knee and hamstring support. Standard: 3 sets of 10-15 reps at RPE 5-6 with 90-120 seconds rest. Low-readiness/back-pain: 2 sets of 10-12 at RPE 5. Seated Hamstring Curl is machine-supported, simple to set up, and avoids prone positioning that may be uncomfortable with lower-back pain. Keep hips heavy against the pad, curl smoothly, pause gently, return slowly, no jerking, and no lower-back arching. Stop if hamstring cramping, back pain, or nerve-like symptoms appear.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Leg Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${PLAN_CUE_PREFIX}Block B knee and hamstring support. Standard: 3 sets of 10-15 reps at RPE 5-6 with 90-120 seconds rest after B2. Low-readiness/back-pain: 2 sets of 10-12 at RPE 5. Use smooth reps with no knee snapping, pause briefly near the top without aggressive lockout, lower slowly, keep hips heavy on the pad, use a controlled comfortable range, and stop 2-4 reps before failure. Reduce load or range if front-of-knee irritation appears. Stop if knee pain rises above 3/10.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Hip Abduction Machine",
        sets: 2,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${PLAN_CUE_PREFIX}Block C hip stability. Standard: 2 sets of 12-20 reps at RPE 5-6 with 90-120 seconds rest. Low-readiness/back-pain: 1-2 sets of 12-15 at RPE 5. Focus outer hip/glute medius, keep the pelvis still, do not rock the torso, control out and back, no jerking, and do not chase load. Stop if hip, lower-back, or knee pain increases.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Upper A - Free-Weight Push/Pull + Low-Stress Shoulder Circuit",
  "Tuesday: Lower A - Machine Lower Body Foundation",
  "Wednesday: Mobility, Flexibility & Balance - 10,000 steps",
  "Thursday: Upper B - Machine Back/Shoulder Emphasis",
  "Friday: Lower B - Back-Safe Machine Lower Body",
  "Saturday: Mobility, Flexibility & Balance",
  "Sunday: Complete rest",
];

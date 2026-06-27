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

export const NEXT_WEEK_TAPER_TITLE = "Next Week 5-Day Taper Microcycle";
export const DEFAULT_WORKOUT_PLAN_VERSION = "next-week-5-day-taper-v1";

export const LOWER_A_TAPER_TITLE = "Lower A — Leg Strength Peak / Machine-Supported";
export const LOWER_B_TAPER_TITLE = "Lower B — Low-Dose Legs + Hip Stability";
export const LOWER_B_BACK_SAFE_TITLE = LOWER_B_TAPER_TITLE;

export const LOWER_B_BACK_PAIN_READINESS_NOTE =
  "Back-pain rule: pain 0-2/10 is acceptable if stable. Pain 3-4/10 means reduce range, load, stance, or duration. Pain 5/10 or higher, sharp pain, or pain shooting down the leg means stop.";

export const FOOT_LOAD_RULES = [
  "Sole/plantar pain 0-2/10: normal controlled activity allowed.",
  "Sole/plantar pain 3-4/10: reduce step load, split walking into smaller chunks, no gym walking.",
  "Sole/plantar pain 5+/10: work-only walking if unavoidable, recovery only, no gym walking, no step chasing.",
  "Sharp pain, limping, swelling, warmth, numbness, or tingling: stop loading and seek medical evaluation.",
  "If work steps exceed 10,000 or sole pain is at least 5/10, Required Foot-Flare Recovery applies.",
] as const;

export const BACK_PAIN_RULES = [
  "Pain 0-2/10 acceptable if stable.",
  "Pain 3-4/10: reduce range, load, stance, or duration.",
  "Pain 5/10 or higher: stop the exercise.",
  "Sharp pain: stop immediately.",
  "Pain shooting down the leg: stop lower-body loading.",
  "Numbness, tingling, weakness, limping, bowel/bladder changes, fever, or trauma-related pain: stop training and seek medical evaluation.",
  "If lower-back pain worsens during Leg Press or Back Hyperextension, stop that exercise and switch to Lower Back Relief only.",
  "No loaded spinal flexion, heavy bracing, max effort, failure training, or grinding.",
] as const;

export const WEEKLY_SET_SUMMARY = [
  "Quads: Leg Press 3, Walking Lunges 2, Leg Extension 5, Single-Leg Leg Press 2 = 12 direct/primary sets.",
  "Hamstrings: Lying Leg Curl 3, Seated Hamstring Curl 2 = 5 direct sets, plus lunges/leg press assistance.",
  "Glutes/hips: Walking Lunges 2, Hip Abduction 2, Leg Press assistance = 4 direct/primary sets plus assistance.",
  "Chest: Incline Dumbbell Press 3, Machine Chest Press 2, Incline Machine Press 2 = 7 direct sets.",
  "Back/lats: One-Arm Row 3, Lat Pulldown 4, Seated Cable Row 2 = 9 direct sets.",
  "Delts/rear delts: Lateral Raise 2, Face Pull 2, Reverse Pec Deck/Face Pull 2 = 6 direct sets.",
  "Triceps: Pressdown 4 plus chest pressing assistance.",
  "Biceps: Cable Curl 4, Bicep Curl Machine 2 plus pulling assistance = 6 direct sets.",
  "Lower back: Back Hyperextension 1-2 very low-dose sets only if tolerated.",
  "Calves/feet/ankles: mobility/recovery only, no direct loaded calf raise.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  "Next week uses a 5-day taper for a 308 lb recently detrained lifter in an aggressive fat-loss phase.",
  "5 Strength / 1 Recovery / 1 Full Rest. Day 1 is the highest lower-body stress. Days 3-5 reduce volume, joint stress, and systemic fatigue.",
  "Work steps count as primary load. Foot pain controls walking volume.",
  "Training loads are logged in kg. Bodyweight remains logged in lb.",
  "No conditioning finishers, no impact work, no failure training, and no direct loaded calf raises.",
  "Walking to the gym is a general warm-up only if foot load is tolerable.",
  "Ramp-up sets stay outside the ledger: Set 1 very easy x 8-10 reps at RPE 3-4; Set 2 easy/moderate x 5-8 reps at RPE 4-5 only if needed.",
  "Required later recovery is separate same-day work and stays easy: effort 1-3/10, pain 0-2/10 maximum.",
] as const;

const GENERAL_TAPER_CUE =
  "Next-week taper: controlled reps, no grinding, no failure training, and stop with reps in reserve. Log working loads in kg. ";

const HIGH_LOAD_CUE =
  "Work steps count as primary load. Gym walking is removed if sole pain is 5+/10 or if work steps are already high. ";

export const DEFAULT_WORKOUT_PLAN: DefaultWorkoutDay[] = [
  {
    dayOfWeek: 1,
    sessionName: LOWER_A_TAPER_TITLE,
    exercises: [
      {
        exerciseName: "A1 Leg Press",
        sets: 3,
        reps: "8-10",
        tempo: "3-1-1",
        restSeconds: 180,
        targetRPE: "6-7",
        cues: `${GENERAL_TAPER_CUE}${HIGH_LOAD_CUE}Straight sets only. Start lighter than expected, full foot on platform, knees track over middle toes, hips and lower back stay stable against the pad, control the lowering, do not chase deep range if hips tuck or lower back rounds, stop 2-4 reps before failure, and do not use as conditioning. Pain 0-2/10 acceptable if stable. If back, hip, knee, or foot pain rises above 3/10, reduce range/load or stop.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Walking Lunges / Stationary Lunges",
        sets: 2,
        reps: "6-10 steps per leg walking or 8-10 reps per leg stationary",
        tempo: "controlled steps",
        restSeconds: 300,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Bodyweight first; add kg-loaded dumbbells only later if stable. This is not conditioning. Take long rest, keep a tall torso, use controlled steps, let the knee track over middle toes, use support if needed, avoid rushing, and stop if feet, knees, balance, or lower back do not tolerate it. Skip or switch to stationary supported lunges if sole pain, knee pain, balance loss, or lower-back irritation appears.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Lying Leg Curl",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${GENERAL_TAPER_CUE}Hips stay heavy on the pad, curl smoothly, pause gently, return slowly, no jerking, and no lower-back arching. Stop if hamstring cramping, back pain, or nerve-like symptoms appear.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Leg Extension",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${GENERAL_TAPER_CUE}Smooth reps, no knee snapping, brief pause near top without aggressive lockout, lower slowly, hips stay heavy on pad, and use controlled comfortable range. Reduce load/range for front-of-knee irritation. Stop if knee pain rises above 3/10.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 2,
    sessionName: "Upper A — Push/Pull Strength",
    exercises: [
      {
        exerciseName: "A1 Incline Dumbbell Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${GENERAL_TAPER_CUE}Bench 30-45 degrees, shoulder blades back/down, elbows slightly tucked, control bottom, no bounce, stop before shoulder pinch. Rest 90-120 seconds after A2 if paired.`,
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
        cues: `${GENERAL_TAPER_CUE}Brace hard, torso square, pull elbow toward hip/ribs, and do not twist to cheat.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 2,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Pull handles to upper chest, ribs down, do not lean far back, shoulder blades rise on return, no yanking. Rest 90-120 seconds after B2.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Plate Lateral Raise / Dumbbell Lateral Raise",
        sets: 2,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Use light plates/dumbbells, raise to shoulder height or slightly below, elbows slightly bent, no shrugging, no swinging, and stop before shoulder pinch.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Rope Triceps Pressdown",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${GENERAL_TAPER_CUE}Elbows pinned, finish with control, avoid leaning over cable.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Cable Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${GENERAL_TAPER_CUE}No swinging, shoulders quiet, smooth full-range curl.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Face Pull",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Pull toward eye level, elbows high, neck relaxed.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 3,
    sessionName: "Posterior Chain + Upper Recovery Strength",
    exercises: [
      {
        exerciseName: "A1 Seated Cable Row",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "5",
        cues: `${GENERAL_TAPER_CUE}Tall posture, feet planted, row to lower ribs, pause, return under control, no body swing.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Machine Chest Press or Incline Machine Press",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "5",
        cues: `${GENERAL_TAPER_CUE}Back supported, controlled range, no shoulder pinch, stop well before fatigue.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Rope Triceps Pressdown",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Elbows pinned, smooth finish, no bodyweight lean.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Cable Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Shoulders quiet, no swinging, stop before fatigue.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Back Hyperextension / Back Extension Machine",
        sets: 1,
        reps: "8-10; optional second set only if tolerated",
        tempo: "slow controlled",
        restSeconds: 120,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Bodyweight only or minimum machine load. Short comfortable range, move slowly, neutral neck, no swinging, no aggressive arching, stop well before fatigue, and treat as movement practice not strength work. Skip if lower-back pain is active. Stop immediately if back pain increases, pain shoots down the leg, numbness, tingling, weakness, or nerve-like symptoms appear.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 4,
    sessionName: LOWER_B_TAPER_TITLE,
    exercises: [
      {
        exerciseName: "A1 Single-Leg Leg Press",
        sets: 2,
        reps: "8-10 per leg",
        tempo: "3-1-1",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Straight sets only. One leg at a time, start light, full foot on platform, knee tracks over middle toes, do not let hips twist, controlled lowering, and stop before knee, hip, back, or foot irritation.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Seated Hamstring Curl",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Smooth curl, hips heavy, no jerking, no lower-back arching.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Leg Extension",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${GENERAL_TAPER_CUE}Controlled reps, no snapping, comfortable range. Rest 90-120 seconds after B2.`,
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
        cues: `${GENERAL_TAPER_CUE}Outer hip/glute medius focus, pelvis still, do not rock torso, control out and back, no jerking, and do not chase load. Stop if hip, lower-back, knee, or foot pain increases.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 5,
    sessionName: "Training Reset — Machine Upper + Arms",
    exercises: [
      {
        exerciseName: "A1 Lat Pulldown Variation",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Controlled pull, ribs down, no yanking, smooth return.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Incline Machine Press",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Back supported, comfortable range, no grinding.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Reverse Pec Deck or Face Pull",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Neck relaxed, shoulder blades move smoothly, no swinging.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Bicep Curl Machine",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Upper arms supported, smooth curl, no swinging, stop well before fatigue.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Lower A - Leg Strength Peak / Machine-Supported",
  "Tuesday: Upper A - Push/Pull Strength",
  "Wednesday: Posterior Chain + Upper Recovery Strength",
  "Thursday: Lower B - Low-Dose Legs + Hip Stability",
  "Friday: Training Reset - Machine Upper + Arms",
  "Saturday: Mobility, Flexibility & Balance - Recovery Protocol",
  "Sunday: Complete rest",
] as const;

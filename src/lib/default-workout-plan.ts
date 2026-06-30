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

export const NEXT_WEEK_TAPER_TITLE = "Adjusted Current Week Taper Microcycle";
export const DEFAULT_WORKOUT_PLAN_VERSION = "adjusted-current-week-taper-v2";

export const ADJUSTED_WEEK_HEADER_COPY =
  "Adjusted current week. Monday lower body was completed. Tuesday is a recovery override. Wednesday through Friday carry the remaining training work. Saturday and Sunday are full rest.";

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
  "If lower-back pain worsens during lower-body loading, stop that exercise and switch to recovery-only work.",
  "No loaded spinal flexion, heavy bracing, max effort, failure training, or grinding.",
] as const;

export const WEEKLY_SET_SUMMARY = [
  "Quads: Leg Press 3, Walking Lunges 2, Leg Extension 5, Single-Leg Leg Press 2 = 12 direct/primary sets.",
  "Hamstrings: Lying Leg Curl 3, Seated Hamstring Curl 2 = 5 direct sets, plus lunges/leg press assistance.",
  "Glutes/hips: Walking Lunges 2, Hip Abduction 2, Leg Press assistance = 4 direct/primary sets plus assistance.",
  "Chest: Incline Dumbbell Press 3, Incline Machine Press 2 = 5 direct sets.",
  "Back/lats: One-Arm Row 3, Lat Pulldown 4, Seated Cable Row 2 = 9 direct sets.",
  "Delts/rear delts: Lateral Raise 2, Face Pull 2, Reverse Pec Deck/Face Pull 2 = 6 direct sets.",
  "Triceps: Pressdown 2 plus 1-2 optional reset sets and chest pressing assistance.",
  "Biceps: Cable Curl 2, Bicep Curl Machine 2 plus pulling assistance = 4 direct sets.",
  "Calves/feet/ankles: mobility/recovery only, no direct loaded calf raise.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  ADJUSTED_WEEK_HEADER_COPY,
  "4 Strength / 1 Recovery / 2 Full Rest. Monday lower body stays completed, Tuesday is recovery-only, and Wednesday through Friday carry the remaining training work.",
  "Work steps count as primary load. Foot pain controls walking volume.",
  "Training loads are logged in kg. Bodyweight remains logged in lb.",
  "No treadmill warm-ups, no bike warm-ups, no running, no jumping, no HIIT, no conditioning finishers, no failure training, and no direct loaded calf raises.",
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
    dayOfWeek: 3,
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
    sessionName: "Upper B — Machine Upper + Arms / Training Reset",
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
        exerciseName: "B1 Seated Cable Row",
        sets: 2,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Tall posture, feet planted, row to lower ribs, pause, return under control.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Reverse Pec Deck or Face Pull",
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
      {
        exerciseName: "C2 Optional Rope Triceps Pressdown",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `${GENERAL_TAPER_CUE}Only if fresh. Skip if elbows, shoulders, or general fatigue are elevated.`,
        supersetGroup: "C",
        exerciseType: "ACCESSORY",
      },
    ],
  },
];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Completed - Lower A",
  "Tuesday: Recovery Override / No Gym",
  "Wednesday: Upper A - Push/Pull Strength",
  "Thursday: Lower B - Low-Dose Legs + Hip Stability",
  "Friday: Upper B - Machine Upper + Arms / Training Reset",
  "Saturday: Complete Rest",
  "Sunday: Complete Rest",
] as const;

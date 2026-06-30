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

export const NEXT_WEEK_TAPER_TITLE = "Adjusted Current Week Progressive Overload Block";
export const DEFAULT_WORKOUT_PLAN_VERSION = "adjusted-current-week-overload-v3";

export const ADJUSTED_WEEK_HEADER_COPY =
  "Adjusted current week. Monday lower body was completed. Tuesday was taken off. Wednesday through Friday now use a higher-volume progressive-overload block because food intake and home recovery are available. Saturday and Sunday are reserved for recovery.";

export const LOWER_A_TAPER_TITLE = "Lower A — Leg Strength Peak / Machine-Supported";
export const LOWER_B_TAPER_TITLE = "Lower B — Progressive Lower Body + Hip Stability";
export const LOWER_B_BACK_SAFE_TITLE = LOWER_B_TAPER_TITLE;

export const LOWER_B_BACK_PAIN_READINESS_NOTE =
  "Back-pain rule: pain 0-2/10 is acceptable if stable. Pain 3-4/10 means reduce range, load, stance, or duration. Pain 5/10 or higher, sharp pain, or pain shooting down the leg means stop.";

export const PROGRESSIVE_OVERLOAD_RULES = [
  "Week 3 target: controlled overload, not max effort.",
  "Main lifts: use the top of the rep range before increasing load.",
  "Increase load only when all working sets hit the target reps at the assigned RPE with clean form.",
  "Smallest available kg jump preferred.",
  "Stay 2-3 reps in reserve on main work.",
  "Accessories may stay 1-3 reps in reserve.",
  "No failure training.",
  "If form breaks, keep load the same next session.",
  "If pain rises above 3/10, reduce range/load or stop.",
] as const;

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
  "No loaded spinal flexion.",
  "No heavy bracing.",
  "No max effort.",
  "No failure training.",
] as const;

export const WEEKLY_SET_SUMMARY = [
  "Quads: Monday completed lower session plus Thursday Single-Leg Leg Press 3, Leg Extension 3, Lunges 2, Friday Leg Extension 3 = strong quad exposure.",
  "Hamstrings: Thursday Lying Leg Curl 3, Friday Seated Hamstring Curl 3 plus Monday completed work.",
  "Glutes/hips: Thursday Hip Abduction 3, Lunges 2, Leg Press assistance.",
  "Chest: Wednesday Incline Dumbbell Press 4, Friday Incline Machine Press 3.",
  "Back/lats: Wednesday Row 4, Pulldown 3, Friday Row 3, Pulldown 3.",
  "Side delts: Wednesday Lateral Raise 3, Friday Lateral Raise 3.",
  "Rear delts/upper back: Wednesday Face Pull 3, Friday Reverse Pec Deck/Face Pull 3.",
  "Triceps: Wednesday Pressdown 3, Friday Pressdown 3 plus pressing assistance.",
  "Biceps: Wednesday Cable Curl 3, Friday Bicep Curl Machine 3 plus pulling assistance.",
  "Feet/ankles/calves: mobility/recovery only, no direct loaded calf raises.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  ADJUSTED_WEEK_HEADER_COPY,
  "4 Strength / 1 Recovery / 2 Full Rest.",
  "Work steps count as primary load. Foot pain controls walking volume.",
  "Training loads are logged in kg. Bodyweight remains logged in lb.",
  "No treadmill warm-ups, no bike warm-ups, no running, no jumping, no HIIT, no conditioning finishers, no failure training, and no direct loaded calf raises.",
  "Walking to the gym is a general warm-up only if foot load is tolerable.",
  "Ramp-up sets stay outside the ledger: Set 1 very easy x 8-10 reps at RPE 3-4; Set 2 easy/moderate x 5-8 reps at RPE 4-5 only if needed.",
  "Required later recovery is separate same-day work and stays easy: effort 1-3/10, pain 0-2/10 maximum.",
  ...PROGRESSIVE_OVERLOAD_RULES,
] as const;

const WEEK3_MAIN_CUE =
  "Week 3 controlled overload, not max effort. Stay 2-3 reps in reserve. Add reps before load. ";

const WEEK3_ACCESSORY_CUE =
  "Week 3 controlled overload. Keep 1-3 reps in reserve, no failure, and add reps before load. ";

const PAIN_CONTROL_CUE =
  "If form breaks, keep load the same next time. If pain rises above 3/10, reduce range/load or stop. ";

const HIGH_LOAD_CUE =
  "Work steps count as primary load. Gym walking is removed if sole pain is 5+/10 or if work steps are already high. ";

const CONTROLLED_CIRCUIT_CUE =
  "Circuit-style strength work, not cardio punishment. Rest until breathing recovers; do not chase breathlessness. ";

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
        cues: `${WEEK3_MAIN_CUE}${HIGH_LOAD_CUE}Straight sets only. Start lighter than expected, full foot on platform, knees track over middle toes, hips and lower back stay stable against the pad, control the lowering, do not chase deep range if hips tuck or lower back rounds, and do not use as conditioning. ${PAIN_CONTROL_CUE}`,
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
        cues: `${WEEK3_MAIN_CUE}Bodyweight first; add kg-loaded dumbbells only later if stable. This is not conditioning. Take long rest, keep a tall torso, use controlled steps, let the knee track over middle toes, use support if needed, avoid rushing, and stop if feet, knees, balance, or lower back do not tolerate it. ${PAIN_CONTROL_CUE}`,
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
        cues: `${WEEK3_ACCESSORY_CUE}Hips stay heavy on the pad, curl smoothly, pause gently, return slowly, no jerking, and no lower-back arching. Stop if hamstring cramping, back pain, or nerve-like symptoms appear.`,
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
        cues: `${WEEK3_ACCESSORY_CUE}Smooth reps, no knee snapping, brief pause near top without aggressive lockout, lower slowly, hips stay heavy on pad, and use controlled comfortable range. ${PAIN_CONTROL_CUE}`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 3,
    sessionName: "Upper A — Progressive Push/Pull Circuit Strength",
    exercises: [
      {
        exerciseName: "A1 Incline Dumbbell Press",
        sets: 4,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_MAIN_CUE}Bench 30-45 degrees, shoulder blades back/down, elbows slightly tucked, control bottom, no bounce, stop before shoulder pinch. Rest after A2: 120 seconds.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 One-Arm Dumbbell Row",
        sets: 4,
        reps: "8-12 per side",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_MAIN_CUE}Brace hard, torso square, pull elbow toward hip/ribs, and do not twist to cheat.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_MAIN_CUE}Pull handles to upper chest, ribs down, do not lean far back, shoulder blades rise on return, no yanking. Rest after B2: 120 seconds.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Dumbbell / Plate Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK3_ACCESSORY_CUE}Use light plates/dumbbells, raise to shoulder height or slightly below, elbows slightly bent, no shrugging, no swinging, and stop before shoulder pinch.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Rope Triceps Pressdown",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_ACCESSORY_CUE}Elbows pinned, finish with control, avoid leaning over the cable.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Cable Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_ACCESSORY_CUE}No swinging, shoulders quiet, smooth full-range curl.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Face Pull",
        sets: 3,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK3_ACCESSORY_CUE}Pull toward eye level, elbows high, neck relaxed. Rest after C3: 120 seconds.`,
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
        sets: 3,
        reps: "8-10 per leg",
        tempo: "3-1-1",
        restSeconds: 180,
        targetRPE: "6-7",
        cues: `${WEEK3_MAIN_CUE}${HIGH_LOAD_CUE}Straight sets only. One leg at a time, start light, full foot on platform, knee tracks over middle toes, do not let hips twist, controlled lowering, and stop before knee, hip, back, or foot irritation.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Lying Leg Curl",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_ACCESSORY_CUE}Hips stay heavy on the pad, curl smoothly, pause gently, return slowly, no jerking, no lower-back arching.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Leg Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK3_ACCESSORY_CUE}Smooth reps, no knee snapping, brief pause near top without aggressive lockout, lower slowly, hips stay heavy on pad, controlled comfortable range. Rest after B2: 120 seconds.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Hip Abduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 180,
        targetRPE: "6",
        cues: `${WEEK3_ACCESSORY_CUE}Outer hip/glute medius focus, pelvis still, do not rock torso, control out and back, no jerking, and do not chase load.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Supported Stationary Lunge or Walking Lunge",
        sets: 2,
        reps: "6-8 reps per leg stationary or 6-8 steps per leg walking",
        tempo: "controlled steps",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${WEEK3_MAIN_CUE}Bodyweight first; kg load only if dumbbells are used later. Not conditioning. Use hand support if needed, knee tracks over middle toes, and do not rush. Skip lunges if sole pain, knee pain, lower-back pain, or balance loss appears. Rest after C2: 2-3 minutes.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 5,
    sessionName: "Full-Body Machine Circuit + Arms",
    exercises: [
      {
        exerciseName: "A1 Incline Machine Press",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Conservative load, back supported, comfortable range, clean reps only.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Seated Cable Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Tall posture, feet planted, row to lower ribs, pause, return under control.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A3 Leg Extension",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Smooth reps, no knee snapping, comfortable range. Rest after A3: 2 minutes.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Lat Pulldown Variation",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Controlled pull, ribs down, no yanking, smooth return.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Reverse Pec Deck or Face Pull",
        sets: 3,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Neck relaxed, shoulder blades move smoothly, no swinging.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B3 Seated Hamstring Curl",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Smooth curl, hips heavy, no jerking, no lower-back arching. Rest after B3: 2 minutes.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Bicep Curl Machine",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${CONTROLLED_CIRCUIT_CUE}Upper arms supported, smooth curl, no swinging, no failure.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Rope Triceps Pressdown",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${CONTROLLED_CIRCUIT_CUE}Elbows pinned, finish with control, avoid leaning over the cable.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Machine Lateral Raise or Dumbbell Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${CONTROLLED_CIRCUIT_CUE}Light load, raise to shoulder height or slightly below, no shrugging, no swinging. Rest after C3: 90-120 seconds.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },
];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Completed - Lower A",
  "Tuesday: Off Day / Recovery Reset",
  "Wednesday: Upper A - Progressive Push/Pull Circuit Strength",
  "Thursday: Lower B - Progressive Lower Body + Hip Stability",
  "Friday: Full-Body Machine Circuit + Arms",
  "Saturday: Recovery Rest",
  "Sunday: Complete Rest",
] as const;

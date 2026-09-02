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

export const NEXT_WEEK_TAPER_TITLE = "Next Week Progressive Overload Block";
/**
 * Standard five-day block: Monday to Friday, Saturday and Sunday full rest.
 *
 * The version is bumped off the temporary four-day mapping so sessions started
 * against it invalidate — a resumed session must not keep serving its old
 * training day, and the mobility protocol follows the session.
 *
 * v4 revamps Friday: direct loaded calf raises entered the program for the first
 * time (seated default, standing progression), shoulders gain a lateral raise
 * alongside the existing face pull, and forearms gain wrist and reverse curls.
 *
 * v5 rebuilds Friday around supersets and adds calf work to Monday and
 * Wednesday. There is no standing calf work at all — the gym has no standing
 * calf machine, so every calf slot is seated (straight-leg gastrocnemius or
 * bent-leg soleus) and every slot carries a fallback because the bent-leg
 * machine has been unreliable. Friday D1 reintroduces overhead pressing, which
 * remains gated by the lower-back rule.
 *
 * v7 makes the next-week program details explicit: Monday uses a light lying
 * curl primer before lunges and pendulum squat, Tuesday leads with incline
 * pressing and a machine row before the dual pulldown block, Wednesday and
 * Thursday remain unchanged, and Friday becomes a lower-fatigue Upper C with
 * chest isolation, supported pulling, arms, rear-delts/scapular work, and core.
 */
export const DEFAULT_WORKOUT_PLAN_VERSION = "five-day-mon-fri-v7";

export const ADJUSTED_WEEK_HEADER_COPY =
  "Five training days with balanced chest, back, legs, hips, arms, and trunk stability. Progress by clean reps before load. Walking to the gym is acceptable while foot pain stays manageable and settles with rest.";

export const LOWER_A_TAPER_TITLE = "Lower A — Hamstring Primer → Lunges → Pendulum Squat Strength";
export const UPPER_A_TITLE = "Upper A — Incline Chest + Row / Dual Pulldown + Rear Delts";
export const LOWER_B_TAPER_TITLE = "Lower B — Split Squat + Hamstrings / Hips + Core";
export const UPPER_B_TITLE = "Upper B — Machine Chest + Dual Pulldown / Arms";
export const UPPER_ACCESSORY_TITLE = "Upper C — Chest Isolation + Upper Back / Arms + Core";
export const LOWER_B_BACK_SAFE_TITLE = LOWER_B_TAPER_TITLE;
export const FULL_BODY_CIRCUIT_TITLE = UPPER_ACCESSORY_TITLE;

/**
 * Overhead pressing of any kind is removed while lower-back pain is 3/10 or
 * higher. Matches every overhead press variant in the template (dumbbell,
 * machine shoulder press, seated machine shoulder press) so the lower-back
 * gating cannot miss one.
 *
 * Deliberately matches the two-word movement phrases "overhead press" and
 * "shoulder press" — NOT the bare fragment "overhead". Widening this to
 * /overhead/ would wrongly gate "Overhead Cable Triceps Extension", which is
 * elbow-extension accessory work, not overhead pressing, and must stay in the
 * session while lower-back pain is elevated.
 */
export function isOverheadPressExercise(exerciseName: string) {
  return /overhead press|shoulder press/i.test(exerciseName);
}

export const LOWER_B_BACK_PAIN_READINESS_NOTE =
  "Lower-back rule: if lower back rises above 3/10, remove back hyperextensions and overhead press first. Pain 5/10 or higher means stop that movement.";

export const PROGRESSIVE_OVERLOAD_RULES = [
  "Week 4 controlled progressive overload.",
  "Add reps before load.",
  "Increase load only when all sets hit the top of the rep range with clean form and assigned RPE.",
  "Stay 2-3 reps in reserve on main work.",
  "Accessories may stay 1-3 reps in reserve.",
  "No failure training.",
  "No grinding.",
  "If form breaks, keep load the same next session.",
  "If feet/ankles rise above 3/10, remove walking lunges and both calf slots (Monday E1 and Wednesday E1) first.",
  "If lower back rises above 3/10, remove back hyperextensions and overhead press first.",
  "Pain 5/10 or higher means stop that movement.",
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
  "No aggressive or heavy loaded spinal flexion.",
  "No heavy bracing.",
  "No max effort.",
  "No failure training.",
] as const;

export const WEEKLY_SET_SUMMARY = [
  "Quads: strong but controlled.",
  "Hamstrings: good.",
  "Glutes/hips: good.",
  "Hip abductors/adductors: improved.",
  "Chest: balanced between incline, mid-chest press, and fly/accessory work.",
  "Back/lats: strong.",
  "Rear delts: good.",
  "Side delts: covered through Tuesday cable lateral raises and the unchanged Wednesday work.",
  "Front delts: enough from pressing; do not add more.",
  "Triceps: good.",
  "Biceps: good — Tuesday, Thursday, and Friday carry the arm volume.",
  "Forearms/grip: receive indirect work from the weekly pulling and curling pattern without unnecessary extra isolation.",
  "Core/trunk: covered through conservative cable crunches on Wednesday and Friday.",
  "Calves/feet: two seated slots — Monday bent-leg (soleus) and Wednesday straight-leg (gastrocnemius). No standing calf work; the gym has no standing calf machine. Both are removed whenever sole/plantar pain reaches 3/10.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  ADJUSTED_WEEK_HEADER_COPY,
  "5 Strength / 0 Recovery / 2 Full Rest.",
  "Work steps count as primary load. Foot pain controls walking volume.",
  "Training loads are logged in kg. Bodyweight remains logged in lb.",
  "No treadmill warm-ups, no bike warm-ups, no running, no jumping, no HIIT, no conditioning finishers, and no failure training.",
  "Calf raise rule: two seated calf slots — Monday E1 bent-leg (soleus) and Wednesday E1 straight-leg (gastrocnemius). There is no standing calf work in this program: the gym has no standing calf machine, so no session should substitute one. Every slot carries a fallback because the bent-leg machine has been out of service. Skip both entirely if sole/plantar pain is 3/10 or higher — alongside walking lunges they are the first movements removed under the foot-load rule.",
  "Walk to gym — general warm-up only if foot load is tolerable. If foot/ankle pain rises above 3/10, use transport or reduce walking.",
  "Ramp-up sets stay outside the ledger: Set 1 very easy x 8-10 reps at RPE 3-4; Set 2 easy/moderate x 5-8 reps at RPE 4-5 only if needed.",
  "Required later recovery is separate same-day work and stays easy: effort 1-3/10, pain 0-2/10 maximum.",
  ...PROGRESSIVE_OVERLOAD_RULES,
] as const;

const WEEK4_MAIN_CUE =
  "Week 4 controlled progressive overload. Stay 2-3 reps in reserve. Add reps before load. ";

const WEEK4_ACCESSORY_CUE =
  "Week 4 controlled progressive overload. Keep 1-3 reps in reserve, no failure, and add reps before load. ";

const FOOT_WALKING_CUE =
  "Walk to gym — general warm-up only if foot load is tolerable. If foot/ankle pain rises above 3/10, use transport or reduce walking. ";

const CONTROLLED_STRENGTH_CUE =
  "Controlled strength work, not conditioning. Rest until breathing recovers; do not chase breathlessness. ";

/**
 * Used by Wednesday E1 — the straight-leg (gastrocnemius) calf
 * slot. The seated straight-leg machine is the default; the leg press calf
 * press is the fallback, because gym machines here go out of service. There is
 * no standing variant anywhere in this program.
 */
const STRAIGHT_LEG_CALF_CUE =
  "Kg load. Straight knee, gastrocnemius emphasis. Equipment alternates: the Seated Straight-Leg Calf Machine is the default; the Leg Press Calf Press is the fallback when the machine is taken or out of service — balls of the feet low on the platform and stay fully seated on it, never perched on the edge, knees soft but not locked, safety catches engaged, and a noticeably lighter load than a working leg press set. Controlled return without forcing dorsiflexion, full range without forcing the end range, no bouncing out of the bottom, no chasing load. There is no standing calf raise option in this program — the gym has no standing calf machine, so do not substitute one. Foot-load gate: skip this exercise entirely if sole or plantar pain is 3/10 or higher; alongside walking lunges it is among the first movements removed under the foot-load rule. Stop immediately on sharp pain.";

export const DEFAULT_WORKOUT_PLAN: DefaultWorkoutDay[] = [
  {
    dayOfWeek: 1,
    sessionName: LOWER_A_TAPER_TITLE,
    exercises: [
      {
        exerciseName: "A1 Lying Leg Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. This is a controlled hamstring and knee primer, not pre-exhaustion. Keep approximately 2-4 reps in reserve and do not chase fatigue. Hips stable and heavy on the pad, smooth curl, controlled eccentric, no jerking, and no lower-back arching.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Walking Lunges",
        sets: 2,
        reps: "6-10 steps per leg",
        tempo: "controlled steps",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${WEEK4_MAIN_CUE}${FOOT_WALKING_CUE}Bodyweight initially or minimal load. Controlled stride, front foot stable, knee tracks naturally, and do not rush. Use support or regress to a supported stationary split squat if necessary. If ankle or sole symptoms meaningfully worsen, reduce or skip this movement according to the existing pain logic.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Pendulum Squat",
        sets: 3,
        reps: "8-12",
        tempo: "controlled lowering",
        restSeconds: 180,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. This is the primary stable lower-body loading movement. Use controlled depth and tempo, no bouncing, and no grinding. Keep the back supported against the pad and reduce range or load if foot, ankle, knee, hip, or lower-back symptoms increase.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Leg Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Smooth reps, no knee snapping, brief pause near top without aggressive lockout, lower slowly, hips stay heavy on pad, and use a controlled comfortable range. Rest 120 seconds between sets.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D2 Hip Abduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Outer hip/glute medius focus, pelvis still, do not rock torso, control out and back, no jerking, do not chase load.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D3 Hip Adduction Machine",
        sets: 2,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Controlled inward squeeze, pelvis still, no rocking, no chasing load, stop if hip/groin/knee discomfort appears.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E1 Seated Bent-Leg Calf Raise or Seated Dumbbell Calf Raise",
        sets: 2,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Bent knee, soleus emphasis. Equipment alternates: the seated bent-leg calf machine is the default; seated dumbbell calf raises are the fallback when the machine is out of service — dumbbells across the knees, balls of the feet on a plate edge. This is Monday's deliberately lighter calf option because walking lunges already load the sole in this session. Controlled tempo, full range without forcing the end range, no bouncing, no chasing load. Stop if the thigh pad irritates the knees. There is no standing calf raise option in this program — the gym has no standing calf machine. Foot-load gate: skip this exercise entirely if sole or plantar pain is 3/10 or higher; alongside walking lunges it is among the first movements removed under the foot-load rule. Placed last so dropping it costs nothing else in the session.`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 2,
    sessionName: UPPER_A_TITLE,
    exercises: [
      {
        exerciseName: "A1 Incline Dumbbell Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. Primary progressive-overload press: add reps before load. Bench 30-45 degrees, shoulder blades back/down, elbows slightly tucked, control the bottom, no bounce, no grinding, and stop before shoulder pinch.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Machine Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. Sit tall with feet planted, row smoothly toward the ribs, pause briefly, and return under control without body swing or lumbar extension.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. First half of the paired lat block; move to B2, then rest 120 seconds. Stay 2-3 reps in reserve and add reps before load. Pull to the upper chest with ribs down, do not lean far back, do not yank, and return smoothly.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Close-Grip Lat Pulldown",
        sets: 2,
        reps: "10-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Complementary volume, not a second maximal pulldown block. Keep 2-3 reps in reserve, use a controlled tempo, pull without swinging or yanking, return smoothly, and rest 120 seconds after the pair.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Overhead Cable Triceps Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Cable anchor at mid-height so the torso stays upright; ribs down, elbows pinned, no lumbar extension, and use a controlled elbow-extension path. This is not overhead pressing and is not gated by the lower-back rule.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Reverse Cable Crossover",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Bilateral or alternating cable execution is acceptable. Rear delts lead, elbows soft, shoulder blades move smoothly, and there is no jerking, shrugging, or failure training. Move to D2, then rest 120 seconds.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D2 Cable Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Light load, raise to shoulder height or slightly below, elbows slightly bent, no shrugging or swinging, and rest 120 seconds after the pair.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E1 Cable Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 90,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Optional direct biceps work retained at modest volume: elbows stay quiet, no swinging, smooth curl and controlled return.`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 3,
    sessionName: LOWER_B_TAPER_TITLE,
    exercises: [
      {
        exerciseName: "A1 Lying Leg Curl (warm-up)",
        sets: 2,
        reps: "12-15",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: `Warm-up for the knees and hamstrings, kept deliberately light. This is not a working hamstring set — the working hamstring volume is the Seated Leg Curl later in the session. Kg load. Hips heavy on the pad, smooth curl, slow return, no jerking, and no lower-back arching. Keep 1-3 reps in reserve; no failure training.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Supported Stationary Bulgarian Split Squat",
        sets: 3,
        reps: "8-10 per leg",
        tempo: "controlled",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: `${WEEK4_MAIN_CUE}Bodyweight only. Use support as needed, controlled range, front foot flat, knee tracks over middle toes, do not chase depth, no bouncing. Pain rule: skip if sole pain, ankle pain, knee pain, hip pinch, lower-back irritation, or balance loss appears.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Seated Leg Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Smooth reps, no knee snapping, controlled comfortable range.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Seated Leg Curl",
        sets: 4,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Hips heavy, smooth curl, pause gently, slow return, no jerking. Fourth set replaces back hyperextensions to keep hamstring volume without loaded spinal extension.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Hip Adduction Machine",
        sets: 4,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Controlled inward squeeze, pelvis still, no rocking, stop if hip/groin/knee discomfort appears.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D2 Hip Abduction Machine",
        sets: 4,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Outer hip/glute medius focus, pelvis still, control out and back, no jerking.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E1 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
        sets: 2,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}${STRAIGHT_LEG_CALF_CUE}`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E2 Cable Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Light load, raise to shoulder height or slightly below, elbows slightly bent, no shrugging, no swinging.`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E3 Cable Crunch",
        sets: 2,
        reps: "10-15",
        tempo: "slow controlled flexion",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: "Light/moderate kg load. This is conservative trunk training, not max-strength spinal flexion. Use slow controlled flexion, exhale through the shortening phase, keep the hips relatively stable, and do not yank with the arms. No aggressive loaded spinal flexion. Stop for back pain, nerve-like symptoms, or any loss of control.",
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
    ],
  },
  {
    dayOfWeek: 4,
    sessionName: UPPER_B_TITLE,
    exercises: [
      {
        exerciseName: "A1 Chest Machine Press",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${CONTROLLED_STRENGTH_CUE}Kg load. Neutral/mid-chest press angle, back supported, handles track mid-chest, controlled range, no shoulder pinch, no grinding. Reason: balances repeated incline pressing with more neutral chest work.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Chest-Supported Row or Seated Cable Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${CONTROLLED_STRENGTH_CUE}Kg load. Equipment alternates: Chest-Supported Row or Seated Cable Row — use whichever is free. Tall posture, feet planted, row to lower ribs, pause, return under control, no body swing.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: `${CONTROLLED_STRENGTH_CUE}Kg load. First half of the paired lat block; move to B2, then rest 120 seconds. Stay 2-3 reps in reserve. Pull to the upper chest with ribs down, do not lean far back, do not yank, and return smoothly.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Close-Grip Lat Pulldown",
        sets: 2,
        reps: "10-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Complementary volume, not a second maximal pulldown block. Keep 2-3 reps in reserve, use a controlled tempo, pull without swinging or yanking, return smoothly, and rest 120 seconds after the pair.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Triceps Pressdown, bar",
        sets: 3,
        reps: "15-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Elbows pinned, finish with control, avoid leaning over cable.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Reverse Cable Crossover",
        sets: 3,
        reps: "15-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Rear delts, elbows soft and slightly bent, open smoothly wide, shoulder blades move under control, no jerking, no shrugging, do not chase load.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Face-Away Bayesian Cable Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Face away from the stack, elbows slightly behind the torso and pinned, tall posture with ribs down, no torso swing, controlled stretch at the bottom, smooth curl.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
    ],
  },

  {
    dayOfWeek: 5,
    sessionName: UPPER_ACCESSORY_TITLE,
    exercises: [
      {
        exerciseName: "A1 Chest-Supported Row",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Keep the chest supported, row smoothly toward the ribs, pause briefly, and return under control without body swing or lumbar loading. Seated Cable Row is the regression/alternative when a supported row is unavailable.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 High-to-Low Cable Fly",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Use a controlled high-to-low path toward the lower chest, keep the ribs and pelvis quiet, use a comfortable stretch, smooth squeeze, and no jerking or heavy loading. Rest 120 seconds after the pair.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 Cable Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Pair with B2, keep the elbows quiet, avoid torso swing, curl smoothly, and control the eccentric. Rest 90-120 seconds after the pair.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B2 Rope Triceps Pressdown",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Use the rope, keep elbows pinned, separate the rope under control, avoid leaning over the cable, and rest 90-120 seconds after the pair.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Face Pull",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Pull toward the face with elbows high but comfortable, rotate smoothly, keep the ribs controlled, and avoid yanking or shrugging. This is a different rear-delt/scapular pattern from Tuesday's Reverse Cable Crossover.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Cable Crunch",
        sets: 2,
        reps: "10-15",
        tempo: "slow controlled flexion",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: "Light/moderate kg load. Controlled trunk flexion, slow eccentric, no jerking, no maximal loading, and no grinding. Progress control, then reps, then small load increases. Keep the hips relatively stable and stop for back pain, nerve-like symptoms, or loss of control.",
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
    ],
  },


];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Lower A — Hamstring Primer → Lunges → Pendulum Squat Strength",
  "Tuesday: Upper A — Incline Chest + Row / Dual Pulldown + Rear Delts",
  "Wednesday: Lower B — Split Squat + Hamstrings / Hips + Core",
  "Thursday: Upper B — Machine Chest + Dual Pulldown / Arms",
  "Friday: Upper C — Chest Isolation + Upper Back / Arms + Core",
  "Saturday: Complete Rest",
  "Sunday: Complete Rest",
] as const;

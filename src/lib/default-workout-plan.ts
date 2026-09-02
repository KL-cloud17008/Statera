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
 * v4 revamps Friday: direct loaded calf raises enter the program for the first
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
 * v6 makes the next-week program details explicit: Monday starts with
 * bodyweight lunges before a dedicated pendulum squat, Tuesday adds a
 * two-movement pec-deck pair and complementary dual pulldowns, Wednesday uses a
 * conservative cable crunch, Thursday uses the same dual-pulldown structure,
 * and Friday drops the duplicated reverse-pec-deck slot.
 */
export const DEFAULT_WORKOUT_PLAN_VERSION = "five-day-mon-fri-v6";

export const ADJUSTED_WEEK_HEADER_COPY =
  "Five training days with balanced chest, back, legs, hips, arms, and trunk stability. Progress by clean reps before load. Walking to the gym is acceptable while foot pain stays manageable and settles with rest.";

export const LOWER_A_TAPER_TITLE = "Lower A — Lunges + Pendulum Squat / Quad-Hamstring Strength";
export const UPPER_A_TITLE = "Upper A — Incline Chest + Row / Dual Pulldown";
export const LOWER_B_TAPER_TITLE = "Lower B — Split Squat + Hamstrings / Hips + Core";
export const UPPER_B_TITLE = "Upper B — Machine Chest + Dual Pulldown / Arms";
export const UPPER_ACCESSORY_TITLE = "Friday — Chest Isolation + Row / Shoulders + Arms";
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
 * /overhead/ would wrongly gate "Overhead Cable Triceps Extension" (Tuesday C1
 * and Friday F2), which is an elbow-extension accessory, not overhead pressing,
 * and must stay in the session while lower-back pain is elevated.
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
  "If feet/ankles rise above 3/10, remove walking lunges and all three calf slots (Monday E1, Wednesday E1, Friday E1) first.",
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
  "Side delts: covered through the Tuesday curl/lateral-raise alternate plus dedicated Wednesday and Friday raises.",
  "Front delts: enough from pressing; do not add more.",
  "Triceps: good.",
  "Biceps: good — Tuesday, Thursday, and Friday carry the arm volume.",
  "Forearms/grip: covered by Friday reverse curls and wrist curls.",
  "Core/trunk: covered through conservative cable crunches on Wednesday.",
  "Calves/feet: three seated slots — Monday bent-leg (soleus), Wednesday and Friday straight-leg (gastrocnemius). No standing calf work; the gym has no standing calf machine. All three are removed whenever sole/plantar pain reaches 3/10.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  ADJUSTED_WEEK_HEADER_COPY,
  "5 Strength / 0 Recovery / 2 Full Rest.",
  "Work steps count as primary load. Foot pain controls walking volume.",
  "Training loads are logged in kg. Bodyweight remains logged in lb.",
  "No treadmill warm-ups, no bike warm-ups, no running, no jumping, no HIIT, no conditioning finishers, and no failure training.",
  "Calf raise rule (reversed from the earlier no-direct-loaded-calf-raise rule): three seated calf slots — Monday E1 bent-leg (soleus), Wednesday E1 and Friday E1 straight-leg (gastrocnemius). There is no standing calf work in this program: the gym has no standing calf machine, so no session should substitute one. Every slot carries a fallback because the bent-leg machine has been out of service. Skip all three entirely if sole/plantar pain is 3/10 or higher — alongside walking lunges they are the first movements removed under the foot-load rule.",
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
 * Shared by Wednesday E1 and Friday E1 — the straight-leg (gastrocnemius) calf
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
        exerciseName: "A1 Walking Lunges",
        sets: 2,
        reps: "6-10 steps per leg",
        tempo: "controlled steps",
        restSeconds: 180,
        targetRPE: "4-5",
        cues: `${WEEK4_MAIN_CUE}${FOOT_WALKING_CUE}Bodyweight first. Controlled strength work, not conditioning. Take long enough between sets and before the pendulum squat for breathing and balance to recover; do not rush. Tall torso, front foot flat, knee tracks over middle toes, and use support or regress to a stationary split squat if needed. Skip or regress if foot, ankle, knee, or lower-back pain increases, or if balance becomes less reliable. If sole/ankle pain reaches 3/10, stop the remaining lunge work — do not push through it.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Pendulum Squat",
        sets: 3,
        reps: "6-8",
        tempo: "controlled lowering",
        restSeconds: 180,
        targetRPE: "5-7",
        cues: `${WEEK4_MAIN_CUE}${FOOT_WALKING_CUE}Kg load. Keep 1-3 reps in reserve on every set, including the last; no failure training. Keep the back supported against the pad, descend only to the deepest comfortable position, track the knees over the middle toes, and use a controlled tempo. If foot, ankle, knee, hip, or lower-back symptoms increase, reduce load or range or regress to a supported stationary split squat.`,
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
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Hips heavy on the pad, smooth curl, pause gently, return slowly, no jerking, and no lower-back arching.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Seated Leg Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Smooth reps, no knee snapping, brief pause near top without aggressive lockout, lower slowly, hips stay heavy on pad, and use a controlled comfortable range. Rest 120 seconds between sets.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Hip Abduction Machine",
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
        exerciseName: "D2 Hip Adduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Controlled inward squeeze, pelvis still, no rocking, no chasing load, stop if hip/groin/knee discomfort appears. Rest 120 seconds after D2.`,
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
        exerciseName: "A1 Two-Arm Reverse Pec Deck",
        sets: 2,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. First half of the pec-deck pairing; move directly to A2, then rest 120 seconds. Keep 2-3 reps in reserve. Rear delts lead the motion, elbows stay soft, shoulder blades move smoothly, and there is no jerking or failure training.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "A2 Single-Arm Pec Deck",
        sets: 2,
        reps: "10-15 per arm",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Second half of the pec-deck pairing; rest 120 seconds after both arms. Keep 2-3 reps in reserve. Set the shoulder comfortably, sweep the arm across under control, pause on the chest squeeze, and avoid twisting or chasing range.`,
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
        exerciseName: "C1 Dumbbell Incline Press or Machine Incline Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. Equipment alternates: Dumbbell Incline Press or Machine Incline Press — use whichever is free. Bench 30-45 degrees, shoulder blades back/down, elbows slightly tucked, control the bottom, no bounce, and stop before shoulder pinch.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Chest-Supported Row or Seated Cable Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_MAIN_CUE}Kg load. Equipment alternates: Chest-Supported Row or Seated Cable Row — use whichever is free. Keep the chest supported if possible, row smoothly, pause near the ribs, return under control, and use no body swing. Rest 120 seconds after the pair.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Machine Shoulder Press",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Use the back support. Seated and controlled, ribs down, no excessive arching, comfortable press path, stop before shoulder pinch, no grinding. Keep it light and controlled. Removed while lower-back pain is 3/10 or higher — it returns when pain clears. Stop immediately if pain shoots down the leg or nerve-like symptoms appear.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E1 Triceps Extension Machine or Overhead Cable Triceps Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Equipment alternates: Triceps Extension Machine (downstairs) or Overhead Cable Triceps Extension (upstairs) — use whichever floor you are on. Machine: elbows pinned, finish with control, avoid leaning over the cable. Overhead cable: straight or curved bar, cable anchor set at mid-height rather than the floor so the torso stays upright; standing or staggered stance, ribs down, no lumbar extension, elbows pinned, lighter load than the machine. The overhead cable variant is elbow-extension accessory work, not overhead pressing — it is not gated by the lower-back rule.`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E2 Machine Preacher Curl or Cable Lateral Raise",
        sets: 3,
        reps: "10-15 curl / 12-20 lateral raise",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Equipment alternates: Machine Preacher Curl (downstairs) or Cable Lateral Raise (upstairs) — use whichever floor you are on. Curl: 10-15 reps, elbows supported, no swinging, smooth full range. Lateral raise: 12-20 reps, light load, shoulder height or slightly below, elbows slightly bent, no shrugging.`,
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
        exerciseName: "A1 Pec Deck or Single-Arm Cable Fly",
        sets: 3,
        reps: "12-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Use straight controlled sets with 120 seconds of rest. Controlled stretch, smooth squeeze, no shoulder pain, and do not go heavy.`,
        supersetGroup: "A",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "B1 T-Bar Chest-Supported Row or Chest-Supported Row",
        sets: 3,
        reps: "10-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Chest-supported only on both variants — an unsupported landmine T-bar is a loaded hip hinge and is not permitted under the back-pain rules. Chest stays on the pad throughout. Pause near the ribs, no body swing, smooth return.`,
        supersetGroup: "B",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C1 Dumbbell Preacher Curl or Machine Preacher Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Triple superset with C2 and C3: rounds 1 and 2 run all three, round 3 is C1 only. Rest 120 seconds after each round. Dumbbell is the default because the machine is often occupied. On either variant, stop short of full elbow extension at the bottom, elbow supported on the pad, no swinging, no dropping into the stretch.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C2 Reverse Curl",
        sets: 2,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Runs in rounds 1 and 2 of the C triple superset only. Overhand grip, elbows pinned, ribs down, no torso swing, no wrist flicking. Forearm and brachialis work, not a second biceps slot.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "C3 Cable or Dumbbell Wrist Curl",
        sets: 2,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Runs in rounds 1 and 2 of the C triple superset only. Forearms supported, wrists past the edge, slow lower, no bouncing, light load.`,
        supersetGroup: "C",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "D1 Seated Machine Shoulder Press",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Use the back support. Seated and controlled, ribs down, no excessive arching, comfortable press path, stop before shoulder pinch, no grinding. This is overhead pressing: removed while lower-back pain is 3/10 or higher — it returns when pain clears, the same gate as Tuesday D1. Stop immediately if pain shoots down the leg or nerve-like symptoms appear.`,
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "E1 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: `${WEEK4_ACCESSORY_CUE}${STRAIGHT_LEG_CALF_CUE}`,
        supersetGroup: "E",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "F1 Cable Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "6",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Superset with F2 — rest 120 seconds after F2. Light load, raise to shoulder height or slightly below, elbows slightly bent, no shrugging, no swinging.`,
        supersetGroup: "F",
        exerciseType: "WORKING",
      },
      {
        exerciseName: "F2 Overhead Cable Triceps Extension",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: `${WEEK4_ACCESSORY_CUE}Kg load. Second half of the F superset; rest 120 seconds after this exercise. Straight or curved bar, cable anchor set at mid-height rather than the floor so the torso stays upright, ribs down, no lumbar extension, elbows pinned. This is elbow-extension accessory work, not overhead pressing — it is not gated by the lower-back rule.`,
        supersetGroup: "F",
        exerciseType: "WORKING",
      },
    ],
  },


];

export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Lower A — Lunges + Pendulum Squat / Quad-Hamstring Strength",
  "Tuesday: Upper A — Incline Chest + Row / Dual Pulldown",
  "Wednesday: Lower B — Split Squat + Hamstrings / Hips + Core",
  "Thursday: Upper B — Machine Chest + Dual Pulldown / Arms",
  "Friday — Chest Isolation + Row / Shoulders + Arms",
  "Saturday: Complete Rest",
  "Sunday: Complete Rest",
] as const;

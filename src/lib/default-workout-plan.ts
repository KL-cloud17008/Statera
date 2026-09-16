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

export const NEXT_WEEK_TAPER_TITLE = "Revised Training Programme";
export const DEFAULT_WORKOUT_PLAN_VERSION = "five-day-mon-fri-v8";
export const ADJUSTED_WEEK_HEADER_COPY = "Five training days. Add clean reps before load. Work and commuting steps are part of total daily foot load; seated exercise still loads the feet.";
export const LOWER_A_TAPER_TITLE = "Lower A — Hamstring Primer → Lunges → Pendulum / Hamstrings + Hips";
export const UPPER_A_TITLE = "Upper A — Incline Machine Press + Row / Pulldowns + Shoulders";
export const LOWER_B_TAPER_TITLE = "Lower B — Split Squat → Calves → Pendulum / Hamstrings + Hips";
export const UPPER_B_TITLE = "Upper B — Machine Chest + Dual Pulldown / Arms";
export const UPPER_ACCESSORY_TITLE = "Upper C — Chest / Rear Delts + Shoulders / Arms";
export const LOWER_B_BACK_PAIN_READINESS_NOTE = "Lower-back rule: remove overhead pressing at 3/10 or higher. Omit back extensions if they provoke symptoms. Above 3/10 or increasing pain: reduce load, range or pace; stop for sharp pain, limping, swelling, warmth, numbness, tingling, weakness, persistent worsening or new/worsening rest/night pain.";
export const LOWER_B_BACK_SAFE_TITLE = LOWER_B_TAPER_TITLE;
export const FULL_BODY_CIRCUIT_TITLE = UPPER_ACCESSORY_TITLE;
export function isOverheadPressExercise(exerciseName: string) { return /overhead press|shoulder press/i.test(exerciseName); }
export const PROGRESSIVE_OVERLOAD_RULES = [
  "Add clean reps before load.",
  "Increase load only when all sets reach the top of the rep range with clean form and assigned RPE.",
  "RPE 7 is approximately three clean repetitions in reserve. No failure or grinding.",
  "Working curls: Monday 2 introductory / 3 target; Wednesday 3 introductory / 4 target. Confirm tolerable recovery, normal gait and stable performance before enabling optional final sets. No calendar-based increase.",
  "Protected lower-body work: rest approximately 2-3 minutes. Working curls: 90-120 seconds.",
  "Supersets: quick safe transition, then enough recovery to retain control; do not chase breathlessness."
] as const;
export const FOOT_LOAD_RULES = [
  "Pain 0-2/10: acceptable only if stable.",
  "Pain 3/10: continue only if stable, gait/form normal and symptoms settle, subject to the stricter calf rule.",
  "Above 3/10 or increasing: reduce load, range or pace.",
  "Stop for sharp pain, limping, swelling, warmth, numbness, tingling, weakness, persistent worsening or new/worsening rest/night pain.",
  "Protected exercise preferences do not override stopping rules.",
  "Numbness, tingling, weakness, bowel/bladder changes, fever, or trauma-related pain: stop training and seek medical evaluation.",
  "Calves: skip at sole/plantar pain 3/10 or higher, increasing pain, or symptoms worse afterwards or the following morning. One set per lower day, no automatic increase.",
  "No standing calf substitution. Slow reps, no bouncing or forced end-range stretch. Seated calf work still loads the foot.",
  "Use the fastest pace that keeps gait normal and sole discomfort mild. Speed is optional; tolerable volume matters more."
] as const;
export const BACK_PAIN_RULES = [
  "Pain 0-2/10: acceptable only if stable.",
  "Pain 3/10: continue only if stable, gait/form normal and symptoms settle, subject to the stricter calf rule.",
  "Above 3/10 or increasing: reduce load, range or pace.",
  "Stop for sharp pain, limping, swelling, warmth, numbness, tingling, weakness, persistent worsening or new/worsening rest/night pain.",
  "Protected exercise preferences do not override stopping rules.",
  "Numbness, tingling, weakness, bowel/bladder changes, fever, or trauma-related pain: stop training and seek medical evaluation.",
  "No aggressive loaded spinal flexion, heavy bracing, max effort or failure training."
] as const;
export const WEEKLY_SET_SUMMARY = [
  "Quads: exactly 15 weekly sets.",
  "Working hamstring curls: 5 introductory / 7 target; Monday primer and Wednesday warm-up are separate preparation.",
  "Hips: three rounds of abduction/adduction each lower day.",
  "Chest, back/lats, rear delts and arms: supported work across upper days.",
  "Side delts: seated dumbbell lateral raises Friday; front delts also receive pressing.",
  "Calves: one conditional seated straight-leg slot per lower day.",
  "Home abs twice weekly: pair one existing movement with dead bugs and a comfortable side-plank variation, replacing overlapping work rather than adding to all four exercises."
] as const;
export const DEFAULT_WORKOUT_PLAN_NOTES = [
  "Five training days. Add clean reps before load. Work and commuting steps are part of total daily foot load; seated exercise still loads the feet.",
  "5 Strength / 0 Recovery / 2 Full Rest.",
  "Training loads in kg; bodyweight remains canonical in lb.",
  "No treadmill or bike warm-up requirement, running, jumping, HIIT, conditioning finishers, failure or grinding.",
  "No conventional deadlifts, barbell squats, barbell bench press or aggressive loaded spinal flexion.",
  "Wednesday warm-up: lying leg curl, 1-2 easy sets of 12-15; not working hamstring sets."
] as const;
export const DEFAULT_WEEKLY_RHYTHM = [
  "Monday: Lower A — Hamstring Primer → Lunges → Pendulum / Hamstrings + Hips",
  "Tuesday: Upper A — Incline Machine Press + Row / Pulldowns + Shoulders",
  "Wednesday: Lower B — Split Squat → Calves → Pendulum / Hamstrings + Hips",
  "Thursday: Upper B — Machine Chest + Dual Pulldown / Arms",
  "Friday: Upper C — Chest / Rear Delts + Shoulders / Arms",
  "Saturday: Complete Rest",
  "Sunday: Complete Rest"
] as const;

export const DEFAULT_WORKOUT_PLAN: DefaultWorkoutDay[] = [
  {
    dayOfWeek: 1,
    sessionName: "Lower A — Hamstring Primer → Lunges → Pendulum / Hamstrings + Hips",
    exercises: [
      {
        exerciseName: "A1 Lying Leg Curl — Easy Primer",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Keep lying, not seated. Preparation, not pre-exhaustion. Hips heavy on pad, smooth curl, controlled return, no jerking or lower-back arching.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B1 Walking Lunges",
        sets: 2,
        reps: "6-10 steps per leg",
        tempo: "controlled steps",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Walk to gym — general warm-up only if foot load is tolerable. If foot/ankle pain rises above 3/10, use transport or reduce walking. Bodyweight initially or minimal load. Controlled stride, front foot stable, knee tracks naturally, and do not rush. Use support or regress to a supported stationary split squat if necessary. If ankle or sole symptoms meaningfully worsen, reduce or skip this movement according to the existing pain logic.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B2 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
        sets: 1,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Conditional on foot tolerance. Seated Straight-Leg Calf Machine or Leg Press Calf Press is one slot. Stay fully seated, knees soft, safety catches engaged, light load. Slow reps, no bouncing or forced end-range stretch. No standing calf substitution. Seated calf work still loads the foot; it is not foot rest. Skip if sole/plantar pain is 3/10 or higher, increases, or leaves symptoms worse afterwards or the following morning. One initial set; no automatic increase.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C1 Pendulum Squat",
        sets: 3,
        reps: "8-12",
        tempo: "controlled lowering",
        restSeconds: 180,
        targetRPE: "6-7",
        cues: "Week 4 controlled progressive overload. Stay 2-3 reps in reserve. Add reps before load. Kg load. This is the primary stable lower-body loading movement. Use controlled depth and tempo, no bouncing, and no grinding. Keep the back supported against the pad and reduce range or load if foot, ankle, knee, hip, or lower-back symptoms increase.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "D1 Seated Leg Extension",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Hips heavy on pad, smooth reps, no knee snapping, controlled comfortable range.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "E1 Seated Leg Curl — Working Sets",
        sets: 3,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Introduction: 2 working sets; target: 3. Final set optional only after confirming tolerable recovery, normal gait and stable performance. No automatic weekly increase. Lying Leg Curl is the equipment alternative if seated is occupied; this working slot is distinct from the easy primer. Hips heavy, smooth curl, slow return. Rest 90-120 seconds.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "F1 Hip Abduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Pelvis still, controlled range, no rocking or jerking. Stop for hip/groin/knee discomfort. Three superset rounds; quick safe transition, then enough recovery to retain control. Do not chase breathlessness.",
        supersetGroup: "F",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "F2 Hip Adduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Pelvis still, controlled range, no rocking or jerking. Stop for hip/groin/knee discomfort. Three superset rounds; quick safe transition, then enough recovery to retain control. Do not chase breathlessness.",
        supersetGroup: "F",
        exerciseType: "WORKING"
      }
    ]
  },
  {
    dayOfWeek: 2,
    sessionName: "Upper A — Incline Machine Press + Row / Pulldowns + Shoulders",
    exercises: [
      {
        exerciseName: "A1 Incline Machine Chest Press",
        sets: 3,
        reps: "8-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Back supported, shoulder blades back/down, elbows slightly tucked, controlled bottom, no bounce or shoulder pinch. Remains first.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "A2 Seated Chest-Supported Machine Row",
        sets: 3,
        reps: "8-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Standalone. Kg load. Chest supported, feet planted, row toward ribs, pause, controlled return, no body swing or lumbar extension.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 2,
        reps: "8-12",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Neutral set 1 → close-grip set 1 → rest → neutral set 2. Ribs down, pull to upper chest, no yanking or excessive lean.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B2 Close-Grip Lat Pulldown",
        sets: 1,
        reps: "10-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Complementary volume: one set only. Controlled pull and return, no swinging. Rest 120 seconds after the pair.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C1 Seated Machine Shoulder Press",
        sets: 2,
        reps: "8-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Back supported, ribs down, no lumbar extension or heavy bracing. Remove when lower-back pain is 3/10 or higher; omit if it provokes symptoms.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "D1 Seated Machine Chest Fly",
        sets: 2,
        reps: "12-15",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Seated and supported. Kg load. Comfortable stretch, smooth squeeze, no shoulder pinch. Quick safe transition to reverse fly, then recover; do not chase breathlessness.",
        supersetGroup: "D",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "D2 Reverse Pec Deck / Seated Machine Reverse Fly",
        sets: 2,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. One exercise: Reverse Pec Deck and Seated Machine Reverse Fly are synonymous names. Chest supported, soft elbows, controlled return, no shrugging or jerking. Rest after the pair.",
        supersetGroup: "D",
        exerciseType: "WORKING"
      }
    ]
  },
  {
    dayOfWeek: 3,
    sessionName: "Lower B — Split Squat → Calves → Pendulum / Hamstrings + Hips",
    exercises: [
      {
        exerciseName: "A1 Lying Leg Curl (warm-up)",
        sets: 2,
        reps: "12-15",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. 1-2 easy warm-up sets. Keep lying. Not working hamstring volume. Hips heavy, smooth curl, slow return, no jerking or lower-back arching.",
        supersetGroup: null,
        exerciseType: "WARMUP"
      },
      {
        exerciseName: "B1 Supported Stationary Bulgarian Split Squat",
        sets: 3,
        reps: "8-10 per leg",
        tempo: "controlled",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Bodyweight only. Use support as needed, controlled range, front foot flat, knee tracks over middle toes, do not chase depth, no bouncing. Pain rule: skip if sole pain, ankle pain, knee pain, hip pinch, lower-back irritation, or balance loss appears.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B2 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
        sets: 1,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 90,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Conditional on foot tolerance. Seated Straight-Leg Calf Machine or Leg Press Calf Press is one slot. Stay fully seated, knees soft, safety catches engaged, light load. Slow reps, no bouncing or forced end-range stretch. No standing calf substitution. Seated calf work still loads the foot; it is not foot rest. Skip if sole/plantar pain is 3/10 or higher, increases, or leaves symptoms worse afterwards or the following morning. One initial set; no automatic increase.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B3 Pendulum Squat",
        sets: 3,
        reps: "8-12",
        tempo: "controlled",
        restSeconds: 180,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Back supported, controlled comfortable depth, no bouncing or grinding. Reduce range or load if symptoms increase.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C1 Seated Leg Extension",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Smooth reps, no knee snapping, controlled comfortable range. Scheduled sets remain available if equipment is busy; do not add waiting-time sets.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C2 Seated Leg Curl",
        sets: 4,
        reps: "10-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Introduction: 3 working sets; target: 4. Final set optional only after confirming tolerable recovery, normal gait and stable performance. No automatic weekly increase. Hips heavy, smooth curl, pause gently, slow return, no jerking. Rest 90-120 seconds.",
        supersetGroup: null,
        exerciseType: "WORKING"
      },
      {
        exerciseName: "D1 Hip Adduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Pelvis still, controlled range, no rocking or jerking. Stop for hip/groin/knee discomfort. Three superset rounds; quick safe transition, then enough recovery to retain control. Do not chase breathlessness.",
        supersetGroup: "D",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "D2 Hip Abduction Machine",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Pelvis still, controlled range, no rocking or jerking. Stop for hip/groin/knee discomfort. Three superset rounds; quick safe transition, then enough recovery to retain control. Do not chase breathlessness.",
        supersetGroup: "D",
        exerciseType: "WORKING"
      }
    ]
  },
  {
    dayOfWeek: 4,
    sessionName: "Upper B — Machine Chest + Dual Pulldown / Arms",
    exercises: [
      {
        exerciseName: "A1 Chest Machine Press",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Controlled strength work, not conditioning. Rest until breathing recovers; do not chase breathlessness. Kg load. Neutral/mid-chest press angle, back supported, handles track mid-chest, controlled range, no shoulder pinch, no grinding. Reason: balances repeated incline pressing with more neutral chest work.",
        supersetGroup: "A",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "A2 Chest-Supported Row or Seated Cable Row",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Controlled strength work, not conditioning. Rest until breathing recovers; do not chase breathlessness. Kg load. Equipment alternates: Chest-Supported Row or Seated Cable Row — use whichever is free. Tall posture, feet planted, row to lower ribs, pause, return under control, no body swing.",
        supersetGroup: "A",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B1 Neutral-Grip Lat Pulldown",
        sets: 3,
        reps: "8-12",
        tempo: "2-1-2",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: "Controlled strength work, not conditioning. Rest until breathing recovers; do not chase breathlessness. Kg load. First half of the paired lat block; move to B2, then rest 120 seconds. Stay 2-3 reps in reserve. Pull to the upper chest with ribs down, do not lean far back, do not yank, and return smoothly.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B2 Close-Grip Lat Pulldown",
        sets: 2,
        reps: "10-12",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Week 4 controlled progressive overload. Keep 1-3 reps in reserve, no failure, and add reps before load. Kg load. Complementary volume, not a second maximal pulldown block. Keep 2-3 reps in reserve, use a controlled tempo, pull without swinging or yanking, return smoothly, and rest 120 seconds after the pair.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C1 Triceps Pressdown, bar",
        sets: 3,
        reps: "15-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Week 4 controlled progressive overload. Keep 1-3 reps in reserve, no failure, and add reps before load. Kg load. Elbows pinned, finish with control, avoid leaning over cable.",
        supersetGroup: "C",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C2 Reverse Cable Crossover",
        sets: 3,
        reps: "15-20",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "5-6",
        cues: "Week 4 controlled progressive overload. Keep 1-3 reps in reserve, no failure, and add reps before load. Kg load. Rear delts, elbows soft and slightly bent, open smoothly wide, shoulder blades move under control, no jerking, no shrugging, do not chase load.",
        supersetGroup: "C",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C3 Face-Away Bayesian Cable Curl",
        sets: 3,
        reps: "10-15",
        tempo: "2-1-2",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Week 4 controlled progressive overload. Keep 1-3 reps in reserve, no failure, and add reps before load. Kg load. Face away from the stack, elbows slightly behind the torso and pinned, tall posture with ribs down, no torso swing, controlled stretch at the bottom, smooth curl.",
        supersetGroup: "C",
        exerciseType: "WORKING"
      }
    ]
  },
  {
    dayOfWeek: 5,
    sessionName: "Upper C — Chest / Rear Delts + Shoulders / Arms",
    exercises: [
      {
        exerciseName: "A1 Seated Machine Chest Fly",
        sets: 2,
        reps: "12-15",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Seated and supported. Kg load. Comfortable stretch, smooth squeeze, no shoulder pinch. Quick safe transition to reverse fly, then recover; do not chase breathlessness.",
        supersetGroup: "A",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "A2 Reverse Pec Deck / Seated Machine Reverse Fly",
        sets: 2,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. One exercise: Reverse Pec Deck and Seated Machine Reverse Fly are synonymous names. Chest supported, soft elbows, controlled return, no shrugging or jerking. Rest after the pair.",
        supersetGroup: "A",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B1 Back Extension — Hyperextension Bench",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "5-6",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Bodyweight initially. Controlled comfortable range. Finish aligned, without deliberately arching beyond neutral. Omit if it provokes lower-back symptoms. Two rounds of back extension → lateral raise, then lateral-raise set 3 alone.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "B2 Seated Dumbbell Lateral Raise",
        sets: 3,
        reps: "12-20",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Seated, light load, elbows soft, raise to shoulder height or below, no shrugging or swinging. Rest after each pair; third set alone.",
        supersetGroup: "B",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C1 Seated Barbell Preacher Curl",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 0,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Seated, upper arms supported, smooth curl, controlled return, no swinging. Pair where equipment permits.",
        supersetGroup: "C",
        exerciseType: "WORKING"
      },
      {
        exerciseName: "C2 Seated Triceps-Extension Machine",
        sets: 2,
        reps: "10-15",
        tempo: "controlled",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Add clean reps before load. RPE 7 is approximately three clean repetitions in reserve. No failure or grinding. Kg load. Seated and supported, elbows stable, controlled comfortable range. Alternative: securely positioned seated cable triceps extension. Two superset rounds where equipment permits.",
        supersetGroup: "C",
        exerciseType: "WORKING"
      }
    ]
  }
];

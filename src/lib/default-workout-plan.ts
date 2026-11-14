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
export const DEFAULT_WORKOUT_PLAN_VERSION = "six-day-sun-fri-v16";
export const ADJUSTED_WEEK_HEADER_COPY = "Sunday through Friday, with short Sunday and Friday sessions and Saturday off. Work and commuting steps count towards total foot load.";
export const SUNDAY_ACCESSORY_TITLE = "Sunday accessories — Farmer walks, glutes and abs";
export const LOWER_A_TAPER_TITLE = "Lower A — Walking lunges, pendulum squat and triceps";
export const UPPER_A_TITLE = "Upper A — Chest press, paired pulldowns, row and abs";
export const LOWER_B_TAPER_TITLE = "Lower B — Bulgarian split squat, pendulum squat and biceps";
export const UPPER_B_TITLE = "Upper B — Chest press, T-bar row, arms and abs";
export const UPPER_ACCESSORY_TITLE = "Upper C — Chest, rear delts, triceps and hips";
export const FRIDAY_TRICEPS_EXERCISE = "Triceps Pressdown or Overhead Extension";
export const FRIDAY_TRICEPS_VARIATIONS = [
  "Straight-bar cable pressdown",
  "Rope cable pressdown",
  "Straight-bar overhead cable extension",
] as const;
export const LOWER_B_BACK_PAIN_READINESS_NOTE = "If lower-back pain is 3/10 or higher, skip overhead presses, machine crunches and rotary torso. Stop any movement that makes symptoms worse.";
export const BACK_PAIN_STOP_RULE = "Stop for symptoms travelling down a leg, new weakness, numbness or tingling. Seek medical evaluation for new bowel or bladder changes, fever or trauma-related pain.";

export const LOWER_BODY_WARMUP = "Start with 1–2 easy lying leg curl sets of 12–15. After the working curl and hip machines, do one easy round of 4 bodyweight walking lunge steps, 4 supported Bulgarian split squats and 4 reverse lunges per leg. Begin the working lunge or split squat once your gait and balance feel steady. Use a light pendulum ramp-up set as needed.";
export const PULLDOWN_GRIP_FALLBACK = "Use a different close-grip handle. If it is unavailable, use a shoulder-width reverse grip if it feels comfortable, and note the grip for comparing future loads.";

function isOverheadPressExercise(exerciseName: string) { return /overhead press|shoulder press/i.test(exerciseName); }
export function isBackPainGatedExercise(exerciseName: string) {
  return isOverheadPressExercise(exerciseName) || /abdominal crunch machine|rotary torso machine/i.test(exerciseName);
}

export function isFootPainGatedExercise(exerciseName: string) {
  return /^(kettlebell farmer walk|seated calf raise|seated straight-leg calf machine or leg press calf press)$/i.test(
    exerciseName.trim().replace(/^[A-Z]\d+\s+/i, "")
  );
}

export const PROGRESSIVE_OVERLOAD_RULES = [
  "Add clean reps before load. Increase by the smallest increment once every set reaches the top of its range at the target effort.",
  "RPE 7 is approximately three clean repetitions in reserve. Leave room in the tank on work days.",
  "For abs, keep the same seat setting and comfortable range so logged loads are comparable. Start light for two weeks before increasing.",
  "For farmer walks, keep the 60-second duration. Build from three rounds toward five once your gait stays normal and symptoms are steady the following morning. Then make small load increases.",
  "For paired sets, leave enough rest to repeat the first movement with control. Use 150–180 seconds after pendulum and calves. Separate them if calf work affects your next squat or the equipment is busy.",
] as const;

export const FOOT_LOAD_RULES = [
  "Pain 0–2/10: acceptable only if stable.",
  "Pain 3/10: continue only if stable, gait and form stay normal, and symptoms settle, subject to the stricter calf and carry rule.",
  "Skip loaded carries and calves with sole or ankle pain at 3/10 or higher, increasing pain, altered gait, or symptoms worse afterwards or the following morning.",
  "Keep calf work seated. Use controlled reps without bouncing or forcing the bottom stretch.",
  "Stop for sharp pain, limping, swelling, warmth, numbness, tingling, weakness, or new persistent worsening or rest pain.",
] as const;

export const BACK_PAIN_RULES = [
  "Keep discomfort mild and stable. If it increases, reduce load or range, or skip that movement.",
  LOWER_B_BACK_PAIN_READINESS_NOTE,
  "Avoid forcing loaded trunk flexion or rotation. Bird dogs or knee-supported side planks are optional alternatives if comfortable.",
  BACK_PAIN_STOP_RULE,
] as const;

export const WEEKLY_SET_SUMMARY = [
  "Quads: 15 sets. Walking lunges and supported Bulgarian split squats stay in, with two pendulum and leg-extension slots.",
  "Hamstrings: 6 curl sets. Calves: up to 6 seated sets.",
  "Hips: 2 dedicated glute-drive sets plus squat and lunge work. Adduction and abduction: 5 sets each, including a light Friday set each.",
  "Chest: 11 sets. Vertical pulls: 6 sets. Supported rows: 6 sets.",
  "Side delts: 6 direct sets. Rear delts: 7 direct sets plus rows. Front delts work in the chest presses.",
  "Biceps: 5 dedicated sets. Triceps: 7 dedicated sets. Forearms and grip: 2 reverse EZ curl sets plus up to 5 farmer walks.",
  "Loaded abs: 7 machine crunch sets and 7 rotary torso sets per side. Pair them on Sunday, Tuesday and Thursday.",
] as const;

export const DEFAULT_WORKOUT_PLAN_NOTES = [
  ADJUSTED_WEEK_HEADER_COPY,
  "Training loads in kg; bodyweight remains canonical in lb.",
  "Lower days: one working lying curl set follows the warm-up. Keep it controlled so it does not limit your lunges or pendulum squat.",
  "On a busy shift day, trim an accessory before shortening rest on your main lifts.",
] as const;

export const DEFAULT_WEEKLY_RHYTHM = [
  `Sunday: ${SUNDAY_ACCESSORY_TITLE}`,
  `Monday: ${LOWER_A_TAPER_TITLE}`,
  `Tuesday: ${UPPER_A_TITLE}`,
  `Wednesday: ${LOWER_B_TAPER_TITLE}`,
  `Thursday: ${UPPER_B_TITLE}`,
  `Friday: ${UPPER_ACCESSORY_TITLE}`,
  "Saturday: Complete Rest",
] as const;

function exercise(exerciseName: string, sets: number, reps: string, restSeconds: number,
  targetRPE: string, cues: string, supersetGroup: string | null = null, exerciseType = "WORKING"): DefaultPlanExercise {
  return { exerciseName, sets, reps, tempo: "controlled", restSeconds, targetRPE, cues, supersetGroup, exerciseType };
}

const lyingCurl = exercise("Lying Leg Curl", 1, "10-15", 90, "6-7", "Ramp up with one or two easy sets first. Keep hips on the pad. Leave at least three reps in reserve and recover before the next movement.");
const hipAdduction = exercise("Hip Adduction Machine", 2, "12-20", 0, "5-6", "Start with a comfortable width. Move smoothly into abduction, then rest; keep both movements easy enough for your lunges.", "Hips");
const hipAbduction = exercise("Hip Abduction Machine", 2, "12-20", 60, "5-6", "Keep your pelvis still. Rest 60–75 seconds after each pair. Then do your bodyweight lunge warm-up.", "Hips");
const pendulum = exercise("Pendulum Squat", 3, "8-12", 0, "6-7", "Set the safeties and keep feet flat. When calves are comfortable, do a seated calf set after each squat set. If you skip calves, rest 150–180 seconds before squatting again.", "Squat and calves");
const calves = exercise("Seated Calf Raise", 3, "12-20", 165, "5-6", "Use the seated calf raise machine. Skip if sole or ankle pain is 3/10 or higher, increasing, or worse afterwards or the following morning. Keep the reps smooth, then rest 150–180 seconds before the next squat.", "Squat and calves");
const seatedCurl = exercise("Seated Leg Curl", 2, "10-15", 105, "7", "Align your knees with the pivot, keep your thighs down, and lower the weight under control.");
const legExtension = exercise("Seated Leg Extension", 2, "10-15", 90, "6-7", "Keep your hips on the pad. Lift smoothly and control the return.");
const machineCrunch = exercise("Abdominal Crunch Machine", 2, "10-15", 0, "6-7", "Set the seat to the machine placard. Curl your ribs towards your pelvis, exhale, and return slowly. Move to the rotary torso machine when ready. Skip if your lower back is 3/10 or higher or symptoms increase.", "Abs", "ACCESSORY");
const rotaryTorso = exercise("Rotary Torso Machine", 2, "10-15 per side", 75, "6", "Follow the machine placard. Use a light load and a comfortable range. Do both sides, then rest. Skip if your lower back is 3/10 or higher or twisting provokes symptoms.", "Abs", "ACCESSORY");
const cableLateralRaise = exercise("Cable Lateral Raise", 3, "12-20 per arm", 75, "7", "Raise out and slightly forward, with a steady torso. Train both arms before resting.", null, "ACCESSORY");

export const DEFAULT_WORKOUT_PLAN: DefaultWorkoutDay[] = [
  {
    dayOfWeek: 1, sessionName: LOWER_A_TAPER_TITLE,
    exercises: [
      lyingCurl,
      { ...hipAdduction, exerciseName: "F2 Hip Adduction Machine" },
      { ...hipAbduction, exerciseName: "F1 Hip Abduction Machine" },
      exercise("B1 Walking Lunges", 2, "6-10 steps per leg", 150, "6-7", "Do the bodyweight warm-up first. Use light dumbbells if your gait is normal and your foot and ankle feel steady. Stay at bodyweight or use support if needed."),
      { ...pendulum, exerciseName: "C1 Pendulum Squat" },
      calves,
      { ...seatedCurl, exerciseName: "E1 Seated Leg Curl — Working Sets" },
      { ...legExtension, exerciseName: "D1 Seated Leg Extension" },
      exercise("Triceps Pressdown, bar", 2, "10-15", 75, "7", "Keep elbows at your sides and use the same straight bar each week. This is Monday’s only arm isolation.", null, "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 2, sessionName: UPPER_A_TITLE,
    exercises: [
      exercise("A1 Machine Chest Press", 3, "8-12", 120, "6-7", "Use the flat machine for a consistent baseline. A supported incline machine can fill this slot if needed. Note the angle and track its load separately."),
      exercise("Wide-Grip Lat Pulldown", 3, "8-12", 0, "7", "Use a comfortable overhand grip slightly wider than your shoulders. Pull towards your upper chest and move into the close-grip set.", "Pulldowns"),
      exercise("B2 Close-Grip Lat Pulldown", 3, "10-12", 120, "6-7", PULLDOWN_GRIP_FALLBACK, "Pulldowns"),
      exercise("A2 Seated Chest-Supported Machine Row", 3, "8-12", 120, "7", "Keep the chest on the pad. Pull towards your ribs and return under control. Leave your wrists and elbows comfortable after the pulldowns."),
      exercise("D2 Reverse Pec Deck / Seated Machine Reverse Fly", 2, "12-20", 75, "7", "Keep your chest supported and elbows soft. Sweep out to the sides without shrugging.", null, "ACCESSORY"),
      cableLateralRaise,
      machineCrunch, rotaryTorso,
    ],
  },
  {
    dayOfWeek: 3, sessionName: LOWER_B_TAPER_TITLE,
    exercises: [
      lyingCurl,
      { ...hipAdduction, exerciseName: "D1 Hip Adduction Machine" },
      { ...hipAbduction, exerciseName: "D2 Hip Abduction Machine" },
      exercise("B1 Supported Stationary Bulgarian Split Squat", 3, "8-10 per leg", 150, "6-7", "Keep the rear support low and use a handhold. Keep the whole front foot planted. Use bodyweight within a steady range."),
      { ...pendulum, exerciseName: "B3 Pendulum Squat" },
      calves,
      { ...seatedCurl, exerciseName: "C2 Seated Leg Curl" },
      { ...legExtension, exerciseName: "C1 Seated Leg Extension" },
      exercise("E1 Seated Machine Preacher Curl", 2, "10-15", 90, "7", "Use the pad to support your upper arms. Curl and lower smoothly. This is Wednesday’s only arm isolation.", null, "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 4, sessionName: UPPER_B_TITLE,
    exercises: [
      exercise("A1 Chest Machine Press", 3, "8-12", 120, "7", "Keep your back on the pad and use a smooth range."),
      exercise("Chest-Supported T-Bar Row", 3, "8-12", 120, "7", "Set the pad so you can reach with a steady torso. Pull towards your lower ribs. A chest-supported machine row can fill this slot if needed."),
      exercise("C1 Overhead Cable Triceps Extension", 3, "12-18", 75, "7", "Use the straight-bar attachment. Keep elbows steady and use a range you can control. Use a supported or seated setup if more comfortable.", null, "ACCESSORY"),
      cableLateralRaise,
      exercise("C3 Face-Away Bayesian Cable Curl", 3, "10-15 per arm", 75, "7", "Use a light cable and stable stance. Keep the elbow slightly behind your torso without leaning back.", null, "ACCESSORY"),
      { ...machineCrunch, sets: 3 },
      { ...rotaryTorso, sets: 3 },
    ],
  },
  {
    dayOfWeek: 5, sessionName: UPPER_ACCESSORY_TITLE,
    exercises: [
      exercise("A1 Seated Machine Chest Fly", 3, "12-15", 0, "6-7", "Set a comfortable stretch. Keep the elbow angle steady. Switch to the reverse pec deck for the next half of the round.", "Pec deck"),
      exercise("A2 Reverse Pec Deck / Seated Machine Reverse Fly", 3, "12-20", 90, "7", "Face the pad, keep elbows soft, and sweep out without shrugging. Rest 90 seconds after each round.", "Pec deck"),
      exercise("High-to-Low Cable Chest Press", 2, "10-15", 105, "7", "Start with the pulleys above shoulder height. Press forwards and down towards your lower chest with a steady stance or supported bench."),
      exercise("Reverse Cable Crossover", 2, "12-20", 75, "7", "Sweep your arms out with elbows soft and torso quiet. Keep the set controlled after the reverse pec deck.", null, "ACCESSORY"),
      exercise(FRIDAY_TRICEPS_EXERCISE, 2, "10-15", 75, "7", "Choose one for both sets: straight-bar cable pressdown, rope cable pressdown, or overhead cable extension with a straight bar. Use a comfortable elbow path and log your choice.", null, "ACCESSORY"),
      exercise("Hip Adduction Machine", 1, "15-20", 0, "5-6", "Use a lighter load than on leg day and a comfortable starting width. Move smoothly into abduction.", "Light hips", "ACCESSORY"),
      exercise("Hip Abduction Machine", 1, "15-20", 60, "5-6", "Use a lighter load than on leg day. Keep your pelvis still and leave at least four reps in reserve.", "Light hips", "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 0, sessionName: SUNDAY_ACCESSORY_TITLE,
    exercises: [
      exercise("Kettlebell Farmer Walk", 5, "60 sec", 60, "6-7", "Use two matching kettlebells and log the load per hand. Walk for 60 seconds and rest 60 seconds. Start with three rounds if foot tolerance is uncertain. Skip if sole or ankle pain reaches 3/10, gait changes, or symptoms increase.", null, "TIMED"),
      exercise("Reverse EZ-Bar Curl", 2, "12-15", 75, "7", "Use an overhand grip with wrists straight and elbows beside you. Keep the load light enough to avoid wrist bending or swinging.", null, "ACCESSORY"),
      exercise("Machine Hip Thrust", 2, "10-15", 90, "6-7", "Use the glute-drive machine if available. Keep feet planted, ribs steady and finish by extending your hips. If the machine is unavailable, do a floor glute bridge and note the variation. Keep a few reps in reserve for Monday.", null, "ACCESSORY"),
      machineCrunch, rotaryTorso,
    ],
  },
];

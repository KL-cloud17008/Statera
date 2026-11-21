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
export const DEFAULT_WORKOUT_PLAN_VERSION = "six-day-sun-fri-v23";
export const ADJUSTED_WEEK_HEADER_COPY = "Sunday through Friday, with short Sunday and Friday sessions and Saturday off. Work and commuting steps count towards total foot load.";
export const SUNDAY_ACCESSORY_TITLE = "Sunday accessories — Farmer walks, glutes and abs";
export const LOWER_A_TAPER_TITLE = "Lower A — Walking lunges, pendulum squat and triceps";
export const UPPER_A_TITLE = "Upper A — Chest press, pulldowns, row and abs";
export const LOWER_B_TAPER_TITLE = "Lower B — Pendulum squat, Bulgarian split squat and biceps";
export const UPPER_B_TITLE = "Upper B — Incline chest press, T-bar row, arms and abs";
export const UPPER_ACCESSORY_TITLE = "Upper C — Chest, rear delts, triceps and hips";
export const FRIDAY_TRICEPS_EXERCISE = "Triceps Pressdown";
export const LEGACY_FRIDAY_TRICEPS_EXERCISE = "Triceps Pressdown or Overhead Extension";
export const FRIDAY_TRICEPS_VARIATIONS = [
  "Straight-bar cable pressdown",
  "Rope cable pressdown",
] as const;
export const LEGACY_FRIDAY_TRICEPS_VARIATIONS = [
  ...FRIDAY_TRICEPS_VARIATIONS,
  "Straight-bar overhead cable extension",
] as const;
export const LOWER_B_BACK_PAIN_READINESS_NOTE = "If lower-back pain is 3/10 or higher, skip overhead presses, loaded crunches, rotary torso and machine back extensions. Stop any movement that makes symptoms worse.";
export const BACK_PAIN_STOP_RULE = "Stop for symptoms travelling down a leg, new weakness, numbness or tingling. Seek medical evaluation for new bowel or bladder changes, fever or trauma-related pain.";

export const LOWER_BODY_WARMUP = "Start with 1–2 easy lying leg curl sets of 8–10. After the working curl and hip machines, do one easy round of 4 bodyweight walking lunge steps, 4 supported Bulgarian split squats and 4 reverse lunges per leg. Begin working sets once your gait and balance feel steady. Ramp up the pendulum squat with lighter sets before your working weight.";
export const PULLDOWN_GRIP_FALLBACK = "Use a different close-grip handle and a load you can control for 8–12 reps. If that handle is unavailable, use a comfortable shoulder-width reverse grip and log it in notes. On a short day, keep the wide-grip work and abs and skip this second grip if needed.";

function isOverheadPressExercise(exerciseName: string) { return /overhead press|shoulder press/i.test(exerciseName); }
export function isBackPainGatedExercise(exerciseName: string) {
  return isOverheadPressExercise(exerciseName) || /abdominal crunch machine|decline bench crunch|rotary torso machine|back extension machine/i.test(exerciseName);
}

export function isFootPainGatedExercise(exerciseName: string) {
  return /^(kettlebell farmer walk|seated calf raise|seated straight-leg calf machine(?: or leg press calf press)?)$/i.test(
    exerciseName.trim().replace(/^[A-Z]\d+\s+/i, "")
  );
}

export const PROGRESSIVE_OVERLOAD_RULES = [
  "Main lifts use 4–6 working reps with 2–3 minutes of rest. Use the smallest load increase once all sets reach 6 with at least two clean reps in reserve. For accessories, reach the top of the listed range on every set at the target effort before adding load.",
  "RPE 7 is approximately three clean repetitions in reserve. Leave room in the tank on work days.",
  "For abs, keep the same bench angle or machine seat setting and use a comfortable range. On the bench, log the plate weight in kg, or 0 kg for bodyweight.",
  "For farmer walks, keep the 60-second duration. Build from three rounds toward five once your gait stays normal and symptoms are steady the following morning. Then make small load increases.",
  "For paired sets, leave enough rest to repeat the first movement with control. On Monday, use 150–180 seconds after pendulum and calves. Separate them if calf work affects your next squat or the equipment is busy.",
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
  "Quads: 13 sets from walking lunges, supported Bulgarian split squats, pendulum squats and leg extensions.",
  "Hamstrings: 8 curl sets. Calves: up to 6 seated sets.",
  "Hips: 4 machine glute kickback sets per leg plus squat and lunge work. Adduction and abduction: 4 sets each, including a light Friday set each.",
  "Chest: 11 sets. Vertical pulls: 5 sets. Supported rows: 6 sets.",
  "Side delts: 5 direct sets. Rear delts: 5 direct sets plus rows. Front delts work in the chest presses.",
  "Biceps: 5 dedicated sets. Triceps: 7 dedicated sets. Forearms and grip: 2 reverse EZ curl sets plus up to 5 farmer walks.",
  "Loaded abs: 7 weighted decline crunch sets and 7 rotary torso sets per side. Pair them on Sunday, Tuesday and Thursday.",
  "Lower back: 7 direct back extension machine sets. Do 2 on Sunday, 2 on Tuesday and 3 on Thursday.",
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

const lyingCurl = exercise("Lying Leg Curl", 1, "8-12", 90, "6-7", "Ramp up with one or two easy sets first. Keep hips on the pad. Leave at least three reps in reserve and recover before the next movement.");
const hipAdduction = exercise("Hip Adduction Machine", 2, "8-12", 0, "5-6", "Start with a comfortable width. Move smoothly into abduction and keep both movements easy enough for the rest of the session.", "Hips");
const hipAbduction = exercise("Hip Abduction Machine", 2, "8-12", 60, "5-6", "Keep your pelvis still. Rest 60–75 seconds after each pair. Then do your bodyweight lunge warm-up.", "Hips");
const pendulum = exercise("Pendulum Squat", 3, "4-6", 0, "6-7", "Set the safeties and keep feet flat. When calves are comfortable, do a seated calf set after each squat set. If you skip calves, rest 150–180 seconds before squatting again.", "Squat and calves");
const calves = exercise("Seated Calf Raise", 3, "8-12", 165, "5-6", "Use the seated bent-knee calf raise machine. Skip if sole or ankle pain is 3/10 or higher, increasing, or worse afterwards or the following morning. Keep the reps smooth, then rest 150–180 seconds before the next squat.", "Squat and calves");
const seatedCurl = exercise("Seated Leg Curl", 3, "8-12", 105, "7", "Align your knees with the pivot, keep your thighs down, and lower the weight under control.");
const legExtension = exercise("Seated Leg Extension", 1, "8-12", 90, "6-7", "Keep your hips on the pad. Lift smoothly and control the return.");
const crunchLoadCue = "Use the same bench angle and hold the plate against your chest. Leave about two clean reps in reserve. Use a lighter plate or bodyweight if needed. Log only the plate weight in kg, then move to rotary torso. Skip if lower-back pain is 3/10 or higher or symptoms increase.";
const declineBenchCrunch = exercise(
  "Plate-Weighted Decline Bench Crunch", 2, "8-12", 0, "8",
  `Start with a 20 kg plate if you can control it. ${crunchLoadCue}`,
  "Abs", "ACCESSORY",
);
const rotaryTorso = exercise("Rotary Torso Machine", 2, "8-12 per side", 75, "6", "Follow the machine placard. Use a light load and a comfortable range. Do both sides, then rest. Skip if your lower back is 3/10 or higher or twisting provokes symptoms.", "Abs", "ACCESSORY");
const cableLateralRaise = exercise("Cable Lateral Raise", 3, "10-12 per arm", 75, "7", "Raise out and slightly forward, with a steady torso. Train both arms before resting.", null, "ACCESSORY");
const gluteKickback = exercise("Machine Glute Kickback", 2, "8-12 per leg", 75, "6-7", "Follow the machine's setup placard. Use its handles or pads for support and keep your hips square. Train both legs before resting.", null, "ACCESSORY");
const backExtension = exercise(
  "Back Extension Machine", 2, "8-12", 120, "6-7",
  "On your first session, start at the lightest machine setting or with no added plates. Use a load that leaves 3–4 clean reps in reserve and log the load in kg. Increase by one small increment once every set reaches 12 with that effort and your lower back feels normal the next day.",
  null, "ACCESSORY",
);

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
      exercise("Triceps Pressdown, bar", 2, "8-12", 75, "7", "Keep elbows at your sides and use the same straight bar each week. This is Monday’s only arm isolation.", null, "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 2, sessionName: UPPER_A_TITLE,
    exercises: [
      exercise("A1 Machine Chest Press", 3, "4-6", 120, "6-7", "Ramp up with lighter sets. Use the flat machine for a consistent baseline. A supported incline machine can fill this slot if needed. Note the angle and track its load separately."),
      exercise("Wide-Grip Lat Pulldown", 3, "4-6", 135, "7", "Use a comfortable overhand grip slightly wider than your shoulders. Pull towards your upper chest. Finish all three sets before changing grips."),
      exercise("B2 Close-Grip Lat Pulldown", 2, "8-12", 105, "6-7", PULLDOWN_GRIP_FALLBACK),
      exercise("A2 Seated Chest-Supported Machine Row", 3, "8-12", 105, "7", "Keep the chest on the pad. Pull towards your ribs and return under control. Use this session for controlled reps and save heavy rows for Thursday."),
      declineBenchCrunch, rotaryTorso,
      { ...cableLateralRaise, sets: 2 },
      exercise("D2 Reverse Pec Deck / Seated Machine Reverse Fly", 2, "8-12", 75, "7", "Keep your chest supported and elbows soft. Sweep out to the sides without shrugging. Skip these sets before cutting the ab pair on a short session.", null, "ACCESSORY"),
      backExtension,
    ],
  },
  {
    dayOfWeek: 3, sessionName: LOWER_B_TAPER_TITLE,
    exercises: [
      lyingCurl,
      { ...hipAdduction, exerciseName: "D1 Hip Adduction Machine", sets: 1 },
      { ...hipAbduction, exerciseName: "D2 Hip Abduction Machine", sets: 1 },
      exercise("B3 Pendulum Squat", 3, "4-6", 165, "6-7", "Ramp up after the bodyweight prep. Set the safeties, keep the whole foot planted and do all three sets before the split squat. Rest 150–180 seconds between sets."),
      exercise("B1 Supported Stationary Bulgarian Split Squat", 3, "8-12 per leg", 150, "6-7", "Keep the rear support low and use a handhold. Keep the whole front foot planted. Use bodyweight within a steady range."),
      { ...seatedCurl, exerciseName: "C2 Seated Leg Curl" },
      exercise("Seated Straight-Leg Calf Machine", 3, "8-12", 90, "5-6", "Use a seated straight-leg calf machine if it is available and comfortable. The seated bent-knee machine also works here. Note which machine you used. Keep reps smooth. Skip if sole or ankle pain is 3/10 or higher, increasing, or worse afterwards or the following morning."),
      { ...legExtension, exerciseName: "C1 Seated Leg Extension", cues: `${legExtension.cues} On a short day, cut this and the preacher curls before trimming the squat or the first two seated curl and calf sets. Follow the foot rule for calves.` },
      exercise("E1 Seated Machine Preacher Curl", 2, "8-12", 90, "7", "Use the pad to support your upper arms. Curl and lower smoothly. This is Wednesday’s only arm isolation. Skip it if the session is running long.", null, "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 4, sessionName: UPPER_B_TITLE,
    exercises: [
      exercise("A1 Incline Machine Chest Press", 3, "4-6", 120, "7", "Ramp up on the incline machine. Keep your back on the pad and use a smooth range. Track this load separately from Tuesday’s flat press."),
      exercise("Chest-Supported T-Bar Row", 3, "4-6", 120, "7", "Set the pad so you can reach with a steady torso. Pull towards your lower ribs. A chest-supported machine row can fill this slot if needed."),
      exercise("C1 Overhead Cable Triceps Extension", 3, "8-12", 0, "7", "Use the straight-bar attachment and keep elbows steady. Pair with Bayesian curls when nearby stations are free. If busy, use the exercise picker to finish this movement first and rest 75–90 seconds between sets.", "Arms", "ACCESSORY"),
      exercise("C3 Face-Away Bayesian Cable Curl", 3, "8-12 per arm", 75, "7", "Use a light cable and stable stance. Keep the elbow slightly behind your torso without leaning back. Do both arms before resting.", "Arms", "ACCESSORY"),
      cableLateralRaise,
      { ...declineBenchCrunch, sets: 3, cues: `Use a 25 kg plate if you have about two clean reps in reserve at the same bench angle. ${crunchLoadCue}` },
      { ...rotaryTorso, sets: 3 },
      { ...backExtension, sets: 3 },
    ],
  },
  {
    dayOfWeek: 5, sessionName: UPPER_ACCESSORY_TITLE,
    exercises: [
      exercise("A1 Seated Machine Chest Fly", 3, "8-12", 0, "6-7", "Set a comfortable stretch. Keep the elbow angle steady. Switch to the reverse pec deck for the next half of the round.", "Pec deck"),
      exercise("A2 Reverse Pec Deck / Seated Machine Reverse Fly", 3, "8-12", 90, "7", "Face the pad, keep elbows soft, and sweep out without shrugging. If the reverse pec deck is occupied, use a reverse cable crossover for these sets and log the substitution in notes. Rest 90 seconds after each round.", "Pec deck"),
      exercise("High-to-Low Cable Chest Press", 2, "8-12", 105, "7", "Start with the pulleys above shoulder height. Press forwards and down towards your lower chest with a steady stance or supported bench."),
      { ...gluteKickback, cues: `${gluteKickback.cues} Consider a third set per leg after two ordinary weeks if you consistently finish the glute work, have time, and are recovering by Monday.` },
      exercise(FRIDAY_TRICEPS_EXERCISE, 2, "8-12", 75, "7", "Choose a straight bar or rope and use it for both sets. Use a comfortable elbow path and log the attachment.", null, "ACCESSORY"),
      exercise("Hip Adduction Machine", 1, "8-12", 0, "5-6", "Use a lighter load than on leg day and a comfortable starting width. Move smoothly into abduction.", "Light hips", "ACCESSORY"),
      exercise("Hip Abduction Machine", 1, "8-12", 60, "5-6", "Use a lighter load than on leg day. Keep your pelvis still and leave at least four reps in reserve.", "Light hips", "ACCESSORY"),
    ],
  },
  {
    dayOfWeek: 0, sessionName: SUNDAY_ACCESSORY_TITLE,
    exercises: [
      exercise("Kettlebell Farmer Walk", 5, "60 sec", 60, "6-7", "Use two matching kettlebells and log the load per hand. Walk for 60 seconds and rest 60 seconds. Start with three rounds if foot tolerance is uncertain. Skip if sole or ankle pain reaches 3/10, gait changes, or symptoms increase.", null, "TIMED"),
      gluteKickback,
      declineBenchCrunch, rotaryTorso,
      exercise("Reverse EZ-Bar Curl", 2, "8-12", 75, "7", "Use an overhand grip with wrists straight and elbows beside you. Keep the load light enough to avoid wrist bending or swinging.", null, "ACCESSORY"),
      backExtension,
    ],
  },
];

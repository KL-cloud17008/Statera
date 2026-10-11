import { formatDate, toLocalDate } from "@/lib/dates";
import type { MobilityBlock, MobilityExercise } from "@/lib/mobility";

export const HOME_CORE_LOG_TYPE = "HOME_CORE";
export const HOME_CORE_VERSION = "home-core-v2";
export const HOME_CORE_DAYS = [2, 5] as const;
export const HOME_CORE_SCHEDULE = "Tuesday & Friday";
export const HOME_CORE_PURPOSE = "Build abdominal and oblique strength with leg raises, reach-ups and controlled trunk stability. Bodyweight only; keep your breathing steady and use a range your back can tolerate.";
export const HOME_CORE_SAFETY = "Keep discomfort at 0–2/10 and stable. At 3/10, shorten the movement or use the easier option. Stop for increasing or sharp pain, symptoms down a leg, numbness, tingling or weakness. New persistent worsening or rest/night pain needs medical advice.";
export const HOME_CORE_PROGRESSION = [
  "Start with one set of each movement. After two comfortable sessions with steady breathing and no worse symptoms the following day, try two sets.",
  "At two sets, add one clean repetition or five seconds to a hold. For bird dogs, add the repetition on each side. Change one thing at a time, keeping effort at 4–6/10.",
  "Build leg raises to 10 reps, reach-ups to 15, bird dogs to 8 per side and side-plank holds to 20 seconds before increasing difficulty.",
  "For leg raises, gradually straighten your knees or lower your legs farther only while your back stays steady. Add a brief pause at the top of reach-ups. Progress bird-dog leg slides to a low leg lift, then opposite arm and leg. Keep the knee-supported side plank until it is comfortably controlled.",
] as const;

export type HomeCoreDose = "intro" | "full";
export type HomeCoreWeek = {
  date: string;
  dayOfWeek: number;
  completedToday: boolean;
  completedDates: string[];
  todayDose: HomeCoreDose | null;
};

/** Home sessions follow the local calendar, independently of a resumed gym session or noon rollover. */
export function getHomeCoreCalendar(timestamp: Date, timezone?: string) {
  const date = formatDate(toLocalDate(timestamp, timezone));
  const calendarDate = new Date(`${date}T00:00:00.000Z`);
  const dayOfWeek = calendarDate.getUTCDay();
  const weekStart = new Date(calendarDate);
  weekStart.setUTCDate(weekStart.getUTCDate() - (dayOfWeek + 6) % 7);
  return { date, calendarDate, dayOfWeek, weekStart };
}

export function getHomeCoreDayLabel(dayOfWeek: number) {
  if (HOME_CORE_DAYS.some((day) => day === dayOfWeek)) return "Core day";
  return dayOfWeek < 2 || dayOfWeek > 5 ? "Next: Tuesday" : "Next: Friday";
}

export const HOME_CORE_VIDEO_REFERENCES = [
  { title: "Do THIS Everyday In 2026 For 6 PACK ABS", author: "Chris Heria", href: "https://www.youtube.com/watch?v=BElgcWsChSs" },
  { title: "6 Min 6-PACK Abs Workout For Summer 2026", author: "THENX", href: "https://www.youtube.com/watch?v=HYGGcCxbuTY" },
] as const;

export const HOME_CORE_SOURCES = [
  { title: "AAOS: bird dog and modified side plank", href: "https://www.orthoinfo.org/recovery/spine-conditioning-program/" },
  { title: "ACSM: home strength training and frequency", href: "https://acsm.org/resistance-training-guidelines-update-2026/" },
] as const;

const baseIntensity = {
  effort: "Effort: 4–6/10; keep a few clean reps or seconds in reserve",
  pain: "Discomfort: 0–2/10 and stable; stop if increasing",
  breathing: "Breathe throughout; ease off if you need to hold your breath",
  goal: "Goal: controlled trunk strength, with energy left for your gym training",
};

export function getHomeCoreBlock(dose: HomeCoreDose): MobilityBlock {
  const sets = dose === "full" ? 2 : 1;
  const setLabel = `${sets} ${sets === 1 ? "set" : "sets"}`;
  const intensity = { ...baseIntensity, effort: dose === "full" ? baseIntensity.effort : "Effort: 3–4/10 for first sessions or before the gym" };
  const exercises: MobilityExercise[] = [
    {
      id: "core-leg-raise", name: "Lying leg raise", category: "Abdominals / trunk control",
      dose: `${setLabel} of 6–10 reps`, cues: "Raise both legs slowly; lower only as far as you can keep your back steady.",
      goal: "Keep your trunk controlled against the pull of your legs as they rise and lower.",
      setup: "Lie on your back in a clear floor space, arms beside you and head resting. Start with bent knees; use straighter legs if that is already comfortable and controlled.",
      howTo: ["Gently brace, then raise both legs towards vertical without swinging or lifting your hips.", "Lower slowly over two to three seconds. Stop before your lower back arches or discomfort increases; you do not need to reach the floor.", "Raise again with control, keeping your ribs and pelvis steady.", "Rest 45–60 seconds before the next set or movement."],
      breathingCue: "Breathe out as you raise your legs; breathe in as you lower. Keep breathing without straining.",
      beginnerPointers: ["A bent-knee leg raise counts. Use the same controlled range for each rep.", "End the set while you still have a few clean reps in reserve."],
      commonMistakes: ["Swinging the legs, bouncing or allowing the back to arch.", "Forcing straight legs or lowering to the floor after control is lost."],
      scaleDown: ["Bend your knees more and shorten the lowering range.", "If raising both legs is uncomfortable, raise one bent knee at a time with the other foot resting; use 4–6 reps per side. Skip the movement if symptoms still increase."],
      progression: ["Build to 10 clean reps at two sets. Then gradually straighten the knees or increase the lowering range, changing only one thing at a time."],
      completionTarget: "Six to ten controlled reps with steady breathing and no increase in symptoms.", painRule: HOME_CORE_SAFETY, intensity,
    },
    {
      id: "core-reach-up", name: "Reach-up crunch", category: "Abdominals / controlled curl-up",
      dose: `${setLabel} of 10–15 reps`, cues: "Feet resting, arms reaching towards the ceiling; lift your shoulder blades a little and lower slowly.",
      goal: "Train a controlled abdominal curl without turning the movement into a full sit-up.",
      setup: "Lie on your back with knees bent and feet resting on the floor. Point both arms towards the ceiling and keep your neck relaxed.",
      howTo: ["Breathe out and reach upwards as you gently lift your head and shoulder blades a little from the floor.", "Keep your pelvis steady and lower back comfortable; use a small curl rather than sitting up.", "Pause briefly, then lower your shoulders and head slowly. Keep your feet resting throughout.", "Rest 45–60 seconds before the next set or movement."],
      breathingCue: "Breathe out as you reach up; breathe in as you lower.",
      beginnerPointers: ["Look upwards and keep a comfortable space between chin and chest.", "A small shoulder-blade lift counts; do not chase height with your neck."],
      commonMistakes: ["Jerking the head forward, swinging the arms or holding your breath.", "Turning each rep into a full sit-up or pushing through back discomfort."],
      scaleDown: ["Use a smaller lift or start with six to eight reps.", "If your neck tires, lightly support your head with one hand and reach with the other. Skip the movement if back or neck symptoms increase."],
      progression: ["Build to 15 controlled reps at two sets. Then add a one- to two-second pause at the top while keeping a few clean reps in reserve."],
      completionTarget: "Ten to fifteen controlled reaches with relaxed neck, steady breathing and no increase in symptoms.", painRule: HOME_CORE_SAFETY, intensity,
    },
    {
      id: "core-bird-dog-slide", name: "Bird dog — leg slide", category: "Trunk stability / back control",
      dose: `${setLabel} of 5 reps per side`, cues: "Hands and knees; slide one leg back along the floor without twisting.",
      goal: "Resist twisting and back arching while one limb moves.",
      setup: "Hands below shoulders, knees below hips. Use a folded towel under your knees if helpful; keep your neck relaxed.",
      howTo: ["Gently brace, then slide one foot back along the floor. Keep both hands and the other knee supported.", "Pause for three seconds while breathing. Keep hips level and your lower back quiet.", "Return slowly and switch legs. A short slide is enough.", "Rest 45–60 seconds between sets or before the next movement."],
      breathingCue: "Breathe normally through each three-second pause.",
      beginnerPointers: ["Start with the foot on the floor; a leg lift is a later progression.", "Keep your weight comfortable on your hands and knees."],
      commonMistakes: ["Lifting the leg high, arching the back or turning the pelvis.", "Moving arm and leg together before the leg-only version is controlled."],
      scaleDown: ["Use a shorter slide.", "If wrists or knees are uncomfortable, replace this movement with a braced bent-knee fall-out: lie on your back, feet resting, let one bent knee open slightly and return while keeping the pelvis still. Use the same reps."],
      progression: ["Build to eight reps per side. Then lift the leg just clear of the floor; add the opposite arm only once steady."],
      completionTarget: "Five controlled reps each side with a three-second pause and level hips.", painRule: HOME_CORE_SAFETY, intensity,
    },
    {
      id: "core-knee-side-plank", name: "Side plank — knees supported", category: "Obliques / side-to-side stability",
      dose: `${setLabel} of 10–15 seconds per side`, cues: "Bent knees stay down; lift your hips gently and keep breathing.",
      goal: "Build oblique strength with a shorter lever than a full side plank.",
      setup: "Lie on your side with both knees bent. Put your forearm on the floor, elbow below your shoulder; align shoulder, hip and knee.",
      howTo: ["Gently brace, press through your forearm and knees and raise your hips only as far as comfortable.", "Hold for 10–15 seconds with steady breathing; keep your neck relaxed.", "Lower slowly. Rest 20–30 seconds before changing sides, and 45–60 seconds between sets."],
      breathingCue: "Breathe throughout; end the hold before you need to strain or hold your breath.",
      beginnerPointers: ["Start at five seconds if needed. Match the easier side's hold on both sides.", "Keep your feet relaxed; your knees provide the lower support."],
      commonMistakes: ["Rolling forward, shrugging into the shoulder or chasing a longer hold.", "Straightening the legs before the supported version is comfortable."],
      scaleDown: ["Hold for five seconds or keep your hips down and practise a gentle side-lying brace.", "A wall side plank is another option: stand sideways near a wall, forearm supported, take a small step away and lean gently into it with your body straight. Use it only if foot and shoulder comfort allow."],
      progression: ["Add five seconds at a time, up to 20 seconds at two sets, before increasing the lever."],
      completionTarget: "The same comfortable hold on each side without sagging or breath-holding.", painRule: HOME_CORE_SAFETY, intensity,
    },
  ];
  return {
    id: "home-core", title: dose === "full" ? "Two-set routine" : "First sessions — one set",
    duration: dose === "full" ? "10–12 min" : "5–7 min", purpose: HOME_CORE_PURPOSE,
    exercises,
  };
}

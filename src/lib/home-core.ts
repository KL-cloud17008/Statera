import { formatDate, toLocalDate } from "@/lib/dates";
import type { MobilityBlock, MobilityExercise } from "@/lib/mobility";

export const HOME_CORE_LOG_TYPE = "HOME_CORE";
export const HOME_CORE_VERSION = "home-core-v1";
export const HOME_CORE_DAYS = [2, 5] as const;
export const HOME_CORE_SCHEDULE = "Tuesday & Friday";
export const HOME_CORE_PURPOSE = "Build abdominal and oblique strength while learning to keep your ribs and pelvis steady. Bodyweight only, with supported positions and short movements to start.";
export const HOME_CORE_SAFETY = "Keep discomfort at 0–2/10 and stable. At 3/10, shorten the movement or use the easier option. Stop for increasing or sharp pain, symptoms down a leg, numbness, tingling or weakness. New persistent worsening or rest/night pain needs medical advice.";
export const HOME_CORE_PROGRESSION = [
  "Start with one set of each movement. After two comfortable sessions with steady breathing and no worse symptoms the following day, try two sets.",
  "At two sets, add one clean repetition per side or five seconds to a hold. Change one thing at a time, keeping effort at 4–6/10.",
  "Cap heel slides at 10 per side, bird dogs at 8 per side and side-plank holds at 20 seconds before trying a harder variation.",
  "Progress heel slides to bent-knee dead-bug heel taps; progress leg slides to a low leg lift, then opposite arm and leg. Keep the knee-supported side plank until it is comfortably controlled.",
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
  { title: "NHS: braced heel slides", href: "https://msk-bexley.nhs.uk/conditions/back-pain/acute-low-back-pain" },
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
      id: "core-brace-breathing", name: "Abdominal brace + breathing", category: "Preparation",
      dose: "1 set of 5 easy breaths", cues: "Knees bent, feet resting; gently tighten your middle and keep breathing.",
      goal: "Find a light abdominal brace before moving your limbs.",
      setup: "Lie on your back in a clear floor space, knees bent and feet resting. Keep your head relaxed.",
      howTo: ["Breathe in comfortably, then breathe out slowly.", "Gently tighten around your waist as if preparing for a light nudge; keep your ribs relaxed.", "Take five normal breaths without letting the brace turn into a breath-hold."],
      breathingCue: "Use a gentle brace that still lets you breathe and speak.",
      beginnerPointers: ["A small effort is enough for this preparation step.", "Roll onto your side to get up; take your time changing positions."],
      commonMistakes: ["Bracing as hard as possible or holding your breath.", "Forcing your lower back hard into the floor."],
      scaleDown: ["Use a lighter brace. If floor transfers are uncomfortable, practise breathing and bracing sitting upright with feet resting."],
      completionTarget: "Five relaxed breaths with a gentle brace.", painRule: HOME_CORE_SAFETY,
      intensity: { ...intensity, effort: "Effort: 2–3/10; preparation only" },
    },
    {
      id: "core-heel-slide", name: "Braced heel slide", category: "Abdominals / trunk control",
      dose: `${setLabel} of 6–8 reps per side`, cues: "Slide one heel slowly; keep your pelvis still and stop before your back arches.",
      goal: "Keep your trunk steady as one leg moves, starting with the heel supported.",
      setup: "Stay on your back with both knees bent, feet resting and arms relaxed beside you.",
      howTo: ["Set a gentle brace and breathe out as you slide one heel away.", "Keep the heel touching the floor. Use only the range that lets your pelvis and back stay steady.", "Slide back slowly, then alternate legs. Count each side separately.", "Rest 45–60 seconds before the next set or movement."],
      breathingCue: "Breathe out during the slide; breathe in as you return.",
      beginnerPointers: ["A short slide with control counts as a complete rep.", "Keep both arms still at first."],
      commonMistakes: ["Lifting both legs or rushing.", "Straightening the leg farther than your trunk can control."],
      scaleDown: ["Shorten the slide or use four reps per side.", "If sliding is uncomfortable, repeat the gentle brace without moving your legs."],
      progression: ["Build to 10 clean reps per side at two sets, then try bent-knee dead-bug heel taps over a small range."],
      completionTarget: "The chosen reps with steady breathing and no increase in symptoms.", painRule: HOME_CORE_SAFETY, intensity,
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

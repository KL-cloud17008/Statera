export type MobilityIntensity = {
  effort: string;
  pain: string;
  breathing: string;
  goal: string;
};

export type RecoveryMode = "standard" | "footFlare";

export type RecoveryIntroVariant = "standard" | "footFlare";

export type MobilityExercise = {
  id: string;
  name: string;
  dose: string;
  cues: string;
  goal: string;
  howTo: string[];
  beginnerPointers: string[];
  commonMistakes: string[];
  scaleDown: string[];
  completionTarget: string;
  intensity: MobilityIntensity;
};

export type MobilityBlock = {
  id: string;
  title: string;
  duration: string;
  purpose: string;
  adaptationNote?: string;
  previousDayReason?: string;
  recoveryIntro?: boolean;
  recoveryIntroVariant?: RecoveryIntroVariant;
  exercises: MobilityExercise[];
};

export type MobilityFocus = {
  label: string;
  value: string;
  note: string;
};

export type MobilityDayProgram = {
  dayOfWeek: number;
  dayName: string;
  trainingRole: string;
  sessionTitle: string;
  totalDuration: string;
  todayPurpose: string;
  previousDayReason: string;
  adaptationNote: string;
  completionSummary: string;
  logType: "PRE_WORKOUT" | "POST_WORKOUT";
  focus: MobilityFocus[];
  blocks: MobilityBlock[];
};

const DEFAULT_INTENSITY: MobilityIntensity = {
  effort: "Effort: 2-4/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: calm enough to breathe through the nose",
  goal: "Goal: finish looser, warmer, and calmer - not exhausted",
};

const RECOVERY_INTENSITY: MobilityIntensity = {
  ...DEFAULT_INTENSITY,
  effort: "Effort: 2-3/10",
  goal: "Goal: leave the area easier to move without adding fatigue",
};

const BRACING_INTENSITY: MobilityIntensity = {
  effort: "Effort: 2-4/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: calm enough to breathe through the nose",
  goal: "Goal: feel steady and calm, not braced as hard as possible",
};

const BREATHING_INTENSITY: MobilityIntensity = {
  effort: "Effort: 1-3/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: slow, quiet, and easy to control",
  goal: "Goal: finish calmer than you started",
};

const FOOT_FLARE_RECOVERY_INTENSITY: MobilityIntensity = {
  effort: "Effort: 1-3/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: calm enough to breathe through the nose",
  goal: "Goal: feet feel less guarded; body feels calmer; no extra fatigue",
};

const RECOVERY_INTRO =
  "This is a low-intensity recovery session, not a workout. The goal is to make your ankles, hips, back, and breathing feel better without adding fatigue.";

const RECOVERY_STOP_NOTE =
  "Stop or scale down if you feel sharp pain, numbness, tingling, joint pinching, dizziness, swelling, warmth, or pain that increases as you continue. If foot pain does not settle or keeps returning, get assessed by a clinician.";

const FOOT_FLARE_RECOVERY_INTRO =
  "Your feet are telling you the walking load jumped faster than the tissue tolerance. Today's recovery keeps the work easy: restore the soles, arches, shins, calves, and ankles first, then downshift the rest of the body.";

const FOOT_FLARE_RECOVERY_NOT_WORKOUT =
  "This is not a workout. Do not chase pain or deep stretching. Finish calmer and less guarded.";

const FOOT_FLARE_RECOVERY_RULES = [
  FOOT_FLARE_RECOVERY_INTENSITY.effort,
  FOOT_FLARE_RECOVERY_INTENSITY.pain,
  FOOT_FLARE_RECOVERY_INTENSITY.breathing,
  FOOT_FLARE_RECOVERY_INTENSITY.goal,
] as const;

const MOVEMENT_CATALOG = {
  footCheckIn: {
    id: "foot-check-in",
    name: "Foot check-in",
    dose: "30-45 sec/foot",
    cues: "Map the heel, big toe, little toe, and midfoot without forcing pressure.",
    goal: "Notice where the sole is irritated without forcing movement.",
    howTo: [
      "Sit down.",
      "Place both feet on the floor.",
      "Slowly shift pressure between heel, big toe, little toe, and midfoot.",
      "Notice whether the arch, heel, or forefoot feels irritated.",
      "Keep pressure gentle.",
    ],
    beginnerPointers: [
      "This is assessment, not stretching.",
      "Stay below pain.",
      "If one foot is more irritated, reduce pressure on that side.",
    ],
    commonMistakes: [
      "Pressing hard to test the sore spot.",
      "Holding the breath while checking the foot.",
      "Trying to stretch the arch during the check-in.",
    ],
    scaleDown: [
      "Keep both feet relaxed and only breathe slowly.",
      "Use less bodyweight through the irritated foot.",
    ],
    completionTarget: "Spend 30-45 seconds per foot with gentle pressure only.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  plantarSoleStretch: {
    id: "gentle-plantar-fascia-sole-stretch",
    name: "Gentle plantar fascia / sole stretch",
    dose: "20-30 sec/side, 1-2 rounds",
    cues: "Lightly pull the toes back only until the sole begins to stretch.",
    goal: "Gently lengthen the sole and arch without yanking on irritated tissue.",
    howTo: [
      "Sit on a chair.",
      "Cross one ankle over the opposite knee if comfortable.",
      "Gently pull the toes back toward the shin until the sole lightly stretches.",
      "Hold 20-30 seconds.",
      "Switch sides.",
    ],
    beginnerPointers: [
      "Mild stretch only.",
      "Do not force the toes back.",
      "No sharp heel or arch pain.",
    ],
    commonMistakes: [
      "Pulling the toes back hard.",
      "Digging into the heel while stretching.",
      "Holding through sharp arch pain.",
    ],
    scaleDown: [
      "Keep the foot on the floor and only lift the toes slightly.",
      "Use one short 10-15 second hold per side.",
    ],
    completionTarget: "Hold 20-30 seconds per side for 1-2 easy rounds.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  softFootRoll: {
    id: "soft-foot-roll",
    name: "Soft foot roll",
    dose: "60-90 sec/foot",
    cues: "Use light pressure and roll slowly from heel to forefoot.",
    goal: "Calm the sole and reduce guarding.",
    howTo: [
      "Sit down.",
      "Place a soft ball, massage ball, or rolled towel under the foot.",
      "Roll slowly from heel to forefoot.",
      "Pause on tight areas but do not dig hard.",
      "Switch feet.",
    ],
    beginnerPointers: [
      "Use light pressure.",
      "Avoid aggressive rolling during a flare.",
      "This should feel relieving, not painful.",
    ],
    commonMistakes: [
      "Grinding hard into the sore area.",
      "Using a hard object when the sole is irritated.",
      "Rolling quickly and tensing the toes.",
    ],
    scaleDown: [
      "Use a rolled towel instead of a ball.",
      "Shorten the roll to 30 seconds per foot.",
    ],
    completionTarget: "Roll 60-90 seconds per foot with pressure that stays easy.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  toeSpreads: {
    id: "toe-spreads-short-foot",
    name: "Toe spreads / short-foot drill",
    dose: "60-90 sec",
    cues: "Spread the toes, then gently lift the arch without clawing the floor.",
    goal: "Wake up the arch of the foot and improve foot control.",
    howTo: [
      "Sit or stand barefoot with the whole foot on the floor.",
      "Spread the toes gently without lifting the heel.",
      "Relax the toes, then shorten the foot by drawing the ball of the foot slightly toward the heel.",
      "Keep the toes long instead of curled.",
      "Hold the arch lift for 3-5 seconds.",
      "Relax fully before the next rep.",
    ],
    beginnerPointers: [
      "Think lift the arch, not grip the floor.",
      "Keep pressure through the big toe, little toe, and heel.",
      "A small movement is enough.",
    ],
    commonMistakes: [
      "Curling the toes hard.",
      "Rolling the foot outward.",
      "Holding the breath.",
      "Chasing a cramp instead of backing off.",
    ],
    scaleDown: [
      "Stay seated and make the arch lift smaller.",
      "Use 1-2 second holds if the foot cramps.",
      "Skip the arch lift and only spread the toes if needed.",
    ],
    completionTarget: "Complete 6-10 calm arch lifts per foot, or about 60-90 seconds total.",
    intensity: DEFAULT_INTENSITY,
  },
  anklePumps: {
    id: "seated-ankle-pumps",
    name: "Seated ankle pumps",
    dose: "15-20 reps/side",
    cues: "Move slowly between toes-up and toes-down without rushing.",
    goal: "Improve ankle circulation and reduce shin and calf stiffness.",
    howTo: [
      "Sit tall on a chair with one heel on the floor.",
      "Pull the toes toward the shin.",
      "Pause briefly at the top.",
      "Point the toes down without forcing the ankle.",
      "Move through a comfortable range.",
      "Switch sides after the target reps.",
    ],
    beginnerPointers: [
      "Keep the heel anchored.",
      "Move slowly enough that the shin works.",
      "Use a smaller range if the front of the ankle pinches.",
    ],
    commonMistakes: [
      "Bouncing quickly through the reps.",
      "Letting the foot turn outward.",
      "Forcing a pinchy ankle position.",
      "Slumping and holding the breath.",
    ],
    scaleDown: [
      "Do both feet at the same time with a smaller range.",
      "Prop the heel on a folded towel if the floor position feels awkward.",
    ],
    completionTarget: "Complete 15-20 smooth pumps per side.",
    intensity: DEFAULT_INTENSITY,
  },
  ankleRocks: {
    id: "ankle-rocks",
    name: "Ankle rocks",
    dose: "8-10 reps/side",
    cues: "Rock the knee forward while the heel stays heavy and the foot points straight.",
    goal: "Improve ankle range for walking, leg press, squatting machines, and stairs.",
    howTo: [
      "Stand facing a wall or hold a sturdy support.",
      "Place one foot a few inches from the wall.",
      "Keep the heel down and the toes pointing forward.",
      "Gently move the knee forward over the middle toes.",
      "Stop before the heel lifts or the ankle pinches.",
      "Rock back to the start and repeat.",
    ],
    beginnerPointers: [
      "Hold support so balance is not the hard part.",
      "Keep the big toe down.",
      "Small, clean reps beat deep forced reps.",
    ],
    commonMistakes: [
      "Turning the foot outward.",
      "Letting the heel pop up.",
      "Collapsing the arch inward.",
      "Pushing into sharp ankle pain.",
    ],
    scaleDown: [
      "Do the movement seated with the foot under the knee.",
      "Use a smaller forward rock.",
      "Hold a wall or chair with both hands.",
    ],
    completionTarget: "Complete 8-10 controlled rocks per side with the heel staying down.",
    intensity: DEFAULT_INTENSITY,
  },
  calfStretch: {
    id: "calf-stretch",
    name: "Calf stretch",
    dose: "30 sec/side",
    cues: "Keep the back heel down and the back foot pointing straight ahead.",
    goal: "Reduce calf stiffness and improve ankle comfort.",
    howTo: [
      "Stand facing a wall or sturdy support.",
      "Step one foot behind you.",
      "Keep the back heel on the floor.",
      "Keep the back knee mostly straight.",
      "Lean forward until you feel a mild calf stretch.",
      "Breathe slowly and switch sides.",
    ],
    beginnerPointers: [
      "The stretch should feel mild, not aggressive.",
      "Keep the ribs stacked over the pelvis.",
      "Let the front knee bend as needed.",
    ],
    commonMistakes: [
      "Turning the back foot outward.",
      "Forcing the heel down through pain.",
      "Arching the lower back.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Move the back foot closer to reduce the stretch.",
      "Use a seated towel calf stretch.",
      "Skip the hold and do seated ankle pumps if standing is uncomfortable.",
    ],
    completionTarget: "Hold 30 seconds per side, or do 2 shorter 15-second holds per side.",
    intensity: DEFAULT_INTENSITY,
  },
  calfStretchBent: {
    id: "calf-stretch-knee-bent",
    name: "Calf stretch - knee bent",
    dose: "30 sec/side",
    cues: "Slightly bend the back knee while the heel stays grounded.",
    goal: "Stretch the deeper calf and soleus area that often affects ankle and foot loading.",
    howTo: [
      "Face a wall.",
      "Step one foot back.",
      "Keep the back heel on the floor.",
      "Slightly bend the back knee.",
      "Hold a mild stretch.",
      "Switch sides.",
    ],
    beginnerPointers: [
      "Keep the heel grounded.",
      "Do not force range.",
      "Stop if sole pain increases.",
    ],
    commonMistakes: [
      "Letting the heel lift.",
      "Turning the foot outward.",
      "Dropping into a deep stretch.",
      "Pushing through arch or heel pain.",
    ],
    scaleDown: [
      "Move the back foot closer.",
      "Do seated ankle pumps instead.",
      "Hold 10-15 seconds per side.",
    ],
    completionTarget: "Hold 30 seconds per side with the heel grounded and the stretch mild.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  tibialisRaises: {
    id: "optional-tibialis-raises",
    name: "Optional tibialis raises",
    dose: "8-12 easy reps",
    cues: "Lift the toes toward the shins while the heels stay planted.",
    goal: "Lightly strengthen the front of the shins for ankle control.",
    howTo: [
      "Stand with your back lightly against a wall or sit on a chair.",
      "Keep the heels on the floor.",
      "Lift the toes and balls of the feet toward the shins.",
      "Pause for one second.",
      "Lower with control.",
      "Stop before the shins cramp.",
    ],
    beginnerPointers: [
      "This is optional and should feel easy.",
      "Use a seated version if standing feels awkward.",
      "Keep the knees soft.",
    ],
    commonMistakes: [
      "Leaning hard into the wall.",
      "Rushing the lowering phase.",
      "Turning the toes outward.",
      "Pushing through shin pain.",
    ],
    scaleDown: [
      "Do seated toe lifts instead.",
      "Do 5 reps only.",
      "Skip this movement and still count the base as complete if it is painful.",
    ],
    completionTarget: "Complete 8-12 easy reps, or skip if it is not available or uncomfortable.",
    intensity: DEFAULT_INTENSITY,
  },
  thoracicOpenBooks: {
    id: "thoracic-open-books",
    name: "Thoracic open books",
    dose: "6 reps/side",
    cues: "Rotate the ribcage slowly while the knees stay stacked.",
    goal: "Improve upper-back rotation for pressing, pulling, and easier breathing.",
    howTo: [
      "Lie on your side with knees bent and stacked.",
      "Reach both arms straight in front of the chest.",
      "Keep the knees together.",
      "Open the top arm toward the floor behind you.",
      "Follow the hand with your eyes.",
      "Pause where breathing still feels easy.",
      "Return to the start and repeat before switching sides.",
    ],
    beginnerPointers: [
      "Put a pillow under the head.",
      "Keep the lower back quiet.",
      "Exhale as you open.",
    ],
    commonMistakes: [
      "Forcing the shoulder to the floor.",
      "Letting the top knee slide backward.",
      "Arching the lower back.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Place a pillow between the knees.",
      "Open only halfway.",
      "Do seated thoracic rotations if floor work is uncomfortable.",
    ],
    completionTarget: "Complete 6 slow reps per side.",
    intensity: DEFAULT_INTENSITY,
  },
  thoracicRotations: {
    id: "thoracic-rotations",
    name: "Thoracic rotations",
    dose: "8 reps/side",
    cues: "Rotate through the upper back while the hips stay mostly still.",
    goal: "Improve upper-back rotation without asking the lower back to twist hard.",
    howTo: [
      "Start on hands and knees.",
      "Place one hand behind the head or across the chest.",
      "Rotate the elbow down toward the opposite wrist.",
      "Rotate the elbow up toward the ceiling.",
      "Follow the elbow with your eyes.",
      "Keep the hips mostly square.",
      "Switch sides after the target reps.",
    ],
    beginnerPointers: [
      "Use the hand-on-shoulder version if the neck feels tense.",
      "Exhale as you rotate upward.",
      "Move slowly enough to feel the upper back working.",
    ],
    commonMistakes: [
      "Twisting mostly through the lower back.",
      "Shrugging toward the ear.",
      "Locking the elbows and rushing.",
      "Pushing into sharp shoulder pain.",
    ],
    scaleDown: [
      "Put hands on a bench instead of the floor.",
      "Use a smaller rotation.",
      "Do the same pattern seated with arms crossed.",
    ],
    completionTarget: "Complete 8 smooth rotations per side.",
    intensity: DEFAULT_INTENSITY,
  },
  bandPullApart: {
    id: "band-pull-aparts-face-pulls",
    name: "Band pull-aparts or light face pulls",
    dose: "10-12 easy reps",
    cues: "Use a light band or cable and keep the neck relaxed.",
    goal: "Wake up the upper back and rear shoulders before pressing and pulling.",
    howTo: [
      "Hold a light band at chest height, or set a cable face pull very light.",
      "Stand tall with ribs down.",
      "Pull the hands apart or pull the rope toward eye level.",
      "Pause when the shoulder blades gently move back.",
      "Return slowly.",
      "Keep every rep easy.",
    ],
    beginnerPointers: [
      "Choose a resistance that feels almost too light.",
      "Keep shoulders away from the ears.",
      "Stop before the neck takes over.",
    ],
    commonMistakes: [
      "Shrugging.",
      "Flaring the ribs.",
      "Using a band that is too heavy.",
      "Snapping back to the start.",
    ],
    scaleDown: [
      "Use no band and make the same arm motion.",
      "Do seated cable face pulls with very light load.",
      "Reduce the range if the shoulder pinches.",
    ],
    completionTarget: "Complete 10-12 easy reps with no neck tension.",
    intensity: DEFAULT_INTENSITY,
  },
  scapularWallSlides: {
    id: "scapular-wall-slides",
    name: "Scapular wall slides or scapular circles",
    dose: "6-8 reps",
    cues: "Move the shoulder blades without shrugging or arching the back.",
    goal: "Prepare shoulder-blade control for machine pressing, rows, and pulldowns.",
    howTo: [
      "Stand with your back near a wall or sit tall.",
      "Keep ribs down and chin gently tucked.",
      "Slide forearms upward as far as comfortable.",
      "Let the shoulder blades rotate without shrugging.",
      "Lower with control.",
      "If wall slides pinch, make slow shoulder-blade circles instead.",
    ],
    beginnerPointers: [
      "The range can be small.",
      "Keep the neck soft.",
      "Stop before the lower back arches.",
    ],
    commonMistakes: [
      "Shrugging hard.",
      "Arching the lower back.",
      "Forcing the hands to touch the wall.",
      "Moving quickly through discomfort.",
    ],
    scaleDown: [
      "Do scapular circles instead of wall slides.",
      "Sit on a chair and use a smaller arm range.",
      "Keep elbows lower than shoulder height.",
    ],
    completionTarget: "Complete 6-8 slow wall slides or 6-8 shoulder-blade circles each direction.",
    intensity: DEFAULT_INTENSITY,
  },
  doorwayPecStretch: {
    id: "doorway-pec-stretch",
    name: "Doorway pec stretch",
    dose: "20-30 sec/side",
    cues: "Open the chest gently without leaning into the shoulder joint.",
    goal: "Reduce chest tightness so the shoulders can sit more comfortably.",
    howTo: [
      "Stand beside a doorway.",
      "Place the forearm on the door frame below shoulder height.",
      "Step the same-side foot slightly forward.",
      "Turn the chest away until a mild chest stretch appears.",
      "Keep the ribs down.",
      "Breathe slowly, then switch sides.",
    ],
    beginnerPointers: [
      "Keep the elbow a little lower if the shoulder feels cranky.",
      "The stretch belongs in the chest, not the front of the shoulder.",
      "Use a very mild range before upper-body training.",
    ],
    commonMistakes: [
      "Forcing the shoulder backward.",
      "Flaring the ribs.",
      "Shrugging.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Use a wall instead of a doorway.",
      "Lower the arm position.",
      "Hold for 10-15 seconds per side.",
    ],
    completionTarget: "Hold 20-30 seconds per side with calm breathing.",
    intensity: DEFAULT_INTENSITY,
  },
  seatedBracingBreaths: {
    id: "seated-bracing-breaths",
    name: "Seated bracing breaths",
    dose: "5-6 breaths",
    cues: "Breathe low into the ribs, then make a gentle trunk brace after the exhale.",
    goal: "Practice trunk support without breath-holding.",
    howTo: [
      "Sit tall on a chair with both feet planted.",
      "Place one hand on the stomach and one hand on the side ribs.",
      "Inhale through the nose and let the ribs expand slightly.",
      "Exhale slowly.",
      "At the end of the exhale, gently tighten the trunk as if preparing for a light poke.",
      "Hold that gentle brace for 2-3 seconds.",
      "Relax before the next breath.",
    ],
    beginnerPointers: [
      "Brace at about 30-40% effort.",
      "Do not suck the stomach in.",
      "Keep the shoulders relaxed.",
    ],
    commonMistakes: [
      "Holding the breath hard.",
      "Bracing at maximum effort.",
      "Lifting the shoulders while inhaling.",
      "Leaning backward to create tension.",
    ],
    scaleDown: [
      "Brace at 10-20% effort.",
      "Hold the brace for 1 second.",
      "Do normal slow breathing without the brace if it feels confusing.",
    ],
    completionTarget: "Complete 5-6 controlled breaths.",
    intensity: BRACING_INTENSITY,
  },
  ninetyNinetySwitches: {
    id: "90-90-hip-switches",
    name: "90/90 hip switches",
    dose: "6-8 total reps",
    cues: "Rotate the hips slowly and use your hands for support.",
    goal: "Improve hip rotation for lower-body setup and easier sitting-to-standing.",
    howTo: [
      "Sit on the floor with both knees bent.",
      "Place the hands behind you for support.",
      "Let both knees rotate toward one side.",
      "Pause in a comfortable 90/90 position.",
      "Rotate both knees to the other side.",
      "Keep the chest as tall as you can.",
    ],
    beginnerPointers: [
      "Hands on the floor are encouraged.",
      "Sit on a cushion if the hips feel stuck.",
      "Do not force the knees flat.",
    ],
    commonMistakes: [
      "Rushing side to side.",
      "Forcing hip range.",
      "Holding the breath.",
      "Pushing into hip pinching.",
    ],
    scaleDown: [
      "Sit on a cushion, yoga block, or low bench.",
      "Keep both hands behind you.",
      "Do seated hip rotations from a chair instead.",
    ],
    completionTarget: "Complete 6-8 slow total switches.",
    intensity: DEFAULT_INTENSITY,
  },
  hipRotations90Seated: {
    id: "90-90-or-seated-hip-rotations",
    name: "90/90 or seated hip rotations",
    dose: "6-8 slow reps",
    cues: "Choose floor or chair version and rotate without loading the feet.",
    goal: "Restore hip rotation without loading the feet.",
    howTo: [
      "Use 90/90 on the floor if comfortable.",
      "Otherwise sit on a chair.",
      "Rotate the knees side to side gently.",
      "Move slowly.",
      "Keep the range easy.",
    ],
    beginnerPointers: [
      "Hands on the floor or chair are encouraged.",
      "Do not force the knees down.",
      "Stay with the chair version if the floor feels like work.",
    ],
    commonMistakes: [
      "Rushing side to side.",
      "Pushing into hip pinching.",
      "Pressing the feet hard into the floor.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Use the chair version.",
      "Move through a smaller range.",
      "Do 3-4 reps only.",
    ],
    completionTarget: "Complete 6-8 slow reps using the floor or chair version.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  hipFlexorStretch: {
    id: "half-kneeling-hip-flexor-stretch",
    name: "Half-kneeling hip flexor stretch",
    dose: "30 sec/side",
    cues: "Tuck the pelvis slightly, squeeze the back-leg glute, then shift forward.",
    goal: "Open the front of the hips without irritating the lower back.",
    howTo: [
      "Set up in half-kneeling with one knee down and one foot forward.",
      "Place a pad under the down knee.",
      "Hold a wall, bench, or chair if balance is hard.",
      "Gently tuck the pelvis under.",
      "Squeeze the glute on the kneeling side.",
      "Shift slightly forward until a mild front-hip stretch appears.",
      "Breathe slowly and switch sides.",
    ],
    beginnerPointers: [
      "The stretch should be in the front of the hip.",
      "Keep the lower back quiet.",
      "A small forward shift is enough.",
    ],
    commonMistakes: [
      "Arching the lower back.",
      "Leaning the torso forward.",
      "Forcing the hip into a deep stretch.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Use the standing version: one foot back, squeeze the back-leg glute, shift gently.",
      "Hold support with one or both hands.",
      "Use a shorter 15-20 second hold.",
    ],
    completionTarget: "Hold 30 seconds per side without lower-back pinching.",
    intensity: DEFAULT_INTENSITY,
  },
  adductorRockBacks: {
    id: "adductor-rock-backs",
    name: "Adductor rock-backs",
    dose: "8 reps/side",
    cues: "Keep the spine neutral and rock back only to a mild inner-thigh stretch.",
    goal: "Loosen the inner thighs and hips for lower-body machine setup.",
    howTo: [
      "Start on hands and knees.",
      "Extend one leg out to the side.",
      "Keep the extended foot flat or heel down if possible.",
      "Keep the back neutral.",
      "Slowly push the hips backward.",
      "Stop at a mild inner-thigh stretch.",
      "Return forward and repeat before switching sides.",
    ],
    beginnerPointers: [
      "Use a pad under the knee.",
      "Keep the movement slow.",
      "Stop before the back rounds heavily.",
    ],
    commonMistakes: [
      "Forcing depth.",
      "Rounding the lower back.",
      "Letting the extended foot spin outward.",
      "Pushing into sharp groin pain.",
    ],
    scaleDown: [
      "Place hands on a bench instead of the floor.",
      "Use a smaller range.",
      "Do a seated wide-knee hinge from a chair.",
    ],
    completionTarget: "Complete 8 controlled rock-backs per side.",
    intensity: DEFAULT_INTENSITY,
  },
  gluteBridge: {
    id: "glute-bridge-activation",
    name: "Glute bridge or machine-friendly glute activation",
    dose: "8-10 easy reps",
    cues: "Squeeze the glutes without arching the lower back.",
    goal: "Wake up the glutes before leg press, hack squat, or posterior-chain work.",
    howTo: [
      "Lie on your back with knees bent and feet flat.",
      "Set the feet about hip-width apart.",
      "Exhale and gently brace the trunk.",
      "Push through the heels and lift the hips.",
      "Pause when the hips feel level with the ribs.",
      "Lower slowly.",
      "If floor work is not comfortable, do seated glute squeezes instead.",
    ],
    beginnerPointers: [
      "Stop before the lower back takes over.",
      "Keep the ribs down.",
      "The top position should feel like glutes, not spine.",
    ],
    commonMistakes: [
      "Overarching at the top.",
      "Pushing through the toes only.",
      "Rushing reps.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do seated glute squeezes for 5-second holds.",
      "Use a smaller bridge height.",
      "Place the upper back on a bench if getting to the floor is uncomfortable.",
    ],
    completionTarget: "Complete 8-10 easy reps, or 6 seated glute squeezes per side.",
    intensity: DEFAULT_INTENSITY,
  },
  pecLatOpener: {
    id: "light-pec-lat-opener",
    name: "Light pec/lat opener",
    dose: "30 sec/side",
    cues: "Use a wall or bench to open the side body and chest gently.",
    goal: "Undo upper-body tightness from pressing, rows, pulldowns, and desk posture.",
    howTo: [
      "Stand beside a wall or hold the edge of a bench.",
      "Place one hand on the support at about shoulder height.",
      "Step the same-side foot slightly back.",
      "Shift the hips gently away from the hand.",
      "Turn the chest slightly open until the pec or lat feels a mild stretch.",
      "Breathe slowly and switch sides.",
    ],
    beginnerPointers: [
      "Keep the stretch broad and mild.",
      "Do not hang from the shoulder.",
      "Keep the neck relaxed.",
    ],
    commonMistakes: [
      "Yanking on the shoulder.",
      "Shrugging.",
      "Arching the lower back.",
      "Turning the stretch into pain.",
    ],
    scaleDown: [
      "Use a lower hand position.",
      "Hold for 15 seconds per side.",
      "Do doorway pec stretch only if the lat position feels awkward.",
    ],
    completionTarget: "Hold 30 seconds per side with calm breathing.",
    intensity: DEFAULT_INTENSITY,
  },
  hipFlexorMobility: {
    id: "hip-flexor-mobility",
    name: "Hip flexor mobility",
    dose: "2 x 30 sec/side",
    cues: "Use a gentle stretch and breathe through each hold.",
    goal: "Reduce front-of-hip stiffness after lower-body training or sitting.",
    howTo: [
      "Choose the half-kneeling or standing hip flexor stretch.",
      "Tuck the pelvis slightly under.",
      "Squeeze the glute on the back-leg side.",
      "Shift forward only until a mild stretch appears.",
      "Take 4-5 slow breaths.",
      "Rest briefly and repeat before switching sides.",
    ],
    beginnerPointers: [
      "Mild is the target.",
      "Keep the lower back from arching.",
      "Use support so balance stays easy.",
    ],
    commonMistakes: [
      "Forcing range.",
      "Leaning forward and losing the glute squeeze.",
      "Holding the breath.",
      "Pushing into hip pinching.",
    ],
    scaleDown: [
      "Use the standing version.",
      "Do one 20-second hold per side.",
      "Use a pillow under the knee.",
    ],
    completionTarget: "Complete two easy 30-second holds per side, or one shorter hold if scaled.",
    intensity: RECOVERY_INTENSITY,
  },
  hamstringFloss: {
    id: "hamstring-floss-seated-stretch",
    name: "Hamstring floss or seated hamstring stretch",
    dose: "8 reps/side or 30 sec/side",
    cues: "Move in and out of a mild hamstring stretch without forcing the knee straight.",
    goal: "Reduce back-of-thigh tension and prepare the posterior chain.",
    howTo: [
      "Sit on the edge of a chair.",
      "Extend one leg forward with the heel on the floor.",
      "Keep the spine long.",
      "Hinge forward slightly until you feel a mild hamstring stretch.",
      "Point and flex the foot slowly, or return upright and repeat.",
      "Switch sides.",
    ],
    beginnerPointers: [
      "Keep the knee softly bent.",
      "Stop before the lower back rounds hard.",
      "A light stretch is enough.",
    ],
    commonMistakes: [
      "Forcing the knee locked.",
      "Rounding aggressively through the lower back.",
      "Bouncing.",
      "Pushing into nerve-like tingling.",
    ],
    scaleDown: [
      "Bend the knee more.",
      "Sit on a cushion.",
      "Do only ankle pumps with the leg forward if the hamstring stretch feels too intense.",
    ],
    completionTarget: "Complete 8 gentle floss reps per side or hold 30 seconds per side.",
    intensity: DEFAULT_INTENSITY,
  },
  catCow: {
    id: "cat-cow",
    name: "Cat-cow",
    dose: "6-8 reps",
    cues: "Move the spine slowly and use long exhales.",
    goal: "Gently move the spine and reduce low-back guarding.",
    howTo: [
      "Start on hands and knees.",
      "Inhale and gently arch the back.",
      "Lift the chest slightly.",
      "Exhale and round the back.",
      "Tuck the chin slightly.",
      "Move slowly from one shape to the other.",
    ],
    beginnerPointers: [
      "Keep the range easy.",
      "Move one spinal segment at a time if you can.",
      "This should feel calming, not like a stretch test.",
    ],
    commonMistakes: [
      "Forcing end range.",
      "Locking the elbows.",
      "Rushing.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Place hands on a bench.",
      "Use fists or forearms if wrists dislike the floor.",
      "Do seated spinal flexion and extension from a chair.",
    ],
    completionTarget: "Complete 6-8 slow reps with steady breathing.",
    intensity: RECOVERY_INTENSITY,
  },
  childPoseBreathing: {
    id: "childs-pose-breathing",
    name: "Child's pose breathing or seated forward breathing",
    dose: "60-90 sec",
    cues: "Use slow nasal inhales and long relaxed exhales.",
    goal: "Down-regulate the nervous system and relax the back and hips.",
    howTo: [
      "Kneel on the floor with a cushion available if needed.",
      "Sit the hips back toward the heels.",
      "Reach the arms forward or rest them by your sides.",
      "Let the chest soften down.",
      "Breathe slowly through the nose if possible.",
      "Use longer exhales than inhales.",
      "Use seated forward breathing on a chair if kneeling is uncomfortable.",
    ],
    beginnerPointers: [
      "Support the chest with a pillow if the floor feels far away.",
      "Put a cushion behind the knees.",
      "Choose the chair version anytime.",
    ],
    commonMistakes: [
      "Forcing the knees or ankles.",
      "Holding the breath.",
      "Trying to make it a hard stretch.",
      "Staying in a position that causes pinching.",
    ],
    scaleDown: [
      "Use chair-supported breathing.",
      "Rest elbows on knees and breathe slowly.",
      "Shorten to 30-45 seconds.",
    ],
    completionTarget: "Complete 60-90 seconds of easy breathing.",
    intensity: BREATHING_INTENSITY,
  },
  supportedBreathingReset: {
    id: "supported-breathing-reset",
    name: "Supported breathing reset",
    dose: "60-90 sec",
    cues: "Use slow nasal inhales, longer exhales, and relaxed feet.",
    goal: "Downshift the nervous system and reduce guarding.",
    howTo: [
      "Sit or lie comfortably.",
      "Inhale through the nose.",
      "Exhale slowly.",
      "Let shoulders and feet relax.",
      "Keep breathing easy.",
    ],
    beginnerPointers: [
      "Use a long exhale.",
      "Do not force bracing.",
      "Finish calmer.",
    ],
    commonMistakes: [
      "Trying to take huge breaths.",
      "Clenching the feet during the exhale.",
      "Holding the breath after inhaling.",
    ],
    scaleDown: [
      "Sit with feet supported on the floor.",
      "Breathe normally and simply make the exhale a little slower.",
    ],
    completionTarget: "Breathe calmly for 60-90 seconds and finish less guarded.",
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
  },
  latStretch: {
    id: "lat-stretch",
    name: "Lat stretch",
    dose: "30 sec/side",
    cues: "Reach long without hanging on the shoulder or flaring the ribs.",
    goal: "Open the lats for pulldowns, rows, and overhead shoulder positions.",
    howTo: [
      "Place both hands on a bench, counter, or wall.",
      "Step back until the arms are long.",
      "Soften the knees.",
      "Shift the hips back.",
      "Breathe into the side ribs.",
      "Bias one side gently, then switch.",
    ],
    beginnerPointers: [
      "Keep the neck soft.",
      "Do not force the shoulders overhead.",
      "Use a higher surface if the back rounds.",
    ],
    commonMistakes: [
      "Hanging through the shoulders.",
      "Arching the lower back.",
      "Shrugging.",
      "Pushing into shoulder pinching.",
    ],
    scaleDown: [
      "Use a wall instead of a bench.",
      "Keep the arms lower.",
      "Hold for 15-20 seconds per side.",
    ],
    completionTarget: "Hold 30 seconds per side with no shoulder pinching.",
    intensity: DEFAULT_INTENSITY,
  },
  scapularRetractionDepression: {
    id: "scapular-retraction-depression",
    name: "Scapular retraction/depression drill",
    dose: "8 easy reps",
    cues: "Slide the shoulder blades gently back and down without arching.",
    goal: "Prepare shoulder-blade position for rows, pulldowns, and rear-delt work.",
    howTo: [
      "Sit or stand tall.",
      "Let the arms hang by your sides.",
      "Gently draw the shoulder blades back.",
      "Then slide them slightly down away from the ears.",
      "Pause for one second.",
      "Relax completely before the next rep.",
    ],
    beginnerPointers: [
      "Use gentle motion instead of hard squeezing.",
      "Keep the neck long.",
      "Keep the ribs down.",
    ],
    commonMistakes: [
      "Shrugging.",
      "Pinching the shoulder blades as hard as possible.",
      "Arching the lower back.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do the drill seated with back support.",
      "Make the movement smaller.",
      "Use one shoulder blade at a time.",
    ],
    completionTarget: "Complete 8 easy reps with a full relax between reps.",
    intensity: DEFAULT_INTENSITY,
  },
  hipHingePattern: {
    id: "hip-hinge-patterning",
    name: "Hip hinge patterning without load",
    dose: "6-8 reps",
    cues: "Push the hips back while the spine stays long and the knees stay soft.",
    goal: "Prepare the posterior chain for hamstring, glute, and back-extension work.",
    howTo: [
      "Stand tall with feet about hip-width.",
      "Place hands on the hips or hold a dowel along the back if available.",
      "Soften the knees.",
      "Push the hips backward as if closing a car door.",
      "Keep the chest long and ribs down.",
      "Return by gently squeezing the glutes.",
    ],
    beginnerPointers: [
      "This is practice, not a stretch contest.",
      "Keep weight over the whole foot.",
      "Stop before the lower back rounds.",
    ],
    commonMistakes: [
      "Squatting instead of hinging.",
      "Rounding the lower back.",
      "Locking the knees.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Put hands on a countertop for support.",
      "Use a smaller hip shift.",
      "Practice seated hip hinges from a chair.",
    ],
    completionTarget: "Complete 6-8 slow reps with the movement coming from the hips.",
    intensity: DEFAULT_INTENSITY,
  },
  seatedHipRotations: {
    id: "gentle-hip-rotations",
    name: "Gentle 90/90 or seated hip rotations",
    dose: "6 total reps",
    cues: "Use the easiest version and keep the hips calm.",
    goal: "Keep hip rotation available on the complete rest day without creating fatigue.",
    howTo: [
      "Choose floor 90/90 switches or sit tall on a chair.",
      "If seated, keep feet wide enough to move the knees comfortably.",
      "Slowly rotate both knees inward and outward.",
      "Stay away from pinching.",
      "Pause and breathe when the hips feel stiff.",
      "Use a small range.",
    ],
    beginnerPointers: [
      "This should feel gentler than training-day hip work.",
      "Use the chair version if the floor feels like effort.",
      "Keep the breath quiet.",
    ],
    commonMistakes: [
      "Forcing the hips open.",
      "Rushing.",
      "Holding the breath.",
      "Treating rest-day mobility like a workout.",
    ],
    scaleDown: [
      "Do only the seated version.",
      "Move one knee at a time.",
      "Skip and take a short easy walk if the hips feel irritated.",
    ],
    completionTarget: "Complete 6 gentle total rotations or switches.",
    intensity: RECOVERY_INTENSITY,
  },
  seatedSpinalFlexionExtension: {
    id: "cat-cow-or-seated-spinal-flexion-extension",
    name: "Cat-cow or seated spinal flexion/extension",
    dose: "6 easy reps",
    cues: "Choose the floor or chair version and keep the motion relaxed.",
    goal: "Gently move the spine on a no-fatigue rest day.",
    howTo: [
      "Choose hands-and-knees cat-cow or sit tall on a chair.",
      "If seated, place hands on thighs.",
      "Inhale and gently lift the chest.",
      "Exhale and gently round the upper back.",
      "Move slowly between the two shapes.",
      "Keep the range comfortable.",
    ],
    beginnerPointers: [
      "The chair version counts fully.",
      "Keep the neck easy.",
      "Use the breath to set the pace.",
    ],
    commonMistakes: [
      "Forcing the lower back.",
      "Rushing.",
      "Locking the jaw or shoulders.",
      "Moving into sharp pain.",
    ],
    scaleDown: [
      "Make the movement smaller.",
      "Do three breaths only.",
      "Sit with back support and breathe quietly if movement is uncomfortable.",
    ],
    completionTarget: "Complete 6 easy reps without strain.",
    intensity: RECOVERY_INTENSITY,
  },
  standingHipExtension: {
    id: "standing-hip-extension",
    name: "Standing hip extension",
    dose: "8 reps/side",
    cues: "Squeeze the glute and move the leg back without arching.",
    goal: "Undo long sitting by waking up the glutes and opening the front of the hip.",
    howTo: [
      "Stand tall and hold a chair or wall.",
      "Keep the ribs down.",
      "Move one leg slightly behind you.",
      "Squeeze the glute on that side.",
      "Return with control.",
      "Switch sides after the target reps.",
    ],
    beginnerPointers: [
      "The leg only needs to move a few inches.",
      "Keep the knee soft.",
      "Think glute squeeze, not back arch.",
    ],
    commonMistakes: [
      "Arching the lower back.",
      "Swinging the leg.",
      "Turning the toes outward.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do seated glute squeezes.",
      "Hold support with both hands.",
      "Use 4-5 reps per side.",
    ],
    completionTarget: "Complete 8 easy reps per side.",
    intensity: DEFAULT_INTENSITY,
  },
  wallChestOpener: {
    id: "wall-chest-opener",
    name: "Wall chest opener",
    dose: "30 sec",
    cues: "Open the chest gently without flaring the ribs.",
    goal: "Counteract rounded sitting posture through the chest and front shoulders.",
    howTo: [
      "Stand beside a wall.",
      "Place one palm or forearm on the wall below shoulder height.",
      "Turn the chest slightly away.",
      "Stop at a mild stretch.",
      "Breathe slowly.",
      "Switch sides halfway if desired.",
    ],
    beginnerPointers: [
      "Keep the shoulder away from the ear.",
      "Mild stretch is enough.",
      "Lower the hand if the shoulder feels pinchy.",
    ],
    commonMistakes: [
      "Forcing the arm behind the body.",
      "Shrugging.",
      "Arching the lower back.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Lower the arm.",
      "Use a doorway pec stretch with a smaller angle.",
      "Hold for 10-15 seconds.",
    ],
    completionTarget: "Complete 30 total seconds of easy chest opening.",
    intensity: DEFAULT_INTENSITY,
  },
  standingThoracicRotation: {
    id: "standing-thoracic-rotation",
    name: "Standing thoracic rotation",
    dose: "6 reps/side",
    cues: "Turn the ribcage while the hips stay quiet.",
    goal: "Bring easy rotation back into the upper back during desk-heavy days.",
    howTo: [
      "Stand tall with feet planted.",
      "Cross the arms over the chest.",
      "Keep hips facing forward.",
      "Rotate the ribcage gently to one side.",
      "Exhale and return to center.",
      "Alternate sides slowly.",
    ],
    beginnerPointers: [
      "Keep the knees soft.",
      "Move only as far as breathing stays easy.",
      "Let the eyes follow the chest.",
    ],
    commonMistakes: [
      "Twisting through the knees.",
      "Forcing the lower back.",
      "Rushing.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do it seated.",
      "Use a smaller turn.",
      "Rest hands on the ribs for feedback.",
    ],
    completionTarget: "Complete 6 easy reps per side.",
    intensity: DEFAULT_INTENSITY,
  },
} satisfies Record<string, MobilityExercise>;

type MovementKey = keyof typeof MOVEMENT_CATALOG;
type MovementOverride = Partial<MobilityExercise>;

function movement(key: MovementKey, override: MovementOverride = {}): MobilityExercise {
  return {
    ...MOVEMENT_CATALOG[key],
    ...override,
  };
}

function dailyLowerLegBase(): MobilityBlock {
  return {
    id: "daily-lower-leg-base",
    title: "Daily lower-leg base",
    duration: "6-8 min",
    purpose:
      "Build foot control, improve ankle range, reduce shin and calf stiffness, and support walking and lower-body training.",
    exercises: [
      movement("toeSpreads"),
      movement("anklePumps"),
      movement("ankleRocks"),
      movement("calfStretch"),
      movement("tibialisRaises"),
    ],
  };
}

function block({
  id,
  title,
  duration,
  purpose,
  exercises,
  adaptationNote,
  previousDayReason,
  recoveryIntro = false,
  recoveryIntroVariant,
}: Omit<MobilityBlock, "exercises"> & { exercises: MobilityExercise[] }): MobilityBlock {
  return {
    id,
    title,
    duration,
    purpose,
    adaptationNote,
    previousDayReason,
    recoveryIntro,
    recoveryIntroVariant,
    exercises,
  };
}

function breathingFinisher(label = "Breathing/reset finisher"): MobilityBlock {
  return block({
    id: "breathing-reset-finisher",
    title: label,
    duration: "1-2 min",
    purpose: "Finish with calm breathing and light trunk control so the session feels complete.",
    exercises: [movement("seatedBracingBreaths")],
  });
}

function footFlareMovement(
  key: MovementKey,
  id: string,
  override: MovementOverride = {}
): MobilityExercise {
  return movement(key, {
    id,
    intensity: FOOT_FLARE_RECOVERY_INTENSITY,
    ...override,
  });
}

function footFlareFootBlock(idPrefix = "foot-flare"): MobilityBlock {
  return block({
    id: `${idPrefix}-foot-sole-downshift`,
    title: "Foot and sole downshift",
    duration: "4-6 min",
    purpose: "Start with the soles and arches so recovery reduces guarding before anything else.",
    adaptationNote:
      "Use light pressure only. Do not push through pain, dig into the sole, or chase a deep stretch.",
    recoveryIntro: true,
    recoveryIntroVariant: "footFlare",
    exercises: [
      footFlareMovement("footCheckIn", `${idPrefix}-foot-check-in`),
      footFlareMovement("plantarSoleStretch", `${idPrefix}-sole-stretch`),
      footFlareMovement("softFootRoll", `${idPrefix}-soft-foot-roll`),
      footFlareMovement("toeSpreads", `${idPrefix}-toe-spreads-short-foot`, {
        dose: "5-8 gentle reps/foot",
        completionTarget: "Complete 5-8 gentle reps per foot with full relaxation between reps.",
      }),
    ],
  });
}

function footFlareLowerLegBlock(idPrefix = "foot-flare"): MobilityBlock {
  return block({
    id: `${idPrefix}-shins-calves-ankles`,
    title: "Shins, calves, ankles",
    duration: "4-6 min",
    purpose: "Move the ankle and lower leg without impact so the sole does not take more load.",
    exercises: [
      footFlareMovement("anklePumps", `${idPrefix}-seated-ankle-pumps`),
      footFlareMovement("ankleRocks", `${idPrefix}-wall-ankle-rocks`, {
        name: "Wall ankle rocks",
        completionTarget: "Complete 8-10 controlled rocks per side and stop before foot pain.",
      }),
      footFlareMovement("calfStretch", `${idPrefix}-calf-stretch-knee-straight`, {
        name: "Calf stretch - knee straight",
        completionTarget: "Hold 30 seconds per side with a mild stretch and no bouncing.",
      }),
      footFlareMovement("calfStretchBent", `${idPrefix}-calf-stretch-knee-bent`),
    ],
  });
}

function footFlareFullBodyBlock(dayOfWeek: number, idPrefix = "foot-flare"): MobilityBlock {
  if (dayOfWeek === 1) {
    return block({
      id: `${idPrefix}-upper-a-downshift`,
      title: "Chest, lats, upper-back reset",
      duration: "4-6 min",
      purpose: "After Upper A, keep the foot work first and finish by easing the chest, lats, ribs, and upper back.",
      exercises: [
        footFlareMovement("pecLatOpener", `${idPrefix}-pec-lat-opener`, {
          dose: "30 sec/side",
          completionTarget: "Hold 30 easy seconds per side without hanging on the shoulder.",
        }),
        footFlareMovement("latStretch", `${idPrefix}-lat-stretch`, {
          dose: "30 sec/side",
          completionTarget: "Hold 30 easy seconds per side with the neck relaxed.",
        }),
        footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`, {
          dose: "4-6 reps/side",
          completionTarget: "Complete 4-6 gentle reps per side without chasing maximum range.",
        }),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 2) {
    return block({
      id: `${idPrefix}-lower-a-downshift`,
      title: "Hips, adductors, glutes reset",
      duration: "4-6 min",
      purpose: "After Lower A, keep the soles calm first and finish with easy hip and inner-thigh mobility.",
      exercises: [
        footFlareMovement("hipFlexorMobility", `${idPrefix}-hip-flexor-mobility`, {
          dose: "30 sec/side",
          completionTarget: "Complete one easy hip-flexor position per side with calm breathing.",
        }),
        footFlareMovement("hipRotations90Seated", `${idPrefix}-hip-rotations`),
        footFlareMovement("adductorRockBacks", `${idPrefix}-adductor-rock-backs`, {
          dose: "6-8 reps/side",
          completionTarget: "Complete 6-8 easy rock-backs per side without forcing depth.",
        }),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 4) {
    return block({
      id: `${idPrefix}-upper-b-downshift`,
      title: "Lats, upper-back, neck reset",
      duration: "4-6 min",
      purpose: "After Upper B, keep the lower legs quiet first and finish with lats, shoulder blades, and upper-back rotation.",
      exercises: [
        footFlareMovement("latStretch", `${idPrefix}-lat-stretch`, {
          dose: "30 sec/side",
          completionTarget: "Hold 30 easy seconds per side without shoulder pinching.",
        }),
        footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`, {
          dose: "4-6 reps/side",
          completionTarget: "Complete 4-6 gentle reps per side with an easy exhale.",
        }),
        footFlareMovement("scapularRetractionDepression", `${idPrefix}-scapular-reset`, {
          dose: "6-8 easy reps",
          completionTarget: "Complete 6-8 easy reps while the neck stays quiet.",
        }),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 5) {
    return block({
      id: `${idPrefix}-lower-b-downshift`,
      title: "Hamstrings, glutes, low-back reset",
      duration: "4-6 min",
      purpose: "After Lower B, keep the soles quiet first and finish with posterior-chain and low-back downshifting.",
      exercises: [
        footFlareMovement("hamstringFloss", `${idPrefix}-hamstring-floss`, {
          dose: "6-8 reps/side or 30 sec/side",
          completionTarget: "Complete 6-8 gentle reps per side or one mild 30-second hold.",
        }),
        footFlareMovement("hipRotations90Seated", `${idPrefix}-hip-rotations`),
        footFlareMovement("catCow", `${idPrefix}-cat-cow`, {
          dose: "6 slow reps",
          completionTarget: "Complete 6 slow reps with steady breathing.",
        }),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  return block({
    id: `${idPrefix}-full-body-downshift`,
    title: "Full-body downshift",
    duration: "4-6 min",
    purpose: "After the foot and lower-leg work, restore easy hips, ribs, and breathing without loading the feet.",
    exercises: [
      footFlareMovement("hipFlexorMobility", `${idPrefix}-hip-flexor-mobility`, {
        dose: "30 sec/side",
        completionTarget: "Complete one easy hip-flexor position per side with calm breathing.",
      }),
      footFlareMovement("hipRotations90Seated", `${idPrefix}-hip-rotations`),
      footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`, {
        dose: "4-6 reps/side",
        completionTarget: "Complete 4-6 gentle reps per side without chasing maximum range.",
        scaleDown: [
          "Use a standing wall version.",
          "Open only halfway.",
          "Do seated thoracic rotations if floor work is uncomfortable.",
        ],
      }),
      footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
    ],
  });
}

function sundayFootFlareResetBlock(): MobilityBlock {
  return block({
    id: "sunday-foot-flare-supported-reset",
    title: "Supported full-body downshift",
    duration: "6-10 min",
    purpose: "Very gentle seated and supported options for a full reset without fatigue.",
    adaptationNote:
      "No aggressive stretching today. Keep every position supported and stop before anything feels worked.",
    exercises: [
      footFlareMovement("anklePumps", "sunday-foot-flare-ankle-pumps", {
        dose: "10-15 reps/side",
        completionTarget: "Complete 10-15 smooth pumps per side with the heel supported.",
      }),
      footFlareMovement("seatedHipRotations", "sunday-foot-flare-seated-hip-rotations"),
      footFlareMovement("seatedSpinalFlexionExtension", "sunday-foot-flare-seated-spine"),
      footFlareMovement("supportedBreathingReset", "sunday-foot-flare-supported-breathing-reset", {
        dose: "90 sec",
        completionTarget: "Breathe calmly for about 90 seconds and finish quieter than you started.",
      }),
    ],
  });
}

export const OPTIONAL_LATER_RECOVERY_FOOT_FLARE_TITLE =
  "Optional later recovery - foot flare focus";

export const OPTIONAL_LATER_RECOVERY: MobilityBlock = block({
  id: "optional-later-recovery",
  title: "Optional later recovery",
  duration: "8-12 min",
  purpose:
    "Use later in the day after a lift if joints feel compressed, calves or hips feel stiff, or breathing needs to settle.",
  adaptationNote:
    "Keep this easier than the primer. It should reduce stiffness and downshift the day, not add more training stress.",
  recoveryIntro: true,
  exercises: [
    movement("calfStretch", {
      id: "later-calf-stretch",
      dose: "30 sec/side",
      completionTarget: "Hold one relaxed calf stretch per side without forcing ankle range.",
      intensity: RECOVERY_INTENSITY,
    }),
    movement("hipFlexorMobility", {
      id: "later-hip-flexor-mobility",
      dose: "30 sec/side",
      completionTarget: "Complete one easy hip-flexor position per side with calm breathing.",
      intensity: RECOVERY_INTENSITY,
    }),
    movement("thoracicOpenBooks", {
      id: "later-open-books",
      dose: "4-6 reps/side",
      completionTarget: "Complete 4-6 gentle reps per side without chasing maximum range.",
      intensity: RECOVERY_INTENSITY,
    }),
    movement("childPoseBreathing", {
      id: "later-supported-breathing",
      name: "Supported breathing reset",
      dose: "60-90 sec",
      completionTarget: "Finish with 60-90 seconds of supported breathing that feels calmer than when you started.",
      intensity: RECOVERY_INTENSITY,
    }),
  ],
});

export function getOptionalLaterRecoveryBlocks(
  mode: RecoveryMode = "standard",
  dayOfWeek = 1
): MobilityBlock[] {
  if (mode === "footFlare") {
    const idPrefix = `optional-day-${dayOfWeek}-foot-flare`;
    return [
      footFlareFootBlock(idPrefix),
      footFlareLowerLegBlock(idPrefix),
      footFlareFullBodyBlock(dayOfWeek, idPrefix),
    ];
  }

  return [OPTIONAL_LATER_RECOVERY];
}

export const OPTIONAL_LATER_RECOVERY_FOOT_FLARE = getOptionalLaterRecoveryBlocks("footFlare", 1);

const MOBILITY_PROGRAMS: Record<number, MobilityDayProgram> = {
  1: {
    dayOfWeek: 1,
    dayName: "Monday",
    trainingRole: "Upper A training day",
    sessionTitle: "Upper A primer",
    totalDuration: "8-12 min",
    todayPurpose:
      "Prepare shoulders, upper back, chest, elbows, wrists, and trunk for pressing and pulling.",
    previousDayReason:
      "Sunday was complete rest, so this gently restores general movement before loading the upper body.",
    adaptationNote:
      "The work should make the shoulders and upper back feel warm and organized without creating fatigue.",
    completionSummary: "Done means your shoulders feel warmer, your chest feels less tight, and your breathing is calm.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Press/pull setup", note: "Upper back, chest, scapulae, elbows, wrists, and trunk." },
      { label: "Previous day", value: "Rest reset", note: "Restores easy motion after Sunday without making the primer long." },
      { label: "Feel target", value: "Warm, not tired", note: "Shoulders down, no shrugging, slow reps, calm nose breathing." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "monday-upper-a-prep",
        title: "Upper A prep block",
        duration: "4-5 min",
        purpose: "Prepare pressing and pulling positions with upper-back control.",
        adaptationNote: "Keep shoulders down. Do not shrug. Move slowly. The goal is warm shoulders and upper back, not fatigue.",
        exercises: [
          movement("thoracicOpenBooks"),
          movement("bandPullApart"),
          movement("scapularWallSlides"),
          movement("doorwayPecStretch"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  2: {
    dayOfWeek: 2,
    dayName: "Tuesday",
    trainingRole: "Lower A training day",
    sessionTitle: "Lower A primer + Monday upper reset",
    totalDuration: "8-12 min",
    todayPurpose:
      "Prepare ankles, knees, hips, hamstrings, glutes, and trunk for leg press and machine lower-body work.",
    previousDayReason:
      "Monday upper-body work can leave the chest, lats, and upper back tight, so the session includes a light pec/lat opener.",
    adaptationNote:
      "Lower-body prep stays controlled so the hips and knees feel ready without spending energy before training.",
    completionSummary: "Done means hips feel easier to position, ankles feel awake, and the upper body feels less compressed.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Lower A setup", note: "Ankles, knees, hips, glutes, hamstrings, and trunk." },
      { label: "Previous day", value: "Upper reset", note: "A light pec/lat opener counters Monday pressing and pulling tightness." },
      { label: "Feel target", value: "Ready joints", note: "Leg press positions should feel smoother, not stretched to the limit." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "tuesday-lower-a-prep",
        title: "Lower A prep + upper reset",
        duration: "5-6 min",
        purpose: "Prepare hips, knees, ankles, and trunk while easing Monday upper-body tightness.",
        previousDayReason: "Monday upper work can tighten the pecs, lats, and upper back.",
        exercises: [
          movement("ninetyNinetySwitches"),
          movement("hipFlexorStretch"),
          movement("adductorRockBacks"),
          movement("gluteBridge"),
          movement("pecLatOpener"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  3: {
    dayOfWeek: 3,
    dayName: "Wednesday",
    trainingRole: "Recovery mobility day",
    sessionTitle: "Lower A recovery",
    totalDuration: "20-30 min",
    todayPurpose:
      "Recover from Tuesday Lower A with hips, adductors, hamstrings, calves, ankles, low back, and breathing.",
    previousDayReason:
      "Tuesday leg press and machine lower-body work can leave the hips, adductors, calves, and trunk guarded.",
    adaptationNote:
      "This is deliberately low-intensity and restorative so a beginner can recover without adding soreness.",
    completionSummary: "Done means hips and calves feel less stiff, the back feels calmer, and breathing has slowed down.",
    logType: "POST_WORKOUT",
    focus: [
      { label: "Recovery match", value: "Lower A relief", note: "Hips, adductors, hamstrings, calves, ankles, low back, and breathing." },
      { label: "Previous day", value: "Leg fatigue", note: "Unwinds stiffness from Tuesday lower-body machine work." },
      { label: "Feel target", value: "Restorative", note: "No fatigue. Leave the session calmer than you began." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "wednesday-lower-a-recovery",
        title: "Lower A recovery block",
        duration: "12-18 min",
        purpose: "Reduce hip, adductor, hamstring, calf, and low-back stiffness after Lower A.",
        adaptationNote: RECOVERY_STOP_NOTE,
        recoveryIntro: true,
        exercises: [
          movement("hipFlexorMobility"),
          movement("ninetyNinetySwitches", {
            id: "90-90-transitions",
            name: "90/90 transitions",
            dose: "8 slow reps",
            completionTarget: "Complete 8 slow total transitions with hands assisting as needed.",
            intensity: RECOVERY_INTENSITY,
          }),
          movement("adductorRockBacks"),
          movement("hamstringFloss"),
          movement("catCow"),
          movement("childPoseBreathing"),
        ],
      }),
      breathingFinisher("Down-regulation finisher"),
    ],
  },
  4: {
    dayOfWeek: 4,
    dayName: "Thursday",
    trainingRole: "Upper B training day",
    sessionTitle: "Upper B primer",
    totalDuration: "8-12 min",
    todayPurpose:
      "Prepare shoulders, scapulae, thoracic spine, lats, rear delts, and elbows for back and shoulder work.",
    previousDayReason:
      "Tuesday and Wednesday lower-body work can leave hips and ankles stiff, so the daily lower-leg base keeps them moving without adding fatigue.",
    adaptationNote:
      "The upper-body work emphasizes scapular control for rows, pulldowns, shoulder work, and rear delts.",
    completionSummary: "Done means lats and pecs feel open, shoulder blades feel controllable, and hips/ankles still feel easy.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Back/shoulders", note: "Lats, thoracic spine, scapulae, rear delts, elbows, and neck position." },
      { label: "Previous days", value: "Lower carryover", note: "Daily base keeps ankles and calves moving after Tuesday and Wednesday." },
      { label: "Feel target", value: "Shoulders quiet", note: "No shrugging; shoulder blades should move smoothly." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "thursday-upper-b-prep",
        title: "Upper B prep block",
        duration: "4-5 min",
        purpose: "Prepare back, shoulders, and lats for rows, pulldowns, and shoulder work.",
        exercises: [
          movement("thoracicRotations"),
          movement("latStretch"),
          movement("bandPullApart"),
          movement("scapularRetractionDepression"),
          movement("doorwayPecStretch"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  5: {
    dayOfWeek: 5,
    dayName: "Friday",
    trainingRole: "Lower B training day",
    sessionTitle: "Lower B primer + Thursday upper reset",
    totalDuration: "8-12 min",
    todayPurpose:
      "Prepare hips, posterior chain, hamstrings, glutes, calves, ankles, and trunk for lower-body and posterior-chain work.",
    previousDayReason:
      "Thursday upper-body work can tighten lats, pecs, neck, and upper back, so the primer includes an upper reset.",
    adaptationNote:
      "The hinge and glute work should make the posterior chain feel easier to access before machines, not pre-fatigued.",
    completionSummary: "Done means the hinge pattern feels clear, hamstrings feel gently awake, and the upper body feels less tight.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Posterior chain", note: "Hips, hamstrings, glutes, calves, ankles, and trunk." },
      { label: "Previous day", value: "Upper reset", note: "Pec/lat opening counters Thursday rows, pulldowns, and shoulder work." },
      { label: "Feel target", value: "Patterned, not tired", note: "Hinge and glute activation should feel crisp and easy." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "friday-lower-b-prep",
        title: "Lower B prep + upper reset",
        duration: "5-6 min",
        purpose: "Prepare posterior chain, hips, hamstrings, glutes, and trunk while easing Thursday upper tightness.",
        previousDayReason: "Thursday upper work can leave lats, pecs, neck, and upper back tight.",
        exercises: [
          movement("hipHingePattern"),
          movement("hamstringFloss"),
          movement("ninetyNinetySwitches"),
          movement("hipFlexorStretch"),
          movement("gluteBridge"),
          movement("pecLatOpener"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  6: {
    dayOfWeek: 6,
    dayName: "Saturday",
    trainingRole: "Recovery mobility day",
    sessionTitle: "Lower B recovery",
    totalDuration: "20-30 min",
    todayPurpose:
      "Recover from Friday Lower B with posterior chain, hips, adductors, calves, back/trunk, and down-regulation.",
    previousDayReason:
      "Friday posterior-chain work can leave hamstrings, glutes, calves, and low back feeling worked and guarded.",
    adaptationNote:
      "This is longer and calmer than a training-day primer so recovery can actually lead the day.",
    completionSummary: "Done means the posterior chain feels less guarded and your breathing feels quieter.",
    logType: "POST_WORKOUT",
    focus: [
      { label: "Recovery match", value: "Lower B relief", note: "Posterior chain, hips, adductors, calves, back/trunk, and breath." },
      { label: "Previous day", value: "Hinge recovery", note: "Unloads hamstrings, glutes, calves, and low back after Friday." },
      { label: "Feel target", value: "Long and calm", note: "More restorative than a primer, still easy enough to avoid fatigue." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "saturday-lower-b-recovery",
        title: "Lower B recovery block",
        duration: "14-20 min",
        purpose: "Recover hips, hamstrings, glutes, calves, and low back after Lower B.",
        adaptationNote: RECOVERY_STOP_NOTE,
        recoveryIntro: true,
        exercises: [
          movement("calfStretch", {
            id: "extra-calf-stretch",
            name: "Extra calf stretch",
            dose: "30 sec/side",
            completionTarget: "Hold one extra easy 30-second calf stretch per side if it feels helpful.",
            intensity: RECOVERY_INTENSITY,
          }),
          movement("hipFlexorMobility"),
          movement("adductorRockBacks"),
          movement("hamstringFloss"),
          movement("thoracicRotations"),
          movement("catCow"),
          movement("childPoseBreathing"),
        ],
      }),
      breathingFinisher("Down-regulation finisher"),
    ],
  },
  0: {
    dayOfWeek: 0,
    dayName: "Sunday",
    trainingRole: "Complete rest / full reset",
    sessionTitle: "Complete rest full-body reset",
    totalDuration: "12-20 min",
    todayPurpose:
      "Very gentle full-body reset with no fatigue, focused on breathing, spine, hips, feet, ankles, and general relaxation.",
    previousDayReason:
      "Saturday recovery work may have already reduced lower-body stiffness, so Sunday stays gentler and more relaxing.",
    adaptationNote:
      "This should feel like recovery, not training. Finish calmer than you started.",
    completionSummary: "Done means nothing feels worked, your breathing is quieter, and movement feels a little easier.",
    logType: "POST_WORKOUT",
    focus: [
      { label: "Rest match", value: "Full reset", note: "Spine, hips, feet, ankles, and breathing with no fatigue." },
      { label: "Previous day", value: "Recovery carryover", note: "Keeps Saturday recovery benefits without adding effort." },
      { label: "Feel target", value: "Calmer", note: "Very gentle range, quiet breath, no training feeling." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "sunday-full-reset",
        title: "Gentle full-body reset",
        duration: "6-10 min",
        purpose: "Move the hips, spine, and upper back softly with no fatigue.",
        adaptationNote: RECOVERY_STOP_NOTE,
        recoveryIntro: true,
        exercises: [
          movement("seatedHipRotations"),
          movement("seatedSpinalFlexionExtension"),
          movement("thoracicOpenBooks", {
            dose: "4-6 reps/side",
            completionTarget: "Complete 4-6 gentle reps per side without forcing range.",
            intensity: RECOVERY_INTENSITY,
          }),
          movement("childPoseBreathing", {
            name: "Child's pose breathing or chair-supported breathing",
            dose: "60-90 sec",
            completionTarget: "Complete 60-90 seconds of supported breathing.",
          }),
        ],
      }),
      breathingFinisher("Calm finish"),
    ],
  },
};

export const UNDO_SITTING: MobilityBlock = block({
  id: "desk-reset",
  title: "Desk Reset (optional)",
  duration: "3-5 min",
  purpose: "Break up long sitting blocks with hips, chest, and upper-back motion.",
  exercises: [
    movement("standingHipExtension"),
    movement("wallChestOpener"),
    movement("standingThoracicRotation"),
  ],
});

export function getMobilityProgram(dayOfWeek: number): MobilityDayProgram {
  return MOBILITY_PROGRAMS[dayOfWeek] ?? MOBILITY_PROGRAMS[0];
}

export function getRecoverySessionBlocks(
  dayOfWeek: number,
  mode: RecoveryMode = "standard"
): MobilityBlock[] {
  const program = getMobilityProgram(dayOfWeek);

  if (mode !== "footFlare" || program.logType !== "POST_WORKOUT") {
    return program.blocks;
  }

  if (program.dayOfWeek === 0) {
    return [
      footFlareFootBlock("sunday-foot-flare"),
      sundayFootFlareResetBlock(),
      breathingFinisher("Calm finish"),
    ];
  }

  const idPrefix = `day-${program.dayOfWeek}-foot-flare`;
  return [
    footFlareFootBlock(idPrefix),
    footFlareLowerLegBlock(idPrefix),
    ...program.blocks.filter((block) => block.id !== "daily-lower-leg-base"),
  ];
}

export function getAllMobilityPrograms(): MobilityDayProgram[] {
  return Object.values(MOBILITY_PROGRAMS).sort((left, right) => left.dayOfWeek - right.dayOfWeek);
}

export function getPreWorkoutChecklist(dayOfWeek: number, version: "A" | "B"): MobilityBlock[] {
  void version;
  return getMobilityProgram(dayOfWeek).blocks;
}

export function getPostWorkoutChecklist(
  dayOfWeek: number,
  mode: RecoveryMode = "standard"
): MobilityBlock[] {
  return getRecoverySessionBlocks(dayOfWeek, mode);
}

export {
  FOOT_FLARE_RECOVERY_INTRO,
  FOOT_FLARE_RECOVERY_NOT_WORKOUT,
  FOOT_FLARE_RECOVERY_RULES,
  RECOVERY_INTRO,
  RECOVERY_STOP_NOTE,
};

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
  category?: string;
  dose: string;
  cues: string;
  goal: string;
  setup?: string;
  howTo: string[];
  breathingCue?: string;
  beginnerPointers: string[];
  commonMistakes: string[];
  scaleDown: string[];
  progression?: string[];
  completionTarget: string;
  painRule?: string;
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
  effort: "Effort: 1-3/10",
  goal: "Goal: finish looser and calmer with no fatigue",
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

const BACK_PAIN_RELIEF_INTENSITY: MobilityIntensity = {
  effort: "Effort: 1-3/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: slow, steady, and relaxed",
  goal: "Goal: finish looser, calmer, and no more painful than when you started",
};

const FOOT_FLARE_RECOVERY_INTENSITY: MobilityIntensity = {
  effort: "Effort: 1-3/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: calm enough to breathe through the nose",
  goal: "Goal: feet feel less guarded; body feels calmer; no extra fatigue",
};

const BALANCE_INTENSITY: MobilityIntensity = {
  effort: "Effort: 1-3/10",
  pain: "Pain: 0-2/10 maximum",
  breathing: "Breathing: slow, steady, and controlled",
  goal: "Goal: improve control without creating risk",
};

const RECOVERY_INTRO =
  "Required does not mean intense. This is low-intensity recovery mobility, not a workout. The goal is to restore feet, ankles, calves, hips, spine, shoulders, and breathing without adding fatigue.";

const RECOVERY_STOP_NOTE =
  "Required does not mean push through pain. Stop or scale down if you feel sharp pain, numbness, tingling, swelling, warmth, limping, dizziness, or pain that increases as you continue. If foot pain does not settle or keeps returning, get assessed by a clinician.";

const FOOT_FLARE_RECOVERY_INTRO =
  "Foot flare recovery is required when your soles are irritated or recent step load is high. The goal is to reduce guarding, restore easy motion, and protect tomorrow's training.";

const FOOT_FLARE_RECOVERY_NOT_WORKOUT =
  "Complete later today. Keep it easy. This is tissue-tolerance work, not another workout. No aggressive stretching, no digging hard into the sole, and no extra fatigue.";

const FOOT_FLARE_RECOVERY_RULES = [
  FOOT_FLARE_RECOVERY_INTENSITY.effort,
  FOOT_FLARE_RECOVERY_INTENSITY.pain,
  FOOT_FLARE_RECOVERY_INTENSITY.breathing,
  FOOT_FLARE_RECOVERY_INTENSITY.goal,
] as const;

const MOVEMENT_CATALOG = {
  ankleCircles: {
    id: "ankle-circles",
    name: "Ankle Circles",
    dose: "1-2 sets of 5-10 slow circles each direction per ankle",
    cues: "Move slowly and smoothly; stay in a comfortable range without forcing the ankle.",
    goal: "Improve ankle awareness, gentle joint motion, and lower-leg circulation without loading the feet aggressively.",
    setup: "Sit tall or stand with support so balance is easy, then let one ankle move freely while the rest of the body stays relaxed.",
    howTo: [
      "Start seated, or stand holding a wall or sturdy support.",
      "Lightly lift one foot or keep the heel grounded with the toes relaxed.",
      "Draw a slow circle with the ankle through an easy range.",
      "Complete the target reps in one direction.",
      "Reverse direction with the same slow control.",
      "Switch ankles and repeat.",
    ],
    breathingCue: "Exhale softly as the ankle moves through the stiffest part of the circle.",
    beginnerPointers: [
      "Small circles are fine.",
      "Keep the knee and hip quiet so the ankle does the work.",
      "Move slowly enough that each part of the circle feels controlled.",
    ],
    commonMistakes: [
      "Whipping through fast circles.",
      "Forcing the end range.",
      "Turning the whole leg instead of moving the ankle.",
      "Holding the breath when the ankle feels stiff.",
    ],
    scaleDown: [
      "Do the circles seated with the leg supported.",
      "Use fewer reps or a smaller range.",
      "Pause and switch to seated ankle pumps if circles feel irritating.",
    ],
    completionTarget: "Complete 5-10 slow circles each direction per ankle while pain stays 0-2/10.",
    painRule:
      "Keep pain 0-2/10. Stop if sharp pain, numbness, tingling, swelling, warmth, or limping appears.",
    intensity: DEFAULT_INTENSITY,
  },
  supportedTandemBalance: {
    id: "supported-tandem-balance-hold",
    name: "Supported Tandem Balance Hold",
    category: "Balance / Foot-Ankle Control",
    dose: "2 rounds x 20-40 seconds each stance",
    cues: "Quiet feet. Tall posture. Light hand support. Breathe slowly. Knee tracks over middle toes.",
    goal:
      "Build balance, ankle control, foot tripod awareness, knee tracking, and hip stability with low joint stress.",
    setup:
      "Stand near a wall, rack, rail, or stable surface. Place one foot in front of the other in a narrow split stance. Use hand support as needed.",
    howTo: [
      "Stand tall with ribs down.",
      "Keep both feet quiet and flat.",
      "Lightly hold support.",
      "Keep knees soft, not locked.",
      "Hold position without gripping the floor aggressively.",
      "Switch which foot is forward.",
    ],
    breathingCue: "Breathe slowly through the hold and keep the jaw relaxed.",
    beginnerPointers: [
      "Quiet feet.",
      "Tall posture.",
      "Light hand support.",
      "Breathe slowly.",
      "Knee tracks over middle toes.",
    ],
    commonMistakes: [
      "Holding breath.",
      "Clawing toes.",
      "Collapsing the arch.",
      "Locking knees.",
      "Leaning into support.",
    ],
    scaleDown: [
      "Use a wider stance.",
      "Use both hands supported.",
      "Use 10-20 second holds.",
    ],
    progression: [
      "Use fingertip support only.",
      "Use a narrower stance.",
      "Use longer holds.",
      "Add slow head turns.",
    ],
    completionTarget:
      "Complete both stances without pain increase, arch collapse, or excessive wobbling.",
    painRule: "0-2/10 maximum.",
    intensity: BALANCE_INTENSITY,
  },
  supportedSingleLegBalanceKickstand: {
    id: "supported-single-leg-balance-toe-touch-kickstand",
    name: "Supported Single-Leg Balance with Toe-Touch Kickstand",
    category: "Balance / Foot Strength / Ankle Stability",
    dose: "2 rounds x 10-30 seconds per side",
    cues: "Foot tripod. Soft knee. Tall posture. Light support. Do not chase instability.",
    goal:
      "Improve single-leg control, intrinsic foot strength, ankle stiffness, knee alignment, hip stability, and plantar-fascia resilience.",
    setup:
      "Stand near a wall, rack, rail, or stable surface. Shift most weight onto one foot. Keep the opposite toes lightly touching the floor as a kickstand.",
    howTo: [
      "Set the working foot flat.",
      "Keep heel, big-toe base, and little-toe base connected to the floor.",
      "Lightly touch the opposite toes to the floor.",
      "Hold support with one or both hands.",
      "Keep knee tracking over middle toes.",
      "Hold without arch collapse or toe clawing.",
      "Switch sides.",
    ],
    breathingCue: "Breathe steadily and keep the support hand light.",
    beginnerPointers: [
      "Foot tripod.",
      "Soft knee.",
      "Tall posture.",
      "Light support.",
      "Do not chase instability.",
    ],
    commonMistakes: [
      "Letting the arch collapse.",
      "Gripping toes.",
      "Twisting hips.",
      "Locking the knee.",
      "Holding breath.",
    ],
    scaleDown: [
      "Use both hands supported.",
      "Use more toe pressure from the kickstand foot.",
      "Use shorter 10-second holds.",
    ],
    progression: [
      "Use lighter support.",
      "Use longer holds.",
      "Use less kickstand pressure.",
      "Use a slow free-foot reach.",
    ],
    completionTarget:
      "Hold with controlled foot pressure, steady breathing, and no increase in foot/knee pain.",
    painRule: "0-2/10 maximum.",
    intensity: BALANCE_INTENSITY,
  },
  toeSpreads: {
    id: "toe-spreads-short-foot",
    name: "Toe spreads / short-foot drill",
    dose: "45-60 sec/foot",
    cues: "Wake up the arches and foot control without clawing the toes.",
    goal: "Wake up arches and foot control before walking or training.",
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
    completionTarget: "Work for 45-60 seconds per foot without toe clawing.",
    intensity: DEFAULT_INTENSITY,
  },
  anklePumps: {
    id: "seated-ankle-pumps",
    name: "Seated Ankle Pumps",
    dose: "15-20 reps/side",
    cues: "Move slowly between toes-up and toes-down without rushing.",
    goal: "Move the ankles and lower legs before walking or training.",
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
      "Sit farther back on the chair if the heel position feels awkward.",
    ],
    completionTarget: "Complete 15-20 smooth pumps per side.",
    intensity: DEFAULT_INTENSITY,
  },
  ankleRocks: {
    id: "wall-ankle-rocks",
    name: "Wall Ankle Rocks",
    dose: "8-10 reps/side",
    cues: "Heel stays down; knee tracks over the middle toes.",
    goal: "Improve ankle dorsiflexion for walking, leg press setup, and stairs.",
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
    id: "wall-calf-stretch-knee-straight",
    name: "Wall Calf Stretch - Knee Straight",
    dose: "20-30 sec/side",
    cues: "Point the foot straight ahead and keep the back heel down.",
    goal: "Improve calf length without forcing the ankle.",
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
      "Skip the hold and do seated ankle pumps if standing is uncomfortable.",
      "Hold 10-15 seconds per side.",
    ],
    completionTarget: "Hold 20-30 seconds per side with the foot pointing straight ahead.",
    intensity: DEFAULT_INTENSITY,
  },
  calfStretchBent: {
    id: "wall-calf-stretch-knee-bent",
    name: "Wall Calf Stretch - Knee Bent",
    dose: "20-30 sec/side",
    cues: "Mild stretch only; slightly bend the back knee while the heel stays grounded.",
    goal: "Open the soleus and Achilles area gently.",
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
    completionTarget: "Hold 20-30 seconds per side with a mild stretch only.",
    intensity: DEFAULT_INTENSITY,
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
  wallThoracicRotations: {
    id: "wall-thoracic-rotations",
    name: "Wall thoracic rotations",
    dose: "6 reps/side",
    cues: "Turn through the ribs and upper back while the hips stay quiet.",
    goal: "Prepare thoracic rotation for pressing, pulling, and easier breathing.",
    howTo: [
      "Stand side-on near a wall.",
      "Place the outside hand lightly on the wall at chest height.",
      "Keep feet planted and hips mostly forward.",
      "Rotate the ribcage away from the wall as far as comfortable.",
      "Exhale, return to the start, and repeat.",
      "Switch sides after the target reps.",
    ],
    beginnerPointers: [
      "Keep the shoulders down.",
      "Use a small range if the lower back wants to twist.",
      "Move slowly enough to breathe through each rep.",
    ],
    commonMistakes: [
      "Shrugging toward the ears.",
      "Twisting mostly through the low back.",
      "Forcing the hand farther than the shoulder likes.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do the same rotation seated.",
      "Cross the arms over the chest instead of touching the wall.",
      "Use 3-4 reps per side.",
    ],
    completionTarget: "Complete 6 slow reps per side without shoulder pinch or low-back twist.",
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
    name: "Wall slides",
    dose: "8 reps",
    cues: "Slide only as high as comfortable without shrugging or arching the back.",
    goal: "Prepare shoulder-blade control for machine pressing, rows, and pulldowns.",
    howTo: [
      "Stand with your back near a wall or sit tall.",
      "Keep ribs down and chin gently tucked.",
      "Slide forearms upward as far as comfortable.",
      "Let the shoulder blades rotate without shrugging.",
      "Lower with control.",
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
      "Sit on a chair and use a smaller arm range.",
      "Keep elbows lower than shoulder height.",
      "Do 4-6 reps if 8 feels like work.",
    ],
    completionTarget: "Complete 8 slow wall slides without shrugging.",
    intensity: DEFAULT_INTENSITY,
  },
  wallAngelsOrSlides: {
    id: "wall-angels-or-wall-slides",
    name: "Wall angels or wall slides",
    dose: "6-8 reps",
    cues: "Do not force overhead range; stop before shoulder pinch.",
    goal: "Prepare shoulder position and upper-back control for rows, pulldowns, and shoulder work.",
    howTo: [
      "Stand with your back near a wall or sit tall.",
      "Keep ribs down and chin gently tucked.",
      "Set the elbows and forearms near the wall if comfortable.",
      "Slide the arms upward only through a smooth range.",
      "Lower with control.",
      "Use wall slides if full wall angels feel pinchy.",
    ],
    beginnerPointers: [
      "Keep the ribs down.",
      "Let the range be smaller than you think.",
      "The neck should stay relaxed.",
    ],
    commonMistakes: [
      "Forcing the hands to touch the wall.",
      "Arching the low back to reach overhead.",
      "Shrugging through the movement.",
      "Pushing into shoulder pinch.",
    ],
    scaleDown: [
      "Use wall slides instead of wall angels.",
      "Keep elbows below shoulder height.",
      "Do the drill seated with a small range.",
    ],
    completionTarget: "Complete 6-8 easy reps without shoulder pinching.",
    intensity: DEFAULT_INTENSITY,
  },
  scapularCircles: {
    id: "scapular-circles",
    name: "Scapular circles",
    dose: "8 each direction",
    cues: "Move the shoulder blades in slow circles while the neck stays quiet.",
    goal: "Prepare scapular control without adding arm fatigue.",
    howTo: [
      "Stand or sit tall with arms relaxed.",
      "Gently move the shoulder blades up, back, down, and forward.",
      "Make slow circles in one direction.",
      "Reverse direction after 8 circles.",
      "Keep the ribs stacked and jaw relaxed.",
    ],
    beginnerPointers: [
      "The circles can be small.",
      "Keep shoulders away from the ears as much as possible.",
      "Move the shoulder blades, not the whole torso.",
    ],
    commonMistakes: [
      "Shrugging hard.",
      "Moving quickly through pinching.",
      "Arching the back.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do one shoulder blade at a time.",
      "Use smaller circles.",
      "Do 4 circles each direction.",
    ],
    completionTarget: "Complete 8 smooth circles each direction with no neck tension.",
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
    dose: "5 slow breaths",
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
    completionTarget: "Complete 5 slow controlled breaths.",
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
      "Use your hands for support if the hips feel stuck.",
      "Do not force the knees flat.",
    ],
    commonMistakes: [
      "Rushing side to side.",
      "Forcing hip range.",
      "Holding the breath.",
      "Pushing into hip pinching.",
    ],
    scaleDown: [
      "Sit on the edge of a chair or low bench.",
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
    name: "Half-kneeling or standing hip flexor stretch",
    dose: "20-30 sec/side",
    cues: "Tuck the pelvis slightly, squeeze the back-leg glute, then shift forward.",
    goal: "Open the front of the hips without irritating the lower back.",
    howTo: [
      "Set up in half-kneeling with one knee down and one foot forward.",
      "Use the standing version if kneeling on the floor is uncomfortable.",
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
    completionTarget: "Hold 20-30 seconds per side without lower-back pinching.",
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
      "Use the chair-supported version if the floor position bothers the knee.",
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
    name: "Bodyweight glute bridge",
    dose: "8-10 easy reps",
    cues: "Squeeze the glutes without arching the lower back.",
    goal: "Wake up the glutes before leg press or supported posterior-chain work.",
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
      "Use chair-supported sit-to-stand practice if getting to the floor is uncomfortable.",
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
    name: "Hamstring floss, seated or standing",
    dose: "8 reps/side",
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
      "Use the standing version with hands on a wall or chair.",
      "Do only ankle pumps with the leg forward if the hamstring stretch feels too intense.",
    ],
    completionTarget: "Complete 8 gentle floss reps per side without aggressive stretching.",
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
  pelvicTilts: {
    id: "pelvic-tilts",
    name: "Pelvic Tilts",
    dose: "1-2 sets x 8-12 slow reps",
    cues: "Small range. No forcing. Move with breath.",
    goal: "Restore gentle pelvis and lower-back motion without loading the spine.",
    howTo: [
      "Lie on your back with knees bent.",
      "Gently flatten the lower back toward the floor.",
      "Gently release back to neutral.",
      "Use a small controlled motion.",
    ],
    beginnerPointers: [
      "Keep the movement small.",
      "Breathe slowly as the pelvis moves.",
      "Stop before the motion turns into bracing.",
    ],
    commonMistakes: [
      "Forcing the lower back flat.",
      "Using a large fast range.",
      "Holding the breath.",
    ],
    scaleDown: [
      "Do fewer reps.",
      "Do seated pelvic tilts if floor work is uncomfortable.",
    ],
    completionTarget: "Complete 8-12 slow reps with pain staying 0-2/10.",
    painRule: "Stop if lower-back pain increases or nerve-like symptoms appear.",
    intensity: BACK_PAIN_RELIEF_INTENSITY,
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
  supportedHipHingeRockBack: {
    id: "supported-hip-hinge-rock-back",
    name: "Supported Hip-Hinge Rock-Back",
    dose: "1-2 sets x 6-10 reps",
    cues: "Long spine. Gentle range. No hamstring strain. No lower-back pinch.",
    goal: "Restore a gentle hip-hinge pattern without loading the spine.",
    howTo: [
      "Hold a bench, rack, counter, or wall.",
      "Push the hips back gently.",
      "Keep the spine long.",
      "Return to standing.",
      "Treat this as mobility, not a loaded hinge.",
    ],
    beginnerPointers: [
      "Use a small range.",
      "Let the support take pressure off the back.",
      "Stop before hamstrings or lower back feel strained.",
    ],
    commonMistakes: [
      "Turning it into a loaded hinge.",
      "Rounding the lower back.",
      "Chasing a big hamstring stretch.",
    ],
    scaleDown: [
      "Use a smaller range.",
      "Do seated forward rock-backs if needed.",
    ],
    completionTarget: "Complete 6-10 gentle reps without lower-back pinching.",
    painRule: "Stop if lower-back, hip, or nerve-like symptoms increase.",
    intensity: BACK_PAIN_RELIEF_INTENSITY,
  },
  latStretch: {
    id: "lat-stretch",
    name: "Wall lat stretch",
    dose: "20-30 sec/side",
    cues: "Reach long without hanging on the shoulder or flaring the ribs.",
    goal: "Open the lats for pulldowns, rows, and overhead shoulder positions.",
    howTo: [
      "Place both hands on a wall at about chest to shoulder height.",
      "Step back until the arms are long.",
      "Soften the knees.",
      "Shift the hips back.",
      "Breathe into the side ribs.",
      "Bias one side gently, then switch.",
    ],
    beginnerPointers: [
      "Keep the neck soft.",
      "Do not force the shoulders overhead.",
      "Move the hands lower on the wall if the back rounds.",
    ],
    commonMistakes: [
      "Hanging through the shoulders.",
      "Arching the lower back.",
      "Shrugging.",
      "Pushing into shoulder pinching.",
    ],
    scaleDown: [
      "Keep the arms lower.",
      "Hold for 15-20 seconds per side.",
      "Stand closer to the wall.",
    ],
    completionTarget: "Hold 20-30 seconds per side with no shoulder pinching.",
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
    name: "Hip hinge patterning against wall",
    dose: "8 reps",
    cues: "Push the hips back toward the wall without rounding the lower back.",
    goal: "Prepare the posterior chain for hamstring, glute, and back-extension work.",
    howTo: [
      "Stand about 6-10 inches in front of a wall with feet about hip-width.",
      "Place hands on the hips.",
      "Soften the knees.",
      "Push the hips backward until they lightly touch the wall.",
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
      "Put hands on a wall or chair for support.",
      "Use a smaller hip shift.",
      "Practice seated hip hinges from a chair.",
    ],
    completionTarget: "Complete 8 slow reps with the movement coming from the hips.",
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
      "Build foot and ankle control, ankle dorsiflexion, calf and soleus mobility, plantar-fascia resilience, knee tracking, and supported balance without adding fatigue.",
    exercises: [
      movement("anklePumps"),
      movement("ankleCircles"),
      movement("ankleRocks"),
      movement("calfStretch"),
      movement("calfStretchBent"),
      movement("supportedTandemBalance"),
      movement("supportedSingleLegBalanceKickstand"),
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

function breathingFinisher(label = "Breathing/reset close"): MobilityBlock {
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

function recoveryMovement(
  key: MovementKey,
  id: string,
  override: MovementOverride = {}
): MobilityExercise {
  return movement(key, {
    id,
    intensity: RECOVERY_INTENSITY,
    ...override,
  });
}

function footFlareFootBlock(idPrefix = "foot-flare"): MobilityBlock {
  return block({
    id: `${idPrefix}-foot-sole-downshift`,
    title: "Required foot-flare recovery",
    duration: "6-8 min",
    purpose:
      "Foot flare recovery is required when your soles are irritated or recent step load is high. Restore ankle motion, calf mobility, supported balance, and quiet foot pressure before adding anything else.",
    adaptationNote:
      "Effort 1-3/10. Pain 0-2/10 maximum. Prioritize easy ankle motion, supported balance, and quiet feet. No aggressive stretching, no unstable surfaces, no hard pressure, and no extra fatigue.",
    recoveryIntro: true,
    recoveryIntroVariant: "footFlare",
    exercises: [
      footFlareMovement("anklePumps", `${idPrefix}-seated-ankle-pumps`),
      footFlareMovement("ankleCircles", `${idPrefix}-ankle-circles`),
      footFlareMovement("ankleRocks", `${idPrefix}-wall-ankle-rocks`, {
        name: "Wall Ankle Rocks",
        completionTarget: "Complete 8-10 controlled rocks per side and stop before foot pain.",
      }),
      footFlareMovement("calfStretch", `${idPrefix}-calf-stretch-knee-straight`, {
        name: "Wall Calf Stretch - Knee Straight",
        completionTarget: "Hold 30 seconds per side with a mild stretch and no bouncing.",
      }),
      footFlareMovement("calfStretchBent", `${idPrefix}-calf-stretch-knee-bent`),
      footFlareMovement("supportedTandemBalance", `${idPrefix}-supported-tandem-balance`),
      footFlareMovement(
        "supportedSingleLegBalanceKickstand",
        `${idPrefix}-supported-single-leg-kickstand`
      ),
    ],
  });
}

function footFlareFullBodyBlock(dayOfWeek: number, idPrefix = "foot-flare"): MobilityBlock {
  if (dayOfWeek === 1) {
    return block({
      id: `${idPrefix}-lower-a-downshift`,
      title: "Lower-body downshift",
      duration: "4-6 min",
      purpose: "After Monday Lower A, keep foot work first and finish with breathing, pelvic tilts, and supported hip motion.",
      exercises: [
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
        footFlareMovement("pelvicTilts", `${idPrefix}-pelvic-tilts`),
        footFlareMovement("supportedHipHingeRockBack", `${idPrefix}-hip-hinge-rock-back`),
      ],
    });
  }

  if (dayOfWeek === 2) {
    return block({
      id: `${idPrefix}-upper-a-downshift`,
      title: "Shoulder and upper-back reset",
      duration: "4-6 min",
      purpose: "After Tuesday Upper A, keep the soles calm and finish with easy upper-back rotation and breathing.",
      exercises: [
        footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 3) {
    return block({
      id: `${idPrefix}-lower-b-downshift`,
      title: "Lower-body flush reset",
      duration: "4-6 min",
      purpose: "After Wednesday Lower B, keep the lower legs quiet first and finish with pelvic tilts and supported hinge motion.",
      exercises: [
        footFlareMovement("pelvicTilts", `${idPrefix}-pelvic-tilts`),
        footFlareMovement("supportedHipHingeRockBack", `${idPrefix}-hip-hinge-rock-back`),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 4) {
    return block({
      id: `${idPrefix}-upper-b-downshift`,
      title: "Shoulder and upper-back reset",
      duration: "4-6 min",
      purpose: "After Thursday Upper B, keep the soles calm and finish with easy upper-back rotation and breathing.",
      exercises: [
        footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`, {
          dose: "5-8 reps/side",
          completionTarget: "Complete 5-8 gentle reps per side without chasing maximum range.",
        }),
        footFlareMovement("scapularRetractionDepression", `${idPrefix}-scapular-reset`),
        footFlareMovement("supportedBreathingReset", `${idPrefix}-supported-breathing-reset`),
      ],
    });
  }

  if (dayOfWeek === 5) {
    return block({
      id: `${idPrefix}-weekly-reset-downshift`,
      title: "Weekly downshift reset",
      duration: "4-6 min",
      purpose: "After Friday Upper Accessory + Arms + Core, finish with easy balance, pelvic tilts, upper-back rotation, and breathing.",
      exercises: [
        footFlareMovement("supportedSingleLegBalanceKickstand", `${idPrefix}-single-leg-kickstand`, {
          dose: "10-20 seconds per side",
          completionTarget: "Hold 10-20 supported seconds per side.",
        }),
        footFlareMovement("pelvicTilts", `${idPrefix}-pelvic-tilts`),
        footFlareMovement("thoracicOpenBooks", `${idPrefix}-thoracic-open-books`, {
          dose: "5 reps/side",
          completionTarget: "Complete 5 gentle reps per side.",
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
      footFlareMovement("seatedHipRotations", "sunday-foot-flare-seated-hip-rotations"),
      footFlareMovement("seatedSpinalFlexionExtension", "sunday-foot-flare-seated-spine"),
      footFlareMovement("supportedBreathingReset", "sunday-foot-flare-supported-breathing-reset", {
        dose: "90 sec",
        completionTarget: "Breathe calmly for about 90 seconds and finish quieter than you started.",
      }),
    ],
  });
}

export const REQUIRED_LATER_RECOVERY_FOOT_FLARE_TITLE =
  "Required foot-flare recovery";

export const REQUIRED_LATER_RECOVERY: MobilityBlock = block({
  id: "day-1-lower-body-flush-sole-care",
  title: "Lower-Body Flush + Sole Care",
  duration: "10-14 min",
  purpose:
    "Complete later the same day after Monday Lower A. Downshift lower-body stress, restore foot/ankle motion, and keep pain 0-2/10 maximum.",
  adaptationNote:
    "Required later recovery does not have to be done immediately after training. Complete it later the same day after walking home, food, shower, or before bed. It is part of the training system, not extra work.",
  recoveryIntro: true,
  exercises: [
    recoveryMovement("anklePumps", "day-1-seated-ankle-pumps", {
      dose: "1-2 minutes",
      completionTarget: "Complete 1-2 minutes of smooth ankle pumps without forcing range.",
    }),
    recoveryMovement("ankleCircles", "day-1-ankle-circles", {
      dose: "1 set x 8-12 each direction",
      completionTarget: "Complete 8-12 slow circles each direction per side.",
    }),
    recoveryMovement("ankleRocks", "day-1-wall-ankle-rocks", {
      dose: "1-2 sets x 8-12 slow reps",
      completionTarget: "Complete 8-12 slow rocks per set while heel stays down.",
    }),
    recoveryMovement("calfStretch", "day-1-wall-calf-stretch-knee-straight", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("calfStretchBent", "day-1-wall-calf-stretch-knee-bent", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("supportedTandemBalance", "day-1-supported-tandem-balance", {
      dose: "1 round x 20-30 seconds each stance",
      completionTarget: "Hold each stance for 20-30 supported seconds.",
    }),
    recoveryMovement("supportedBreathingReset", "day-1-supported-breathing-reset", {
      dose: "2 minutes",
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
    }),
  ],
});

export const LOWER_BACK_RELIEF_TITLE = "Lower Back Relief — Mobility & Flexibility";

export const LOWER_BACK_RELIEF_SAFETY_NOTE =
  "Use if lower-back irritation is active or worsens during lower-body loading. Effort 1-3/10. Pain 0-2/10 maximum. Pain 3-4/10: reduce range, load, stance, or duration. Pain 5/10 or higher, sharp pain, pain shooting down the leg, numbness, tingling, weakness, limping, bowel/bladder changes, fever, or trauma-related pain: stop and seek medical evaluation. No loaded spinal flexion, heavy bracing, max effort, failure training, or fatigue.";

export const LOWER_BACK_RELIEF: MobilityBlock = block({
  id: "lower-back-relief-mobility-flexibility",
  title: LOWER_BACK_RELIEF_TITLE,
  duration: "8-12 min",
  purpose:
    "Reduce lower-back irritation, restore gentle spine/hip motion, and downshift tension without loading the spine heavily.",
  adaptationNote: LOWER_BACK_RELIEF_SAFETY_NOTE,
  exercises: [
    movement("supportedBreathingReset", {
      id: "lower-back-relief-supported-breathing-reset",
      name: "Supported Breathing Reset",
      dose: "2 minutes",
      cues: "Slow exhale. No bracing hard. Calm the system.",
      howTo: [
        "Lie on your back with knees bent, or sit supported if lying down is uncomfortable.",
        "Breathe slowly through the nose.",
        "Let the ribs drop down.",
        "Keep jaw, shoulders, and hips relaxed.",
      ],
      beginnerPointers: [
        "Let the exhale be slow.",
        "Keep the shoulders and jaw easy.",
        "This should feel calming, not effortful.",
      ],
      commonMistakes: [
        "Bracing hard.",
        "Trying to take huge breaths.",
        "Rushing the exhale.",
      ],
      scaleDown: [
        "Sit supported if floor work is uncomfortable.",
        "Breathe normally and make the exhale slightly slower.",
      ],
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
      painRule: "Stop if lying down increases symptoms.",
      intensity: BACK_PAIN_RELIEF_INTENSITY,
    }),
    movement("pelvicTilts"),
    movement("catCow", {
      id: "lower-back-relief-cat-cow",
      name: "Cat-Cow",
      dose: "1 set x 6-10 slow reps",
      cues: "Smooth motion. Do not force end range. Breathe steadily.",
      howTo: [
        "Start on hands and knees.",
        "Slowly round the upper and lower back.",
        "Slowly return through neutral into gentle extension.",
        "Keep the movement pain-free.",
      ],
      scaleDown: [
        "Do standing cat-cow with hands on a bench or wall.",
        "Use a smaller range.",
      ],
      completionTarget: "Complete 6-10 slow reps with pain-free motion.",
      painRule: "Stop if lower-back pain increases.",
      intensity: BACK_PAIN_RELIEF_INTENSITY,
    }),
    movement("supportedHipHingeRockBack"),
    movement("thoracicOpenBooks", {
      id: "lower-back-relief-open-book-thoracic-rotation",
      name: "Open Book Thoracic Rotation",
      dose: "1 set x 5-8 reps per side",
      cues: "Rotate through upper back, not lower back. Stay pain-free. Exhale into the turn.",
      howTo: [
        "Lie on your side with knees bent, or use a seated version if floor work is uncomfortable.",
        "Rotate the upper back gently.",
        "Keep the hips quiet.",
        "Move slowly.",
      ],
      scaleDown: [
        "Do seated thoracic rotation with arms crossed.",
        "Use a smaller range.",
      ],
      completionTarget: "Complete 5-8 easy reps per side without lower-back twisting.",
      painRule: "Stop if lower-back, hip, or shoulder pain increases.",
      intensity: BACK_PAIN_RELIEF_INTENSITY,
    }),
    movement("hipFlexorStretch", {
      id: "lower-back-relief-supported-hip-flexor-stretch",
      name: "Supported Hip Flexor Stretch",
      dose: "1-2 rounds x 20-30 seconds per side",
      cues: "Glute lightly on the back leg. Ribs down. No back arching.",
      howTo: [
        "Use a supported half-kneeling or standing split stance.",
        "Gently tuck the pelvis.",
        "Shift forward slightly.",
        "Feel the front of the hip, not lower-back compression.",
      ],
      scaleDown: [
        "Use the standing version only.",
        "Use a shorter hold.",
      ],
      completionTarget: "Hold 20-30 seconds per side and finish no more painful than when started.",
      painRule: "Stop if hip pinching or lower-back compression appears.",
      intensity: BACK_PAIN_RELIEF_INTENSITY,
    }),
  ],
});

const DAY_2_LATER_RECOVERY: MobilityBlock = block({
  id: "day-2-upper-body-downshift-foot-ankle-base",
  title: "Upper-Body Downshift + Foot/Ankle Base",
  duration: "8-12 min",
  purpose:
    "Complete later the same day after Tuesday Upper A. Keep foot and ankle work easy, then restore upper-back rotation and breathing.",
  adaptationNote: RECOVERY_STOP_NOTE,
  recoveryIntro: true,
  exercises: [
    recoveryMovement("anklePumps", "day-2-seated-ankle-pumps", {
      dose: "1 minute",
      completionTarget: "Complete 1 easy minute of ankle pumps.",
    }),
    recoveryMovement("ankleCircles", "day-2-ankle-circles", {
      dose: "1 set x 8-12 each direction",
      completionTarget: "Complete 8-12 slow circles each direction per side.",
    }),
    recoveryMovement("calfStretch", "day-2-wall-calf-stretch-knee-straight", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("calfStretchBent", "day-2-wall-calf-stretch-knee-bent", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("thoracicOpenBooks", "day-2-open-book-thoracic-rotation", {
      name: "Open Book Thoracic Rotation",
      dose: "1 set x 5-8 reps per side",
      completionTarget: "Complete 5-8 slow rotations per side.",
    }),
    recoveryMovement("supportedBreathingReset", "day-2-supported-breathing-reset", {
      dose: "2 minutes",
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
    }),
  ],
});

const DAY_3_LATER_RECOVERY: MobilityBlock = block({
  id: "day-3-lower-body-flush-back-care",
  title: "Lower-Body Flush + Back Care",
  duration: "10-14 min",
  purpose:
    "Complete later the same day after Wednesday Lower B. Keep lower-body recovery easy, foot-focused, and back-friendly.",
  adaptationNote: RECOVERY_STOP_NOTE,
  recoveryIntro: true,
  exercises: [
    recoveryMovement("anklePumps", "day-3-seated-ankle-pumps", {
      dose: "1-2 minutes",
      completionTarget: "Complete 1-2 minutes of smooth ankle pumps.",
    }),
    recoveryMovement("ankleCircles", "day-3-ankle-circles", {
      dose: "1 set x 8-12 each direction",
      completionTarget: "Complete 8-12 slow circles each direction per side.",
    }),
    recoveryMovement("ankleRocks", "day-3-wall-ankle-rocks", {
      dose: "1 set x 8-12 slow reps",
      completionTarget: "Complete 8-12 slow rocks while heel stays down.",
    }),
    recoveryMovement("calfStretch", "day-3-wall-calf-stretch-knee-straight", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("calfStretchBent", "day-3-wall-calf-stretch-knee-bent", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("pelvicTilts", "day-3-pelvic-tilts", {
      dose: "1 set x 8-12 slow reps",
      completionTarget: "Complete 8-12 slow pelvic tilts.",
    }),
    recoveryMovement("supportedHipHingeRockBack", "day-3-supported-hip-hinge-rock-back", {
      dose: "1 set x 6-10 reps",
      completionTarget: "Complete 6-10 supported hinge rock-backs.",
    }),
    recoveryMovement("supportedBreathingReset", "day-3-supported-breathing-reset", {
      dose: "2 minutes",
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
    }),
  ],
});

const DAY_4_LATER_RECOVERY: MobilityBlock = block({
  id: "day-4-shoulder-upper-back-reset-foot-base",
  title: "Shoulder / Upper-Back Reset + Foot Base",
  duration: "8-12 min",
  purpose:
    "Complete later the same day after Thursday Upper B. Keep foot and ankle work easy, then restore upper-back rotation and breathing.",
  adaptationNote: RECOVERY_STOP_NOTE,
  recoveryIntro: true,
  exercises: [
    recoveryMovement("anklePumps", "day-4-seated-ankle-pumps", {
      dose: "1 minute",
      completionTarget: "Complete 1 easy minute of ankle pumps.",
    }),
    recoveryMovement("ankleCircles", "day-4-ankle-circles", {
      dose: "1 set x 8-12 each direction",
      completionTarget: "Complete 8-12 slow circles each direction per side.",
    }),
    recoveryMovement("calfStretch", "day-4-wall-calf-stretch-knee-straight", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("calfStretchBent", "day-4-wall-calf-stretch-knee-bent", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("thoracicOpenBooks", "day-4-open-book-thoracic-rotation", {
      name: "Open Book Thoracic Rotation",
      dose: "1 set x 5-8 reps per side",
      completionTarget: "Complete 5-8 slow rotations per side.",
    }),
    recoveryMovement("supportedBreathingReset", "day-4-supported-breathing-reset", {
      dose: "2 minutes",
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
    }),
  ],
});

const DAY_5_LATER_RECOVERY: MobilityBlock = block({
  id: "day-5-weekly-downshift-foot-flare-recovery",
  title: "Weekly Downshift / Foot-Flare Recovery",
  duration: "12-16 min",
  purpose:
    "Complete later the same day after Friday Upper Accessory + Arms + Core. End the week with easy foot, ankle, balance, spine, and breathing work.",
  adaptationNote: RECOVERY_STOP_NOTE,
  recoveryIntro: true,
  exercises: [
    recoveryMovement("supportedBreathingReset", "day-5-supported-breathing-reset", {
      dose: "2 minutes",
      completionTarget: "Breathe for 2 easy minutes and finish calmer.",
    }),
    recoveryMovement("anklePumps", "day-5-seated-ankle-pumps", {
      dose: "1-2 minutes",
      completionTarget: "Complete 1-2 minutes of smooth ankle pumps.",
    }),
    recoveryMovement("ankleCircles", "day-5-ankle-circles", {
      dose: "1 set x 8-12 each direction",
      completionTarget: "Complete 8-12 slow circles each direction per side.",
    }),
    recoveryMovement("ankleRocks", "day-5-wall-ankle-rocks", {
      dose: "1-2 sets x 8-12 slow reps",
      completionTarget: "Complete 8-12 slow rocks per set while heel stays down.",
    }),
    recoveryMovement("calfStretch", "day-5-wall-calf-stretch-knee-straight", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("calfStretchBent", "day-5-wall-calf-stretch-knee-bent", {
      dose: "20-30 seconds per side",
      completionTarget: "Hold 20-30 easy seconds per side.",
    }),
    recoveryMovement("supportedTandemBalance", "day-5-supported-tandem-balance", {
      dose: "1 round x 20-30 seconds each stance",
      completionTarget: "Hold each stance for 20-30 supported seconds.",
    }),
    recoveryMovement("supportedSingleLegBalanceKickstand", "day-5-supported-single-leg-kickstand", {
      dose: "1 round x 10-20 seconds per side",
      completionTarget: "Hold 10-20 supported seconds per side without chasing instability.",
    }),
    recoveryMovement("pelvicTilts", "day-5-pelvic-tilts", {
      dose: "1 set x 8-12 slow reps",
      completionTarget: "Complete 8-12 slow pelvic tilts.",
    }),
    recoveryMovement("thoracicOpenBooks", "day-5-open-book-thoracic-rotation", {
      name: "Open Book Thoracic Rotation",
      dose: "1 set x 5 reps per side",
      completionTarget: "Complete 5 slow rotations per side.",
    }),
  ],
});

const STANDARD_LATER_RECOVERY_BY_DAY: Record<number, MobilityBlock> = {
  1: REQUIRED_LATER_RECOVERY,
  2: DAY_2_LATER_RECOVERY,
  3: DAY_3_LATER_RECOVERY,
  4: DAY_4_LATER_RECOVERY,
  5: DAY_5_LATER_RECOVERY,
};

export function getRequiredLaterRecoveryBlocks(
  mode: RecoveryMode = "standard",
  dayOfWeek = 1
): MobilityBlock[] {
  if (mode === "footFlare") {
    const idPrefix = `required-day-${dayOfWeek}-foot-flare`;
    return [
      footFlareFootBlock(idPrefix),
      footFlareFullBodyBlock(dayOfWeek, idPrefix),
      breathingFinisher("Recovery close"),
    ];
  }

  return [STANDARD_LATER_RECOVERY_BY_DAY[dayOfWeek] ?? REQUIRED_LATER_RECOVERY];
}

export function getRequiredLaterRecoveryTitle(
  mode: RecoveryMode = "standard",
  dayOfWeek = 1
) {
  if (mode === "footFlare") {
    return REQUIRED_LATER_RECOVERY_FOOT_FLARE_TITLE;
  }

  return (STANDARD_LATER_RECOVERY_BY_DAY[dayOfWeek] ?? REQUIRED_LATER_RECOVERY).title;
}

export const REQUIRED_LATER_RECOVERY_FOOT_FLARE = getRequiredLaterRecoveryBlocks("footFlare", 1);

const MOBILITY_PROGRAMS: Record<number, MobilityDayProgram> = {
  1: {
    dayOfWeek: 1,
    dayName: "Monday",
    trainingRole: "Lower A training day",
    sessionTitle: "Lower A primer",
    totalDuration: "6-10 min",
    todayPurpose:
      "Prepare feet, ankles, knees, hips, hamstrings, glutes, trunk, and breathing before the heaviest lower-body day.",
    previousDayReason:
      "Sunday was full rest, so this restores easy motion before leg press and lunge work.",
    adaptationNote:
      "Use support. Keep range comfortable. Do not force feet, knees, hips, or balance. This is preparation, not a workout.",
    completionSummary: "Done means ankles, hips, and trunk feel ready without fatigue.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Lower A setup", note: "Feet, ankles, knees, hips, hamstrings, glutes, and trunk." },
      { label: "Load rule", value: "Foot-controlled", note: "Walk to the gym only if foot load is tolerable." },
      { label: "Feel target", value: "Ready, not tired", note: "Leg positions should feel smoother, not stretched hard." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "monday-lower-a-prep",
        title: "Lower A prep block",
        duration: "3-5 min",
        purpose: "Prepare hips, trunk, and supported hinge positions for machine-supported leg work.",
        adaptationNote: "Keep this easy. Skip any floor option that irritates the lower back.",
        exercises: [
          movement("pelvicTilts"),
          movement("supportedHipHingeRockBack"),
          movement("hipFlexorStretch"),
          movement("gluteBridge"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  2: {
    dayOfWeek: 2,
    dayName: "Tuesday",
    trainingRole: "Upper A training day",
    sessionTitle: "Upper A primer",
    totalDuration: "6-10 min",
    todayPurpose:
      "Prepare feet, ankles, upper back, shoulders, chest, lats, elbows, wrists, and trunk for incline push, rows, pulldown, rear delts, and anti-rotation work.",
    previousDayReason:
      "Monday was Lower A, so this keeps lower-leg prep low-dose before upper-body training.",
    adaptationNote:
      "Keep shoulders down. Use supported balance only. Move slowly. This is preparation, not conditioning.",
    completionSummary: "Done means shoulders and upper back feel mobile while the lower legs stay calm.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Upper A setup", note: "Incline press, row, pulldown, rear delts, arms, and trunk control." },
      { label: "Load rule", value: "Foot-controlled", note: "Walk to the gym only if foot load is tolerable." },
      { label: "Feel target", value: "Shoulders quiet", note: "No shrugging, no pinch, calm breathing." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "tuesday-upper-a-prep",
        title: "Upper A prep block",
        duration: "3-5 min",
        purpose: "Prepare shoulders, thoracic spine, chest, lats, elbows, wrists, and trunk.",
        adaptationNote: "Move slowly. Do not force overhead range or shoulder stretch.",
        exercises: [
          movement("wallThoracicRotations"),
          movement("scapularWallSlides"),
          movement("doorwayPecStretch"),
          movement("latStretch"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  3: {
    dayOfWeek: 3,
    dayName: "Wednesday",
    trainingRole: "Lower B training day",
    sessionTitle: "Lower B primer",
    totalDuration: "6-10 min",
    todayPurpose:
      "Prepare feet, ankles, knees, hips, hamstrings, hip stability, trunk, and breathing for lower accessory work.",
    previousDayReason:
      "Tuesday was Upper A, so lower-body prep stays short, supported, and controlled.",
    adaptationNote:
      "Use support. Keep range comfortable. Do not force knees, hips, arches, or balance.",
    completionSummary: "Done means hips and ankles feel easier to position without adding fatigue.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Lower B setup", note: "Supported split squat, low-dose back extension, leg curl, leg extension, adduction, and abduction." },
      { label: "Foot rule", value: "No step chasing", note: "Gym walking is removed if soles are flaring." },
      { label: "Feel target", value: "Stable", note: "Hips stay quiet and breathing stays easy." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "wednesday-lower-b-prep",
        title: "Lower B prep block",
        duration: "3-5 min",
        purpose: "Prepare hips, trunk, and supported lower-body positions.",
        adaptationNote: "Keep this easy. Do not load the hinge or chase depth.",
        exercises: [
          movement("pelvicTilts"),
          movement("supportedHipHingeRockBack"),
          movement("hipFlexorStretch"),
          movement("ninetyNinetySwitches"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  4: {
    dayOfWeek: 4,
    dayName: "Thursday",
    trainingRole: "Upper B training day",
    sessionTitle: "Upper B primer",
    totalDuration: "6-10 min",
    todayPurpose:
      "Prepare feet, ankles, upper back, lats, chest, shoulders, arms, and breathing for machine press, rows, pulldown, shoulders, and arms.",
    previousDayReason:
      "Wednesday was Lower B, so this keeps lower-leg work quiet before upper-body training.",
    adaptationNote:
      "Keep prep easy. Do not force shoulder range or chase fatigue.",
    completionSummary: "Done means upper-back motion feels smooth and the lower legs stay calm.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Upper B setup", note: "Machine press, row, pulldown, lateral raise, triceps, biceps, and light overhead press." },
      { label: "Back rule", value: "Controlled press", note: "Remove overhead press first if lower back rises above 3/10." },
      { label: "Feel target", value: "Fresh", note: "Finish the primer with quiet breathing." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "thursday-upper-b-prep",
        title: "Upper B prep block",
        duration: "3-5 min",
        purpose: "Prepare upper back, lats, shoulders, elbows, wrists, and trunk before controlled upper-body strength work.",
        adaptationNote: "Do not force shoulder range. Stop before pinch.",
        exercises: [
          movement("wallThoracicRotations"),
          movement("scapularWallSlides"),
          movement("doorwayPecStretch"),
          movement("latStretch"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  5: {
    dayOfWeek: 5,
    dayName: "Friday",
    trainingRole: "Upper accessory training day",
    sessionTitle: "Upper accessory primer",
    totalDuration: "6-10 min",
    todayPurpose:
      "Prepare feet, ankles, upper back, rear delts, lats, chest, arms, trunk, and breathing for accessory upper-body and core work.",
    previousDayReason:
      "Thursday was Upper B, so Friday keeps prep simple before accessory rows, arms, rear delts, and trunk stability.",
    adaptationNote:
      "Keep prep easy. Friday is accessory strength work, not conditioning.",
    completionSummary: "Done means upper-back motion feels smooth and the lower legs stay calm.",
    logType: "PRE_WORKOUT",
    focus: [
      { label: "Training match", value: "Upper accessory setup", note: "Chest balance, row, arms, face pull, incline bench plank, and anti-rotation hold." },
      { label: "Trunk rule", value: "Control", note: "No heavy bracing and no loaded spinal flexion." },
      { label: "Feel target", value: "Fresh", note: "Finish the primer with quiet breathing." },
    ],
    blocks: [
      dailyLowerLegBase(),
      block({
        id: "friday-upper-accessory-prep",
        title: "Upper accessory prep block",
        duration: "3-5 min",
        purpose: "Prepare upper back, lats, rear delts, shoulders, elbows, and trunk before controlled accessory work.",
        adaptationNote: "Do not force shoulder range. Stop before pinch.",
        exercises: [
          movement("wallThoracicRotations"),
          movement("scapularCircles"),
          movement("doorwayPecStretch"),
          movement("latStretch"),
        ],
      }),
      breathingFinisher(),
    ],
  },
  6: {
    dayOfWeek: 6,
    dayName: "Saturday",
    trainingRole: "Complete Rest",
    sessionTitle: "Complete Rest",
    totalDuration: "0-8 min if stiff",
    todayPurpose:
      "Rest at home. Use mobility only if it improves foot, ankle, hip, or lower-back comfort.",
    previousDayReason:
      "Friday closed the five-day training week, so Saturday stays deliberately restful.",
    adaptationNote:
      "Optional only if it improves comfort. No gym, no make-up sets, and no step chasing.",
    completionSummary: "Done means you stayed rested and did not turn mobility into training.",
    logType: "POST_WORKOUT",
    focus: [
      { label: "Rest match", value: "Complete rest", note: "No gym and no make-up training." },
      { label: "Optional reset", value: "If helpful", note: "Use only if it improves foot, ankle, hip, or lower-back comfort." },
      { label: "Foot rule", value: "No step chasing", note: "Work steps count as load; irritated soles control walking." },
    ],
    blocks: [
      block({
        id: "saturday-complete-rest-optional-reset",
        title: "Complete Rest Optional Reset",
        duration: "0-8 min if helpful",
        purpose: "Use only if it improves foot, ankle, hip, or lower-back comfort. Keep it gentle and do not train.",
        adaptationNote: RECOVERY_STOP_NOTE,
        recoveryIntro: true,
        exercises: [
          recoveryMovement("supportedBreathingReset", "saturday-supported-breathing-reset", {
            name: "Supported Breathing Reset",
            dose: "2 minutes",
            completionTarget: "Breathe for 2 easy minutes and finish calmer.",
          }),
          recoveryMovement("anklePumps", "saturday-seated-ankle-pumps", {
            dose: "1-2 minutes",
            completionTarget: "Complete 1-2 minutes of smooth ankle pumps.",
          }),
          recoveryMovement("ankleCircles", "saturday-ankle-circles", {
            dose: "1 set x 8-12 gentle circles each direction per side",
            completionTarget: "Complete 8-12 slow circles each direction per side.",
          }),
          recoveryMovement("calfStretch", "saturday-wall-calf-stretch-knee-straight", {
            dose: "20-30 seconds per side",
            completionTarget: "Hold 20-30 easy seconds per side.",
          }),
          recoveryMovement("calfStretchBent", "saturday-wall-calf-stretch-knee-bent", {
            dose: "20-30 seconds per side",
            completionTarget: "Hold 20-30 easy seconds per side.",
          }),
        ],
      }),
    ],
  },
  0: {
    dayOfWeek: 0,
    dayName: "Sunday",
    trainingRole: "Complete Rest",
    sessionTitle: "Complete Rest",
    totalDuration: "0 min",
    todayPurpose:
      "Full rest. Keep the day empty and start the next week fresh.",
    previousDayReason:
      "Saturday was complete rest, so Sunday stays deliberately empty.",
    adaptationNote:
      "No gym, no make-up training, and no recovery checklist is scheduled.",
    completionSummary: "Done means the day stayed empty.",
    logType: "POST_WORKOUT",
    focus: [
      { label: "Rest match", value: "Complete rest", note: "Keep the day empty." },
      { label: "Previous day", value: "Recovery rest", note: "No make-up training after Saturday." },
      { label: "Feel target", value: "Fresh", note: "Start the next week without adding work." },
    ],
    blocks: [],
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

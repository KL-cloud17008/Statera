export type MobilityExercise = { name: string; dose: string; cues: string };
export type MobilityBlock = { title: string; duration: string; exercises: MobilityExercise[] };

const TRAINING_DAY_PRIMER: MobilityBlock = {
  title: "Training-Day Primer (8-12 min)",
  duration: "8-12 min",
  exercises: [
    { name: "Toe spreads / short-foot drill", dose: "60 sec", cues: "Spread toes, then create a stable arch without gripping hard." },
    { name: "Seated ankle pumps", dose: "2 x 12-20", cues: "Move slowly through a comfortable ankle range." },
    { name: "Seated calf stretch", dose: "30 sec/side", cues: "Keep the heel anchored and breathe." },
    { name: "Ankle rocks", dose: "10/side", cues: "Drive knee over toes while heel stays grounded." },
    { name: "90/90 hip switches", dose: "8 controlled reps", cues: "Move smoothly without forcing range." },
    { name: "Half-kneeling hip flexor stretch", dose: "30 sec/side", cues: "Posterior pelvic tilt first, then shift forward." },
    { name: "Cat-cow", dose: "6-8 reps", cues: "Move one segment at a time." },
    { name: "Thoracic open books", dose: "6/side", cues: "Keep knees stacked as ribcage rotates." },
    { name: "Seated bracing breaths", dose: "6-8 breaths", cues: "Exhale fully, brace gently, and keep shoulders relaxed." },
  ],
};

const REST_DAY_RECOVERY: MobilityBlock = {
  title: "Rest-Day Recovery Mobility (20-30 min)",
  duration: "20-30 min",
  exercises: [
    { name: "Foot activation", dose: "2 min", cues: "Toe yoga and short-foot work." },
    { name: "Calf and ankle mobility", dose: "6-8 min", cues: "Alternate calf stretching with seated ankle pump work." },
    { name: "Hip flexor mobility", dose: "2 x 30 sec/side", cues: "Stay tall and breathe through each hold." },
    { name: "90/90 transitions", dose: "8-12 reps", cues: "Controlled transitions; hands-assisted if needed." },
    { name: "Adductor rock-backs", dose: "8-10/side", cues: "Neutral spine, gentle range progression." },
    { name: "Thoracic rotations", dose: "8/side", cues: "Rotate through upper back, not low back." },
    { name: "Cat-cow", dose: "8 reps", cues: "Use long exhales to down-regulate." },
    { name: "Child's pose breathing", dose: "90 sec", cues: "Nasal inhale, long calm exhale." },
    { name: "Seated bracing breaths", dose: "2 controlled rounds", cues: "Finish with calm breathing and light trunk tension." },
  ],
};

export const UNDO_SITTING: MobilityBlock = {
  title: "Desk Reset (optional)",
  duration: "3-5 min",
  exercises: [
    { name: "Standing hip extension", dose: "8/side", cues: "Squeeze glute at end range." },
    { name: "Wall chest opener", dose: "30 sec", cues: "Open chest without flaring ribs." },
    { name: "Standing thoracic rotation", dose: "6/side", cues: "Keep hips quiet." },
  ],
};

export function getPreWorkoutChecklist(dayOfWeek: number, version: "A" | "B"): MobilityBlock[] {
  void dayOfWeek;
  void version;
  return [TRAINING_DAY_PRIMER];
}

export function getPostWorkoutChecklist(dayOfWeek: number): MobilityBlock[] {
  void dayOfWeek;
  return [REST_DAY_RECOVERY];
}

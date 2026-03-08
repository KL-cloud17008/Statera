export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio"
  | "Full Body";

export type LibraryExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  notes?: string;
  source: "builtin" | "custom";
};

export type WorkoutTemplateExercise = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
  createdAt: string;
};

export type FreeWorkoutSessionDraft = {
  label: string;
  exercises: WorkoutTemplateExercise[];
  startedAt: string;
};

export const DEFAULT_EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: "bench-press", name: "Bench Press", muscleGroup: "Chest", defaultSets: 4, defaultReps: "5-8", defaultRestSeconds: 120, source: "builtin" },
  { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", muscleGroup: "Chest", defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 90, source: "builtin" },
  { id: "chest-fly", name: "Chest Fly", muscleGroup: "Chest", defaultSets: 3, defaultReps: "10-15", defaultRestSeconds: 60, source: "builtin" },
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "Back", defaultSets: 4, defaultReps: "6-10", defaultRestSeconds: 120, source: "builtin" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "Back", defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 90, source: "builtin" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "Back", defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 90, source: "builtin" },
  { id: "back-squat", name: "Back Squat", muscleGroup: "Legs", defaultSets: 4, defaultReps: "5-8", defaultRestSeconds: 150, source: "builtin" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "Legs", defaultSets: 4, defaultReps: "8-12", defaultRestSeconds: 120, source: "builtin" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroup: "Legs", defaultSets: 3, defaultReps: "6-10", defaultRestSeconds: 120, source: "builtin" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "Legs", defaultSets: 3, defaultReps: "10-15", defaultRestSeconds: 75, source: "builtin" },
  { id: "standing-calf-raise", name: "Standing Calf Raise", muscleGroup: "Legs", defaultSets: 3, defaultReps: "12-20", defaultRestSeconds: 60, source: "builtin" },
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "Shoulders", defaultSets: 4, defaultReps: "5-8", defaultRestSeconds: 120, source: "builtin" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "Shoulders", defaultSets: 3, defaultReps: "12-15", defaultRestSeconds: 60, source: "builtin" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroup: "Shoulders", defaultSets: 3, defaultReps: "12-15", defaultRestSeconds: 60, source: "builtin" },
  { id: "barbell-curl", name: "Barbell Curl", muscleGroup: "Arms", defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 60, source: "builtin" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "Arms", defaultSets: 3, defaultReps: "10-12", defaultRestSeconds: 60, source: "builtin" },
  { id: "triceps-pushdown", name: "Triceps Pushdown", muscleGroup: "Arms", defaultSets: 3, defaultReps: "10-15", defaultRestSeconds: 60, source: "builtin" },
  { id: "skull-crusher", name: "Skull Crusher", muscleGroup: "Arms", defaultSets: 3, defaultReps: "8-12", defaultRestSeconds: 75, source: "builtin" },
  { id: "plank", name: "Plank", muscleGroup: "Core", defaultSets: 3, defaultReps: "30-60 sec", defaultRestSeconds: 45, source: "builtin" },
  { id: "hanging-knee-raise", name: "Hanging Knee Raise", muscleGroup: "Core", defaultSets: 3, defaultReps: "10-15", defaultRestSeconds: 60, source: "builtin" },
  { id: "farmers-carry", name: "Farmer's Carry", muscleGroup: "Full Body", defaultSets: 3, defaultReps: "40 m", defaultRestSeconds: 90, source: "builtin" },
  { id: "assault-bike", name: "Assault Bike", muscleGroup: "Cardio", defaultSets: 1, defaultReps: "10 min", defaultRestSeconds: 0, source: "builtin" }
];

export function makeCustomExerciseId(name: string) {
  return `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

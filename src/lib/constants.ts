export const APP_NAME = "Athanor";

export const DEFAULT_TIMEZONE = "America/New_York";

/** Fallback for accounts without a time zone. */
export const TRAINING_TIMEZONE = "America/New_York";

// Macro targets (defaults from spec)
export const DEFAULT_CALORIC_TARGET = 2874;
export const DEFAULT_PROTEIN_TARGET = 305;
export const DEFAULT_CARB_TARGET = 207;
export const DEFAULT_FAT_TARGET = 83;

// dayOfWeek values stored in the DB follow the local calendar (0 = Sunday).
export const DEFAULT_TRAINING_DAYS = [0, 1, 2, 3, 4, 5];
export const DEFAULT_REST_DAYS = [6];
export const DEFAULT_RECOVERY_DAYS: number[] = [];

/** Labels for training days, keyed by dayOfWeek. */
export const TRAINING_DAY_LABELS: Record<number, string> = {
  0: "Sunday • Farmer walks, glutes and abs",
  1: "Monday • Lower A — Walking lunges, pendulum squat and triceps",
  2: "Tuesday • Upper A — Chest press, paired pulldowns, row and abs",
  3: "Wednesday • Lower B — Bulgarian split squat, pendulum squat and biceps",
  4: "Thursday • Upper B — Chest press, T-bar row, arms and abs",
  5: "Friday • Upper C — Chest, rear delts, triceps and hips",
};

// Navigation items
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" as const },
  { label: "Mobility", href: "/mobility", icon: "PersonStanding" as const },
  { label: "Flexibility & Balance", href: "/flexibility-balance", icon: "Activity" as const },
  { label: "Training", href: "/workout", icon: "Dumbbell" as const },
  { label: "Steps", href: "/steps", icon: "Footprints" as const },
  { label: "Weight", href: "/weight", icon: "Scale" as const },
  { label: "Settings", href: "/settings", icon: "Settings" as const },
] as const;

// User profile defaults
export const DEFAULT_HEIGHT_INCHES = 69; // 5'9"
export const DEFAULT_START_WEIGHT = 326.7;

export const APP_NAME = "Athanor";

export const DEFAULT_TIMEZONE = "America/New_York";

/** All training date calculations use this timezone. */
export const TRAINING_TIMEZONE = "America/New_York";

// Macro targets (defaults from spec)
export const DEFAULT_CALORIC_TARGET = 2874;
export const DEFAULT_PROTEIN_TARGET = 305;
export const DEFAULT_CARB_TARGET = 207;
export const DEFAULT_FAT_TARGET = 83;

// Training schedule — dayOfWeek values stored in DB (adjusted current week)
// Day 1 = Sunday night (training date Mon), Day 2 = Monday night (Tue), etc.
export const DEFAULT_TRAINING_DAYS = [1, 3, 4, 5];
export const DEFAULT_REST_DAYS = [0, 6]; // Sat and Sun training dates = full rest
export const DEFAULT_RECOVERY_DAYS = [2]; // Tuesday recovery override / no gym

// Training day boundary (hour in TRAINING_TIMEZONE)
export const TRAINING_DAY_BOUNDARY_HOUR = 12; // noon

/** Labels for training days — keyed by dayOfWeek (DB value 1-5). */
export const TRAINING_DAY_LABELS: Record<number, string> = {
  1: "Monday • Lower A — Leg Strength Peak / Machine-Supported",
  2: "Tuesday • Recovery Override — No Gym",
  3: "Wednesday • Upper A — Push/Pull Strength",
  4: "Thursday • Lower B — Low-Dose Legs + Hip Stability",
  5: "Friday • Upper B — Machine Upper + Arms / Training Reset",
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

export const APP_NAME = "Athnaor";

export const DEFAULT_TIMEZONE = "America/New_York";

/** All training date calculations use this timezone. */
export const TRAINING_TIMEZONE = "America/New_York";

// Macro targets (defaults from spec)
export const DEFAULT_CALORIC_TARGET = 2874;
export const DEFAULT_PROTEIN_TARGET = 305;
export const DEFAULT_CARB_TARGET = 207;
export const DEFAULT_FAT_TARGET = 83;

// Training schedule — dayOfWeek values stored in DB (1-5 = Mon-Fri training dates)
// Day 1 = Sunday night (training date Mon), Day 2 = Monday night (Tue), etc.
export const DEFAULT_TRAINING_DAYS = [1, 2, 3, 4, 5];
export const DEFAULT_REST_DAYS = [0, 6]; // Sat, Sun training dates = rest

// Training day boundary (hour in TRAINING_TIMEZONE)
export const TRAINING_DAY_BOUNDARY_HOUR = 12; // noon

/** Labels for training days — keyed by dayOfWeek (DB value 1-5). */
export const TRAINING_DAY_LABELS: Record<number, string> = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

// Navigation items
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" as const },
  { label: "Workout", href: "/workout", icon: "Dumbbell" as const },
  { label: "Nutrition", href: "/nutrition", icon: "Apple" as const },
  { label: "Weight", href: "/weight", icon: "Scale" as const },
  { label: "Settings", href: "/settings", icon: "Settings" as const },
] as const;

// User profile defaults
export const DEFAULT_HEIGHT_INCHES = 69; // 5'9"
export const DEFAULT_START_WEIGHT = 326.7;

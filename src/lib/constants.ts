export const APP_NAME = "ATHANOR";

export const DEFAULT_TIMEZONE = "America/New_York";

// Macro targets (defaults from spec)
export const DEFAULT_CALORIC_TARGET = 2874;
export const DEFAULT_PROTEIN_TARGET = 305;
export const DEFAULT_CARB_TARGET = 207;
export const DEFAULT_FAT_TARGET = 83;

// Training schedule
export const DEFAULT_TRAINING_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri
export const DEFAULT_REST_DAYS = [0, 6]; // Sun, Sat

// Training day boundary (hour)
export const TRAINING_DAY_BOUNDARY_HOUR = 12; // noon

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

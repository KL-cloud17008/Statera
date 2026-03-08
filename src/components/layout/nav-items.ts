import {
  Apple,
  Dumbbell,
  Footprints,
  LayoutDashboard,
  PersonStanding,
  Scale,
  Settings,
  type LucideIcon,
} from "lucide-react";

export const NAV_ITEMS: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Workout", href: "/workout", icon: Dumbbell },
  { label: "Mobility", href: "/mobility", icon: PersonStanding },
  { label: "Nutrition", href: "/nutrition", icon: Apple },
  { label: "Weight", href: "/weight", icon: Scale },
  { label: "Steps", href: "/steps", icon: Footprints },
  { label: "Settings", href: "/settings", icon: Settings },
];

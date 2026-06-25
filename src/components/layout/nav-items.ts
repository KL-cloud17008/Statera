import {
  Activity,
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
  { label: "Mobility", href: "/mobility", icon: PersonStanding },
  { label: "Flexibility & Balance", href: "/flexibility-balance", icon: Activity },
  { label: "Training", href: "/workout", icon: Dumbbell },
  { label: "Steps", href: "/steps", icon: Footprints },
  { label: "Weight", href: "/weight", icon: Scale },
  { label: "Settings", href: "/settings", icon: Settings },
];

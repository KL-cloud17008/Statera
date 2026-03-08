"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  const pathname = usePathname();
  const activeLabel = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    );
    return match?.label ?? "Dashboard";
  }, [pathname]);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="editorial-panel flex items-center justify-between rounded-[1.45rem] px-4 py-3">
        <div>
          <p className="eyebrow">{activeLabel}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="outline" size="icon-sm" className="rounded-full">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

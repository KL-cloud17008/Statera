"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/94 px-5 pb-3 pt-[max(env(safe-area-inset-top),0.9rem)] backdrop-blur-xl md:hidden">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary/60">
            <BrandMark className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">{activeLabel}</p>
            <p className="mt-1 text-[1rem] font-medium tracking-normal text-foreground">Athanor</p>
          </div>
        </div>
        <div className="hidden min-[440px]:block">
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

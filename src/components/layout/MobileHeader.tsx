"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
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
    <header className="sticky top-0 z-40 px-3 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] md:hidden">
      <div className="chrome-surface flex items-end justify-between gap-4 rounded-[var(--radius-panel)] border px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sidebar-foreground shadow-[color-mix(in_srgb,var(--sky-accent)_18%,transparent)_0_0_24px]">
            <BrandMark className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/52">{activeLabel}</p>
            <p className="mt-1 text-[1rem] font-semibold tracking-normal text-sidebar-foreground">Athanor</p>
          </div>
        </div>
        <div className="hidden min-[440px]:block">
          <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-xs font-medium text-white/58">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" className="text-white/58 hover:bg-white/8 hover:text-white">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

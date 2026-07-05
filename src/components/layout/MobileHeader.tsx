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
      <div className="chrome-surface flex items-end justify-between gap-4 rounded-[var(--radius-panel)] border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.05)] text-[var(--cream)]">
            <BrandMark className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[var(--cream-3)]">{activeLabel}</p>
            <p className="mt-1 [font-family:var(--font-display)] text-[1.08rem] font-[380] tracking-[-0.01em] text-[var(--cream)]">Athanor</p>
          </div>
        </div>
        <div className="hidden min-[440px]:block">
          <div className="mt-2 flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.04)] px-3 py-1.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[var(--cream-2)]">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" className="text-[var(--cream-3)] hover:text-[var(--cream)]">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

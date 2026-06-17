"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 hidden px-4 py-3 md:block">
      <div className="chrome-surface mx-auto flex h-16 max-w-[104rem] items-center gap-5 rounded-full border px-3 backdrop-blur-xl lg:px-4">
        <Link href="/" className="flex min-w-48 items-center gap-3 text-sidebar-foreground">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sidebar-foreground">
            <BrandMark className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-[1.04rem] font-medium tracking-normal">Athanor</p>
            <p className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/48">Training ledger</p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="flex flex-1 items-center justify-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[0.74rem] font-semibold uppercase tracking-[0.12em] transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_rgba(191,110,72,0.72),0_0_0_5px_rgba(191,110,72,0.22)]",
                  isActive
                    ? "border-[rgba(191,110,72,0.5)] bg-[rgba(191,110,72,0.18)] text-[#fff6ec] shadow-[rgba(191,110,72,0.2)_0_0_0_1px_inset]"
                    : "border-transparent text-white/56 hover:border-white/12 hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-[#e6a07d]" : "text-white/45 group-hover:text-white/82"
                  )}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-48 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-white/58 xl:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" aria-label="Sign out" className="text-white/58 hover:bg-white/8 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

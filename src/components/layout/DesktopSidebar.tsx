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
      <div className="chrome-surface mx-auto flex h-16 max-w-[112rem] items-center gap-3 rounded-full border px-3 backdrop-blur-xl lg:gap-4 lg:px-4">
        <Link href="/" className="group flex min-w-[11rem] items-center gap-3 text-sidebar-foreground focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_rgba(112,199,255,0.72),0_0_0_5px_rgba(79,124,255,0.22)]">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sidebar-foreground shadow-[rgba(112,199,255,0.18)_0_0_24px] transition-colors group-hover:border-white/24">
            <BrandMark className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-[1.04rem] font-semibold tracking-normal">Athanor</p>
            <p className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/52">Prime ledger</p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hide-scrollbar flex flex-1 items-center justify-start gap-1 overflow-x-auto px-1 xl:justify-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-[0.78rem] font-semibold tracking-normal transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_rgba(107,128,255,0.72),0_0_0_5px_rgba(107,128,255,0.22)] motion-reduce:transition-none",
                  isActive
                    ? "border-[rgba(112,199,255,0.44)] bg-[rgba(112,199,255,0.12)] text-white shadow-[rgba(112,199,255,0.22)_0_0_0_1px_inset,rgba(79,124,255,0.18)_0_0_24px]"
                    : "border-transparent text-white/62 hover:border-white/14 hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors duration-150 motion-reduce:transition-none",
                    isActive ? "text-[#9fdbff]" : "text-white/48 group-hover:text-white/82"
                  )}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-[3rem] items-center justify-end gap-3 xl:min-w-[10.5rem]">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-white/62 xl:flex">
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

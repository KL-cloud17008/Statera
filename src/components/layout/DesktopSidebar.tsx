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
      <div className="chrome-surface mx-auto flex h-16 max-w-[112rem] items-center gap-3 rounded-full border px-3 lg:gap-4 lg:px-4">
        <Link
          href="/"
          className="group flex min-w-[11rem] items-center gap-3 text-[var(--cream)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)]"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.05)] text-[var(--cream)] transition-colors group-hover:border-[var(--hairline-strong)]">
            <BrandMark className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="[font-family:var(--font-display)] text-[1.12rem] font-[380] tracking-[-0.01em]">Athanor</p>
            <p className="mt-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--cream-3)]">Prime ledger</p>
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
                  "group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] transition-[background-color,border-color,color] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0",
                  isActive
                    ? "border-[var(--hairline-strong)] bg-[rgba(240,232,220,0.07)] text-[var(--cream)]"
                    : "border-transparent text-[var(--cream-3)] hover:bg-[rgba(240,232,220,0.05)] hover:text-[var(--cream)]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none",
                    isActive ? "text-[var(--ember-bright)]" : "text-[var(--cream-3)] group-hover:text-[var(--cream-2)]"
                  )}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-[3rem] items-center justify-end gap-3 xl:min-w-[10.5rem]">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.04)] px-3 py-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--cream-2)] xl:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" aria-label="Sign out" className="text-[var(--cream-3)] hover:text-[var(--cream)]">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

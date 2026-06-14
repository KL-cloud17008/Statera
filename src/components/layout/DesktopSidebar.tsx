"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    <header className="chrome-surface sticky top-0 z-40 hidden border-b backdrop-blur-xl md:block">
      <div className="mx-auto flex h-20 max-w-[118rem] items-center gap-8 px-8 lg:px-12">
        <Link href="/" className="flex min-w-48 items-center gap-3 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-foreground">
            <BrandMark className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-[1.04rem] font-medium tracking-normal">Athanor</p>
            <p className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Training ledger</p>
          </div>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[0.78rem] font-medium uppercase tracking-[0.12em] transition-colors duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_36%,transparent),0_0_0_5px_var(--ring)]",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-card/72 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-48 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 text-[0.76rem] font-medium uppercase tracking-[0.13em] text-muted-foreground xl:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </div>
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

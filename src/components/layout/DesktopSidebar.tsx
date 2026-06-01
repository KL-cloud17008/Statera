"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Circle, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[16.25rem] border-r border-sidebar-border bg-sidebar/76 px-5 py-6 backdrop-blur-2xl md:flex md:flex-col">
      <div className="pointer-events-none absolute inset-y-6 right-0 w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />
      <div className="rounded-[1.35rem] border border-sidebar-border/70 bg-card/34 p-4 shadow-[rgba(22,15,12,0.035)_0_0_0_1px_inset] dark:bg-card/20">
        <div className="flex items-center gap-3 text-foreground">
          <span className="flex size-10 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/62">
            <BrandMark className="h-5 w-5 text-foreground" />
          </span>
          <div>
            <p className="text-[1.05rem] font-medium leading-none tracking-[-0.052em]">Athanor</p>
            <p className="mt-1.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">Training ledger</p>
          </div>
        </div>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.86rem] transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_36%,transparent),0_0_0_5px_var(--ring)]",
                isActive
                  ? "bg-sidebar-accent/88 text-sidebar-accent-foreground shadow-[rgba(22,15,12,0.05)_0_0_0_1px_inset]"
                  : "text-muted-foreground hover:-translate-y-px hover:bg-sidebar-accent/52 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-150",
                  isActive ? "text-foreground" : "text-muted-foreground/76 group-hover:text-foreground"
                )}
                strokeWidth={1.9}
              />
              <span className="tracking-[-0.01em]">{item.label}</span>
              {isActive ? <Circle className="ml-auto h-1.5 w-1.5 fill-current text-foreground/70" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-5 rounded-[1.35rem] border border-sidebar-border/70 bg-card/28 p-4 shadow-[rgba(22,15,12,0.03)_0_0_0_1px_inset] dark:bg-card/16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Appearance</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Warm-neutral canvas with matched dark mode.</p>
          </div>
          <ThemeToggle />
        </div>
        <form action={signOut}>
          <Button variant="ghost" className="h-10 px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}

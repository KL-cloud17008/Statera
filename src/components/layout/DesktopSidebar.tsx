"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-shell-grid fixed inset-y-0 left-0 z-30 hidden w-[18rem] border-r border-sidebar-border bg-sidebar/80 px-5 py-6 backdrop-blur-xl md:flex md:flex-col">
      <div className="surface-elevated rounded-[--radius-panel] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_32px_rgba(68,227,157,0.22)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Fittrack</p>
            <p className="text-lg font-semibold text-foreground">ATHANOR</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Build consistency across training, recovery, bodyweight, and daily movement.
        </p>
      </div>

      <nav className="mt-6 flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)]",
                isActive
                  ? "surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent transition-colors",
                  isActive ? "bg-primary/14 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="surface-card mt-6 space-y-4 rounded-[--radius-surface] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Appearance</p>
            <p className="text-xs text-muted-foreground">Dark is default. Flip anytime.</p>
          </div>
          <ThemeToggle />
        </div>
        <form action={signOut}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}

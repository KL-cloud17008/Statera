"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-shell-grid fixed inset-y-0 left-0 z-30 hidden w-[16.25rem] border-r border-sidebar-border/60 bg-sidebar/58 px-6 py-8 backdrop-blur-xl md:flex md:flex-col">
      <div>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-foreground/86">
            <polygon points="32,8 48,34 16,34" fill="currentColor" />
            <polygon points="32,30 48,56 16,56" fill="currentColor" opacity="0.35" />
          </svg>
          <p className="text-[1.05rem] font-semibold tracking-[-0.05em] text-foreground">Athanor</p>
        </div>
      </div>

      <nav className="mt-14 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)]",
                isActive ? "bg-white/[0.04] text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-150",
                  isActive ? "text-foreground" : "text-muted-foreground/72 group-hover:text-foreground"
                )}
                strokeWidth={2}
              />
              <span className="tracking-[-0.01em]">{item.label}</span>
              {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/80" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-5 border-t border-white/8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Theme</p>
            <p className="mt-2 text-sm text-muted-foreground">Dark is the default. Switch if needed.</p>
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

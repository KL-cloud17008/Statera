"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-shell-grid fixed inset-y-0 left-0 z-30 hidden w-[16.25rem] border-r border-sidebar-border bg-sidebar/86 px-6 py-8 backdrop-blur-xl md:flex md:flex-col">
      <div>
        <div className="flex items-center gap-3 text-foreground">
          <BrandMark className="text-foreground" />
          <p className="text-[1.05rem] font-medium tracking-[-0.045em]">Athanor</p>
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
                "group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_36%,transparent),0_0_0_5px_var(--ring)]",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[rgba(0,0,0,0.045)_0_0_0_1px_inset]"
                  : "text-muted-foreground hover:bg-sidebar-accent/58 hover:text-foreground"
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
              {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/70" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-5 border-t border-sidebar-border pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Appearance</p>
            <p className="mt-2 text-sm text-muted-foreground">Light-first, quiet dark when needed.</p>
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

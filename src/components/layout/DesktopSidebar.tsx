"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-hairline bg-canvas/90 backdrop-blur-sm md:block">
      <div className="app-container flex h-14 items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-primary"
          aria-label="Athanor — dashboard"
        >
          <BrandMark className="size-5" />
          <span className="text-body font-semibold tracking-tight">Athanor</span>
        </Link>

        <nav aria-label="Primary" className="hide-scrollbar -mb-px flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-14 shrink-0 items-center gap-2 border-b-2 px-3 text-label",
                  "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                  isActive
                    ? "border-accent text-primary"
                    : "border-transparent text-tertiary hover:text-primary"
                )}
              >
                <item.icon className="size-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="shrink-0">
          <Button variant="ghost" size="icon-sm" type="submit" aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/80 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl md:hidden">
      <div className="hide-scrollbar flex items-center justify-between gap-1 overflow-x-auto px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[3.8rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[10.5px] font-medium tracking-wide transition-colors duration-150",
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

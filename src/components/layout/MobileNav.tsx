"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="chrome-surface fixed inset-x-0 bottom-0 z-50 border-t px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2.5 backdrop-blur-xl md:hidden">
      <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[3.1rem] min-w-[4.45rem] flex-col items-center justify-center gap-1 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150",
                isActive ? "border-primary bg-primary text-primary-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              <item.icon className="h-[1rem] w-[1rem]" strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

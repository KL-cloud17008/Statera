"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-background/88 px-4 pb-[calc(env(safe-area-inset-bottom)+0.8rem)] pt-3 backdrop-blur-xl md:hidden">
      <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto border-t border-white/8 px-1 pt-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[3.4rem] min-w-[4.6rem] flex-col items-center justify-center gap-1 border-t px-3 pb-2 pt-2 text-[11px] transition-colors duration-150",
                isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              <item.icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={isActive ? 2.2 : 1.95} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/70 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl md:hidden">
      <div className="surface-card hide-scrollbar flex items-center gap-2 overflow-x-auto rounded-[1.6rem] px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[3.5rem] min-w-[4.8rem] flex-col items-center justify-center gap-1 rounded-[1.2rem] px-3 py-2 text-[11px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/14 text-primary shadow-[0_10px_24px_rgba(68,227,157,0.18)]"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.35 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

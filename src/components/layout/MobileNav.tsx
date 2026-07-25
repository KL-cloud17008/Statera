"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      data-mobile-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-card/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="hide-scrollbar flex items-stretch overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-touch min-w-touch flex-col items-center justify-center gap-1 px-2 py-2",
                  "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                  isActive ? "text-primary" : "text-tertiary hover:text-secondary"
                )}
              >
                <item.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="w-full truncate text-center text-micro">{item.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-6 rounded-pill",
                    isActive ? "bg-accent" : "bg-transparent"
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

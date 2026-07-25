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
      className="fixed inset-x-0 bottom-0 z-40 bg-obsidian md:hidden"
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
                  "relative flex min-h-touch min-w-touch flex-col items-center justify-center gap-1 px-1 py-2",
                  "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                  isActive ? "text-obsidian-text" : "text-obsidian-dim"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 top-0 h-0.5 rounded-pill",
                    isActive ? "bg-accent-bright" : "bg-transparent"
                  )}
                />
                <item.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="w-full truncate text-center text-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

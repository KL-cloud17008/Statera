"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

/**
 * Display-only label overrides for the bottom bar. Seven tabs across 390px
 * leaves ~56px each, which truncated every label ("Flexib…", "Dashb…").
 * NAV_ITEMS stays the source of truth for routes, icons, and order — this
 * only shortens what is painted in the tab strip, where the header above
 * already names the current page in full.
 */
const TAB_LABEL_OVERRIDES: Record<string, string> = {
  "Flexibility & Balance": "Balance",
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      data-mobile-nav
      className="fixed inset-x-0 bottom-0 z-40 bg-ink md:hidden"
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
                  "relative flex min-h-touch min-w-touch flex-col items-center justify-center gap-1 px-0.5 py-2",
                  "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                  isActive ? "text-ink-text" : "text-ink-dim"
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
                <span className="w-full truncate text-center text-[0.625rem] leading-tight tracking-tight">
                  {TAB_LABEL_OVERRIDES[item.label] ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

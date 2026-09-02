"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

/* Five primary destinations preserve readable labels at 360px. The remaining
   routes stay one tap away in a small, anchored More tray. */
const PRIMARY_LABELS = ["Dashboard", "Training", "Mobility", "Steps", "Weight"];
const primaryItems = NAV_ITEMS.filter((item) => PRIMARY_LABELS.includes(item.label));
const secondaryItems = NAV_ITEMS.filter((item) => !PRIMARY_LABELS.includes(item.label));

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isSecondaryActive = secondaryItems.some((item) => pathname.startsWith(item.href));

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Primary"
      data-mobile-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {moreOpen ? (
        <div className="absolute inset-x-3 bottom-[calc(100%+0.5rem)] rounded-panel border border-ink-line-strong bg-ink-800 p-2 shadow-overlay">
          <p className="px-3 py-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink-dim">More in Athanor</p>
          <div className="grid gap-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-touch items-center gap-3 rounded-control px-3 text-row",
                  isActive(item.href) ? "bg-ink text-ink-text" : "text-ink-muted hover:bg-ink hover:text-ink-text"
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <item.icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="flex items-stretch">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[3.75rem] min-w-0 flex-col items-center justify-center gap-1 px-1 py-2",
                  "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                  active ? "text-ink-text" : "text-ink-dim"
                )}
              >
                <span aria-hidden className={cn("absolute inset-x-3 top-0 h-0.5", active ? "bg-accent-bright" : "bg-transparent")} />
                <item.icon className="size-[1.125rem]" strokeWidth={active ? 2.25 : 1.75} />
                <span className="w-full truncate text-center text-[0.625rem] leading-tight tracking-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((current) => !current)}
            className={cn(
              "relative flex min-h-[3.75rem] min-w-0 w-full flex-col items-center justify-center gap-1 px-1 py-2",
              "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
              moreOpen || isSecondaryActive ? "text-ink-text" : "text-ink-dim"
            )}
          >
            <span aria-hidden className={cn("absolute inset-x-3 top-0 h-0.5", moreOpen || isSecondaryActive ? "bg-accent-bright" : "bg-transparent")} />
            <MoreHorizontal className="size-[1.125rem]" strokeWidth={moreOpen ? 2.25 : 1.75} />
            <span className="w-full truncate text-center text-[0.625rem] leading-tight tracking-tight">More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

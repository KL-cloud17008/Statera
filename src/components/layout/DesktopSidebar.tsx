"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { routeTone } from "@/lib/presentation";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col border-r border-rule bg-raised md:flex">
      <Link
        href="/"
        className="flex h-24 shrink-0 items-center gap-3 border-b border-rule px-6 text-primary"
        aria-label="Athanor — dashboard"
      >
        <span className="flex size-9 items-center justify-center bg-ink text-ink-text">
          <BrandMark className="size-4 shrink-0" />
        </span>
        <span>
          <span className="block font-display text-xl font-semibold tracking-tight leading-none">Athanor</span>
          <span className="mt-1 block text-caption text-tertiary">Training ledger</span>
        </span>
      </Link>

      <nav aria-label="Primary" className="navigation-index flex-1 overflow-y-auto py-6">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-tone={routeTone(item.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-touch items-center gap-3 rounded-control px-3 text-row font-medium",
                    "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                    isActive
                      ? "bg-accent-subtle text-accent"
                      : "text-secondary hover:bg-sunken hover:text-primary"
                  )}
                >
                  <span className="leading-snug">{item.label}</span>
                  <span aria-hidden="true" className="nav-number">{String(index + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={signOut} className="shrink-0 border-t border-rule">
        <button
          type="submit"
          className="flex min-h-touch w-full items-center gap-3 px-6 text-row text-tertiary transition-colors duration-(--duration-fast) ease-(--ease-out) hover:bg-sunken hover:text-primary motion-reduce:transition-none"
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </form>
    </aside>
  );
}

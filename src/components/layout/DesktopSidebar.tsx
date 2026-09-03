"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

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
          <span className="block font-display text-xl font-semibold uppercase leading-none">Athanor</span>
          <span className="mt-1 block text-[0.625rem] uppercase tracking-[0.12em] text-tertiary">Training ledger</span>
        </span>
      </Link>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-6">
        <p className="px-3 pb-3 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-tertiary">Workspace</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-touch items-center gap-3 rounded-control px-3 text-row font-medium",
                    "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                    isActive
                      ? "bg-ink text-ink-text"
                      : "text-secondary hover:bg-sunken hover:text-primary"
                  )}
                >
                  <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                  <span className={cn("ml-auto size-1.5 rounded-full", isActive ? "bg-accent-bright" : "bg-transparent")} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-3 mb-3 border border-rule bg-sunken p-3">
        <p className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-tertiary">
          <Zap className="size-3 text-accent" /> Daily signal
        </p>
        <p className="mt-2 text-caption leading-relaxed text-secondary">Training, movement, and recovery in one working surface.</p>
      </div>
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

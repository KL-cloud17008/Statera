"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

/**
 * The persistent desktop sidebar: a full-height ink rail that frames the light
 * ledger canvas, replacing the previous centred top pill bar. Mobile keeps a
 * bottom tab bar.
 */
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col bg-ink md:flex">
      <Link
        href="/"
        className="flex h-[4.5rem] shrink-0 items-center gap-2.5 border-b border-ink-line px-5 text-ink-text"
        aria-label="Athanor — dashboard"
      >
        <BrandMark className="size-4 shrink-0" />
        <span>
          <span className="block font-display text-body leading-none">Athanor</span>
          <span className="mt-1 block text-[0.625rem] uppercase tracking-[0.16em] text-ink-dim">Private OS</span>
        </span>
      </Link>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto py-5">
        <p className="px-5 pb-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink-dim">Navigate</p>
        <ul>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-touch items-center gap-3 px-5 text-row",
                    "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                    isActive
                      ? "bg-ink-800 text-ink-text"
                      : "text-ink-muted hover:bg-ink-800 hover:text-ink-text"
                  )}
                >
                  {/* The accent marks exactly one thing in the chrome: where you are. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-1 left-0 w-0.5 rounded-pill",
                      isActive ? "bg-accent-bright" : "bg-transparent"
                    )}
                  />
                  <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-line px-5 py-4">
        <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ink-dim">System online</p>
        <p className="mt-1 text-caption text-ink-muted">Training · recovery · signal</p>
      </div>
      <form action={signOut} className="shrink-0 border-t border-ink-line">
        <button
          type="submit"
          className="flex min-h-touch w-full items-center gap-3 px-5 text-row text-ink-dim transition-colors duration-(--duration-fast) ease-(--ease-out) hover:text-ink-text motion-reduce:transition-none"
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </form>
    </aside>
  );
}

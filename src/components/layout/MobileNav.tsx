"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" data-mobile-nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="chrome-surface hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border p-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[3rem] min-w-[5rem] flex-col items-center justify-center gap-1 rounded-full border px-3 text-center text-[10px] font-semibold leading-[1.05] tracking-normal transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0",
                isActive
                  ? "border-[var(--hairline-strong)] bg-[var(--veil-2)] text-[var(--cream)]"
                  : "border-transparent text-[var(--cream-3)] hover:bg-[var(--veil-1)] hover:text-[var(--cream)]"
              )}
            >
              <item.icon className={cn("h-[1rem] w-[1rem]", isActive ? "text-[var(--ember-bright)]" : "text-[var(--cream-3)]")} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

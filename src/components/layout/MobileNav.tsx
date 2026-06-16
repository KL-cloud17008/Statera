"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="chrome-surface hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border p-1.5 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[3rem] min-w-[4.25rem] flex-col items-center justify-center gap-1 rounded-full border px-3 text-[9px] font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_rgba(191,110,72,0.72),0_0_0_5px_rgba(191,110,72,0.22)]",
                isActive
                  ? "border-[rgba(191,110,72,0.5)] bg-[rgba(191,110,72,0.18)] text-[#fff6ec]"
                  : "border-transparent text-white/52 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon className={cn("h-[1rem] w-[1rem]", isActive ? "text-[#e6a07d]" : "text-white/45")} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

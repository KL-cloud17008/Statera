"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="chrome-surface hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border p-1.5 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[3rem] min-w-[5rem] flex-col items-center justify-center gap-1 rounded-full border px-3 text-center text-[10px] font-bold leading-[1.05] tracking-normal transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_rgba(107,128,255,0.72),0_0_0_5px_rgba(107,128,255,0.22)] motion-reduce:transition-none",
                isActive
                  ? "border-[rgba(112,199,255,0.44)] bg-[rgba(112,199,255,0.12)] text-white shadow-[rgba(112,199,255,0.18)_0_0_18px]"
                  : "border-transparent text-white/58 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon className={cn("h-[1rem] w-[1rem]", isActive ? "text-[#9fdbff]" : "text-white/48")} strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

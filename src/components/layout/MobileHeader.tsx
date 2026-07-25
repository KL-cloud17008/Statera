"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function MobileHeader() {
  const pathname = usePathname();
  const activeLabel = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    );
    return match?.label ?? "Dashboard";
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-30 bg-obsidian md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <BrandMark className="size-4 shrink-0 text-obsidian-text" />
          <span className="truncate text-row text-obsidian-text">{activeLabel}</span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            className="flex size-touch items-center justify-center text-obsidian-dim transition-colors duration-(--duration-fast) hover:text-obsidian-text motion-reduce:transition-none"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </header>
  );
}

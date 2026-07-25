"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";

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
      className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-sm md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="app-container flex h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <BrandMark className="size-5 shrink-0 text-primary" />
          <span className="truncate text-body font-semibold text-primary">{activeLabel}</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}

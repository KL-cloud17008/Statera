"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
      className="sticky top-0 z-30 border-b border-rule bg-raised/95 backdrop-blur-md md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center bg-ink text-ink-text">
            <BrandMark className="size-3.5 shrink-0" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-semibold uppercase leading-none text-primary">Athanor</span>
            <span className="mt-0.5 block truncate text-[0.625rem] uppercase tracking-[0.1em] text-tertiary">{activeLabel}</span>
          </span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button type="button" aria-label="Open navigation" className="flex size-touch items-center justify-center rounded-control border border-control-border bg-raised text-primary hover:bg-sunken">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(22rem,88vw)] gap-0 p-0">
            <SheetHeader className="border-b border-rule p-6 pr-14 text-left">
              <SheetTitle className="font-display text-2xl font-semibold uppercase">Athanor</SheetTitle>
              <SheetDescription>Personal training command center</SheetDescription>
            </SheetHeader>
            <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn("flex min-h-touch items-center gap-3 rounded-control px-3 text-row font-medium transition-colors", isActive ? "bg-ink text-ink-text" : "text-secondary hover:bg-sunken hover:text-primary")}>
                          <item.icon className="size-4" strokeWidth={1.8} />
                          <span>{item.label}</span>
                          <span className={cn("ml-auto size-1.5 rounded-full", isActive ? "bg-accent-bright" : "bg-transparent")} />
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <form action={signOut} className="border-t border-rule p-3">
              <button type="submit" className="flex min-h-touch w-full items-center gap-3 rounded-control px-3 text-row text-secondary hover:bg-sunken hover:text-primary">
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

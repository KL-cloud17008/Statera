"use client";

import { Dumbbell, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-primary" />
        <span className="text-base font-bold tracking-tight">ATHANOR</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <form action={signOut}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

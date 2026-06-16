"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("flex gap-4 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-center gap-1 rounded-full border border-border bg-[color-mix(in_srgb,var(--cream-paper)_68%,var(--bone)_32%)] p-1 shadow-[var(--shadow-soft)]", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-[background-color,border-color,color,box-shadow] duration-150 hover:text-foreground data-[state=active]:border-[color-mix(in_srgb,var(--ember)_32%,var(--border)_68%)] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[rgba(255,246,236,0.12)_0_1px_0_inset] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--ember)_48%,transparent),0_0_0_5px_var(--ring)]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

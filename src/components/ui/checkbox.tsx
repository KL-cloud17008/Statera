"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Checked is the olive accent — a completed/goal-met state, not an action. */
const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer relative flex size-4 shrink-0 items-center justify-center rounded-control border border-control-border bg-raised text-on-accent",
      /* The box stays 16px so it reads as a checkbox in a dense ledger row,
         but the hit area is expanded to 44px. In the session cockpit this is
         the control that marks a set done, mid-workout, one-handed. */
      "before:absolute before:-inset-3.5 before:content-['']",
      "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
      "hover:border-tertiary",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="text-current">
      <Check className="size-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

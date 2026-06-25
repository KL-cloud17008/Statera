"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-input text-primary transition-[border-color,background-color,box-shadow,transform] duration-150 hover:border-[color-mix(in_srgb,var(--electric-blue)_38%,var(--border)_62%)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--electric-blue)_48%,transparent),0_0_0_5px_var(--ring)] data-[state=checked]:border-[color-mix(in_srgb,var(--electric-blue)_72%,var(--primary)_28%)] data-[state=checked]:bg-[color-mix(in_srgb,var(--electric-blue)_84%,var(--primary)_16%)] data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="text-current">
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

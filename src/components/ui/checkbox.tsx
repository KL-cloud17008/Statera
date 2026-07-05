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
      "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)] bg-input text-[var(--basalt-0)] transition-[border-color,background-color,box-shadow,transform] duration-[var(--duration-fast)] hover:border-[var(--cream-3)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] data-[state=checked]:border-[var(--olive)] data-[state=checked]:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-50",
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

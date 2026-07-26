import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The primary action is a solid ink button. The olive accent is NOT spent on
 * buttons — it marks position in the nav, data emphasis, and the goal-met
 * state. Ember is reserved for the four sanctioned attention states and never
 * appears on a control.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-control border font-medium",
    "transition-colors duration-(--duration-fast) ease-(--ease-out)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "border-transparent bg-ink text-on-ink hover:bg-ink-800 active:bg-ink-700",
        secondary:
          "border-rule bg-raised text-primary hover:bg-row-hover hover:border-rule-strong",
        ghost:
          "border-transparent bg-transparent text-secondary hover:bg-row-hover hover:text-primary",
        critical:
          "border-transparent bg-critical text-on-status hover:opacity-90 active:opacity-100",
        link: "border-transparent bg-transparent p-0 text-secondary underline-offset-4 hover:text-primary hover:underline",
      },
      size: {
        sm: "h-8 px-2.5 text-row",
        md: "h-10 px-3.5 text-body",
        lg: "h-11 px-4 text-body",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

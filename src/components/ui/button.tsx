import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The accent fill is the single primary action per view. Everything else is
 * neutral: outline for secondary, ghost for tertiary, critical for destructive.
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
        primary:
          "border-transparent bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active",
        secondary:
          "border-hairline bg-card text-primary hover:bg-surface-hover active:bg-surface-active",
        ghost:
          "border-transparent bg-transparent text-secondary hover:bg-surface-hover hover:text-primary",
        critical:
          "border-transparent bg-critical text-on-status hover:opacity-90 active:opacity-100",
        link: "border-transparent bg-transparent p-0 text-secondary underline-offset-4 hover:text-primary hover:underline",
      },
      size: {
        // Every interactive size meets the 44px touch target on coarse pointers.
        sm: "h-9 px-3 text-label",
        md: "h-11 px-4 text-body",
        lg: "h-12 px-5 text-body",
        icon: "size-11",
        "icon-sm": "size-9",
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

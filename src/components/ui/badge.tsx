import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Badges are labels, never actions. Status variants are reserved for the
 * sanctioned coaching states; `secondary` is the neutral default.
 */
const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-pill border px-2 py-0.5 text-micro uppercase",
  {
    variants: {
      variant: {
        secondary: "border-hairline bg-sunken text-secondary",
        outline: "border-hairline bg-transparent text-tertiary",
        accent: "border-accent-border bg-accent-subtle text-accent",
        attention: "border-attention-border bg-attention-surface text-attention",
        positive: "border-positive-border bg-positive-surface text-positive",
        critical: "border-critical-border bg-critical-surface text-critical",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

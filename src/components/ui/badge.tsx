import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-foreground/14 bg-foreground/[0.055] text-foreground",
        secondary: "border-border/80 bg-secondary/62 text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "border-border/82 bg-transparent text-muted-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground",
        link: "border-transparent bg-transparent px-0 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

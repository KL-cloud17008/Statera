import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_14px_32px_rgba(68,227,157,0.22)] hover:brightness-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-[0_14px_32px_rgba(255,111,134,0.22)] hover:brightness-105",
        outline:
          "surface-card text-foreground hover:border-primary/35 hover:bg-accent/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:brightness-105",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-accent/80 hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-primary hover:text-primary/80",
      },
      size: {
        default: "h-11 px-4",
        xs: "h-8 rounded-xl px-3 text-xs",
        sm: "h-9 rounded-xl px-3.5 text-sm",
        lg: "h-12 rounded-2xl px-5 text-sm",
        icon: "size-11 rounded-2xl",
        "icon-xs": "size-8 rounded-xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
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
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

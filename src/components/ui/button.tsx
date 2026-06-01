import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium tracking-normal transition-[background-color,border-color,color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_36%,transparent),0_0_0_5px_var(--ring)]",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground shadow-[rgba(255,255,255,0.12)_0_1px_0_inset] hover:bg-primary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:brightness-105",
        outline: "border-border bg-card/30 text-foreground shadow-[rgba(22,15,12,0.03)_0_0_0_1px_inset] hover:border-foreground/22 hover:bg-accent/60",
        secondary: "border-border bg-secondary/80 text-secondary-foreground shadow-[rgba(22,15,12,0.025)_0_0_0_1px_inset] hover:bg-accent",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-accent/58 hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-foreground/76 hover:text-foreground hover:underline hover:underline-offset-4",
      },
      size: {
        default: "h-11 px-4",
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-5 text-sm",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
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

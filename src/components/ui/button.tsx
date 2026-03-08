import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] border text-sm font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)]",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-foreground text-background shadow-none hover:bg-foreground/92",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:brightness-105",
        outline: "border-white/10 bg-white/[0.03] text-foreground hover:bg-white/[0.05]",
        secondary: "border-white/8 bg-white/[0.045] text-foreground hover:bg-white/[0.07]",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-foreground/76 hover:text-foreground",
      },
      size: {
        default: "h-11 px-4",
        xs: "h-8 rounded-[0.85rem] px-3 text-xs",
        sm: "h-9 rounded-[0.9rem] px-3.5 text-sm",
        lg: "h-12 rounded-[1.1rem] px-5 text-sm",
        icon: "size-11 rounded-[1rem]",
        "icon-xs": "size-8 rounded-[0.85rem]",
        "icon-sm": "size-9 rounded-[0.9rem]",
        "icon-lg": "size-12 rounded-[1.1rem]",
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

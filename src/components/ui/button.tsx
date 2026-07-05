import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold tracking-normal transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--cream)_90%,white)]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-[color-mix(in_srgb,var(--destructive)_88%,white)]",
        outline:
          "border-[var(--hairline-strong)] bg-transparent text-foreground hover:bg-[var(--basalt-2)]",
        secondary:
          "border-[var(--hairline)] bg-[var(--basalt-2)] text-secondary-foreground hover:border-[var(--hairline-strong)] hover:bg-[var(--basalt-3)]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-[rgba(240,232,220,0.07)] hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-foreground/80 hover:text-foreground hover:underline hover:underline-offset-4",
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

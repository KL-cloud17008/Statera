import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold tracking-normal transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--electric-blue)_58%,transparent),0_0_0_5px_var(--ring)] active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default: "border-[rgba(238,246,255,0.14)] bg-[linear-gradient(180deg,#15243a,#08111f)] text-primary-foreground shadow-[var(--shadow-command)] hover:border-[rgba(112,199,255,0.42)] hover:bg-[linear-gradient(180deg,#1a2d48,#0a1424)]",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-[rgba(238,246,255,0.12)_0_1px_0_inset] hover:brightness-105",
        outline: "border-[rgba(7,17,31,0.14)] bg-[rgba(255,255,255,0.62)] text-foreground shadow-[var(--shadow-soft)] backdrop-blur-md hover:border-[color-mix(in_srgb,var(--electric-blue)_32%,var(--border)_68%)] hover:bg-white/80",
        secondary: "border-[rgba(7,17,31,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(229,243,252,0.78))] text-secondary-foreground shadow-[var(--shadow-soft)] hover:border-[color-mix(in_srgb,var(--electric-blue)_26%,var(--border)_74%)] hover:bg-white",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-white/50 hover:text-foreground",
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

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-[var(--radius-tight)] border border-border bg-input px-4 py-3 text-sm text-foreground shadow-[rgba(0,0,0,0.035)_0_0_0_1px_inset] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/68 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_40%,transparent),0_0_0_5px_var(--ring)] focus-visible:border-primary/40",
        className
      )}
      {...props}
    />
  );
}

export { Input };

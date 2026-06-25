import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-[var(--radius)] border border-[rgba(7,17,31,0.13)] bg-input px-4 py-3 text-sm text-foreground shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/62 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-[color-mix(in_srgb,var(--foreground)_22%,var(--border)_78%)] focus-visible:border-[color-mix(in_srgb,var(--electric-blue)_46%,var(--border)_54%)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--electric-blue)_48%,transparent),0_0_0_5px_var(--ring)] motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };

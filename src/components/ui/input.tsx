import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-[var(--radius)] border border-[var(--hairline)] bg-input px-4 py-3 text-sm text-foreground transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)] placeholder:text-muted-foreground/55 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-[var(--hairline-strong)] focus-visible:border-[var(--hairline-strong)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_var(--ring)] motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };

import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-[var(--radius)] border border-[var(--hairline)] bg-input px-4 py-3 text-sm text-foreground transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)] placeholder:text-muted-foreground/55 hover:border-[var(--hairline-strong)] focus-visible:border-[var(--hairline-strong)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

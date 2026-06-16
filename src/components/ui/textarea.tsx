import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-[var(--radius)] border border-border bg-[color-mix(in_srgb,var(--input)_84%,var(--cream-paper)_16%)] px-4 py-3 text-sm text-foreground shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/62 hover:border-[color-mix(in_srgb,var(--foreground)_22%,var(--border)_78%)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--ember)_48%,transparent),0_0_0_5px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

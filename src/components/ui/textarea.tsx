import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-control border border-control-border bg-raised px-3 py-2.5",
        /* Placeholders are content and take the tertiary tone (4.99:1); faint
           is 2.18:1 and fails AA. Matches Input. */
        "text-body text-primary placeholder:text-tertiary",
        "transition-colors duration-(--duration-fast) ease-(--ease-out)",
        "hover:border-tertiary",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:bg-sunken disabled:text-faint",
        "aria-invalid:border-critical aria-invalid:outline-critical",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

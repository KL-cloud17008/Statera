import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-control border border-rule bg-raised px-3",
        /* Placeholders are content, so they take the tertiary tone (4.99:1);
           faint is 2.18:1 and fails AA. Disabled text below is exempt. */
        "text-body text-primary placeholder:text-tertiary",
        "transition-colors duration-(--duration-fast) ease-(--ease-out)",
        "hover:border-rule-strong",
        "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:bg-sunken disabled:text-faint",
        "aria-invalid:border-critical aria-invalid:outline-critical",
        // Numeric fields align in columns like the rest of the ledger.
        "[&[type=number]]:tabular-nums [&[type=number]]:font-mono",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };

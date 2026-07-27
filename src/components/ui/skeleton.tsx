import { cn } from "@/lib/utils";

/**
 * A pending row. The previous build shimmered a gradient built from
 * `var(--muted)` and `var(--accent)` — neither is a real custom property in
 * this system (only the `--color-*` theme keys are), so the gradient resolved
 * to nothing and the skeleton was invisible. A flat sunken fill is enough.
 *
 * The pulse is removed under prefers-reduced-motion by the global rule.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-control bg-sunken", className)}
      {...props}
    />
  );
}

export { Skeleton };

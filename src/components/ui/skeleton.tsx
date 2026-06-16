import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-[var(--radius-card)] bg-[linear-gradient(90deg,var(--muted),color-mix(in_srgb,var(--accent)_72%,var(--muted)_28%),var(--muted))] bg-[length:200%_100%] skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

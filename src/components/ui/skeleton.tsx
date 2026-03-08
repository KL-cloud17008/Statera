import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-muted/80 via-accent/70 to-muted/80 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

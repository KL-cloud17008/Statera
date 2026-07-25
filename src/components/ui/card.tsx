import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Elevation comes from the hairline border and the surface step, never a
 * drop shadow. `interactive` adds the hover/active affordance for cards that
 * are themselves links or buttons.
 */
function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-card border border-hairline bg-card",
        interactive &&
          "transition-colors duration-(--duration-fast) ease-(--ease-out) hover:bg-surface-hover hover:border-strong motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-heading text-primary", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-caption text-tertiary", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-action" className={cn("shrink-0", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-3 border-t border-hairline px-5 py-4", className)}
      {...props}
    />
  );
}

/** A full-bleed hairline divider inside a card, aligned to the card edges. */
function CardDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-divider"
      role="presentation"
      className={cn("h-px bg-hairline", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardDivider,
};

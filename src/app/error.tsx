"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="editorial-panel w-full max-w-2xl px-6 py-10 text-center sm:px-8 sm:py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="eyebrow mt-6">Something Broke</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          The page did not finish loading
        </h1>
        <p className="mx-auto mt-4 max-w-xl supporting-copy">
          Try the route again. If the problem persists, refresh and repeat the action that triggered it.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Ref {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <Button type="button" size="lg" onClick={reset}>
            Try again
          </Button>
        </div>
      </section>
    </div>
  );
}

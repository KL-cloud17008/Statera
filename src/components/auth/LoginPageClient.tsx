"use client";

import { useState } from "react";
import { AlertCircle, Dumbbell, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPageClient() {
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const action = isSignUp ? signUp : signIn;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="editorial-panel w-full max-w-5xl p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="page-hero flex min-h-[28rem] flex-col justify-between p-8">
            <div>
              <p className="eyebrow">ATHANOR</p>
              <h1 className="mt-4 max-w-lg">Fitness tracking that reads like a product, not a spreadsheet.</h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Track training, steps, mobility, and weight with the same premium system used throughout the app.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Steps", "Goal progress + streak"],
                ["Weight", "Trend + projection"],
                ["Workout", "Sessions + PRs"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[1.25rem] border border-white/10 bg-background/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="eyebrow">{title}</p>
                  <p className="mt-2 text-sm text-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="editorial-panel-quiet px-6 py-6 sm:px-7 sm:py-7">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground shadow-[0_16px_32px_rgba(68,227,157,0.22)]">
                <Dumbbell className="h-7 w-7" />
              </div>
              <p className="eyebrow mt-5">{isSignUp ? "Create Account" : "Welcome Back"}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {isSignUp ? "Start your setup" : "Sign in to continue"}
              </h2>
              <p className="mt-3 supporting-copy">
                {isSignUp
                  ? "Create an account to keep training, movement, and bodyweight in one place."
                  : "Pick up where you left off without losing the thread."}
              </p>
            </div>

            <form action={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="h-12"
                />
                {isSignUp ? <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p> : null}
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-[1rem] border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <Button type="submit" className="h-12 w-full" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSignUp ? "Create account" : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don&apos;t have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="focus-surface rounded-full px-1 font-semibold text-primary focus-visible:outline-none hover:text-primary/85"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

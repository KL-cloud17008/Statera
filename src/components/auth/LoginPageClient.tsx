"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <div className="w-full max-w-5xl rounded-[var(--radius-panel)] border border-border bg-card/72 p-3 shadow-[var(--shadow-elevated)] backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="page-hero flex min-h-[26rem] flex-col justify-between p-8">
            <div>
              <p className="eyebrow">Athanor</p>
              <h1 className="mt-4 max-w-lg">Movement, training, and bodyweight in one calm view.</h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Track steps, weight, mobility, and training volume with an interface built for daily use.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Steps", "Daily goal + streak"],
                ["Weight", "Trend + projection"],
                ["Workout", "Sessions + PRs"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[var(--radius-card)] border border-border/70 bg-secondary/60 p-4">
                  <p className="eyebrow">{title}</p>
                  <p className="mt-2 text-sm text-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="h-full rounded-[1.75rem] border-0">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-border bg-secondary text-foreground">
                <BrandMark className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {isSignUp ? "Start tracking your training in a single place." : "Sign in to continue your progress."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Password" required minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} className="h-12" />
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
                  {isSignUp ? "Create Account" : "Sign In"}
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
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

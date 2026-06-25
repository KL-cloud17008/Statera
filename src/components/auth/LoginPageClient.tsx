"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPageClient() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const action = isSignUp ? signUp : signIn;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result && "success" in result && result.success) {
        setSuccess(result.success);
        setIsSignUp(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="app-atmosphere flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="login-frame w-full max-w-6xl rounded-[var(--radius-panel)] p-2 backdrop-blur-xl sm:p-3">
        <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="login-landscape flex min-h-[31rem] flex-col justify-between rounded-[0.875rem] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-primary-foreground">
                  <BrandMark className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[1.05rem] font-medium text-primary-foreground">Athanor</p>
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/48">
                    Training ledger
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/62">
                Daily practice
              </span>
            </div>

            <div className="max-w-3xl py-12 sm:py-16">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-white/58">A calm place to return</p>
              <h1 className="mt-5 max-w-3xl text-primary-foreground">Movement, training, and bodyweight in one quiet view.</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/64">
                Keep the day legible: the work you did, the recovery you kept, and the trend that matters next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Steps", "Daily pace"],
                ["Weight", "Trend line"],
                ["Training", "Logged work"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[var(--radius-card)] border border-white/10 bg-white/7 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{title}</p>
                  <p className="mt-2 text-sm font-medium text-primary-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="login-auth-panel flex min-h-[31rem] flex-col justify-center rounded-[0.875rem] p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 text-center">
                <div className="duna-mark-surface mx-auto flex size-14 items-center justify-center rounded-full text-foreground">
                  <BrandMark className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-normal">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {isSignUp ? "Begin with one readable place for training, movement, and bodyweight." : "Sign in to continue your daily ledger."}
                </p>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" autoCapitalize="none" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Password" required minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} className="h-12" />
                  {isSignUp ? <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p> : null}
                </div>

                {error ? (
                  <div className="status-note status-note-error flex items-start gap-2 p-3 text-sm" role="alert" aria-live="polite">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}

                {success ? (
                  <div className="status-note status-note-success flex items-start gap-2 p-3 text-sm" role="status" aria-live="polite">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{success}</p>
                  </div>
                ) : null}

                <Button type="submit" className="h-12 w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-semibold text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

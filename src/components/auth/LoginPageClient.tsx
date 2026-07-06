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
      <div className="login-frame w-full max-w-6xl rounded-[var(--radius-panel)] p-2 sm:p-3">
        <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="login-landscape flex min-h-[31rem] flex-col justify-between rounded-[var(--radius-card)] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.05)] text-[var(--cream)]">
                  <BrandMark className="h-6 w-6" />
                </span>
                <div>
                  <p className="[font-family:var(--font-display)] text-[1.12rem] font-[380] tracking-[-0.01em] text-[var(--cream)]">Athanor</p>
                  <p className="mt-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--cream-3)]">
                    Prime ledger
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.04)] px-3 py-1.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--cream-2)]">
                Private OS
              </span>
            </div>

            <div className="max-w-3xl py-12 sm:py-16">
              <p className="eyebrow">Athanor Prime</p>
              <h1 className="mt-5 max-w-3xl text-[var(--cream)]">Private performance operating system.</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--cream-2)]">
                Training, steps, bodyweight, and recovery signal in one precise ledger.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Steps", "Daily pace"],
                ["Weight", "Body trend"],
                ["Training", "Output log"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[rgba(240,232,220,0.04)] px-4 py-3">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">{title}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--cream)]">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="login-auth-panel flex min-h-[31rem] flex-col justify-center rounded-[var(--radius-card)] p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 text-center">
                <div className="duna-mark-surface mx-auto flex size-14 items-center justify-center rounded-full text-foreground">
                  <BrandMark className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-normal">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {isSignUp ? "Create access to your private ledger." : "Sign in to continue your command ledger."}
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

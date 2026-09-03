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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8 sm:px-6">
      <div className="w-full max-w-5xl">
        <div className="grid gap-px overflow-hidden rounded-panel border border-rule bg-rule lg:grid-cols-[1.08fr_0.92fr]">
          {/* The ink panel is the same chrome that frames the app canvas. */}
          <section className="flex min-h-[28rem] flex-col justify-between bg-ink p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-pill border border-ink-line bg-ink-800 text-ink-text">
                  <BrandMark className="size-5" />
                </span>
                <div>
                  <p className="font-display text-body text-ink-text">Athanor</p>
                  <p className="mt-0.5 text-label uppercase text-ink-dim">Prime ledger</p>
                </div>
              </div>
              <span className="rounded-pill border border-ink-line bg-ink-800 px-3 py-1 text-label uppercase text-ink-muted">
                Private OS
              </span>
            </div>

            <div className="max-w-xl py-12">
              <p className="text-label uppercase text-ink-dim">Athanor Prime</p>
              <p className="mt-4 font-display text-[2.75rem] font-semibold uppercase leading-[0.95] tracking-normal text-ink-text">
                Private performance operating system.
              </p>
              <p className="mt-4 max-w-md text-body text-ink-muted">
                Training, steps, bodyweight, and recovery signal in one precise ledger.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Steps", "Daily pace"],
                ["Weight", "Body trend"],
                ["Training", "Output log"],
              ].map(([title, copy]) => (
                <div key={title} className="border-t border-ink-line pt-3">
                  <p className="text-label uppercase text-ink-dim">{title}</p>
                  <p className="mt-1 text-row font-medium text-ink-text">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[28rem] flex-col justify-center bg-raised p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                {/* The page's one h1 lives here — the ink panel is decoration. */}
                <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
                <p className="mt-2 text-body text-secondary">
                  {isSignUp ? "Create access to your private ledger." : "Sign in to continue your command ledger."}
                </p>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" autoCapitalize="none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Password" required minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} />
                  {isSignUp ? <p className="text-caption text-tertiary">Must be at least 6 characters.</p> : null}
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-control border-l-2 border-critical-line bg-critical-surface px-3 py-2 text-row text-critical" role="alert" aria-live="polite">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}

                {success ? (
                  <div className="flex items-start gap-2 rounded-control border-l-2 border-accent-line bg-accent-subtle px-3 py-2 text-row text-accent" role="status" aria-live="polite">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <p>{success}</p>
                  </div>
                ) : null}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-row text-secondary">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-medium text-primary underline-offset-4 transition-colors duration-(--duration-fast) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
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

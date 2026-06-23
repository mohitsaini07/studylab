"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  signIn,
  signInWithGoogle,
  signUp,
  type AuthState,
} from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Button, Card, Input } from "@/components/ui";
const initial: AuthState = {};
export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, action, pending] = useActionState(
    mode === "signin" ? signIn : signUp,
    initial,
  );
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-5">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 sm:p-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            {mode === "signin"
              ? "Sign in to continue to your study workspace."
              : "Start turning your PDFs into focused study sets."}
          </p>
          <form action={signInWithGoogle} className="mt-7">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full"
            >
              <GoogleIcon />
              {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
            </Button>
          </form>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-[.12em] text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <form action={action} className="space-y-4">
            {mode === "signup" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  First name
                  <Input
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="mt-2"
                    placeholder="Mohit"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Last name
                  <Input
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="mt-2"
                    placeholder="Saini"
                  />
                </label>
              </div>
            )}
            <label className="block text-sm font-medium">
              Email address
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <Input
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                className="mt-2"
                placeholder="At least 8 characters"
              />
            </label>
            {state.error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {state.error}
              </p>
            )}
            {state.success && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {state.success}
              </p>
            )}
            <Button className="w-full" size="lg" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" />
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {mode === "signin"
              ? "New to StudyLab?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-brand"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </Card>
        <p className="mt-6 text-center text-xs text-muted">
          By continuing, you agree to keep uploaded material lawful and
          appropriate.
        </p>
        <Link
          href="/"
          className="mt-4 block text-center text-xs font-medium text-brand"
        >
          Back to StudyLab
        </Link>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      role="img"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

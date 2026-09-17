"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState
  );

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Sign up</h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Create your Qylo account.</p>

        <form action={formAction} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-[var(--foreground)]">
              I am a
            </label>
            <select
              id="role"
              name="role"
              defaultValue="learner"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
            >
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <input type="hidden" name="preferredLanguage" value="en" />

          {state.error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow-sm)] transition-opacity disabled:opacity-60"
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--foreground-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent)]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

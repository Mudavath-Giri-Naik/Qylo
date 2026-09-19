"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "@/app/auth/actions";
import { AuthOptionWheel } from "@/components/auth/AuthOptionWheel";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

const SELECT_CLASSNAME =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form action={formAction} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-balance text-muted-foreground">Start learning quantum computing with Qylo</p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="role">I am a</FieldLabel>
                  <select id="role" name="role" defaultValue="learner" className={SELECT_CLASSNAME}>
                    <option value="learner">Learner</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </Field>

                <input type="hidden" name="preferredLanguage" value="en" />

                {state.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {state.error}
                  </p>
                )}
                {state.message && (
                  <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
                    {state.message}
                  </p>
                )}

                <Field>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Creating account..." : "Sign up"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

                <Field>
                  <GoogleSignInButton label="Sign up with Google" className="w-full" />
                </Field>

                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Log in</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="hidden bg-muted md:block">
              <AuthOptionWheel />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form action={formAction} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">Log in to your Qylo account</p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" name="password" type="password" required autoComplete="current-password" />
                </Field>

                {state.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {state.error}
                  </p>
                )}

                <Field>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Logging in..." : "Login"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

                <Field>
                  <GoogleSignInButton className="w-full" />
                </Field>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="relative hidden bg-muted md:block">
              {/* eslint-disable-next-line @next/next/no-img-element -- local screenshot, fills the panel via object-cover */}
              <img
                src="/dashboard.png"
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="email" type="email" placeholder="Email address" required />
      <Input name="password" type="password" placeholder="Password" required />
      <FormMessage type="error" message={state.error} />
      <SubmitButton label="Log in" loadingLabel="Signing in..." className="w-full" />
      <div className="flex items-center justify-between text-sm text-stone-500">
        <Link href="/forgot-password" className="hover:text-stone-900">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-stone-900">
          Create an account
        </Link>
      </div>
    </form>
  );
}

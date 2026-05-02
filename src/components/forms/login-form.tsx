"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { loginAction } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="email" type="email" placeholder="Email address" required />
      <div className="relative">
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="pr-14"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-stone-500 transition hover:text-stone-900"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
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

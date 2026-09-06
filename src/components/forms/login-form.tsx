"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { loginAction, resendVerificationAction, type LoginActionState } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function LoginForm() {
  // Annotated because useActionState infers from the initial value, and
  // initialActionState is the narrower ActionState.
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialActionState,
  );
  const [resendState, resendAction] = useActionState(resendVerificationAction, initialActionState);
  const [showPassword, setShowPassword] = useState(false);
  // Tracked so the resend below can reuse the address already typed rather than
  // asking for it a second time.
  const [email, setEmail] = useState("");

  return (
    <>
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
          Email address
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Input
            id="login-password"
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

    {/* A refusal to sign in is useless without a way out. Registration's welcome
        email is best-effort, so a couple can be unverified through no fault of
        their own; this is how they recover. Rendered as a SIBLING form because
        forms cannot nest. */}
    {state.needsVerification ? (
      <form action={resendAction} className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-stone-600">
          Didn&apos;t get the email, or the link expired?
        </p>
        <SubmitButton
          label="Resend verification email"
          loadingLabel="Sending..."
          className="mt-3 w-full"
        />
        <FormMessage type="success" message={resendState.success} />
        <FormMessage type="error" message={resendState.error} />
      </form>
    ) : null}
    </>
  );
}

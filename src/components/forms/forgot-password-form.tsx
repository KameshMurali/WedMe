"use client";

import { useActionState } from "react";

import { requestPasswordResetAction } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="email" type="email" placeholder="Your account email" required />
      <FormMessage type="error" message={state.error} />
      <FormMessage type="success" message={state.success} />
      <SubmitButton label="Send reset link" loadingLabel="Preparing..." className="w-full" />
    </form>
  );
}

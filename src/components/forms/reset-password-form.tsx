"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium">
          New password
        </label>
        <Input id="reset-password" name="password" type="password" placeholder="New password" required />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium">
          Confirm new password
        </label>
        <Input id="reset-confirm" name="confirmPassword" type="password" placeholder="Confirm new password" required />
      </div>
      <FormMessage type="error" message={state.error} />
      <SubmitButton label="Update password" loadingLabel="Updating..." className="w-full" />
    </form>
  );
}

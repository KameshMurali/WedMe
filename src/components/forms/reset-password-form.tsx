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
      <div className="space-y-2">
        <Input name="password" type="password" placeholder="New password" required minLength={10} />
        {/* Surface the password policy up front so users don't hit one
            validation error after another and assume reset is broken. */}
        <ul className="space-y-0.5 pl-1 text-xs leading-5 text-[color:var(--muted)]">
          <li>• At least 10 characters</li>
          <li>• One uppercase and one lowercase letter</li>
          <li>• At least one number</li>
          <li>• At least one special character (e.g. - _ # @ !)</li>
        </ul>
      </div>
      <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />
      <FormMessage type="error" message={state.error} />
      <SubmitButton label="Update password" loadingLabel="Updating..." className="w-full" />
    </form>
  );
}

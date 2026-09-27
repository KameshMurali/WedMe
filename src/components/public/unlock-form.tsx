"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";

import { unlockSiteAction, type UnlockState } from "@/actions/site-unlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: UnlockState = {};

export function UnlockForm({ slug, reason }: { slug: string; reason: "password" | "invite" }) {
  const [state, formAction, pending] = useActionState(unlockSiteAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <label className="block space-y-2 text-left">
        <span className="text-sm font-semibold text-[color:var(--text)]">
          {reason === "invite" ? "Invite code" : "Password"}
        </span>
        <Input
          type={reason === "invite" ? "text" : "password"}
          name="secret"
          required
          autoComplete={reason === "invite" ? "off" : "current-password"}
          placeholder={reason === "invite" ? "From your invitation" : "From the couple"}
          aria-label={reason === "invite" ? "Invite code" : "Site password"}
          className="h-11"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-rose-600">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        <Lock className="h-4 w-4" />
        {pending ? "Checking…" : "View the wedding"}
      </Button>
    </form>
  );
}

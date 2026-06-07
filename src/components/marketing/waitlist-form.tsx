"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { joinWaitlistAction, type WaitlistState } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CurrencyCode, PlanKey } from "@/lib/pricing";

const initialState: WaitlistState = {};

export function WaitlistForm({
  planKey,
  planName,
  currency,
  ctaLabel,
}: {
  planKey: PlanKey;
  planName: string;
  currency: CurrencyCode;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(joinWaitlistAction, initialState);

  if (state.success) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
        <span>{state.success}</span>
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        {ctaLabel}
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="planKey" value={planKey} />
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="source" value={`pricing_${planKey}`} />
      <p className="text-xs text-[color:var(--muted)]">
        Get founding-couple pricing on <strong className="text-[color:var(--text)]">{planName}</strong> when it launches.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="you@email.com"
          aria-label="Email address"
          className="h-11"
        />
        <Button type="submit" disabled={pending} className="sm:flex-none">
          {pending ? "Joining…" : "Notify me"}
        </Button>
      </div>
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </form>
  );
}

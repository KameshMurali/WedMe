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
  source,
  defaultOpen = false,
}: {
  planKey: PlanKey;
  planName: string;
  currency: CurrencyCode;
  ctaLabel: string;
  // Where the signup came from, stored on WaitlistSignup. Defaults to the
  // pricing-card behaviour so those call sites are unchanged; the homepage
  // passes its own value, which is the only way to tell a campaign signup
  // apart from someone who read the pricing page.
  source?: string;
  // The form normally hides behind a button and opens on click. That is right
  // next to a price, where the visitor is already deciding. It is wrong for
  // someone arriving cold from a link, who should see the email field.
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
      <input type="hidden" name="source" value={source ?? `pricing_${planKey}`} />
      <p className="text-xs text-[color:var(--muted)]">
        Get founding-couple pricing on <strong className="text-[color:var(--text)]">{planName}</strong> when it launches.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          // Focus only when the visitor opened this themselves by pressing the
          // button: they asked for the form, so focusing saves them a click.
          //
          // Never when it renders open by default. The homepage band sits at
          // the foot of a long page, and a browser scrolls a focused element
          // into view, so an unconditional autoFocus threw the viewport 11,628px
          // down on a phone. Arriving on the site meant being asked for your
          // email before you had seen a single word of it.
          autoFocus={!defaultOpen}
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

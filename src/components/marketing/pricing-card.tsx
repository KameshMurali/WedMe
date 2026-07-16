import type { Route } from "next";
import Link from "next/link";
import { Check, Clock, Gift } from "lucide-react";

import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Button } from "@/components/ui/button";
import {
  applyLaunchOffer,
  checkoutEnabled,
  currencies,
  isLaunchOfferActive,
  type CurrencyCode,
  type Plan,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

function formatPrice(amount: number, code: CurrencyCode) {
  const meta = currencies[code];
  // Hide the trailing ".00" for round numbers (always, since our prices are
  // major-units integers).
  const formatted = amount.toLocaleString(meta.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return code === "AED" ? `AED ${formatted}` : `${meta.symbol}${formatted}`;
}

function recurrenceLabel(plan: Plan) {
  if (plan.recurrence === "free") return "to begin";
  if (plan.recurrence === "wedding-year") return "for your wedding year";
  return "once, forever";
}

export function PricingCard({
  plan,
  currency,
  registerHref,
  emphasis = false,
}: {
  plan: Plan;
  currency: CurrencyCode;
  registerHref: Route;
  emphasis?: boolean;
}) {
  const basePrice = plan.prices[currency];
  const discountedAmount = applyLaunchOffer(basePrice.amount, plan);
  const isDiscounted = discountedAmount !== basePrice.amount;
  const priceLabel = formatPrice(discountedAmount, currency);
  const strikeLabel = isDiscounted ? formatPrice(basePrice.amount, currency) : null;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[1.6rem] border bg-white p-7 shadow-[0_20px_60px_rgba(43,26,24,0.08)] transition",
        emphasis
          ? "border-[color:var(--primary)]/30 ring-2 ring-[color:var(--primary)]/15"
          : "border-black/8",
      )}
    >
      {plan.badge ? (
        <span
          className={cn(
            "absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm",
            emphasis
              ? "bg-[color:var(--primary)] text-white"
              : "bg-white text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30",
          )}
        >
          {plan.badge}
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
          {plan.name}
        </p>
        {!checkoutEnabled && plan.recurrence !== "free" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            <Clock className="h-3 w-3" />
            Coming Soon
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-display text-5xl text-[color:var(--text)]">{priceLabel}</span>
        <span className="text-sm text-[color:var(--muted)]">{recurrenceLabel(plan)}</span>
      </div>

      {strikeLabel ? (
        <p className="mt-1 text-xs text-[color:var(--muted)]">
          <span className="line-through">{strikeLabel}</span>
          <span className="ml-2 font-semibold text-emerald-700">
            Launch offer — save {plan.launchOfferPct}%
          </span>
        </p>
      ) : null}

      <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">{plan.pitch}</p>

      <ul className="mt-6 space-y-3">
        {plan.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-3 text-sm leading-6 text-[color:var(--text)]">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[color:var(--primary)]" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3">
        {plan.recurrence === "free" || checkoutEnabled ? (
          // Free tier always links to register; paid tiers link to Checkout
          // once it's live.
          <Button asChild variant={emphasis ? "solid" : "outline"}>
            <Link href={registerHref}>{plan.ctaLabel}</Link>
          </Button>
        ) : (
          // Pre-launch: capture interest instead of taking payment.
          <>
            <p className="text-xs text-[color:var(--muted)]">
              Payments for this plan are not yet open. Drop your email and we'll notify you the moment it launches — founding-couple pricing locked in.
            </p>
            <WaitlistForm
              planKey={plan.key}
              planName={plan.name}
              currency={currency}
              ctaLabel={`Join the waitlist — ${plan.name}`}
            />
          </>
        )}
        {plan.key === "forever" ? (
          <p className="inline-flex items-center justify-center gap-2 text-xs text-[color:var(--muted)]">
            <Gift className="h-3.5 w-3.5" />
            Giftable — a family member can buy this for the couple
          </p>
        ) : null}
      </div>

      {plan.key === "forever" && isLaunchOfferActive() ? (
        <LaunchOfferCountdown />
      ) : null}
    </div>
  );
}

// Server-rendered tiny countdown — refreshes when the page revalidates.
// For a live ticker we'd hydrate this, but a date-anchored line works fine
// for the launch-offer urgency cue without bloating the client bundle.
function LaunchOfferCountdown() {
  return (
    <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-emerald-700">
      Ends 31 Jul — first 100 couples
    </p>
  );
}

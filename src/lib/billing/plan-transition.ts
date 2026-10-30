import type { PlanKey } from "@/lib/pricing";

/**
 * What a Paddle event means for a couple's entitlement.
 *
 * Pure: no Prisma, no env reads at module scope, no `server-only`. That is
 * deliberate and load-bearing — `src/server/services/paddle-signature.ts`
 * starts with `import "server-only"`, and `server-only` is not a declared
 * dependency (Next aliases it at build time), so a module that imports it
 * cannot be pulled into a Playwright spec the way `tests/pricing-offer.spec.ts`
 * pulls in `src/lib/pricing.ts`. Keeping the decisions here means the parts
 * worth testing can actually be tested, with no database and no HTTP.
 *
 * The route stays responsible for IO: reading the body, verifying the
 * signature, and writing rows. This file only decides what should happen.
 */

// Together is sold as "your wedding year": 12 months of full access plus the
// 6-month post-wedding archive the pitch copy promises. Forever never expires.
//
// SINGLE SOURCE. This constant previously existed twice — in the webhook and
// again in scripts/grant-plan.ts — so an admin grant and a paid purchase could
// silently disagree about when a plan ends. Both import it from here now.
export const TOGETHER_MONTHS = 18;

/**
 * When a plan granted at `activatedAt` runs out. `null` means never.
 *
 * `setMonth` overflows rather than clamping: 31 August + 18 months lands on
 * 2 March, not 28 February. For an expiry that is in the customer's favour by
 * a day or two, which is the right direction to round, but it means the day of
 * month is not preserved and nothing should assume it is.
 */
export function resolveExpiry(planKey: PlanKey, activatedAt: Date): Date | null {
  if (planKey !== "together") return null;
  const expires = new Date(activatedAt);
  expires.setMonth(expires.getMonth() + TOGETHER_MONTHS);
  return expires;
}

/** The subset of a Paddle webhook payload these decisions actually read. */
export type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    action?: string;
    customer_id?: string;
    transaction_id?: string;
    custom_data?: { userId?: string; planKey?: string } | null;
    items?: Array<{ price?: { id?: string } | null } | null> | null;
  };
};

export type PlanTransition =
  | { kind: "grant"; planKey: PlanKey; priceId: string }
  | { kind: "revoke"; reason: string }
  | { kind: "ignore"; reason: string }
  | { kind: "unmapped"; reason: string };

/**
 * Map a Paddle price id to the plan it buys.
 *
 * THIS IS THE AUTHORITY FOR WHAT WAS BOUGHT, and the reason is worth stating
 * plainly. The webhook used to read `custom_data.planKey`, which is data the
 * BROWSER supplies at checkout and Paddle echoes back untouched. The client
 * token that opens checkout is a `NEXT_PUBLIC_` value inlined into the bundle,
 * and `Paddle.Checkout.open` is callable from the console, so anyone could
 * open checkout against the Together price while passing
 * `customData: { planKey: "forever" }` — pay for the cheaper tier, receive the
 * lifetime one.
 *
 * The price id comes from Paddle's own record of the transaction, not from the
 * buyer, so it is the only field here that can be trusted to say what was paid
 * for. `custom_data` survives as a hint for attribution and nothing more.
 *
 * Ids are read at call time rather than at module load so that tests can set
 * them, and so an env var that arrives late (as they do on Vercel) is still
 * seen.
 */
export function planKeyForPriceId(
  priceId: string | undefined | null,
  priceIds: { together?: string; forever?: string },
): PlanKey | null {
  if (!priceId) return null;
  if (priceIds.together && priceId === priceIds.together) return "together";
  if (priceIds.forever && priceId === priceIds.forever) return "forever";
  return null;
}

/** Paddle adjustment actions that take money back and so must revoke access. */
const REVOKING_ADJUSTMENTS = new Set(["refund", "chargeback", "chargeback_warning"]);

/**
 * Decide what an event means, without performing it.
 *
 * Only two families matter, because both paid tiers are one-time purchases and
 * nothing here renews:
 *
 *   transaction.completed  → grant, at the plan the PRICE says was bought
 *   adjustment.*           → revoke, when the adjustment takes money back
 *
 * The absence of `subscription.*` handling is correct, not an oversight.
 */
export function transitionForEvent(
  event: PaddleEvent,
  priceIds: { together?: string; forever?: string },
): PlanTransition {
  const type = event.event_type;

  if (type === "transaction.completed") {
    const items = event.data?.items ?? [];
    // A transaction can carry several line items. Take the first that maps to
    // a plan we sell, so an added-on item cannot shadow the real purchase.
    for (const item of items) {
      const mapped = planKeyForPriceId(item?.price?.id, priceIds);
      if (mapped) return { kind: "grant", planKey: mapped, priceId: item!.price!.id! };
    }
    return {
      kind: "unmapped",
      reason: items.length
        ? "no line item matched a configured price id"
        : "transaction carried no line items",
    };
  }

  if (type === "adjustment.created" || type === "adjustment.updated") {
    const action = event.data?.action;
    // An adjustment is only final once approved. A refund that is still
    // pending must not revoke access the customer is currently entitled to.
    const status = event.data?.status;
    if (status && status !== "approved") {
      return { kind: "ignore", reason: `adjustment ${action ?? "?"} is ${status}, not approved` };
    }
    if (action && REVOKING_ADJUSTMENTS.has(action)) {
      return { kind: "revoke", reason: `adjustment ${action}` };
    }
    return { kind: "ignore", reason: `adjustment action ${action ?? "unknown"} does not revoke` };
  }

  return { kind: "ignore", reason: `event type ${type ?? "unknown"} is not acted on` };
}

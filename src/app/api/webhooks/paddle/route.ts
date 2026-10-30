import { NextResponse } from "next/server";

import { resolveExpiry, transitionForEvent, type PaddleEvent } from "@/lib/billing/plan-transition";
import { env } from "@/lib/env";
import { prisma } from "@/server/prisma";
import { verifyPaddleSignature } from "@/server/services/paddle-signature";

// Paddle sends the signed payload as raw bytes — this route must never be
// body-parsed by a framework layer before we hash it.
export const dynamic = "force-dynamic";

// Terminal statuses. A row in any of these has been fully processed and a
// replay can be acknowledged immediately.
//
// "received" is NOT here, and that is the whole point: the row is written
// before the entitlement is granted, so a row still reading "received" means
// an earlier attempt died in between. See the duplicate handling below.
const TERMINAL_STATUSES = new Set(["applied", "ignored", "unmapped", "revoked"]);

/**
 * Price ids, read from the server environment.
 *
 * NOT from src/lib/pricing.ts, even though the values are the same. pricing.ts
 * is imported by client components, so everything in it is browser-visible and
 * browser-supplied data must never decide what a buyer receives. env.ts is
 * server-side, and reading it here keeps the webhook's view of "what costs
 * what" out of anything the buyer can touch.
 */
function configuredPriceIds() {
  return {
    together: env.NEXT_PUBLIC_PADDLE_PRICE_TOGETHER,
    forever: env.NEXT_PUBLIC_PADDLE_PRICE_FOREVER,
  };
}

export async function POST(request: Request) {
  // 1. Raw body first — the signature is computed over the exact bytes sent.
  const rawBody = await request.text();

  const signature = verifyPaddleSignature({
    header: request.headers.get("paddle-signature"),
    rawBody,
    secret: env.PADDLE_WEBHOOK_SECRET,
  });

  if (!signature.ok) {
    // Deliberately terse: never tell an attacker which check failed.
    console.error("Paddle webhook rejected", { reason: signature.reason });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventId = event.event_id;
  const eventType = event.event_type;
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // `custom_data` is buyer-supplied and echoed back by Paddle untouched. It is
  // used for ATTRIBUTION only — which workspace to apply this to — never to
  // decide what was bought. See plan-transition.ts.
  const attributedUserId = event.data?.custom_data?.userId ?? null;
  const claimedPlanKey = event.data?.custom_data?.planKey ?? null;
  const transactionId = event.data?.id ?? null;
  const customerId = event.data?.customer_id ?? null;

  try {
    // 2. Idempotency. Paddle retries on any non-2xx, and a replayed event must
    //    never grant a plan twice. The unique paddleEventId makes the insert
    //    itself the lock.
    try {
      await prisma.paymentEvent.create({
        data: {
          paddleEventId: eventId,
          eventType,
          payload: event as object,
          userId: attributedUserId,
          planKey: claimedPlanKey,
          paddleTransactionId: transactionId,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;

      // A duplicate insert used to end the request here, which created a state
      // the system could never leave: the row is written BEFORE the grant, so
      // if the function died in between — timeout, deploy, cold-start kill, a
      // DB blip — the money was taken, the row said "received", and every
      // retry returned 200 without ever granting the plan. Meanwhile the
      // buyer's confirmation screen promised the plan would activate on its
      // own, which by then was false.
      //
      // Recorded is not the same as processed. Short-circuit only on a
      // terminal status; a "received" row means an earlier attempt died, so
      // fall through and finish the work.
      const existing = await prisma.paymentEvent.findUnique({
        where: { paddleEventId: eventId },
        select: { status: true },
      });

      if (existing && TERMINAL_STATUSES.has(existing.status)) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      console.warn("Paddle webhook resuming an event that was recorded but never processed", {
        eventId,
        eventType,
        status: existing?.status ?? "missing",
      });
    }

    // 3. Decide what this event means. Pure, and tested separately.
    const transition = transitionForEvent(event, configuredPriceIds());

    if (transition.kind === "ignore") {
      await prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "ignored" },
      });
      return NextResponse.json({ received: true });
    }

    // 4. A refund or chargeback takes the money back, so it must take the plan
    //    back too. Until this existed, the terms promised "a full refund within
    //    14 days of purchase, no questions asked" while the webhook marked
    //    every non-transaction event as ignored — so a buyer could take the
    //    refund and keep a lifetime plan permanently.
    if (transition.kind === "revoke") {
      // An adjustment names the transaction it reverses, not the customer's
      // workspace. Walk back through the purchase we recorded.
      const reversedTransactionId = event.data?.transaction_id ?? null;
      const couple = await resolveCoupleForAdjustment(reversedTransactionId, customerId);

      if (!couple) {
        console.error("Paddle adjustment could not be traced to a couple", {
          eventId,
          reversedTransactionId,
          customerId,
        });
        await prisma.paymentEvent.update({
          where: { paddleEventId: eventId },
          data: { status: "unmapped" },
        });
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction([
        prisma.couple.update({
          where: { id: couple.id },
          // Mirrors what scripts/grant-plan.ts does for the "hello" case, so a
          // revoked couple is indistinguishable from one that never paid.
          data: {
            planKey: "hello",
            planActivatedAt: null,
            planExpiresAt: null,
            planSource: null,
            paddleTransactionId: null,
          },
        }),
        prisma.paymentEvent.update({
          where: { paddleEventId: eventId },
          data: { status: "revoked", userId: couple.primaryUserId },
        }),
      ]);

      console.info("Paddle plan revoked", {
        eventId,
        coupleId: couple.id,
        reason: transition.reason,
      });
      return NextResponse.json({ received: true });
    }

    // 5. A completed transaction. `transition.planKey` came from the PRICE
    //    Paddle recorded, not from anything the browser sent.
    if (transition.kind === "unmapped" || !attributedUserId) {
      // A real payment we can't attribute is a support incident, not a silent
      // no-op — log loudly and keep the payload for manual reconciliation.
      console.error("Paddle transaction could not be mapped to a workspace", {
        eventId,
        transactionId,
        attributedUserId,
        reason: transition.kind === "unmapped" ? transition.reason : "no userId in custom_data",
      });
      await prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "unmapped" },
      });
      return NextResponse.json({ received: true });
    }

    if (claimedPlanKey && claimedPlanKey !== transition.planKey) {
      // Not fatal — the price is authoritative and we are about to honour it —
      // but it should never happen in normal use, so it is worth seeing.
      console.error("Paddle checkout claimed a different plan than the price paid for", {
        eventId,
        transactionId,
        claimedPlanKey,
        grantedPlanKey: transition.planKey,
        priceId: transition.priceId,
      });
    }

    const couple = await prisma.couple.findUnique({
      where: { primaryUserId: attributedUserId },
      select: { id: true },
    });

    if (!couple) {
      console.error("Paddle transaction referenced a user with no couple", {
        eventId,
        attributedUserId,
      });
      await prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "unmapped" },
      });
      return NextResponse.json({ received: true });
    }

    const activatedAt = new Date();
    await prisma.$transaction([
      prisma.couple.update({
        where: { id: couple.id },
        data: {
          planKey: transition.planKey,
          planActivatedAt: activatedAt,
          planExpiresAt: resolveExpiry(transition.planKey, activatedAt),
          planSource: "paddle",
          paddleCustomerId: customerId,
          paddleTransactionId: transactionId,
        },
      }),
      prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "applied", planKey: transition.planKey },
      }),
    ]);

    console.info("Paddle plan granted", {
      eventId,
      userId: attributedUserId,
      planKey: transition.planKey,
      priceId: transition.priceId,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    // Return 500 so Paddle retries — a transient DB failure must not silently
    // drop a paid entitlement. The resume path above is what makes the retry
    // able to finish the job rather than short-circuit on its own earlier row.
    console.error("Paddle webhook processing failed", error);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

/**
 * Find the couple an adjustment should revoke.
 *
 * Two routes, in order of confidence:
 *   1. the transaction the adjustment reverses, matched against the purchase
 *      recorded on the couple — exact, and survives a customer buying twice;
 *   2. the Paddle customer id, for the case where the transaction link is
 *      missing from the payload.
 */
async function resolveCoupleForAdjustment(
  reversedTransactionId: string | null,
  customerId: string | null,
) {
  if (reversedTransactionId) {
    const byTransaction = await prisma.couple.findFirst({
      where: { paddleTransactionId: reversedTransactionId },
      select: { id: true, primaryUserId: true },
    });
    if (byTransaction) return byTransaction;
  }

  if (customerId) {
    const byCustomer = await prisma.couple.findFirst({
      where: { paddleCustomerId: customerId },
      select: { id: true, primaryUserId: true },
    });
    if (byCustomer) return byCustomer;
  }

  return null;
}

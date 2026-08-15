import { NextResponse } from "next/server";

import { plans, type PlanKey } from "@/lib/pricing";
import { env } from "@/lib/env";
import { prisma } from "@/server/prisma";
import { verifyPaddleSignature } from "@/server/services/paddle-signature";

// Paddle sends the signed payload as raw bytes — this route must never be
// body-parsed by a framework layer before we hash it.
export const dynamic = "force-dynamic";

const knownPlanKeys = new Set(plans.map((plan) => plan.key));

// Together is sold as "your wedding year": 12 months of unlimited use plus the
// 6-month post-wedding archive the pitch copy promises. Forever never expires.
const TOGETHER_MONTHS = 18;

function resolveExpiry(planKey: PlanKey, activatedAt: Date) {
  if (planKey !== "together") return null;
  const expires = new Date(activatedAt);
  expires.setMonth(expires.getMonth() + TOGETHER_MONTHS);
  return expires;
}

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    custom_data?: { userId?: string; planKey?: string } | null;
  };
};

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
          userId: event.data?.custom_data?.userId ?? null,
          planKey: event.data?.custom_data?.planKey ?? null,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        // Already processed — acknowledge so Paddle stops retrying.
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    // 3. Only completed transactions grant entitlements. Everything else is
    //    acknowledged (200) so Paddle doesn't retry-storm an event we ignore.
    if (eventType !== "transaction.completed") {
      await prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "ignored" },
      });
      return NextResponse.json({ received: true });
    }

    const userId = event.data?.custom_data?.userId;
    const planKey = event.data?.custom_data?.planKey;

    if (!userId || !planKey || !knownPlanKeys.has(planKey as PlanKey) || planKey === "hello") {
      // A real payment we can't attribute is a support incident, not a silent
      // no-op — log loudly and keep the payload for manual reconciliation.
      console.error("Paddle transaction could not be mapped to a workspace", {
        eventId,
        transactionId: event.data?.id,
        userId,
        planKey,
      });
      await prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "unmapped" },
      });
      return NextResponse.json({ received: true });
    }

    const couple = await prisma.couple.findUnique({
      where: { primaryUserId: userId },
      select: { id: true },
    });

    if (!couple) {
      console.error("Paddle transaction referenced a user with no couple", { eventId, userId });
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
          planKey,
          planActivatedAt: activatedAt,
          planExpiresAt: resolveExpiry(planKey as PlanKey, activatedAt),
          planSource: "paddle",
        },
      }),
      prisma.paymentEvent.update({
        where: { paddleEventId: eventId },
        data: { status: "applied" },
      }),
    ]);

    console.info("Paddle plan granted", { eventId, userId, planKey });
    return NextResponse.json({ received: true });
  } catch (error) {
    // Return 500 so Paddle retries — a transient DB failure must not silently
    // drop a paid entitlement.
    console.error("Paddle webhook processing failed", error);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

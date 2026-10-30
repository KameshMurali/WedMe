import crypto from "node:crypto";

import { test, expect } from "@playwright/test";

import {
  TOGETHER_MONTHS,
  planKeyForPriceId,
  resolveExpiry,
  transitionForEvent,
  type PaddleEvent,
} from "../src/lib/billing/plan-transition";
import { verifyPaddleSignature } from "../src/lib/billing/paddle-signature";

/**
 * The billing path, tested without a database or a network.
 *
 * Playwright is the only test framework configured in this repo, and these are
 * plain unit tests running inside it — the same trick tests/pricing-offer.spec.ts
 * uses to cover src/lib/pricing.ts. No page, no server, no DATABASE_URL.
 *
 * Every case here is a defect that was found in review and fixed, not a
 * hypothetical. If one of these fails, someone has reintroduced a way to take
 * money and get the entitlement wrong.
 */

const PRICES = { together: "pri_together_001", forever: "pri_forever_001" };

function sign(body: string, secret: string, ts = Math.floor(Date.now() / 1000)) {
  const h1 = crypto.createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  return `ts=${ts};h1=${h1}`;
}

test.describe("webhook signature", () => {
  const secret = "pdl_ntfset_test_secret";
  const body = JSON.stringify({ event_id: "evt_1", event_type: "transaction.completed" });

  test("accepts a correctly signed payload", () => {
    const result = verifyPaddleSignature({ header: sign(body, secret), rawBody: body, secret });
    expect(result.ok).toBe(true);
  });

  test("fails closed when no secret is configured", () => {
    // An unset secret must never be read as "accept everything" — without this
    // the webhook is an unauthenticated endpoint that grants paid plans.
    const result = verifyPaddleSignature({
      header: sign(body, secret),
      rawBody: body,
      secret: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "missing_secret" });
  });

  test("rejects a payload whose body was altered after signing", () => {
    const header = sign(body, secret);
    const tampered = body.replace("evt_1", "evt_2");
    expect(verifyPaddleSignature({ header, rawBody: tampered, secret })).toEqual({
      ok: false,
      reason: "mismatch",
    });
  });

  test("rejects a replay of a captured payload", () => {
    const old = Math.floor(Date.now() / 1000) - 60 * 60;
    expect(
      verifyPaddleSignature({ header: sign(body, secret, old), rawBody: body, secret }),
    ).toEqual({ ok: false, reason: "stale" });
  });

  test("rejects a malformed header rather than throwing", () => {
    for (const header of [null, "", "garbage", "ts=;h1=", "h1=abc"]) {
      const result = verifyPaddleSignature({ header, rawBody: body, secret });
      expect(result.ok, `header ${JSON.stringify(header)}`).toBe(false);
    }
  });

  test("a wrong signature of the right length is still rejected", () => {
    // Guards the constant-time compare: timingSafeEqual throws on a length
    // mismatch, so the equal-length case is the one that must reach it.
    const real = sign(body, secret);
    const hex = real.split("h1=")[1];
    const forged = real.replace(hex, "a".repeat(hex.length));
    expect(verifyPaddleSignature({ header: forged, rawBody: body, secret })).toEqual({
      ok: false,
      reason: "mismatch",
    });
  });
});

test.describe("what was bought is decided by the price, not by the browser", () => {
  function completed(priceId: string, customData?: Record<string, string>): PaddleEvent {
    return {
      event_id: "evt_txn",
      event_type: "transaction.completed",
      data: {
        id: "txn_1",
        custom_data: customData ?? null,
        items: [{ price: { id: priceId } }],
      },
    };
  }

  test("grants the plan the price id maps to", () => {
    expect(transitionForEvent(completed(PRICES.forever), PRICES)).toMatchObject({
      kind: "grant",
      planKey: "forever",
    });
    expect(transitionForEvent(completed(PRICES.together), PRICES)).toMatchObject({
      kind: "grant",
      planKey: "together",
    });
  });

  test("a buyer cannot pay for Together and claim Forever", () => {
    // THE EXPLOIT THIS CLOSES. The client token is a NEXT_PUBLIC_ value
    // inlined into the bundle and Paddle.Checkout.open is callable from the
    // console, so custom_data is attacker-controlled. Paying the Together
    // price while claiming "forever" must grant Together.
    const event = completed(PRICES.together, { userId: "usr_1", planKey: "forever" });
    expect(transitionForEvent(event, PRICES)).toMatchObject({
      kind: "grant",
      planKey: "together",
    });
  });

  test("an unknown price is never guessed at", () => {
    const event = completed("pri_not_ours", { userId: "usr_1", planKey: "forever" });
    expect(transitionForEvent(event, PRICES).kind).toBe("unmapped");
  });

  test("a transaction with no line items is unmapped, not granted", () => {
    const event: PaddleEvent = {
      event_id: "evt_txn",
      event_type: "transaction.completed",
      data: { id: "txn_1", items: [], custom_data: { userId: "usr_1", planKey: "forever" } },
    };
    expect(transitionForEvent(event, PRICES).kind).toBe("unmapped");
  });

  test("unconfigured price ids map nothing", () => {
    // A half-configured deploy must not match "" against a missing price id
    // and grant a plan to anyone who sends an empty string.
    expect(planKeyForPriceId("", {})).toBeNull();
    expect(planKeyForPriceId(undefined, PRICES)).toBeNull();
    expect(planKeyForPriceId("pri_together_001", {})).toBeNull();
  });
});

test.describe("refunds take the plan back", () => {
  function adjustment(action: string, status = "approved"): PaddleEvent {
    return {
      event_id: "evt_adj",
      event_type: "adjustment.created",
      data: { id: "adj_1", action, status, transaction_id: "txn_1", customer_id: "ctm_1" },
    };
  }

  test("an approved refund revokes", () => {
    // The terms promise "a full refund within 14 days, no questions asked",
    // while every non-transaction event used to be marked ignored — so a buyer
    // could refund a lifetime plan and keep it.
    expect(transitionForEvent(adjustment("refund"), PRICES).kind).toBe("revoke");
  });

  test("a chargeback revokes", () => {
    expect(transitionForEvent(adjustment("chargeback"), PRICES).kind).toBe("revoke");
  });

  test("a pending refund does not revoke yet", () => {
    // Access must not be pulled on a refund that has only been requested.
    expect(transitionForEvent(adjustment("refund", "pending_approval"), PRICES).kind).toBe("ignore");
  });

  test("a non-revoking adjustment is ignored", () => {
    expect(transitionForEvent(adjustment("credit"), PRICES).kind).toBe("ignore");
  });
});

test.describe("events that are not acted on", () => {
  test("subscription events are ignored, deliberately", () => {
    // Both paid tiers are one-time (src/lib/pricing.ts `recurrence`), so there
    // is nothing recurring to track. This asserts the absence is a decision.
    for (const type of [
      "subscription.created",
      "subscription.updated",
      "subscription.canceled",
      "subscription.past_due",
    ]) {
      expect(transitionForEvent({ event_id: "e", event_type: type }, PRICES).kind).toBe("ignore");
    }
  });

  test("an unknown event type is ignored rather than throwing", () => {
    expect(transitionForEvent({ event_id: "e", event_type: "who.knows" }, PRICES).kind).toBe(
      "ignore",
    );
    expect(transitionForEvent({}, PRICES).kind).toBe("ignore");
  });
});

test.describe("expiry", () => {
  test("Together expires, Forever and hello do not", () => {
    const at = new Date("2027-02-14T00:00:00.000Z");
    expect(resolveExpiry("forever", at)).toBeNull();
    expect(resolveExpiry("hello", at)).toBeNull();
    expect(resolveExpiry("together", at)).not.toBeNull();
  });

  test("Together runs the full wedding year plus archive", () => {
    const at = new Date("2027-02-14T00:00:00.000Z");
    const expires = resolveExpiry("together", at)!;
    const months =
      (expires.getFullYear() - at.getFullYear()) * 12 + (expires.getMonth() - at.getMonth());
    expect(months).toBe(TOGETHER_MONTHS);
    expect(expires.getTime()).toBeGreaterThan(at.getTime());
  });

  test("the constant is shared, so a grant and a purchase cannot disagree", () => {
    // It used to exist twice, hardcoded in both the webhook and grant-plan.ts.
    expect(TOGETHER_MONTHS).toBe(18);
  });
});

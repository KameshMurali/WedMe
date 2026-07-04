# Payment Integration Plan — ToNewBeginning.com

Status: **Proposed** · Last updated: 2026-06

## 1. Context & goals

The pricing surface already exists and is live:

- **Three tiers** (`src/lib/pricing.ts`): `hello` (free), `together`, `forever`.
- **Both paid tiers are ONE-TIME payments** — not subscriptions:
  - **Together** — one payment for the wedding year (12 months unlimited + 6 months archive ⇒ ~18-month lifetime).
  - **Forever** — one payment, lifetime access. Also marketed as *giftable*.
- **5 currencies** (INR, USD, GBP, EUR, AED), prices anchored per-market in `pricing.ts` (major units, e.g. `$49`), with an optional **launch-offer discount** (`launchOfferPct`, `applyLaunchOffer`, `isLaunchOfferActive`).
- A **founding-couple waitlist** is collecting demand today, gated by `checkoutEnabled = false`.
- **Plan limits are already enforced** (`src/server/services/plan.ts` → `getWorkspacePlanKey()` + `planLimits`); right now everyone resolves to `hello`. This is the single seam where activating a paid plan unlocks unlimited events/RSVPs.

**Goal:** take real one-time payments in the buyer's currency, activate the corresponding plan on their workspace, and unlock the gated limits — without rebuilding the pricing UI.

Because both products are one-time, we use **Stripe Checkout in `payment` mode** (no subscription machinery).

## 2. Provider decision

**Recommended: Stripe.**
- Supports all 5 currencies and is available to UAE-registered businesses.
- Hosted Checkout = PCI burden stays with Stripe; we never touch card data (keeps our "no card entry" posture intact).
- One-time payments map cleanly to our model.

Alternatives considered (not recommended for v1): **Razorpay** (great for INR but weak multi-currency), **Telr/PayTabs** (UAE-local but more integration overhead). Revisit only if Stripe fees/availability become a blocker in a specific market.

## 3. Data model (Prisma migration)

Add a `Purchase` record as the source of truth, and a denormalized pointer on the workspace for fast reads.

```prisma
enum PurchaseStatus { PENDING PAID REFUNDED }

model Purchase {
  id                    String         @id @default(cuid())
  weddingSiteId         String
  planKey               String         // "together" | "forever"
  currency              String         // ISO 4217
  amountMinor           Int            // charged amount in minor units (paise/cents/fils)
  status                PurchaseStatus @default(PENDING)
  stripeSessionId       String         @unique
  stripePaymentIntentId String?
  purchasedByEmail      String?        // for gifting (phase 2)
  activatedAt           DateTime?
  expiresAt             DateTime?      // null = lifetime (forever); set for together
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  weddingSite           WeddingSite    @relation(fields: [weddingSiteId], references: [id], onDelete: Cascade)

  @@index([weddingSiteId])
}

// On WeddingSite (denormalized for cheap reads in getWorkspacePlanKey):
//   planKey        String?   // active paid plan, null = free
//   planExpiresAt  DateTime? // null = lifetime
```

Ship via the established migrations workflow (`prisma migrate diff` → `prisma/migrations/<ts>_add_purchase` → committed → Vercel build runs `prisma migrate deploy`). Remember the `migration_lock.toml` is already present.

## 4. Money handling (critical correctness)

- `pricing.ts` stores **major units**. Stripe wants **minor units** → multiply by 100. All 5 currencies are 2-decimal (INR paise, AED fils, USD/GBP/EUR cents), so `amountMinor = majorAmount * 100`. (Add a guard/comment so a future zero-decimal currency like JPY isn't mishandled.)
- **Always compute the amount server-side** from `pricing.ts` + `applyLaunchOffer()`. Never trust an amount/price posted from the client — the client only sends `{ planKey, currency }`.
- Use Stripe **inline `price_data`** (no pre-created Price objects) so `pricing.ts` stays the single source of truth and price edits don't require Stripe dashboard changes.

## 5. Checkout flow

```
Pricing card / dashboard "Upgrade" ──► createCheckoutSession (server action / route)
   • requireUser(), resolve site, resolve currency (cookie/geo), planKey
   • compute amountMinor = applyLaunchOffer(plan, plan.prices[currency].amount) * 100
   • stripe.checkout.sessions.create({
       mode: "payment",
       line_items: [{ price_data: { currency, unit_amount: amountMinor,
                       product_data: { name: `${plan.name} plan` } }, quantity: 1 }],
       success_url: `${APP_URL}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
       cancel_url:  `${APP_URL}/pricing?status=cancelled`,
       customer_email: user.email,
       metadata: { siteId, planKey, currency },
     })
   • create local Purchase(status=PENDING, stripeSessionId)
   • redirect to session.url
                                   │
Stripe Checkout (hosted) ──────────┘
   │ on success
   ▼
success_url page  ──►  shows "activating…" (does NOT grant access by itself)
Stripe webhook  ──►  /api/webhooks/stripe  (SOURCE OF TRUTH)
```

No client-side Stripe SDK needed — we create the session server-side and redirect to `session.url`.

## 6. Webhook (source of truth)

Route: `POST /api/webhooks/stripe` (App Router, **raw body** via `req.text()` for signature verification).

- Verify `STRIPE_WEBHOOK_SECRET` signature; reject otherwise.
- Handle `checkout.session.completed` (and `payment_intent.succeeded` as backstop):
  - Look up the `Purchase` by `stripeSessionId`; if already `PAID`, **no-op (idempotent)**.
  - Mark `Purchase.status = PAID`, set `activatedAt`, set `expiresAt` (`together` → now + 18 months; `forever` → null).
  - Set `WeddingSite.planKey` / `planExpiresAt`.
  - Fire a Resend confirmation email ("Your ToNewBeginning plan is active") — best-effort, like the welcome email.
- Handle `charge.refunded` → set `Purchase.status = REFUNDED`, clear the workspace plan.
- Idempotency: rely on the `stripeSessionId` unique constraint + status check so duplicate webhook deliveries are safe.

## 7. Plan resolution (the unlock)

Update `src/server/services/plan.ts::getWorkspacePlanKey(siteId)` to read the real plan:

```
if WeddingSite.planKey && (planExpiresAt == null || planExpiresAt > now) → return planKey
else → "hello"
```

This automatically:
- Unlocks **unlimited events** (the cap in `replaceEventsAction` already routes through this).
- Unlocks the **50-RSVP** limit (wire the same way if/when RSVP enforcement lands).
- Lets `getPlanLimits()` return the paid (unlimited) limits.

Together's expiry naturally downgrades the workspace back to `hello` limits after ~18 months (read-only archive can be a later refinement — for v1, the public site stays published; only editing limits reapply).

## 8. UI entry points

- **Flip `checkoutEnabled = true`** in `pricing.ts` → `PricingCard` already swaps the waitlist form back to a real CTA (`Link href={registerHref}` today; change the paid-tier branch to call `createCheckoutSession`).
- **Dashboard upgrade CTA**: add an "Upgrade" affordance in the dashboard (e.g. Settings or a billing nav item) + a `/dashboard/billing` page showing current plan, purchase history, and upgrade buttons.
- **Success page** `/dashboard/billing?status=success`: poll/refresh until the webhook marks the plan active (don't grant on redirect alone).
- **Email-locked-in pricing**: optionally honor founding-couple `WaitlistSignup` rows with their captured currency/price.

## 9. Environment & config

Add to `src/lib/env.ts` schema + Vercel (prod + preview):
- `STRIPE_SECRET_KEY` (test key in preview, live key in prod)
- `STRIPE_WEBHOOK_SECRET`
- (no publishable key needed for the redirect-to-Checkout approach)

Register the webhook endpoint in the Stripe dashboard pointing at `https://wed.tonewbeginning.com/api/webhooks/stripe`.

## 10. Security & correctness checklist

- ✅ Amount computed server-side from `pricing.ts` — client never sends prices.
- ✅ Webhook signature verified; raw body preserved.
- ✅ Idempotent activation (unique `stripeSessionId` + status guard).
- ✅ Access granted **only** by the webhook, never by the success redirect.
- ✅ Card data never touches our servers (hosted Checkout) — consistent with our "don't enter financial credentials" rule.
- ⚠️ **VAT/Tax**: UAE VAT is 5%. Decide whether prices are tax-inclusive (simplest) or enable **Stripe Tax**. Recommend tax-inclusive for v1, revisit with an accountant.
- ⚠️ **Currency lock**: once a session is created in a currency, keep it; don't let a later cookie change mutate an in-flight purchase.

## 11. Gifting (Forever) — Phase 2

"Forever" is giftable. Defer to phase 2:
- Gifter enters the couple's **slug or email**; resolve to `siteId`.
- `metadata.targetSiteId` + `purchasedByEmail`; webhook activates the *target* workspace and emails both gifter and couple.
- v1 ships **self-purchase only** to keep scope tight.

## 12. Testing

- Stripe **test mode** + test cards (`4242…`) across all 5 currencies.
- **Stripe CLI** (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) for local webhook testing; replay `checkout.session.completed`.
- E2E (mirroring the existing regression harness): create session → simulate webhook → assert `Purchase=PAID`, `WeddingSite.planKey` set, `getWorkspacePlanKey` returns the paid plan, event limit lifted. Clean up the test rows.
- Verify a **refund** webhook downgrades correctly.

## 13. Rollout phases

1. **Schema + plan resolution** — `Purchase` model, migration, `getWorkspacePlanKey` reads real plan (no UI change; still everyone free).
2. **Checkout + webhook** — server action, `/api/webhooks/stripe`, env vars, Stripe test mode. Validate end-to-end in preview.
3. **Go live** — set Stripe live keys, flip `checkoutEnabled = true`, dashboard billing page, confirmation email. Announce to the waitlist with founding-couple pricing.
4. **Phase 2** — gifting, Stripe Tax, Together→archive downgrade UX, invoices/receipts page.

## 14. Open decisions (need product sign-off)

- Tax-inclusive pricing vs Stripe Tax?
- Together duration: confirm 12mo active + 6mo archive = 18mo `expiresAt` (and what "archive" restricts).
- Honor founding-couple waitlist pricing? If so, how (coupon, captured amount)?
- Refund policy (self-serve vs manual via Stripe dashboard — recommend manual for v1).

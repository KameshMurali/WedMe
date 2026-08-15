# Paddle setup — turning checkout on

Checkout ships **dark**. `checkoutEnabled` in `src/lib/pricing.ts` is derived
from environment variables, not hand-flipped, so until the variables below are
set the pricing page keeps showing the waitlist capture. That is deliberate: a
half-configured deploy can never take money it isn't able to fulfil.

Work through this in **sandbox first**. Nothing here touches live money until
Step 7.

---

## Step 0 — Create a sandbox account

Sandbox is a **separate account** from your live one, even though you already
signed up. They share no credentials.

Sign up at <https://sandbox-vendors.paddle.com/signup>.

Quick way to tell which account a credential came from:

| | Sandbox | Live |
|---|---|---|
| Client-side token | starts `test_` | no prefix |
| API key | contains `_sdbx` | no marker |
| API base URL | `sandbox-api.paddle.com` | `api.paddle.com` |

---

## Step 1 — Create the products and prices

**Catalog → Products → New product.** Create two: `Together` and `Forever`.

Give each product **one price**, billing type **one-time**. These are one-off
payments, not subscriptions — in Paddle's model they are *transactions*. Picking
"recurring" here would bill your couples every year.

Set a base price, then use **Add currency override** for the rest:

| Currency | Together | Forever |
|---|---:|---:|
| INR | 3,499 | 7,999 |
| USD | 49 | 99 |
| GBP | 39 | 79 |
| EUR | 45 | 89 |
| AED | 179 | 359 |

These must match `src/lib/pricing.ts` **exactly**. The site renders prices from
that file and Paddle charges from these; any drift means advertising one price
and charging another.

> **Confirm AED appears in the currency dropdown.** Paddle's docs weren't
> reachable to verify it. If AED isn't offered, Paddle will charge UAE buyers in
> your base currency while the pricing page still advertises dirhams — a real
> price-mismatch bug. Say so and the AED column comes out of `pricing.ts`
> instead.

Copy both **price IDs** (`pri_...`).

---

## Step 2 — Create the launch discount

**Catalog → Discounts → New discount.** 30% off, **restricted to the Forever
price only** — `launchOfferPct: 30` is set on Forever alone, matching the
"30% off Forever" promise on the pricing page.

Copy the discount ID (`dsc_...`).

Once live, check that the checkout total matches the struck-through price on the
card (₹7,999 → ₹5,599). The site rounds with `Math.round` and Paddle does its
own rounding, so a rupee of drift is possible. Small, but it's exactly the sort
of thing a buyer screenshots.

---

## Step 3 — Create a client-side token

**Developer Tools → Authentication → Client-side tokens.**

This is the *only* Paddle credential safe to expose in a browser. The **API key
is server-side** and must never be pasted into a `NEXT_PUBLIC_*` variable —
anything with that prefix is compiled into the JavaScript bundle every visitor
downloads.

---

## Step 4 — Create the webhook

**Developer Tools → Notifications → New destination.**

- **URL:** your deployed app + `/api/webhooks/paddle`
- **Events:** `transaction.completed` — this one only

Reveal and copy the **signing secret**.

The URL has to be publicly reachable, so this needs a deployed environment.
Recommended: put the sandbox variables in Vercel's **Preview** scope and point
the sandbox webhook at the stable branch alias URL. That keeps test traffic off
your live domain. Live credentials go in the **Production** scope at Step 7.

---

## Step 5 — Get the domain approved

**Checkout → Website approval.** Submit `wed.tonewbeginning.com`.

Paddle.js refuses to open checkout on an unapproved domain, so skipping this
produces a button that silently does nothing.

---

## Step 6 — Set the environment variables

```bash
# Public — compiled into the browser bundle
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...   # live token has no test_ prefix
NEXT_PUBLIC_PADDLE_ENV=sandbox             # flip to "production" at go-live
NEXT_PUBLIC_PADDLE_PRICE_TOGETHER=pri_...
NEXT_PUBLIC_PADDLE_PRICE_FOREVER=pri_...
NEXT_PUBLIC_PADDLE_DISCOUNT_LAUNCH=dsc_...

# Server-only — never exposed to the browser
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=pdl_ntfset_...
```

Checkout turns on only when the client token **and both** price IDs are present.
Redeploy after setting them — Next.js inlines `NEXT_PUBLIC_*` values at build
time, so changing them in Vercel has no effect until the next build.

---

## Step 7 — Test, then go live

Sandbox rejects real card numbers. Use Paddle's test card with any cardholder
name and any future expiry date.

End-to-end check:

1. Sign in (checkout requires an account — the payment has to be attributable to
   a workspace).
2. Choose Together, pay with the test card.
3. A `PaymentEvent` row appears with `status: "applied"`.
4. The couple's `planKey` is `together`, with `planExpiresAt` ~18 months out.
5. AI drafting is unlimited and the registry is uncapped.

Then go live: repeat Steps 1–5 in the **live** account — product, price and
discount IDs do **not** transfer between sandbox and live — swap in the live
credentials, and set `NEXT_PUBLIC_PADDLE_ENV=production`.

---

## Troubleshooting

### Payment succeeded but the plan didn't activate

The most likely failure, in the order worth checking:

1. **`PADDLE_WEBHOOK_SECRET` doesn't match the destination.** The webhook
   verifies Paddle's signature and *fails closed* — an unset or wrong secret
   rejects every request rather than trusting an unverified payload. Deliberate:
   without that check, anyone who knew the URL could POST JSON and grant
   themselves Forever.
2. **The destination isn't subscribed to `transaction.completed`.** Other event
   types are acknowledged and ignored.
3. **Check the `PaymentEvent` row's `status`**, which says where it stopped:

   | `status` | Meaning |
   |---|---|
   | `applied` | Plan granted. Working as intended. |
   | `unmapped` | Paid, but no matching workspace — check `customData.userId`. Needs manual reconciliation; the full payload is stored on the row. |
   | `ignored` | Not a `transaction.completed` event. |
   | `received` | Processing failed partway. Paddle will retry. |

Retries are safe: `paddleEventId` is unique, so a replayed event can never grant
a plan twice.

### Checkout button does nothing

Domain not approved (Step 5), or the price ID for that plan is missing.

### Pricing page still shows the waitlist

`checkoutEnabled` is false — the client token or one of the price IDs is unset,
or the app hasn't been rebuilt since they were added.

---

## Money and compliance

Paddle is the **Merchant of Record**: it is the legal seller, so it registers and
remits VAT, GST and US sales tax worldwide and issues buyer invoices. That's the
main reason it was chosen over a plain processor at roughly 2% cheaper.

Two consequences worth knowing:

- **Payouts are USD, EUR, GBP, AUD or CAD — never INR.** Money arriving in an
  Indian bank account is export-of-service revenue: FIRC/FEMA documentation and
  GST treatment (LUT for zero-rated export). Accountant territory, not code.
- **Buyers see "Paddle" on their statement**, not ToNewBeginning. The refund
  policy on `/terms` names Paddle for exactly this reason — an unrecognised card
  descriptor is a common chargeback trigger.

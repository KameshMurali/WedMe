// Pricing source of truth. Per-currency prices are anchored to local
// purchasing power, not FX-converted live. Update here when running A/B
// tests or adjusting for new markets.

export type PlanKey = "hello" | "together" | "forever";
export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED";

// Lives here (not geo.ts) so it's safe to import from client components —
// geo.ts depends on next/headers and can't enter the client bundle.
export const CURRENCY_COOKIE_NAME = "tnb-currency";

// Paddle checkout configuration. Only NEXT_PUBLIC_* values may live in this
// module — it is imported by client components, so server secrets must never
// be referenced here (PADDLE_API_KEY / PADDLE_WEBHOOK_SECRET stay in env.ts).
export const paddleConfig = {
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
  environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
  priceIds: {
    together: process.env.NEXT_PUBLIC_PADDLE_PRICE_TOGETHER ?? "",
    forever: process.env.NEXT_PUBLIC_PADDLE_PRICE_FOREVER ?? "",
  } as Record<string, string>,
  // Paddle discount applied at checkout while the launch offer is running.
  // Without this the struck-through price would be a lie — see applyLaunchOffer.
  launchDiscountId: process.env.NEXT_PUBLIC_PADDLE_DISCOUNT_LAUNCH ?? "",
};

// Master switch for monetization rollout — DERIVED, not hand-flipped.
//   unconfigured → paid tiers show the "Notify me — founding-couple pricing"
//                  waitlist capture (validate demand before payments exist).
//   configured   → paid tiers open real Paddle checkout.
// Deriving it means checkout turns on by setting Vercel env vars, and a
// half-configured deploy can never take money it can't fulfil.
export const checkoutEnabled = Boolean(
  paddleConfig.clientToken && paddleConfig.priceIds.together && paddleConfig.priceIds.forever,
);

// Whether the launch discount can actually be CHARGED, which is a stricter
// question than whether the offer window is open.
//
// The discount is applied by Paddle at checkout using launchDiscountId. If that
// id is missing, the checkout call silently drops it and bills full price, so
// any struck-through price shown next to it is false. Three ways that used to
// happen, all of which this closes:
//
//   1. Paddle not configured at all — the card advertised "save 30%" beside a
//      "Coming Soon" pill and copy saying payments were not open.
//   2. Token and price ids set but the discount id forgotten — the card
//      advertised the discounted price and Paddle opened at full price.
//   3. The window open but nothing purchasable, so the countdown created
//      urgency toward a date on which nothing would change.
export const launchDiscountConfigured = Boolean(paddleConfig.launchDiscountId);

export function isLaunchOfferChargeable() {
  return checkoutEnabled && launchDiscountConfigured;
}

export type PriceAmount = {
  amount: number; // integer in MAJOR units (we don't need cents for these prices)
  display: string; // pre-formatted for paste into headlines (e.g. "$49")
};

export type CurrencyMeta = {
  code: CurrencyCode;
  symbol: string;
  label: string; // "US Dollar"
  locale: string; // BCP 47 locale used for Intl formatting fallbacks
  flag: string; // emoji flag for the switcher
};

export const currencies: Record<CurrencyCode, CurrencyMeta> = {
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee", locale: "en-IN", flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US", flag: "🇺🇸" },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB", flag: "🇬🇧" },
  EUR: { code: "EUR", symbol: "€", label: "Euro", locale: "en-IE", flag: "🇪🇺" },
  AED: { code: "AED", symbol: "AED", label: "UAE Dirham", locale: "en-AE", flag: "🇦🇪" },
};

function inr(n: number): PriceAmount {
  return { amount: n, display: `₹${n.toLocaleString("en-IN")}` };
}
function usd(n: number): PriceAmount {
  return { amount: n, display: `$${n}` };
}
function gbp(n: number): PriceAmount {
  return { amount: n, display: `£${n}` };
}
function eur(n: number): PriceAmount {
  return { amount: n, display: `€${n}` };
}
function aed(n: number): PriceAmount {
  return { amount: n, display: `AED ${n}` };
}

export type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  pitch: string; // body copy used on the pricing card
  highlights: string[]; // bullet list
  badge?: string; // e.g. "Most chosen", "Best value"
  ctaLabel: string;
  recurrence: "free" | "wedding-year" | "lifetime";
  prices: Record<CurrencyCode, PriceAmount>;
  launchOfferPct?: number; // optional discount applied during launch offer window
};

// Structured, enforceable plan limits — the single source of truth that both
// the marketing copy and the server-side quota checks must agree with.
// `null` means unlimited. Keep these in sync with each plan's `highlights`.
export type PlanLimits = {
  maxEvents: number | null;
  maxRsvps: number | null;
  maxRegistryLinks: number | null;
  // Lifetime free-tier AI drafting teaser (persistent Couple.aiDraftCount).
  // Paid tiers are "unlimited" behind invisible abuse caps (burst + daily).
  aiLifetimeDrafts: number | null;
  // Per-day attempt cap. This is the one that bounds SPEND, because a failed or
  // off-topic attempt still costs a model call while never spending a lifetime
  // credit — so without a tighter free-tier daily cap a free account could burn
  // the full daily allowance every day forever without ever using its ten
  // drafts. null = fall back to AI_DRAFT_DAILY_LIMIT.
  aiDailyDrafts: number | null;
};

export const planLimits: Record<PlanKey, PlanLimits> = {
  hello: { maxEvents: 2, maxRsvps: 50, maxRegistryLinks: 4, aiLifetimeDrafts: 10, aiDailyDrafts: 3 },
  together: { maxEvents: null, maxRsvps: null, maxRegistryLinks: null, aiLifetimeDrafts: null, aiDailyDrafts: null },
  forever: { maxEvents: null, maxRsvps: null, maxRegistryLinks: null, aiLifetimeDrafts: null, aiDailyDrafts: null },
};

export const plans: Plan[] = [
  {
    key: "hello",
    name: "Hello",
    tagline: "Start with no commitment",
    pitch:
      "Build a draft, share your story, see your wedding take shape. Free forever. Upgrade only when your celebration gets serious.",
    highlights: [
      "Branded ToNewBeginning subdomain",
      "Up to 2 wedding events",
      "Up to 50 RSVPs",
      "Gallery, story timeline, FAQs",
    ],
    ctaLabel: "Create your account",
    recurrence: "free",
    prices: {
      INR: inr(0),
      USD: usd(0),
      GBP: gbp(0),
      EUR: eur(0),
      AED: aed(0),
    },
  },
  {
    key: "together",
    name: "Together",
    tagline: "For your wedding year",
    pitch:
      "One payment for the full year of your wedding: 12 months of unlimited everything, plus 6 months of post-wedding archive so guests can revisit.",
    highlights: [
      "AI-assisted content drafting",
      "Unlimited events, RSVPs, uploads",
      "Password protection + invite codes",
      "Priority email support",
    ],
    badge: "Most chosen",
    ctaLabel: "Choose Together",
    recurrence: "wedding-year",
    prices: {
      INR: inr(3499),
      USD: usd(49),
      GBP: gbp(39),
      EUR: eur(45),
      AED: aed(179),
    },
  },
  {
    key: "forever",
    name: "Forever",
    tagline: "Your wedding lives on",
    pitch:
      "Pay once, your site lives forever. Everything in Together, plus anniversary refresh emails, lifetime archive, AI content help, and a real human concierge for setup.",
    highlights: [
      "Everything in Together",
      "Lifetime hosting & archive",
      "Anniversary refresh emails",
      "AI-assisted content & translations",
      "1:1 concierge setup call",
      "Giftable, perfect from family",
    ],
    badge: "Best value",
    ctaLabel: "Choose Forever",
    recurrence: "lifetime",
    launchOfferPct: 30,
    prices: {
      INR: inr(7999),
      USD: usd(99),
      GBP: gbp(79),
      EUR: eur(89),
      AED: aed(359),
    },
  },
];

export function findPlan(key: PlanKey) {
  const plan = plans.find((p) => p.key === key);
  if (!plan) throw new Error(`Unknown plan: ${key}`);
  return plan;
}

// Launch offer: real, date-bounded. When the window closes, the badge and
// discount disappear automatically — no manual cleanup needed.
export const launchOffer = {
  // Bump this date when you re-launch a promo. Re-opened for the paid launch;
  // the matching Paddle discount must be live or the strike-through misleads.
  //
  // Pushed out from 2026-09-30 ahead of the launch post: driving signups into
  // an offer that lapses days later strands everyone who arrives late, and
  // checkout is still gated on paddleConfig anyway.
  endsAt: new Date("2026-12-31T23:59:59Z"),
  label: "Launch offer",
  blurb: "First 100 couples: 30% off Forever",
};

// The window is open. Says nothing about whether the discount can be charged.
// Use this for forward-looking copy ("30% off at launch"), never for a price.
export function isLaunchOfferActive(now: Date = new Date()) {
  return now < launchOffer.endsAt;
}

// The window is open AND Paddle can actually apply the discount. This is the
// only condition under which it is honest to show a reduced number.
export function isLaunchOfferLive(now: Date = new Date()) {
  return isLaunchOfferActive(now) && isLaunchOfferChargeable();
}

// Returns the price to DISPLAY. Gated on isLaunchOfferLive, not merely on the
// window: a discounted figure beside a "Coming Soon" pill, or beside a checkout
// that will bill full price, is a false claim about what the customer pays.
//
// `chargeable` exists so tests can exercise all four combinations without
// mutating NEXT_PUBLIC_* env vars, which are inlined at build time.
export function applyLaunchOffer(
  amount: number,
  plan: Plan,
  now: Date = new Date(),
  chargeable: boolean = isLaunchOfferChargeable(),
) {
  if (!plan.launchOfferPct) return amount;
  if (!isLaunchOfferActive(now) || !chargeable) return amount;
  const discounted = Math.round(amount * (1 - plan.launchOfferPct / 100));
  return discounted;
}

// "Ends 31 December" from launchOffer.endsAt. The card hardcoded "Ends 31 Jul"
// while the date said December, so the urgency line was simply wrong.
export function formatLaunchOfferEnd(locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(launchOffer.endsAt);
}

// schema.org Offers for the marketing pages, derived from `plans`.
//
// Both the homepage and the pricing page previously hardcoded their own copies
// of these prices as string literals. That put "price: 99, availability:
// InStock" in the same document that rendered a "Coming Soon" pill, which is
// exactly the on-page/structured-data mismatch search engines penalise. Derived
// here so the two can never disagree with each other or with the prices a
// visitor sees.
//
// Availability follows checkout: PreOrder while payments are closed, because
// nothing on the site can be bought yet.
export function buildOfferSchema(currency: CurrencyCode = "USD") {
  const availability = checkoutEnabled
    ? "https://schema.org/InStock"
    : "https://schema.org/PreOrder";

  return plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    // Run through applyLaunchOffer so the structured price equals the price on
    // the card in every state: undiscounted while the offer is not chargeable,
    // discounted once it is.
    price: String(applyLaunchOffer(plan.prices[currency].amount, plan)),
    priceCurrency: currency,
    availability,
    description: plan.tagline,
  }));
}

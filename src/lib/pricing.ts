// Pricing source of truth. Per-currency prices are anchored to local
// purchasing power, not FX-converted live. Update here when running A/B
// tests or adjusting for new markets.

export type PlanKey = "hello" | "together" | "forever";
export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED";

// Lives here (not geo.ts) so it's safe to import from client components —
// geo.ts depends on next/headers and can't enter the client bundle.
export const CURRENCY_COOKIE_NAME = "tnb-currency";

// Master switch for monetization rollout.
//   false → paid tiers show a "Notify me — founding-couple pricing" waitlist
//           capture (validate demand before payments exist).
//   true  → paid tiers link to real Checkout (flip this when Stripe is wired).
export const checkoutEnabled = false;

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

export const plans: Plan[] = [
  {
    key: "hello",
    name: "Hello",
    tagline: "Start with no commitment",
    pitch:
      "Build a draft, share your story, see your wedding take shape. Free forever — upgrade only when your celebration gets serious.",
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
      "One payment for the full year of your wedding — 12 months of unlimited everything, plus 6 months of post-wedding archive so guests can revisit.",
    highlights: [
      "Custom domain (yourwedding.com)",
      "No ToNewBeginning branding",
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
      "Pay once, your site lives forever. Everything in Together — plus anniversary refresh emails, lifetime archive, AI content help, and a real human concierge for setup.",
    highlights: [
      "Everything in Together",
      "Lifetime hosting & archive",
      "Anniversary refresh emails",
      "AI-assisted content & translations",
      "1:1 concierge setup call",
      "Giftable — perfect from family",
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
  // Bump this date when you re-launch a promo.
  endsAt: new Date("2026-07-31T23:59:59Z"),
  label: "Launch offer",
  blurb: "First 100 couples — 30% off Forever",
};

export function isLaunchOfferActive(now: Date = new Date()) {
  return now < launchOffer.endsAt;
}

export function applyLaunchOffer(
  amount: number,
  plan: Plan,
  now: Date = new Date(),
) {
  if (!plan.launchOfferPct || !isLaunchOfferActive(now)) return amount;
  const discounted = Math.round(amount * (1 - plan.launchOfferPct / 100));
  return discounted;
}

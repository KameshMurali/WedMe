import type { Route } from "next";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { CurrencySwitcher } from "@/components/marketing/currency-switcher";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PricingCard } from "@/components/marketing/pricing-card";
import { detectCurrency } from "@/lib/geo";
import { isLaunchOfferActive, launchOffer, plans } from "@/lib/pricing";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Pricing — Wedding Website Plans · ToNewBeginning",
  description:
    "ToNewBeginning.com pricing: start free with the Hello plan (2 events, 50 RSVPs), upgrade to Together (₹3,499 / $49 for your wedding year), or choose Forever for lifetime hosting. No subscriptions.",
  alternates: { canonical: "/pricing" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "ToNewBeginning.com — Wedding Website Builder",
  description:
    "A wedding website platform for Indian and South Asian couples with multi-event support, RSVP management, photo galleries, and a polished couple dashboard.",
  brand: { "@type": "Brand", name: "ToNewBeginning" },
  offers: [
    {
      "@type": "Offer",
      name: "Hello",
      description: "Free forever — up to 2 wedding events and 50 RSVPs, gallery, story timeline.",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://wed.tonewbeginning.com/register",
    },
    {
      "@type": "Offer",
      name: "Together",
      description:
        "Wedding year plan — AI-assisted content drafting, unlimited events, unlimited RSVPs, no ToNewBeginning branding.",
      price: "49",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://wed.tonewbeginning.com/register",
    },
    {
      "@type": "Offer",
      name: "Forever",
      description:
        "Lifetime plan — everything in Together plus permanent hosting, anniversary refresh emails, AI content help, and concierge setup.",
      price: "99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://wed.tonewbeginning.com/register",
    },
  ],
};

const pricingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What happens after my wedding year ends on Together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your site automatically moves to a read-only archive for 6 months. After that you can upgrade to Forever to keep it live, or download a permanent backup.",
      },
    },
    {
      "@type": "Question",
      name: "Can someone else gift me Forever?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — a parent or sibling can buy Forever and apply it to your slug. We send a card-style email so it feels like a real gift, not a billing receipt.",
      },
    },
    {
      "@type": "Question",
      name: "Why are prices different in different countries?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We anchor prices to local purchasing power, not raw FX. A couple in India and a couple in California pay a fair amount for what the product is worth where they live.",
      },
    },
    {
      "@type": "Question",
      name: "Do I lose work if I never upgrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Hello is free forever for drafts and small celebrations. You only need to upgrade when you outgrow it — more events, more guests, or AI help drafting your content.",
      },
    },
  ],
};

export default async function PricingPage() {
  const [currency, user] = await Promise.all([detectCurrency(), getCurrentUser()]);
  // Already signed-in users skip the marketing register CTA and go to the
  // dashboard where the upgrade context will live once Checkout is wired.
  const registerHref = (user ? "/dashboard" : "/register") as Route;

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }} />
    <main className="section-shell relative pb-24 pt-16 sm:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[color:var(--accent)]/14 to-transparent" />

      {/* Top row — back link + launch offer pill + currency switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
          >
            ← Back to home
          </Link>
          {isLaunchOfferActive() ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-semibold text-[color:var(--text)] shadow-sm ring-1 ring-black/5">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--primary)]" />
              {launchOffer.label} · {launchOffer.blurb}
            </span>
          ) : null}
        </div>
        <CurrencySwitcher current={currency} />
      </div>

      {/* Editorial headline (mirrors the reference aesthetic) */}
      <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="font-display text-5xl leading-[0.95] text-[color:var(--text)] sm:text-6xl lg:text-7xl">
            Start free.
            <br />
            Upgrade when your
            <br />
            wedding gets serious.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--muted)]">
            Explore the core wedding workspace for free. Pay once for the year your celebration runs —
            or keep your site as a memory <em>forever</em>. No subscriptions, no surprise renewals.
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-black/8 bg-white/70 p-6 text-sm leading-7 text-[color:var(--muted)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
            Why we don&apos;t do monthly
          </p>
          <p className="mt-3">
            Weddings have a date. Your plan should too. <strong className="text-[color:var(--text)]">Together</strong> covers
            the wedding year + 6 months of post-wedding archive. <strong className="text-[color:var(--text)]">Forever</strong>{" "}
            keeps your site alive past anniversaries, with refresh emails and a lifetime archive.
          </p>
        </div>
      </div>

      {/* Plan grid */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.key}
            plan={plan}
            currency={currency}
            registerHref={registerHref}
            emphasis={plan.key === "together"}
          />
        ))}
      </div>

      {/* Reassurance row */}
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <Reassurance
          title="Cancel anytime — there's nothing to cancel"
          body="No recurring billing. Together is one payment for the wedding year. Forever is one payment, period."
        />
        <Reassurance
          title="Your photos stay yours"
          body="Export your gallery any time. If you stop using us, we hand back a zipped backup — no hostage data."
        />
        <Reassurance
          title="Made with the same care your wedding deserves"
          body="Designed for South Asian, multi-day, multi-event weddings — and equally happy for two-people elopements."
        />
      </div>

      {/* Mini FAQ */}
      <div className="mt-20">
        <h2 className="font-display text-4xl text-[color:var(--text)]">A few questions before you choose</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Faq
            q="What happens after my wedding year ends on Together?"
            a="Your site automatically moves to a read-only archive for 6 months. After that you can upgrade to Forever to keep it live, or download a permanent backup."
          />
          <Faq
            q="Can someone else gift me Forever?"
            a="Yes — a parent or sibling can buy Forever and apply it to your slug. We send a card-style email so it feels like a real gift, not a billing receipt."
          />
          <Faq
            q="Why are prices different in different countries?"
            a="We anchor prices to local purchasing power, not raw FX. A couple in India and a couple in California pay a fair amount for what the product is worth where they live."
          />
          <Faq
            q="Do I lose work if I never upgrade?"
            a="No. Hello is free forever for drafts and small celebrations. You only need to upgrade when you outgrow it (more events, more guests, AI help drafting your content)."
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 rounded-[2rem] border border-black/8 bg-white/80 px-8 py-12 text-center shadow-[0_24px_80px_rgba(43,26,24,0.05)] sm:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
          Ready when you are
        </p>
        <h3 className="mt-4 font-display text-4xl text-[color:var(--text)] sm:text-5xl">
          Build your wedding workspace today. Decide on a plan when it feels right.
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
          Hello is free forever. You can build a complete draft, share it for feedback, and only upgrade once you&apos;re ready
          to publish to your full guest list.
        </p>
        <div className="mt-7">
          <Link
            href={registerHref}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-7 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-[color:var(--accent)]"
          >
            {user ? "Open your dashboard" : "Create your free account"}
          </Link>
        </div>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}

function Reassurance({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.4rem] border border-black/8 bg-white/65 p-5 backdrop-blur-sm">
      <p className="font-semibold text-[color:var(--text)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-[1.4rem] border border-black/8 bg-white/70 p-5 transition open:bg-white">
      <summary className="cursor-pointer list-none font-semibold text-[color:var(--text)] [&::-webkit-details-marker]:hidden">
        <span className="mr-3 text-[color:var(--primary)] transition group-open:rotate-90 inline-block">›</span>
        {q}
      </summary>
      <p className="mt-3 pl-5 text-sm leading-7 text-[color:var(--muted)]">{a}</p>
    </details>
  );
}

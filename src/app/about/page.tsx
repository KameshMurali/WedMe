import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "About ToNewBeginning.com · Indian Wedding Website Builder",
  description:
    "ToNewBeginning.com is a wedding website platform built for South Asian and Indian couples. Learn who we are, what we believe, and how to reach us.",
  alternates: { canonical: "/about" },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToNewBeginning.com",
  url: "https://wed.tonewbeginning.com",
  logo: "https://wed.tonewbeginning.com/icon.png",
  image: "https://wed.tonewbeginning.com/og-image.png",
  foundingLocation: { "@type": "Place", name: "India" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@tonewbeginning.com",
    contactType: "customer support",
  },
  sameAs: [
    "https://tonewbeginning.com",
    "https://www.instagram.com/wed.tonewbeginning",
  ],
  description:
    "A premium wedding website builder designed for Indian and South Asian couples: multi-day ceremonies, large guest lists, RSVP management, photo galleries, and a calm couple dashboard.",
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <main className="section-shell pb-24 pt-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary)]">
            About us
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-[color:var(--text)] sm:text-6xl">
            Built for the weddings that deserve more.
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--muted)]">
            ToNewBeginning.com is a wedding website platform built specifically for Indian and South
            Asian couples: celebrations that span multiple days, multiple ceremonies, and hundreds
            of guests across cities and countries.
          </p>

          <div className="mt-12 space-y-10">
            <section>
              <h2 className="font-display text-3xl text-[color:var(--text)]">What we are</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                We are a wedding website builder. Not a directory, not an agency, not a template
                seller. Couples use ToNewBeginning.com to create a living digital home for their
                entire wedding journey: the love story, the event schedule (Haldi, Sangeet, Baraat,
                reception and more), RSVP workflows, photo galleries, travel guidance, and a
                post-wedding memories wall for guests.
              </p>
            </section>

            <section>
              <h2 className="font-display text-3xl text-[color:var(--text)]">Who we built this for</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                We built ToNewBeginning.com for couples who want a wedding website that reflects
                their celebration honestly: one that supports five events and five hundred guests
                as comfortably as it supports two people eloping. The platform was designed with
                South Asian weddings as the primary use case, but it works equally well for any
                multi-day, multi-event celebration.
              </p>
            </section>

            <section>
              <h2 className="font-display text-3xl text-[color:var(--text)]">Where we are based</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                Our team is based in India. We are a small, independent product studio, not a
                venture-backed startup optimising for growth metrics. We care about the quality of
                the product and the experience of every couple who uses it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-3xl text-[color:var(--text)]">Get in touch</h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                Questions, feedback, or a couple needing concierge help setting up their site:
                reach us at{" "}
                <a
                  href="mailto:hello@tonewbeginning.com"
                  className="font-medium text-[color:var(--primary)] underline underline-offset-2"
                >
                  hello@tonewbeginning.com
                </a>
                . We respond within one business day.
              </p>
            </section>
          </div>

          <div className="mt-16 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center rounded-full bg-[color:var(--primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-[color:var(--accent)]"
            >
              Create your free wedding website
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:bg-white"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

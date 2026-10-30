import type { Metadata } from "next";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  LogOut,
  Palette,
  PlayCircle,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CeremonySequence } from "@/components/marketing/ceremony-sequence";
import { GuestStack } from "@/components/marketing/guest-stack";
import { HeroOverlay } from "@/components/marketing/hero-overlay";
import { HeroVideoLayer } from "@/components/marketing/hero-video-layer";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { OrnamentDivider } from "@/components/marketing/ornament-divider";
import { RiteRouter } from "@/components/marketing/rite-router";
import { ScrollProgressBar } from "@/components/public/motion-primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { buildOfferSchema } from "@/lib/pricing";
import { detectCurrency } from "@/lib/geo";
import { resolveWorkspaceResumePath, workspaceResumeCookieName } from "@/lib/constants";
import { templateRegistry } from "@/lib/template-registry";
import { getCurrentUser } from "@/server/auth/session";
import { getWorkspaceShellForUser } from "@/server/repositories/wedding-site";

export const metadata: Metadata = {
  title: "ToNewBeginning.com · Multi-Event Wedding Website Builder",
  description:
    "Create a beautiful wedding website for your whole celebration. ToNewBeginning.com supports multi-day events, Haldi to reception RSVPs, photo galleries, and a calm couple dashboard. Free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ToNewBeginning.com · Multi-Event Wedding Website Builder",
    description:
      "Build a cinematic, guest-first wedding website with multi-event timelines, RSVP management, photo galleries, and a polished couple dashboard.",
    url: "https://wed.tonewbeginning.com",
    siteName: "ToNewBeginning.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToNewBeginning.com · Multi-Event Wedding Website Builder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToNewBeginning.com · Multi-Event Wedding Website Builder",
    description:
      "Build a cinematic, guest-first wedding website with multi-event timelines, RSVP management, photo galleries, and a polished couple dashboard.",
    images: ["/og-image.png"],
  },
};

const BASE_URL = "https://wed.tonewbeginning.com";

// The editorial hero's media, or null while there is none.
//
// The band renders complete without it — bg-hero-mesh is the base layer and the
// poster and video only ever sit ON TOP of a finished hero. So this is a flag
// rather than a fallback: pointing it at files that are not in public/hero yet
// would ship a homepage firing 404s on every visit, which is worse than
// shipping the gradient. Flip it on in the same commit that adds the files.
//
// Two tiers of each, because a phone has no use for the 1920 master: see
// public/hero/README.md for how they are produced and what they must weigh.
type HeroMedia = {
  poster: string;
  posterNarrow: string;
  wide: { mp4: string; webm?: string };
  narrow: { mp4: string; webm?: string };
};

const heroMedia: HeroMedia | null = {
  poster: "/hero/hero-poster.jpg",
  posterNarrow: "/hero/hero-poster-sm.jpg",
  wide: { mp4: "/hero/hero-1080.mp4", webm: "/hero/hero-1080.webm" },
  narrow: { mp4: "/hero/hero-720.mp4", webm: "/hero/hero-720.webm" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToNewBeginning.com",
  alternateName: ["To New Beginning", "ToNewBeginning", "wed.tonewbeginning", "wed.tonewbeginning.com"],
  url: BASE_URL,
  description:
    "A multi-event wedding website builder for every celebration, including Indian, South Asian, fusion, and Western multi-day weddings: multi-event ceremonies, RSVP workflows, photo galleries, and a polished guest experience.",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ToNewBeginning.com",
  applicationCategory: "WebApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  description:
    "ToNewBeginning.com is a multi-event wedding website builder for every celebration, including Indian, South Asian, fusion, and Western multi-day weddings, with support for multi-day events, multi-event RSVPs, photo galleries, guest messages, and a couple dashboard.",
  // Derived from `plans` rather than hardcoded, so the price Google is told
  // always equals the price on the page, and availability reflects whether
  // anything can actually be bought.
  offers: buildOfferSchema(),
};

const homepageFaqs = [
  {
    q: "What is ToNewBeginning.com?",
    a: "ToNewBeginning.com is a multi-event wedding website builder for couples planning weddings with more than one celebration: Indian, South Asian, fusion, and Western multi-day weddings alike. It lets you create a personalised wedding website with support for multi-day events (Haldi, Sangeet, Baraat, reception and more), RSVP management, photo galleries, travel guidance for guests, and a polished couple dashboard, all in one place.",
  },
  {
    q: "Does it support weddings with multiple ceremonies?",
    a: "Yes. The platform is built specifically for multi-event celebrations. Each ceremony can have its own date, venue, dress code, timing, and independent RSVP settings. Guests can accept or decline individual events separately.",
  },
  {
    q: "Can guests RSVP to specific events individually?",
    a: "Absolutely. Guests submit one RSVP form and choose which events they will attend. The couple dashboard shows per-event headcounts and can export attendance data as a CSV for your caterer or venue coordinator.",
  },
  {
    q: "What happens to my wedding website after the wedding?",
    a: "On the free Hello plan your site remains as an editable draft indefinitely. On the Together plan it archives for 6 months after your wedding year ends. On the Forever plan your site and gallery stay live permanently, a lasting digital memory of your celebration.",
  },
  {
    q: "Does ToNewBeginning include AI features?",
    a: "Yes. On the Together and Forever plans, AI helps you draft your story, FAQs, and guest guidance from a few short answers. Forever additionally includes AI translations so guests can read your site in Tamil, Hindi, and more.",
  },
  {
    q: "Can family gift the Forever plan to the couple?",
    a: "Yes, and it is designed to feel like a real gift. A parent or sibling can purchase Forever and we send a card-style email to the couple, not a billing receipt.",
  },
  {
    q: "How does RSVP work for large wedding guest lists?",
    a: "RSVPs can be submitted by any guest without an account. Together and Forever plans allow unlimited responses. You can also create invite groups with access codes to restrict who can view private site content.",
  },
  {
    q: "Is the platform only for a specific kind of wedding?",
    a: "ToNewBeginning.com is built for multi-event weddings of every kind, including Indian, South Asian, fusion, and Western multi-day celebrations: multi-day timelines, large guest lists, multi-ceremony structure, and a design aesthetic that suits traditional and modern celebrations alike. It works equally well for destination weddings and elopements.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homepageFaqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const featureHighlights = [
  {
    title: "Every ceremony gets its stage",
    description:
      "Haldi at home, Sangeet in a ballroom, ceremony at dawn. Each event carries its own timing, venue map, dress code, and guest list. Nothing gets squeezed into a single \"wedding day\".",
    icon: HeartHandshake,
  },
  {
    title: "RSVPs that understand multi-event weddings",
    description:
      "Guests reply once and choose exactly the functions they'll attend. You see per-event headcounts, meal preferences, and travel notes in one calm dashboard. No spreadsheets, no chasing.",
    icon: LayoutDashboard,
  },
  {
    title: "Sixteen designs, zero rebuilds",
    description:
      "Sixteen designs, each built for a tradition rather than recoloured from one. Switch any time and your story, events, and photos flow into the new look instantly.",
    icon: Palette,
  },
];


// The rolling ceremony names under the hero. These eight also carry the pinned
// sequence much further down the page, and that repetition is deliberate rather
// than an oversight: here they are ambient, a rhythm that says "we know your
// wedding" before any claim is made; there they are the argument, each with its
// own timing, venue, dress code and RSVP. Several screens apart, one motif in
// two registers reads as authorship. Side by side it would read as a bug, which
// is why this lives in the hero and not next to the stage.
const ceremonyMarquee = [
  "Mehendi",
  "Haldi",
  "Sangeet",
  "Nikkah",
  "Muhurtham",
  "Ceremony",
  "Reception",
  "Walima",
];

function getResumeLabel(pathname: string) {
  const labels: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/templates": "Templates",
    "/dashboard/content": "Content",
    "/dashboard/events": "Events",
    "/dashboard/rsvps": "RSVPs",
    "/dashboard/uploads": "Moderation",
    "/dashboard/settings": "Settings",
    "/dashboard/preview": "Preview",
  };

  return labels[pathname] ?? "Dashboard";
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const workspace = user ? await getWorkspaceShellForUser(user.id) : null;
  // Same resolution the pricing page uses, so a visitor is offered the founding
  // -couple list in the currency they would actually pay in.
  const currency = await detectCurrency();
  const cookieStore = await cookies();
  const rawResumePath = cookieStore.get(workspaceResumeCookieName)?.value;
  const safeResumePath = resolveWorkspaceResumePath(rawResumePath);
  const resumeLabel = getResumeLabel(safeResumePath);
  const hasWorkspace = Boolean(workspace);
  const workspaceHref = (hasWorkspace ? safeResumePath : "/login") as Route;

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <ScrollProgressBar />
    {/* page-wash paints a fixed, warm field behind everything, tinted by the
        ceremony currently on the stage and drained to neutral at the commit
        boundary. See globals.css — it is deliberately the hero's WARMTH rather
        than the film's saturation, which would fight the sixteen template
        palettes further down. */}
    <main className="page-wash band-ink pb-24">
      {/* Site chrome. This used to live inside the hero panel, above a divider
          rule. The hero is now a full-bleed band, so the chrome sits in its own
          shell above it rather than being furniture inside the artwork. */}
      <section className="section-shell pt-6">
        <div className="glass-panel fade-border relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] px-5 py-4 rich-shadow sm:px-10 sm:py-5">
          <div className="absolute inset-0 bg-hero-mesh opacity-90" />
          <div className="relative flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="font-display text-2xl text-[color:var(--text)]">ToNewBeginning.com</p>
              {/* Hidden on phones. It was taking a quarter of the first screen
                  between the wordmark and a headline that says the same thing
                  better, so the hero began a thousand pixels down. */}
              <p className="mt-2 hidden text-sm text-[color:var(--muted)] sm:block">
                A premium wedding platform with a calm couple workspace and polished guest journey.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button asChild variant="ghost">
                <Link href="/pricing">Pricing</Link>
              </Button>
              {/* ghost when logged out, so "Create Couple Account" beside it
                  is the emphasised control. A signed-in couple is a different
                  case: resuming their workspace IS the primary action there,
                  so it keeps the outline. */}
              <Button asChild variant={hasWorkspace ? "outline" : "ghost"}>
                <Link href={workspaceHref}>
                  <LogIn className="h-4 w-4" />
                  {hasWorkspace ? "Resume workspace" : "Log in"}
                </Link>
              </Button>
              {hasWorkspace ? (
                <>
                  {/* An email address is wide and this pill does not truncate,
                      so on a phone it either wraps the row or runs off it. The
                      Log out control beside it is the part that has to be
                      reachable. */}
                  <div className="hidden rounded-full border border-[color:var(--border)] panel-soft px-4 py-2 text-sm text-[color:var(--muted)] sm:block">
                    Signed in as {user?.email}
                  </div>
                  <form action={logoutAction}>
                    <Button type="submit" variant="ghost">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </form>
                </>
              ) : (
                /* Hidden on phones: it wrapped the chrome onto a second row
                   to offer the same action as "Start yours free", which is a
                   few hundred pixels below it in the hero. */
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/register">Create Couple Account</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The editorial hero.
          The height subtracts the chrome panel above rather than being a flat
          fraction of the screen, so the band ends AT the fold and the marquee
          reads as the bottom rule instead of being sliced through.

          svh, not vh: vh is the LARGE viewport on mobile, so a vh band stays
          taller than the screen until the browser chrome retracts.

          And it only claims a full screen when there is media to fill it. A
          tall band is composed around a picture; with nothing but the gradient
          behind, the same band is just a column of text with an empty half
          beside it. Without media it takes its natural height. */}
      <section
        className={`relative isolate mt-6 flex items-end overflow-hidden ${
          heroMedia ? "min-h-[calc(100svh-10rem)] lg:min-h-[calc(100svh-11rem)]" : ""
        }`}
      >
        {/* Media stack. bg-hero-mesh is the BASE, always painted, so the band is
            finished before any image or video arrives — the drift wrapper only
            ever moves a layer that is already complete. */}
        <div className="hero-media-drift absolute inset-0 -z-10 will-change-transform">
          <div className="absolute inset-0 bg-hero-mesh" />
          {heroMedia ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- the LCP
                  element: a plain img with an explicit fetchPriority, not routed
                  through the optimizer, so nothing sits between the HTML and
                  the first paint. */}
              <img
                src={heroMedia.poster}
                srcSet={`${heroMedia.posterNarrow} 960w, ${heroMedia.poster} 1920w`}
                sizes="100vw"
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <HeroVideoLayer
                wide={heroMedia.wide}
                narrow={heroMedia.narrow}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </>
          ) : null}
        </div>

        {/* Scrim.
            The first attempt was a PALE scrim with the page's dark type on top,
            and it failed twice over: it washed the colour out of the footage
            AND still left near-black Cormorant sitting on mid-tone marigold and
            teal, which is unreadable at any size. Saturated media wants light
            type on a dark scrim — it is more legible and it lets the video keep
            its colour, which is the whole reason for having it.

            Two layers, because the text sits in different places at different
            widths: a vertical wash that covers the phone, where the column runs
            the full width, and a left-to-right wash that covers the desktop,
            where it occupies the left half. */}
        {heroMedia ? (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(20,14,36,0.92) 0%, rgba(20,14,36,0.72) 45%, rgba(20,14,36,0.42) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 hidden lg:block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(20,14,36,0.80) 0%, rgba(20,14,36,0.45) 55%, transparent 85%)",
              }}
            />
          </>
        ) : null}

        <div className="section-shell relative w-full pb-10 pt-12 sm:pt-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {/* The overture leads the content block rather than floating over
                  it. Nothing between it and .hero-overture may set overflow,
                  filter, opacity or will-change: each forces transform-style to
                  compute flat and collapses the depth that is the whole
                  effect. */}
              <HeroOverlay onMedia={Boolean(heroMedia)} />

              {/* Every colour below switches on whether there is media behind
                  it. On the bare gradient the page's own dark ink is correct;
                  over the footage it would be unreadable, and white would be
                  unreadable on the gradient. One condition, applied
                  consistently, rather than a second hero component. */}
              <div className="animate-fade-rise">
                <Badge className={heroMedia ? "bg-white/15 text-white/90 backdrop-blur-sm" : undefined}>
                  Craft Your Celebration
                </Badge>
              </div>
              {/* Lines one and two paint immediately: they are the LCP text, and
                  starting a heading at opacity 0 trades a measurable metric for
                  a flourish. The per-character reveal goes on the payoff line
                  only, which is the line that earns it. */}
              <h1
                className={`mt-5 max-w-3xl animate-fade-rise font-royal text-4xl leading-[1.08] sm:text-5xl lg:text-7xl ${
                  heroMedia ? "text-white [text-shadow:0_2px_24px_rgba(20,14,36,0.5)]" : "text-[color:var(--text)]"
                }`}
                style={{ animationDelay: "120ms" }}
              >
                Five ceremonies.
                <br />
                Two hundred guests.
                <br />
                {/* Plain text, not RevealText. That component split this line
                    into 17 per-character motion spans, and motion/react writes
                    `initial` into inline style on the SERVER render — so the
                    production HTML shipped every character at opacity:0 and the
                    line only appeared if JavaScript ran. It rides the h1's own
                    `animate-fade-rise` instead, which is CSS and ends at the
                    resting state. */}
                <span className={heroMedia ? "text-[color:var(--accent)]" : "text-[color:var(--primary)]"}>
                  One beautiful link.
                </span>
              </h1>
              <p
                className={`mt-4 max-w-2xl animate-fade-rise text-[15px] leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${
                  heroMedia ? "text-white/85 [text-shadow:0_1px_12px_rgba(20,14,36,0.55)]" : "text-[color:var(--muted)]"
                }`}
                style={{ animationDelay: "240ms" }}
              >
                Your family is planning five events across three venues, and every guest has the
                same ten questions. ToNewBeginning gives everyone one gorgeous answer: a website
                for your whole wedding with your story, schedules, dress codes, per-event RSVPs,
                photos, and wishes, all at one link you can drop in any WhatsApp group.
              </p>
              {hasWorkspace ? (
                <div
                  className="mt-6 animate-fade-rise rounded-[1.6rem] border border-[color:var(--border)] panel-solid p-4 backdrop-blur"
                  style={{ animationDelay: "320ms" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    Resume where you left off
                  </p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">Continue from {resumeLabel}</p>
                </div>
              ) : null}
              {/* The two treatments are swapped from how they shipped. The
                  filled button used to be "See a real wedding site" and the
                  signup was the outline beside it, so the strongest control on
                  the first screen sent visitors away from the funnel. The
                  components are unchanged; only which one carries the filled
                  class and the forward arrow. */}
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-rise" style={{ animationDelay: "360ms" }}>
                <Button
                  asChild
                  className={heroMedia ? "bg-white text-[#15101f] hover:bg-[color:var(--accent)] hover:text-[color:var(--primary-ink,#15101f)]" : undefined}
                >
                  <Link href={hasWorkspace ? workspaceHref : "/register"}>
                    {hasWorkspace ? (
                      <>
                        Resume {resumeLabel} <PlayCircle className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Start yours free <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className={heroMedia ? "border-white/40 bg-white/10 text-white backdrop-blur hover:border-white hover:bg-white/20" : undefined}
                >
                  <Link href="/kammonbeginnings">See a real wedding site</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* The band's bottom rule. It arrives on the entrance sequence's last
              beat rather than simply being there from the first frame. */}
          <div
            className={`animate-fade-rise relative mt-12 overflow-hidden border-t pt-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] ${
              heroMedia ? "border-white/20" : "border-white/60"
            }`}
            style={{ animationDelay: "480ms" }}
            aria-hidden="true"
          >
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center">
                  {ceremonyMarquee.map((ceremony) => (
                    <span
                      key={`${copy}-${ceremony}`}
                      className={`flex items-center whitespace-nowrap px-5 font-display text-xl sm:text-2xl ${
                        heroMedia ? "text-white/65" : "text-[color:var(--muted)]"
                      }`}
                    >
                      {ceremony}
                      <span className="ml-10 h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]/60" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      <CeremonySequence />

      {/* THE PAPER BAND.
          Everything from the guest deck to the sixteen designs runs on light
          paper; the ink canvas resumes below it. Two tone transitions across
          12,400px instead of one unbroken field, and the dark runs need no
          paint at all because they are the canvas.

          One wrapper, no edits to the sections inside it — they read their
          colours from tokens, so the band simply redefines what light means
          here. See .band-light in globals.css for why it may never be given
          overflow, transform, filter, will-change or contain. */}
      <div className="band-light">

      <GuestStack />

      <section className="section-shell mt-20">
        <div className="scroll-reveal">
          <SectionHeading
            eyebrow="Why couples pick us"
            title="Built around how multi-event weddings actually work."
            description="Most builders assume one event, one day, one guest list. Yours has never worked that way, so we didn't build it that way."
          />
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureHighlights.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="scroll-reveal" style={{ "--i": index } as React.CSSProperties}>
                <Card className="h-full space-y-4 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10">
                    <Icon className="h-6 w-6 text-[color:var(--primary)]" />
                  </div>
                  <h3 className="font-display text-3xl text-[color:var(--text)]">{feature.title}</h3>
                  <p className="text-sm leading-7 text-[color:var(--muted)]">{feature.description}</p>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* The commit boundary. Everything above this moves; from here the page
          deliberately stops, because choosing is hostile to motion. The router
          leads into the sixteen template pages, and the grid below it is the
          comparison view for a reader who already knows what they want. */}
      <RiteRouter />

      <section className="section-shell mt-20">
        <div className="scroll-reveal">
        <SectionHeading
          eyebrow="Sixteen designs, one wedding"
          title="Pick a feeling. Change your mind whenever."
          description="Romantic florals or cinematic drama: every template carries your full story, events, and photos, so switching looks takes one click, not one weekend."
        />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templateRegistry.map((template, index) => (
            <div key={template.key} className="scroll-reveal" style={{ "--i": index % 4 } as React.CSSProperties}>
              {/* These cards were rectangles that went nowhere. Sixteen
                  culturally specific designs — the product's clearest
                  differentiator — were a dead end for a reader AND invisible to
                  a crawler, because the only route that rendered them was
                  /dev/template-gallery, which 404s unless TEMPLATE_GALLERY=1.
                  Each one is now a link to a real indexable page. */}
              {/* Each card wears the palette it is selling. These are the same
                    themeDefaults the template itself renders from, so the card
                    is a faithful miniature rather than sixteen identical
                    rectangles — which is what this grid was: the largest flat
                    region on the page, selling variety with none. */}
                <Card
                  className="template-swatch group h-full overflow-clip p-0 sm:p-0 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow"
                  style={
                    {
                      "--surface": template.themeDefaults.surfaceColor,
                      "--text": template.themeDefaults.textColor,
                      "--swatch-muted": template.themeDefaults.mutedColor,
                      "--primary": template.themeDefaults.primaryColor,
                      "--accent": template.themeDefaults.accentColor,
                    } as React.CSSProperties
                  }
                >
                <Link href={`/templates/${template.key}` as Route} className="block">
                {/* The strip wipes up as the card arrives, like an invitation
                    coming out of its envelope. clip-path, not height — the
                    card's box never changes, so this cannot cause layout
                    shift. */}
                <div className="aspect-video w-full overflow-hidden">
                  {/* A real screenshot of the design, not a CSS gradient. The
                      sixteen designs are the product's clearest differentiator
                      and were being sold with sixteen colour swatches — the
                      least persuasive possible representation of them. The
                      gradient survives as the img's background, so it is still
                      what a reader sees while the file loads or if it 404s. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- a
                      static asset of known size, below the fold and lazy; the
                      optimizer would add a round trip for no gain. */}
                  <img
                    src={`/templates/${template.key}.webp`}
                    alt={`The ${template.name} design`}
                    loading="lazy"
                    decoding="async"
                    width={960}
                    height={540}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ background: template.previewGradient }}
                  />
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {template.mood}
                  </p>
                  <h3 className="font-display text-2xl text-[color:var(--text)]">{template.name}</h3>
                  <p className="text-sm leading-7 text-[color:var(--muted)]">{template.description}</p>
                </div>
                </Link>
              </Card>
            </div>
          ))}
        </div>
      </section>
      </div>

      <section className="section-shell mt-20">
        <Card className="scroll-reveal grid gap-8 bg-gradient-to-br from-[#1b1335] via-[#2f2152] to-[#6b4a2e] text-white lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            {/* Written for couples, not for investors. "Seeded", "RSVP data"
                and "investor-demo ready on day one" described the fixture to
                the people who built it; a couple reading this wants to know
                what they are about to click. */}
            <SectionHeading
              eyebrow="A finished wedding site"
              title="See how yours could look before you build it."
              description="Kamesh and Monisha's site is real and public: four days of ceremonies each with their own venue, timing and dress code, per-event RSVPs, a guest gallery and a wall of wishes. It is the same site you would publish."
              tone="light"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-stone-900 hover:bg-amber-100">
                <Link href="/kammonbeginnings">View the wedding site</Link>
              </Button>
              {/* One branching control, not two. For a signed-in couple this
                  is "Resume workspace" and must stay — it is what
                  safeResumePath exists to serve. Logged out, "Log in" was the
                  only other thing on offer beside a demo link, which asks a
                  stranger to sign in to an account they do not have. */}
              <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                <Link href={hasWorkspace ? workspaceHref : "/register"}>
                  {hasWorkspace ? "Resume workspace" : "Start yours free"}
                </Link>
              </Button>
            </div>
          </div>
          {/* Each tile used to be a single label floating in a tall empty
              box, which read as content that had failed to load. A sentence
              under each one both fills the box and says what the label means
              to a couple rather than to a product manager. */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Every ceremony, on its own",
                body: "Mehendi, Haldi, Sangeet and the rest, each with its own timing, venue and dress code.",
              },
              {
                label: "RSVPs per event",
                body: "Guests reply once and pick the functions they'll attend. Headcounts per ceremony, not one number.",
              },
              {
                label: "Sixteen designs",
                body: "Switch any time. Your story, events and photos follow the new look instantly.",
              },
              {
                label: "Photos and wishes",
                body: "Guests upload from their phones and leave messages. You approve what appears.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.6rem] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <OrnamentDivider kind="girih" />

      <section className="section-shell mt-20">
        <div className="scroll-reveal">
        <SectionHeading
          eyebrow="Common questions"
          title="Everything couples ask before choosing a wedding website builder."
          description="Answers to the questions we hear most from couples planning multi-event weddings, whether Indian, South Asian, fusion, or Western multi-day celebrations."
        />
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {homepageFaqs.map(({ q, a }) => (
            <details key={q} className="faq-item group rounded-[1.4rem] border border-[color:var(--border)] panel-solid p-5 transition open:bg-[color:var(--elevated)]">
              <summary className="cursor-pointer list-none font-semibold text-[color:var(--text)] [&::-webkit-details-marker]:hidden">
                <span className="mr-3 inline-block text-[color:var(--primary)] transition group-open:rotate-90">›</span>
                {q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-7 text-[color:var(--muted)]">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing waitlist band. Until this existed, the only way to join was
          inside a pricing card on /pricing — so anyone arriving on the bare
          domain from a link or a post had no way in and simply left. */}
      <OrnamentDivider kind="chapel" />

      <section className="section-shell mt-20">
        <Card className="scroll-reveal mx-auto max-w-3xl text-center">
          {/* The band used to lead with "Paid plans are opening soon." — so
              after ~12,000px the last thing a visitor read was that they could
              not buy yet, contradicting "Start yours free" in the hero, and the
              final 4,300px of the page carried no signup link at all. The free
              tier is the ask; the waitlist is for the paid plans only, and it
              now says so. */}
          <SectionHeading
            align="center"
            eyebrow="One link, every ceremony"
            title="Start your wedding site free."
            description="Build it, share the link, collect RSVPs. No card, and nothing expires while you are planning."
          />
          <div className="mt-8 flex justify-center">
            <Button asChild>
              <Link href={hasWorkspace ? workspaceHref : "/register"}>
                {hasWorkspace ? "Resume workspace" : "Start yours free"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Demoted beneath the signup, and no longer defaultOpen: collapsed,
              WaitlistForm renders an outline Button carrying ctaLabel, and its
              `autoFocus={!defaultOpen}` then applies to a visitor who opened
              the form themselves — which is what that guard was always for.
              Open by default it would have stolen focus on page load. */}
          <div className="mx-auto mt-8 max-w-md border-t border-[color:var(--border)] pt-6 text-center">
            <p className="mb-4 text-sm leading-7 text-[color:var(--muted)]">
              Paid plans open soon. We&rsquo;ll tell you the moment they do &mdash; one email, nothing else.
            </p>
            <WaitlistForm
              planKey="together"
              planName="Together"
              currency={currency}
              ctaLabel="Join the founding-couple list"
              source="home_waitlist"
            />
          </div>
        </Card>
      </section>
    </main>
    <MarketingFooter />
    </>
  );
}

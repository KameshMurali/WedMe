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
import { HeroShowcaseLazy } from "@/components/marketing/hero-showcase-lazy";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { resolveWorkspaceResumePath, workspaceResumeCookieName } from "@/lib/constants";
import { templateRegistry } from "@/lib/template-registry";
import { getCurrentUser } from "@/server/auth/session";
import { getWorkspaceShellForUser } from "@/server/repositories/wedding-site";

export const metadata: Metadata = {
  title: "ToNewBeginning.com · Wedding Website Builder for Indian Couples",
  description:
    "Create a beautiful wedding website for your Indian celebration. ToNewBeginning.com supports multi-day events, Haldi to reception RSVPs, photo galleries, and a calm couple dashboard. Free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ToNewBeginning.com · Wedding Website Builder for Indian Couples",
    description:
      "Build a cinematic, guest-first wedding website with multi-event timelines, RSVP management, photo galleries, and a polished couple dashboard. Designed for South Asian weddings.",
    url: "https://wed.tonewbeginning.com",
    siteName: "ToNewBeginning.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToNewBeginning.com · Wedding Website Builder for Indian Couples",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToNewBeginning.com · Wedding Website Builder for Indian Couples",
    description:
      "Build a cinematic, guest-first wedding website with multi-event timelines, RSVP management, photo galleries, and a polished couple dashboard. Designed for South Asian weddings.",
    images: ["/og-image.png"],
  },
};

const BASE_URL = "https://wed.tonewbeginning.com";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToNewBeginning.com",
  url: BASE_URL,
  description:
    "A wedding website builder for Indian and South Asian couples: multi-event ceremonies, RSVP workflows, photo galleries, and a polished guest experience.",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ToNewBeginning.com",
  applicationCategory: "WebApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  description:
    "ToNewBeginning.com is a wedding website builder designed for Indian and South Asian celebrations with support for multi-day events, multi-event RSVPs, photo galleries, guest messages, and a couple dashboard.",
  offers: [
    { "@type": "Offer", name: "Hello", price: "0", priceCurrency: "USD", description: "Free plan with up to 2 wedding events and 50 RSVPs." },
    { "@type": "Offer", name: "Together", price: "49", priceCurrency: "USD", description: "Wedding year plan: AI-assisted content drafting, unlimited events and RSVPs." },
    { "@type": "Offer", name: "Forever", price: "99", priceCurrency: "USD", description: "Lifetime plan: everything in Together plus permanent hosting and anniversary emails." },
  ],
};

const homepageFaqs = [
  {
    q: "What is ToNewBeginning.com?",
    a: "ToNewBeginning.com is a wedding website builder designed for Indian and South Asian couples. It lets you create a personalised wedding website with support for multi-day events (Haldi, Sangeet, Baraat, reception and more), RSVP management, photo galleries, travel guidance for guests, and a polished couple dashboard, all in one place.",
  },
  {
    q: "Does it support Indian weddings with multiple ceremonies?",
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
    q: "How does RSVP work for large Indian wedding guest lists?",
    a: "RSVPs can be submitted by any guest without an account. Together and Forever plans allow unlimited responses. You can also create invite groups with access codes to restrict who can view private site content.",
  },
  {
    q: "Is the platform built specifically for Indian weddings?",
    a: "ToNewBeginning.com is designed with South Asian and Indian weddings as the primary use case: multi-day timelines, large guest lists, multi-ceremony structure, and a design aesthetic that suits traditional and modern celebrations alike. It works equally well for destination weddings and elopements.",
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
    title: "RSVPs that understand Indian weddings",
    description:
      "Guests reply once and choose exactly the functions they'll attend. You see per-event headcounts, meal preferences, and travel notes in one calm dashboard. No spreadsheets, no chasing.",
    icon: LayoutDashboard,
  },
  {
    title: "Five designs, zero rebuilds",
    description:
      "Switch templates any time, and your story, events, and photos flow into the new look instantly. Customise the palette until it feels like you, then publish when it's ready.",
    icon: Palette,
  },
];

// Slow marquee under the hero — grounds the brand in the ceremonies it serves.
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
    <main className="pb-24">
      <section className="section-shell pt-6">
        <div className="glass-panel fade-border relative overflow-hidden rounded-[2rem] border border-white/70 px-6 py-6 rich-shadow sm:px-10 lg:px-14 lg:py-10">
          <div className="absolute inset-0 bg-hero-mesh opacity-90" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/60 pb-6">
            <div>
              <p className="font-display text-2xl text-[#1f1117]">ToNewBeginning.com</p>
              <p className="mt-2 text-sm text-stone-700">
                A premium wedding platform with a calm couple workspace and polished guest journey.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={workspaceHref}>
                  <LogIn className="h-4 w-4" />
                  {hasWorkspace ? "Resume workspace" : "Log in"}
                </Link>
              </Button>
              {hasWorkspace ? (
                <>
                  <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-stone-700">
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
                <Button asChild variant="ghost">
                  <Link href="/register">Create Couple Account</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="animate-fade-up">
                <Badge>Craft Your Celebration</Badge>
              </div>
              <h1
                className="mt-5 max-w-3xl animate-fade-up font-display text-4xl leading-[1.04] text-[#1f1117] sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                Five ceremonies.
                <br />
                Two hundred guests.
                <br />
                <span className="text-[color:var(--primary)]">One beautiful link.</span>
              </h1>
              <p
                className="mt-6 max-w-2xl animate-fade-up text-base leading-8 text-stone-800 sm:text-lg"
                style={{ animationDelay: "240ms" }}
              >
                Your family is planning five events across three venues, and every guest has the
                same ten questions. ToNewBeginning gives everyone one gorgeous answer: an Indian
                wedding website with your story, schedules, dress codes, per-event RSVPs, photos,
                and wishes, all at one link you can drop in any WhatsApp group.
              </p>
              {hasWorkspace ? (
                <div
                  className="mt-6 animate-fade-up rounded-[1.6rem] border border-white/70 bg-white/75 p-4 backdrop-blur"
                  style={{ animationDelay: "320ms" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    Resume where you left off
                  </p>
                  <p className="mt-2 text-base font-semibold text-[#1f1117]">Continue from {resumeLabel}</p>
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "360ms" }}>
                <Button asChild>
                  <Link href="/kammonbeginnings">
                    See a real wedding site <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={hasWorkspace ? workspaceHref : "/register"}>
                    {hasWorkspace ? (
                      <>
                        Resume {resumeLabel} <PlayCircle className="h-4 w-4" />
                      </>
                    ) : (
                      "Start yours free"
                    )}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex w-full justify-center lg:w-auto lg:justify-end">
              <HeroShowcaseLazy />
            </div>
          </div>

          {/* Ceremony marquee — quiet motion that says "we know your wedding". */}
          <div
            className="relative mt-10 overflow-hidden border-t border-white/60 pt-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
            aria-hidden="true"
          >
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center">
                  {ceremonyMarquee.map((ceremony) => (
                    <span
                      key={`${copy}-${ceremony}`}
                      className="flex items-center whitespace-nowrap px-5 font-display text-xl text-stone-500 sm:text-2xl"
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

      <section className="section-shell mt-20">
        <Reveal>
          <SectionHeading
            eyebrow="Why couples pick us"
            title="Built around how Indian weddings actually work."
            description="Most builders assume one event, one day, one guest list. Yours has never worked that way, so we didn't build it that way."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureHighlights.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.12}>
                <Card className="h-full space-y-4 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10">
                    <Icon className="h-6 w-6 text-[color:var(--primary)]" />
                  </div>
                  <h3 className="font-display text-3xl text-[color:var(--text)]">{feature.title}</h3>
                  <p className="text-sm leading-7 text-[color:var(--muted)]">{feature.description}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Five moods, one wedding"
          title="Pick a feeling. Change your mind whenever."
          description="Romantic florals or cinematic drama: every template carries your full story, events, and photos, so switching looks takes one click, not one weekend."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          {templateRegistry.map((template, index) => (
            <Reveal key={template.key} delay={index * 0.08}>
              <Card className="group h-full overflow-hidden p-0 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                <div className="h-40 w-full overflow-hidden">
                  <div
                    className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
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
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-shell mt-20">
        <Card className="grid gap-8 bg-gradient-to-br from-[#26171c] via-[#3d2730] to-[#7b5842] text-white lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="Demo Site : KamMonBeginnings"
              title="A seeded wedding experience is included for Kamesh & Monisha."
              description="Sample events, story milestones, dress code boards, FAQs, RSVP data, guest messages, uploads, and themed imagery are all seeded so the platform feels investor-demo ready on day one."
              tone="light"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-stone-900 hover:bg-amber-100">
                <Link href="/kammonbeginnings">View the wedding site</Link>
              </Button>
              <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                <Link href={workspaceHref}>{hasWorkspace ? "Resume workspace" : "Log in"}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Secure registration and login",
              "Theme and template selection",
              "RSVP analytics and CSV export",
              "Guest uploads moderation",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.6rem] border border-white/10 bg-white/10 px-5 py-5 text-sm font-medium backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Common questions"
          title="Everything couples ask before choosing a wedding website builder."
          description="Answers to the questions we hear most from couples planning Indian and South Asian weddings."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {homepageFaqs.map(({ q, a }) => (
            <details key={q} className="group rounded-[1.4rem] border border-black/8 bg-white/70 p-5 transition open:bg-white">
              <summary className="cursor-pointer list-none font-semibold text-[color:var(--text)] [&::-webkit-details-marker]:hidden">
                <span className="mr-3 inline-block text-[color:var(--primary)] transition group-open:rotate-90">›</span>
                {q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-7 text-[color:var(--muted)]">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
    <MarketingFooter />
    </>
  );
}

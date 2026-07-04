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
import { SectionHeading } from "@/components/ui/section-heading";
import { resolveWorkspaceResumePath, workspaceResumeCookieName } from "@/lib/constants";
import { templateRegistry } from "@/lib/template-registry";
import { getCurrentUser } from "@/server/auth/session";
import { getWorkspaceShellForUser } from "@/server/repositories/wedding-site";

export const metadata: Metadata = {
  title: "ToNewBeginning.com — Wedding Website Builder for Indian Couples",
  description:
    "Create a beautiful wedding website for your Indian celebration. ToNewBeginning.com supports multi-day events, Haldi to reception RSVPs, photo galleries, and a calm couple dashboard — free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ToNewBeginning.com — Wedding Website Builder for Indian Couples",
    description:
      "Build a cinematic, guest-first wedding website with multi-event timelines, RSVP management, photo galleries, and a polished couple dashboard. Designed for South Asian weddings.",
    url: "https://wed.tonewbeginning.com",
    siteName: "ToNewBeginning.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToNewBeginning.com — Wedding Website Builder for Indian Couples",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToNewBeginning.com — Wedding Website Builder for Indian Couples",
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
    "A wedding website builder for Indian and South Asian couples — multi-event ceremonies, RSVP workflows, photo galleries, and a polished guest experience.",
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
    { "@type": "Offer", name: "Hello", price: "0", priceCurrency: "USD", description: "Free plan — up to 2 wedding events and 50 RSVPs." },
    { "@type": "Offer", name: "Together", price: "49", priceCurrency: "USD", description: "Wedding year plan — unlimited events, RSVPs, custom domain." },
    { "@type": "Offer", name: "Forever", price: "99", priceCurrency: "USD", description: "Lifetime plan — everything in Together plus permanent hosting and anniversary emails." },
  ],
};

const homepageFaqs = [
  {
    q: "What is ToNewBeginning.com?",
    a: "ToNewBeginning.com is a wedding website builder designed for Indian and South Asian couples. It lets you create a personalised wedding website with support for multi-day events (Haldi, Sangeet, Baraat, reception and more), RSVP management, photo galleries, travel guidance for guests, and a polished couple dashboard — all in one place.",
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
    a: "On the free Hello plan your site remains as an editable draft indefinitely. On the Together plan it archives for 6 months after your wedding year ends. On the Forever plan your site and gallery stay live permanently — a lasting digital memory of your celebration.",
  },
  {
    q: "Is there a custom domain option?",
    a: "Yes — on the Together and Forever plans you can connect your own domain (e.g. kammonbeginnings.com) so guests see a personal URL rather than the ToNewBeginning subdomain.",
  },
  {
    q: "Can family gift the Forever plan to the couple?",
    a: "Yes, and it is designed to feel like a real gift. A parent or sibling can purchase Forever and we send a card-style email to the couple — not a billing receipt.",
  },
  {
    q: "How does RSVP work for large Indian wedding guest lists?",
    a: "RSVPs can be submitted by any guest without an account. Together and Forever plans allow unlimited responses. You can also create invite groups with access codes to restrict who can view private site content.",
  },
  {
    q: "Is the platform built specifically for Indian weddings?",
    a: "ToNewBeginning.com is designed with South Asian and Indian weddings as the primary use case — multi-day timelines, large guest lists, multi-ceremony structure, and a design aesthetic that suits traditional and modern celebrations alike. It works equally well for destination weddings and elopements.",
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
    title: "Elegant public wedding websites",
    description:
      "Deliver a cinematic, mobile-first guest experience with story timelines, event guidance, schedules, galleries, RSVPs, videos, and post-event memories.",
    icon: HeartHandshake,
  },
  {
    title: "Couple dashboard and builder",
    description:
      "Give couples a polished admin area with secure login, content editing, template switching, theme tuning, analytics, moderation, and publishing controls.",
    icon: LayoutDashboard,
  },
  {
    title: "Reusable SaaS architecture",
    description:
      "Scale from one wedding to many with Prisma data models, publish snapshots, storage abstraction, validation, and a theme-driven template system.",
    icon: Palette,
  },
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
              <Badge>Craft Your Celebration</Badge>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.04] text-[#1f1117] sm:text-5xl lg:text-6xl">
                The wedding website builder for Indian celebrations — story, events, RSVPs, and memories in one place.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-800 sm:text-lg">
                ToNewBeginning.com is a wedding website platform built for South Asian and Indian
                couples. Create a beautiful site that covers every ceremony — from Haldi and Sangeet
                to the reception — with per-event RSVPs, a photo gallery, guest messaging, and a
                calm couple dashboard.
              </p>
              <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/75 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                  Resume where you left off
                </p>
                <p className="mt-2 text-base font-semibold text-[#1f1117]">
                  {hasWorkspace ? `Continue from ${resumeLabel}` : "Home screen login now resumes your last workspace area."}
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-700">
                  Returning couples can log in from the home screen and jump back into templates,
                  content, settings, preview, or whichever dashboard area they used last.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/kammonbeginnings">
                    Open Demo Site <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={workspaceHref}>
                    {hasWorkspace ? (
                      <>
                        Resume {resumeLabel} <PlayCircle className="h-4 w-4" />
                      </>
                    ) : (
                      "Log in to resume"
                    )}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex w-full justify-center lg:w-auto lg:justify-end">
              <HeroShowcaseLazy />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Product Vision"
          title="A more flexible, modern, and advanced alternative to the wedding website status quo."
          description="The product is structured as a true wedding website SaaS: public storytelling, secure admin workflows, and reusable templates all sitting on one shared platform architecture."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10">
                  <Icon className="h-6 w-6 text-[color:var(--primary)]" />
                </div>
                <h3 className="font-display text-3xl text-[color:var(--text)]">{feature.title}</h3>
                <p className="text-sm leading-7 text-[color:var(--muted)]">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Template System"
          title="Five premium starting points, one shared content model."
          description="Each template supports the same sections, data model, and dashboard tooling. Couples can switch themes without rebuilding their site."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          {templateRegistry.map((template) => (
            <Card key={template.key} className="overflow-hidden p-0">
              <div className="h-40 w-full" style={{ background: template.previewGradient }} />
              <div className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {template.mood}
                </p>
                <h3 className="font-display text-2xl text-[color:var(--text)]">{template.name}</h3>
                <p className="text-sm leading-7 text-[color:var(--muted)]">{template.description}</p>
              </div>
            </Card>
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

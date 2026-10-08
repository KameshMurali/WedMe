import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventsSection, HeroSection, ScheduleSection, StorySection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { demoSiteSnapshot } from "@/server/services/demo-site";
import { findTemplateByKey, templateRegistry } from "@/lib/template-registry";
import { siteUrl } from "@/lib/constants";
import type { SiteSnapshot } from "@/types";

// One real, indexable page per design.
//
// The rendering is the same trick /dev/template-gallery already used — the demo
// snapshot re-themed under any template, static, no database. What is added
// here is the half that makes it a PAGE rather than a harness: copy that is
// unique to each design.
//
// That distinction is the whole SEO argument. Sixteen URLs showing the same
// demo wedding with different colours are sixteen near-duplicates, and a search
// engine is right to collapse them. The band above the preview carries the
// template's own name, tradition, palette and ornament vocabulary, so each page
// says something no other page says.
//
// The preview below it is the live site, not a screenshot: nothing to
// regenerate when a design changes, and nothing to go stale.

export const dynamic = "force-static";

// Without this, a key that is not in the registry renders the not-found UI but
// answers HTTP 200 — a soft 404. Search engines treat those as thin duplicate
// pages rather than as "gone", which is exactly the wrong signal on a route
// whose whole purpose is to be indexed. false makes anything outside
// generateStaticParams a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return templateRegistry.map((template) => ({ templateKey: template.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateKey: string }>;
}): Promise<Metadata> {
  const { templateKey } = await params;
  const template = templateRegistry.find((entry) => entry.key === templateKey);
  if (!template) return {};

  const title = `${template.name} · ${template.mood} Wedding Website Template`;
  return {
    title,
    description: `${template.description} A ${template.mood.toLowerCase()} wedding website design with multi-event timelines, per-event RSVPs, a photo gallery and guest messages. Free to start.`,
    alternates: { canonical: `/templates/${template.key}` },
    openGraph: {
      title,
      description: template.description,
      url: `${siteUrl}/templates/${template.key}`,
      type: "website",
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateKey: string }>;
}) {
  const { templateKey } = await params;
  const template = templateRegistry.find((entry) => entry.key === templateKey);
  if (!template) notFound();

  // findTemplateByKey falls back to classic-elegant on an unknown key, which
  // would quietly render the wrong design. The lookup above has already ruled
  // that out, so this only resolves the defaults.
  const defaults = findTemplateByKey(template.key).themeDefaults;

  const snapshot = {
    ...demoSiteSnapshot,
    // The hero photo belongs to the couple, not the design, and a freshly
    // applied template has none. Stripping it shows the DESIGN rather than the
    // demo couple's photographs, and exercises the composed fallback that a
    // real couple sees on day one.
    site: { ...demoSiteSnapshot.site, heroImageUrl: null, heroVideoUrl: null },
    theme: { ...demoSiteSnapshot.theme, ...defaults, templateKey: template.key },
  } as unknown as SiteSnapshot;

  const palette: Array<[string, string]> = [
    ["Primary", defaults.primaryColor],
    ["Accent", defaults.accentColor],
    ["Background", defaults.backgroundColor],
    ["Surface", defaults.surfaceColor],
    ["Text", defaults.textColor],
  ];

  return (
    <>
      <main>
        {/* The indexable half. Real text, unique per design, above the fold. */}
        <section className="section-shell pt-8">
          <Link
            href={"/templates" as Route}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)] hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            All sixteen designs
          </Link>

          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <Badge>{template.mood}</Badge>
              <h1 className="mt-5 font-display text-4xl leading-tight text-[color:var(--text)] sm:text-5xl">
                {template.name}
              </h1>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                {template.description}
              </p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                {template.tier === "premium"
                  ? "Available on the Together and Forever plans."
                  : "Available on every plan, including the free Hello plan."}{" "}
                Your story, events, schedule, photos and guest messages are kept separately from the
                design, so switching to another of the sixteen takes one click and nothing is lost.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={"/register" as Route}>
                    Start with this design <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={"/pricing" as Route}>See plans</Link>
                </Button>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Palette
              </p>
              <dl className="mt-4 space-y-3">
                {palette.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-8 w-8 flex-none rounded-full ring-1 ring-black/10"
                      style={{ background: value }}
                    />
                    <dt className="text-sm text-[color:var(--muted)]">{label}</dt>
                    <dd className="ml-auto font-mono text-xs text-[color:var(--muted)]">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                Every colour here is a starting point, not a constraint. The customizer lets you
                change any of them and keeps your choices when you switch designs.
              </p>
            </div>
          </div>
        </section>

        {/* The persuasive half: the design itself, running. Not a screenshot —
            a screenshot goes stale the moment the design changes, and a crawler
            reads a picture of a website as a blank rectangle. */}
        <section className="mt-12">
          <p className="section-shell pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            A live preview, with sample content
          </p>
          <SiteShell snapshot={snapshot} activeHref={`/templates/${template.key}`}>
            <main>
              <HeroSection snapshot={snapshot} />
              <StorySection
                milestones={snapshot.storyMilestones.slice(0, 3)}
                slug={snapshot.site.slug}
                condensed
              />
              <EventsSection events={snapshot.events.slice(0, 3)} slug={snapshot.site.slug} condensed />
              <ScheduleSection items={snapshot.scheduleItems} />
            </main>
          </SiteShell>
        </section>
      </main>
    </>
  );
}

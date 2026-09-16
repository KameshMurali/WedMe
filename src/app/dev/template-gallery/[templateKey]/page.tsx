import { notFound } from "next/navigation";

import { HeroSection, StorySection, EventsSection, ScheduleSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { demoSiteSnapshot } from "@/server/services/demo-site";
import { findTemplateByKey, templateRegistry } from "@/lib/template-registry";
import type { SiteSnapshot } from "@/types";

// Renders the demo snapshot under any template, so every design can be looked
// at side by side without a database and without clicking through the
// customizer sixteen times.
//
// Opt-in only, via TEMPLATE_GALLERY=1. The gallery is a verification and
// screenshot harness — it is what the CI thumbnail job will drive — and it has
// no business answering on a real deployment, so it 404s unless the flag is set.
//
// Gated on an explicit flag rather than NODE_ENV because the thumbnails have to
// be captured from a PRODUCTION build: React's development build needs eval(),
// which a hardened CSP blocks, and the resulting hydration failure freezes every
// scroll-triggered animation on the page mid-entrance.
export const dynamic = "force-static";

export function generateStaticParams() {
  return templateRegistry.map((template) => ({ templateKey: template.key }));
}

export default async function TemplateGalleryPage({
  params,
}: {
  params: Promise<{ templateKey: string }>;
}) {
  if (process.env.TEMPLATE_GALLERY !== "1") notFound();

  const { templateKey } = await params;
  const template = templateRegistry.find((entry) => entry.key === templateKey);
  if (!template) notFound();

  // findTemplateByKey falls back to classic-elegant on an unknown key, which
  // would quietly render the wrong design; the lookup above has already ruled
  // that out, so this only resolves the defaults.
  const defaults = findTemplateByKey(template.key).themeDefaults;

  const snapshot = {
    ...demoSiteSnapshot,
    // The hero photo belongs to the couple, not to the template, and a freshly
    // applied design has none — which is the state the destination heroes have
    // to survive, since they lay white copy over what is meant to be a photo.
    // Stripping it here means the gallery shows the design rather than the demo
    // couple's pictures, and exercises the composed fallback.
    site: { ...demoSiteSnapshot.site, heroImageUrl: null, heroVideoUrl: null },
    theme: { ...demoSiteSnapshot.theme, ...defaults, templateKey: template.key },
  } as unknown as SiteSnapshot;

  return (
    <SiteShell snapshot={snapshot} activeHref={`/dev/template-gallery/${template.key}`}>
      <main>
        <HeroSection snapshot={snapshot} />
        <StorySection milestones={snapshot.storyMilestones.slice(0, 3)} slug={snapshot.site.slug} condensed />
        <EventsSection events={snapshot.events.slice(0, 3)} slug={snapshot.site.slug} condensed />
        <ScheduleSection items={snapshot.scheduleItems} />
      </main>
    </SiteShell>
  );
}

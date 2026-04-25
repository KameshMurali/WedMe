import { notFound } from "next/navigation";

import { DressCodeSection, ExperienceSection, TidbitsSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/experience`}>
      <ExperienceSection items={snapshot.travelGuideItems} faqItems={snapshot.faqItems} />
      <TidbitsSection items={snapshot.tidbits} />
      <DressCodeSection guides={snapshot.dressCodeGuides} />
    </SiteShell>
  );
}

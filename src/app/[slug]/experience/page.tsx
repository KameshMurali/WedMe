import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DressCodeSection, ExperienceSection, TidbitsSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `Guest Experience | ${snapshot.site.coupleNames}'s Wedding`,
    description: `Travel tips, accommodation recommendations, dress code guidance, and FAQs for guests attending ${snapshot.site.coupleNames}'s wedding celebration.`,
    alternates: { canonical: `/${slug}/experience` },
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  const base = `https://wed.tonewbeginning.com`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: snapshot.site.coupleNames, item: `${base}/${slug}` },
      { "@type": "ListItem", position: 3, name: "Guest Experience", item: `${base}/${slug}/experience` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/experience`}>
        <ExperienceSection items={snapshot.travelGuideItems} faqItems={snapshot.faqItems} />
        <TidbitsSection items={snapshot.tidbits} />
        <DressCodeSection guides={snapshot.dressCodeGuides} />
      </SiteShell>
    </>
  );
}

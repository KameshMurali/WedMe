import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ScheduleSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.site.coupleNames}'s Wedding Schedule | ToNewBeginning`,
    description: `Day-by-day schedule and itinerary for ${snapshot.site.coupleNames}'s wedding celebration: timings, venues, and everything guests need to plan their day.`,
    alternates: { canonical: `/${slug}/schedule` },
  };
}

export default async function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
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
      { "@type": "ListItem", position: 3, name: "Schedule", item: `${base}/${slug}/schedule` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/schedule`}>
        <ScheduleSection items={snapshot.scheduleItems} />
      </SiteShell>
    </>
  );
}

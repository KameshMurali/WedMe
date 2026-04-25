import { notFound } from "next/navigation";

import { EventsSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/events`}>
      <EventsSection events={snapshot.events} slug={slug} />
    </SiteShell>
  );
}

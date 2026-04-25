import { notFound } from "next/navigation";

import { StorySection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/story`}>
      <StorySection milestones={snapshot.storyMilestones} />
    </SiteShell>
  );
}

import { notFound } from "next/navigation";

import { ComingSoonPage } from "@/components/public/coming-soon";
import {
  DressCodeSection,
  EventsSection,
  ExperienceSection,
  GallerySection,
  HeroSection,
  ScheduleSection,
  StorySection,
  TidbitsSection,
  VideoSection,
} from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublicSiteStatus, getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);

  if (!snapshot) {
    // Snapshot is null either because the slug doesn't exist OR because the
    // site exists but is still a draft (and the visitor isn't the owner).
    // Differentiate so we can show a friendly "coming soon" page instead of a
    // dead-end 404 for new accounts whose welcome email URL hasn't been
    // published yet.
    const status = await getPublicSiteStatus(slug);
    if (status.exists && !status.isPublished) {
      return (
        <ComingSoonPage
          brandName={status.brandName}
          coupleNames={status.coupleNames}
          weddingDate={status.weddingDate}
        />
      );
    }
    notFound();
  }

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}`}>
      <main>
        <HeroSection snapshot={snapshot} />
        <StorySection milestones={snapshot.storyMilestones} condensed />
        <EventsSection events={snapshot.events} slug={slug} condensed />
        <ScheduleSection items={snapshot.scheduleItems} />
        <TidbitsSection items={snapshot.tidbits} />
        <DressCodeSection guides={snapshot.dressCodeGuides} />
        <ExperienceSection items={snapshot.travelGuideItems} faqItems={snapshot.faqItems} />
        <GallerySection assets={snapshot.mediaAssets} condensed />
        <VideoSection videos={snapshot.embeddedVideos} />
      </main>
    </SiteShell>
  );
}

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
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);

  if (!snapshot) {
    return null;
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

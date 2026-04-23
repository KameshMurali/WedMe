import { GallerySection, VideoSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return null;

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/gallery`}>
      <GallerySection assets={snapshot.mediaAssets} />
      <VideoSection videos={snapshot.embeddedVideos} />
    </SiteShell>
  );
}

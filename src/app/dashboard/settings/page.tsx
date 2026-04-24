import { PublishSettingsForm } from "@/components/admin/publish-settings-form";
import { SiteBasicsForm } from "@/components/admin/site-basics-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/server/auth/session";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";

export default async function DashboardSettingsPage() {
  const user = await requireUser();
  const site = await getWeddingSiteForUser(user.id);
  if (!site || !site.publishSettings) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Settings</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Site settings and publish</h1>
      </div>
      <Card>
        <SiteBasicsForm
          defaultValues={{
            brandName: site.brandName,
            headline: site.headline,
            subtitle: site.subtitle ?? "",
            tagline: site.tagline ?? "",
            weddingDate: site.weddingDate.toISOString().slice(0, 10),
            locationSummary: site.locationSummary ?? "",
            heroImageUrl: site.heroImageUrl ?? "",
            heroVideoUrl: site.heroVideoUrl ?? "",
            seoTitle: site.seoTitle ?? "",
            seoDescription: site.seoDescription ?? "",
            ogImageUrl: site.ogImageUrl ?? "",
            canonicalUrl: site.canonicalUrl ?? "",
            slug: site.slug,
          }}
        />
      </Card>
      <Card>
        <PublishSettingsForm
          defaultValues={{
            visibility: site.publishSettings.visibility,
            status: site.publishSettings.status,
            noIndex: site.publishSettings.noIndex,
            isRsvpOpen: site.publishSettings.isRsvpOpen,
            isUploadsOpen: site.publishSettings.isUploadsOpen,
            isMessagesOpen: site.publishSettings.isMessagesOpen,
          }}
        />
      </Card>
    </div>
  );
}

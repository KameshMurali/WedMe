import Image from "next/image";
import { notFound } from "next/navigation";

import { GuestUploadForm } from "@/components/forms/guest-upload-form";
import { SiteShell } from "@/components/public/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getApprovedGuestUploadsBySlug } from "@/server/repositories/guest-engagement";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";
import { directBlobUploadsEnabled } from "@/server/storage/upload-config";

export default async function MemoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [snapshot, uploads] = await Promise.all([
    getPublishedSiteSnapshot(slug),
    getApprovedGuestUploadsBySlug(slug),
  ]);

  if (!snapshot) notFound();

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/memories`}>
      <section className="section-shell mt-16">
        <SectionHeading
          eyebrow="Guest Memories"
          title="Share photos, clips, and little moments from the celebration."
          description="Uploads are mobile-friendly, validated, and moderated before they appear on the public memories wall."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <GuestUploadForm
              slug={slug}
              isOpen={snapshot.publish.isUploadsOpen}
              events={snapshot.events.map((event) => ({ id: event.id, title: event.title }))}
              useSignedUploads={directBlobUploadsEnabled}
            />
          </Card>
          <div className="space-y-4">
            {uploads.length ? (
              uploads.map((upload) => (
                <Card key={upload.id} className="overflow-hidden p-0">
                  {upload.url ? (
                    upload.type === "IMAGE" ? (
                      <Image
                        src={upload.url}
                        alt={upload.caption ?? upload.submitterName}
                        width={1200}
                        height={900}
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <video src={upload.url} controls className="h-64 w-full object-cover" />
                    )
                  ) : upload.externalUrl ? (
                    <div className="flex h-64 items-center justify-center bg-black/5 p-8 text-center text-sm text-[color:var(--muted)]">
                      <a href={upload.externalUrl} target="_blank" rel="noreferrer" className="underline">
                        Watch shared video link
                      </a>
                    </div>
                  ) : null}
                  <div className="space-y-3 p-6">
                    {upload.event ? <Badge>{upload.event.title}</Badge> : null}
                    <h3 className="font-display text-3xl text-[color:var(--text)]">
                      {upload.caption ?? "Shared memory"}
                    </h3>
                    <p className="text-sm text-[color:var(--muted)]">By {upload.submitterName}</p>
                    {upload.message ? (
                      <p className="text-sm leading-7 text-[color:var(--muted)]">{upload.message}</p>
                    ) : null}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No public memories yet"
                description="Once approved by the couple, guest uploads will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

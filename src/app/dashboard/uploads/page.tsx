import { ExternalLink, FileQuestion } from "lucide-react";

import { DashboardUnavailableState } from "@/components/admin/dashboard-unavailable-state";
import { MessageModerationButtons, UploadModerationButtons } from "@/components/admin/moderation-buttons";
import { Card } from "@/components/ui/card";
import { bytesToSize } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { getUploadManagerSiteForUser } from "@/server/repositories/wedding-site";

export default async function DashboardUploadsPage() {
  const user = await requireUser();
  const site = await getUploadManagerSiteForUser(user.id);
  if (!site) {
    return (
      <DashboardUnavailableState
        section="Moderation"
        title="We couldn't load uploads and wishes yet."
        description="Moderation data is still reconnecting. Your session is active, so you can move to another section and return once the workspace finishes loading."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Moderation</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Uploads and wishes</h1>
      </div>
      <div className="space-y-4">
        <h2 className="font-display text-4xl text-[color:var(--text)]">Guest uploads</h2>
        {site.guestUploads.length === 0 ? (
          <Card>
            <p className="text-sm text-[color:var(--muted)]">No guest uploads yet.</p>
          </Card>
        ) : null}
        {site.guestUploads.map((upload) => {
          const submittedLabel = upload.createdAt
            ? new Date(upload.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : null;
          const sizeLabel = upload.sizeBytes ? bytesToSize(upload.sizeBytes) : null;

          return (
            <Card key={upload.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                {/* Media preview — couples can't moderate what they can't see.
                    Render an image, video, external-link card, or empty placeholder
                    depending on what was submitted. */}
                <div className="w-full lg:w-80 lg:flex-none">
                  <UploadPreview
                    type={upload.type}
                    url={upload.url}
                    externalUrl={upload.externalUrl}
                    altText={upload.caption ?? upload.submitterName}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="font-display text-3xl text-[color:var(--text)]">
                        {upload.caption ?? upload.submitterName}
                      </h3>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">
                        From <span className="font-semibold text-[color:var(--text)]">{upload.submitterName}</span>
                        {" · "}
                        {upload.type} · {upload.status} · {upload.event?.title ?? "General"}
                        {submittedLabel ? <> · {submittedLabel}</> : null}
                        {sizeLabel ? <> · {sizeLabel}</> : null}
                      </p>
                      {upload.message ? (
                        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{upload.message}</p>
                      ) : null}
                      {upload.url ? (
                        <p className="mt-3 text-xs">
                          <a
                            href={upload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open original file
                          </a>
                        </p>
                      ) : null}
                    </div>
                    {upload.status === "PENDING" ? <UploadModerationButtons uploadId={upload.id} /> : null}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="space-y-4">
        <h2 className="font-display text-4xl text-[color:var(--text)]">Guest messages</h2>
        {site.guestMessages.map((message) => (
          <Card key={message.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="font-display text-3xl text-[color:var(--text)]">{message.authorName}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {message.visibility} · {message.status}
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{message.message}</p>
                {message.feedback ? (
                  <p className="mt-3 text-sm text-[color:var(--muted)]">Feedback: {message.feedback}</p>
                ) : null}
              </div>
              {message.status === "PENDING" ? <MessageModerationButtons messageId={message.id} /> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UploadPreview({
  type,
  url,
  externalUrl,
  altText,
}: {
  type: "IMAGE" | "VIDEO" | "LINK";
  url: string | null;
  externalUrl: string | null;
  altText: string;
}) {
  const containerClass =
    "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[1.4rem] border border-black/8 bg-black/[0.03]";

  if (type === "IMAGE" && url) {
    return (
      <div className={containerClass}>
        {/* Plain <img> intentionally — moderation is a low-traffic dashboard
            view, and next/image's optimizer adds a round-trip we don't need
            here. eslint-disable-next-line @next/next/no-img-element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={altText}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  if (type === "VIDEO" && url) {
    return (
      <div className={containerClass}>
        <video src={url} controls className="h-full w-full bg-black" />
      </div>
    );
  }

  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${containerClass} flex-col gap-2 p-4 text-center transition hover:bg-black/[0.06]`}
      >
        <ExternalLink className="h-7 w-7 text-[color:var(--primary)]" />
        <p className="text-xs font-semibold text-[color:var(--text)]">External link</p>
        <p className="break-all text-[11px] text-[color:var(--muted)]">{externalUrl}</p>
      </a>
    );
  }

  return (
    <div className={`${containerClass} flex-col gap-2 text-center`}>
      <FileQuestion className="h-7 w-7 text-[color:var(--muted)]" />
      <p className="text-xs text-[color:var(--muted)]">No preview available</p>
    </div>
  );
}

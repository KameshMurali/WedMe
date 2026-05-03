import { DashboardUnavailableState } from "@/components/admin/dashboard-unavailable-state";
import { MessageModerationButtons, UploadModerationButtons } from "@/components/admin/moderation-buttons";
import { Card } from "@/components/ui/card";
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
        {site.guestUploads.map((upload) => (
          <Card key={upload.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="font-display text-3xl text-[color:var(--text)]">
                  {upload.caption ?? upload.submitterName}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {upload.type} · {upload.status} · {upload.event?.title ?? "General"}
                </p>
                {upload.message ? <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{upload.message}</p> : null}
              </div>
              {upload.status === "PENDING" ? <UploadModerationButtons uploadId={upload.id} /> : null}
            </div>
          </Card>
        ))}
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

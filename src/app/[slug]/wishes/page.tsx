import { GuestMessageForm } from "@/components/forms/guest-message-form";
import { SiteShell } from "@/components/public/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getApprovedGuestMessagesBySlug } from "@/server/repositories/guest-engagement";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function WishesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [snapshot, messages] = await Promise.all([
    getPublishedSiteSnapshot(slug),
    getApprovedGuestMessagesBySlug(slug),
  ]);

  if (!snapshot) return null;

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/wishes`}>
      <section className="section-shell mt-16">
        <SectionHeading
          eyebrow="Wishes & Messages"
          title="Leave a note, blessing, or memory for the couple."
          description="Messages can be marked public or private, and public notes are moderated before appearing on the guestbook wall."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <GuestMessageForm slug={slug} isOpen={snapshot.publish.isMessagesOpen} />
          </Card>
          <div className="space-y-4">
            {messages.length ? (
              messages.map((message) => (
                <Card key={message.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl text-[color:var(--text)]">{message.authorName}</h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(message.createdAt)}
                      </p>
                    </div>
                    <Badge>{message.visibility}</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{message.message}</p>
                  {message.feedback ? (
                    <div className="mt-4 rounded-3xl bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--text)]">
                      Feedback: {message.feedback}
                    </div>
                  ) : null}
                </Card>
              ))
            ) : (
              <EmptyState
                title="No public wishes yet"
                description="The first approved guest message will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

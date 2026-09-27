import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";

import { UnlockForm } from "@/components/public/unlock-form";
import { Card } from "@/components/ui/card";
import { getSiteAccess } from "@/server/services/site-access";

export const metadata: Metadata = {
  title: "Private wedding website",
  // Nothing here should be indexed, and the title deliberately names no couple.
  robots: { index: false, follow: false },
};

/**
 * The password / invite-code gate.
 *
 * Lives at /unlock/[slug] rather than /[slug]/unlock because [slug]/layout.tsx
 * guards everything beneath it: a gate nested under its own guard would
 * redirect to itself forever. "unlock" is a reserved slug, so no couple can
 * register a wedding that shadows it.
 *
 * It renders nothing belonging to the couple — no names, no date, no photo.
 * A locked site should not be able to tell a stranger whose wedding it is.
 */
export default async function UnlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await getSiteAccess(slug);

  if (!access) notFound();

  // Already allowed in, or the site was never protected. Sending them onward
  // keeps this page from becoming a dead end for someone who simply refreshed.
  if (access.ok) redirect(`/${slug}` as Route);

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Private
          </p>
          <h1 className="mt-4 font-display text-4xl text-[color:var(--text)]">
            This wedding is invite only
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            {access.reason === "invite"
              ? "Enter the invite code from your invitation to see the details."
              : "Enter the password the couple shared with you to see the details."}
          </p>
        </div>

        <div className="mt-8">
          <UnlockForm slug={slug} reason={access.reason} />
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Lost it? Ask the couple, they can send it again.
        </p>
      </Card>
    </main>
  );
}

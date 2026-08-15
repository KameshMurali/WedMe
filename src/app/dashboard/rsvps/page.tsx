import Link from "next/link";

import { DashboardUnavailableState } from "@/components/admin/dashboard-unavailable-state";
import { RsvpManager } from "@/components/admin/rsvp-manager";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { getRsvpManagerSiteForUser } from "@/server/repositories/wedding-site";

export default async function DashboardRsvpsPage() {
  const user = await requireUser();
  const site = await getRsvpManagerSiteForUser(user.id);
  if (!site) {
    return (
      <DashboardUnavailableState
        section="RSVPs"
        title="We couldn't load the RSVP manager yet."
        description="Guest response data is temporarily unavailable, but your workspace session is still open. Try refreshing or return to overview and come back once the connection settles."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">RSVPs</p>
          <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Responses</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/api/dashboard/rsvps/export">Export CSV</Link>
        </Button>
      </div>
      <RsvpManager
        responses={site.rsvpResponses}
        partnerOneName={site.couple?.partnerOneName ?? "Partner 1"}
        partnerTwoName={site.couple?.partnerTwoName ?? "Partner 2"}
      />
    </div>
  );
}

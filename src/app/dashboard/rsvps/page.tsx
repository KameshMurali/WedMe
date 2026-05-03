import Link from "next/link";

import { DashboardUnavailableState } from "@/components/admin/dashboard-unavailable-state";
import { Card } from "@/components/ui/card";
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
      <div className="grid gap-4">
        {site.rsvpResponses.map((response) => (
          <Card key={response.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-display text-3xl text-[color:var(--text)]">{response.guestName}</h2>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {response.status} · {response.attendeeCount} guest(s) · {response.guestEmail ?? "No email"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {response.eventSelections.map((selection) => (
                    <span
                      key={selection.id}
                      className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)]"
                    >
                      {selection.event.title}: {selection.status}
                    </span>
                  ))}
                </div>
              </div>
              <div className="max-w-md space-y-2 text-sm text-[color:var(--muted)]">
                {response.noteToCouple ? <p>Note: {response.noteToCouple}</p> : null}
                {response.mealPreference ? <p>Meal: {response.mealPreference}</p> : null}
                {response.accessibilityNeeds ? <p>Accessibility: {response.accessibilityNeeds}</p> : null}
                {response.travelNotes ? <p>Travel: {response.travelNotes}</p> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

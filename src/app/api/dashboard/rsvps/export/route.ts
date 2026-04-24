import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/session";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";

function quote(value: string | number | null | undefined) {
  const safeValue = value == null ? "" : String(value);
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to export RSVPs." }, { status: 401 });
  }

  const site = await getWeddingSiteForUser(user.id);

  if (!site) {
    return NextResponse.json({ error: "No wedding site found." }, { status: 404 });
  }

  const header = [
    "Guest name",
    "Email",
    "Status",
    "Attendee count",
    "Invite code",
    "Meal preference",
    "Accessibility needs",
    "Travel notes",
    "Selected events",
  ];

  const rows = site.rsvpResponses.map((response) => [
    response.guestName,
    response.guestEmail,
    response.status,
    response.attendeeCount,
    response.inviteCode,
    response.mealPreference,
    response.accessibilityNeeds,
    response.travelNotes,
    response.eventSelections.map((selection) => `${selection.event.title} (${selection.status})`).join(" | "),
  ]);

  const csv = [header, ...rows].map((row) => row.map((value) => quote(value)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-rsvps.csv"`,
    },
  });
}

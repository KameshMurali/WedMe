import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/session";
import { getRsvpManagerSiteForUser } from "@/server/repositories/wedding-site";

// Mirrors the dashboard labels so the export reads the same as the UI.
function sideLabel(
  side: string | null | undefined,
  partnerOne: string | undefined,
  partnerTwo: string | undefined,
) {
  if (side === "PARTNER_ONE") return `${partnerOne ?? "Partner 1"}'s side`;
  if (side === "PARTNER_TWO") return `${partnerTwo ?? "Partner 2"}'s side`;
  if (side === "BOTH") return "Both / friend of the couple";
  return "";
}

function quote(value: string | number | null | undefined) {
  const safeValue = value == null ? "" : String(value);
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to export RSVPs." }, { status: 401 });
  }

  const site = await getRsvpManagerSiteForUser(user.id);

  if (!site) {
    return NextResponse.json({ error: "No wedding site found." }, { status: 404 });
  }

  const header = [
    "Guest name",
    "Email",
    "Status",
    "Attendee count",
    "Invite code",
    "Side",
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
    sideLabel(response.guestSide, site.couple?.partnerOneName, site.couple?.partnerTwoName),
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

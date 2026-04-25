import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { rsvpSchema } from "@/lib/validations/rsvp";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = rsvpSchema.safeParse(json);

    const rateLimit = await consumeRateLimit({
      action: "rsvp_submission",
      source: request,
      limit: 8,
      windowMs: 15 * 60 * 1000,
      keyParts: [parsed.success ? parsed.data.slug : "unknown"],
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many RSVP submissions from this connection. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please review your RSVP response." },
        { status: 400 },
      );
    }

    const site = await prisma.weddingSite.findUnique({
      where: { slug: parsed.data.slug },
      include: { publishSettings: true },
    });

    if (!site || !site.publishSettings?.isRsvpOpen) {
      return NextResponse.json({ error: "RSVPs are currently closed for this wedding." }, { status: 400 });
    }

    const inviteGroup = parsed.data.inviteCode
      ? await prisma.inviteGroup.findUnique({
          where: { code: parsed.data.inviteCode },
        })
      : null;

    if (inviteGroup && parsed.data.attendeeCount > inviteGroup.maxAttendees) {
      return NextResponse.json(
        { error: `This invite allows up to ${inviteGroup.maxAttendees} attendees.` },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const response = await transaction.rSVPResponse.create({
        data: {
          weddingSiteId: site.id,
          inviteGroupId: inviteGroup?.id ?? null,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail || null,
          inviteCode: parsed.data.inviteCode || null,
          status: parsed.data.status,
          attendeeCount: parsed.data.attendeeCount,
          mealPreference: parsed.data.mealPreference || null,
          accommodationNeeds: parsed.data.accommodationNeeds || null,
          travelNotes: parsed.data.travelNotes || null,
          specialRequests: parsed.data.specialRequests || null,
          accessibilityNeeds: parsed.data.accessibilityNeeds || null,
          noteToCouple: parsed.data.noteToCouple || null,
          confirmedAt: new Date(),
        },
      });

      await transaction.rSVPEventSelection.createMany({
        data: parsed.data.selectedEvents.map((event) => ({
          responseId: response.id,
          eventId: event.eventId,
          status: event.status,
        })),
      });

      await transaction.analyticsEvent.create({
        data: {
          weddingSiteId: site.id,
          type: "RSVP_SUBMITTED",
          path: `/${site.slug}/rsvp`,
        },
      });
    });

    return NextResponse.json({ success: "Thanks, your RSVP has been saved." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save RSVP." },
      { status: 500 },
    );
  }
}

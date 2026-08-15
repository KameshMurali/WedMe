import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  buildRsvpDedupeKey,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "@/lib/rsvp-identity";
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

    // Only persist event selections for events that still belong to this site.
    // Stale or fabricated event IDs would otherwise trip a foreign-key error
    // and lose the entire RSVP.
    const validEventIds = new Set(
      (
        await prisma.event.findMany({
          where: { weddingSiteId: site.id },
          select: { id: true },
        })
      ).map((event) => event.id),
    );

    const selectedEvents = parsed.data.selectedEvents.filter((event) =>
      validEventIds.has(event.eventId),
    );

    // One RSVP per guest per wedding, identified by name + email + contact.
    // Checked in the app so the guest gets a friendly explanation; the unique
    // index on (weddingSiteId, dedupeKey) below is the race-condition backstop.
    const dedupeKey = buildRsvpDedupeKey(parsed.data);
    const duplicateMessage =
      "It looks like you've already RSVP'd for this wedding. If you need to change your response, please contact the couple directly.";

    // Compare against this site's responses on normalised values, so rows
    // written before dedupeKey existed are matched too.
    const candidates = await prisma.rSVPResponse.findMany({
      where: { weddingSiteId: site.id },
      select: { guestName: true, guestEmail: true, guestPhone: true },
    });
    const normalizedName = normalizeName(parsed.data.guestName);
    const normalizedEmail = normalizeEmail(parsed.data.guestEmail);
    const normalizedPhone = normalizePhone(parsed.data.guestPhone);
    const existing = candidates.some(
      (candidate) =>
        normalizeName(candidate.guestName) === normalizedName &&
        normalizeEmail(candidate.guestEmail) === normalizedEmail &&
        normalizePhone(candidate.guestPhone) === normalizedPhone,
    );

    if (existing) {
      return NextResponse.json({ error: duplicateMessage }, { status: 409 });
    }

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const response = await transaction.rSVPResponse.create({
        data: {
          weddingSiteId: site.id,
          inviteGroupId: inviteGroup?.id ?? null,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail || null,
          guestPhone: parsed.data.guestPhone || null,
          dedupeKey,
          inviteCode: parsed.data.inviteCode || null,
          status: parsed.data.status,
          attendeeCount: parsed.data.attendeeCount,
          guestSide: parsed.data.guestSide || null,
          mealPreference: parsed.data.mealPreference || null,
          accommodationNeeds: parsed.data.accommodationNeeds || null,
          travelNotes: parsed.data.travelNotes || null,
          specialRequests: parsed.data.specialRequests || null,
          accessibilityNeeds: parsed.data.accessibilityNeeds || null,
          noteToCouple: parsed.data.noteToCouple || null,
          confirmedAt: new Date(),
        },
      });

      if (selectedEvents.length > 0) {
        await transaction.rSVPEventSelection.createMany({
          data: selectedEvents.map((event) => ({
            responseId: response.id,
            eventId: event.eventId,
            status: event.status,
          })),
        });
      }

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
    // Race backstop: two simultaneous submits pass the check above, then the
    // unique index rejects the second. Surface the same friendly message
    // rather than a 500.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "It looks like you've already RSVP'd for this wedding. If you need to change your response, please contact the couple directly.",
        },
        { status: 409 },
      );
    }

    // Never leak raw DB/internal error text to guests.
    console.error("RSVP submission failed", error);
    return NextResponse.json({ error: "Unable to save RSVP." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { guestMessageSchema } from "@/lib/validations/guest";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = guestMessageSchema.safeParse(json);

    const rateLimit = await consumeRateLimit({
      action: "guest_message",
      source: request,
      limit: 6,
      windowMs: 15 * 60 * 1000,
      keyParts: [parsed.success ? parsed.data.slug : "unknown"],
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many messages were submitted from this connection. Please try again a little later." },
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
        { error: parsed.error.issues[0]?.message ?? "Please review your message." },
        { status: 400 },
      );
    }

    const site = await prisma.weddingSite.findUnique({
      where: { slug: parsed.data.slug },
      include: { publishSettings: true },
    });

    if (!site || !site.publishSettings?.isMessagesOpen) {
      return NextResponse.json({ error: "Messages are currently closed." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.guestMessage.create({
        data: {
          weddingSiteId: site.id,
          authorName: parsed.data.authorName,
          email: parsed.data.email || null,
          message: parsed.data.message,
          feedback: parsed.data.feedback || null,
          visibility: parsed.data.visibility,
          status: "PENDING",
        },
      }),
      prisma.analyticsEvent.create({
        data: {
          weddingSiteId: site.id,
          type: "MESSAGE_SUBMITTED",
          path: `/${site.slug}/wishes`,
        },
      }),
    ]);

    return NextResponse.json({
      success: "Your message has been shared with the couple and is pending moderation.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit message." },
      { status: 500 },
    );
  }
}

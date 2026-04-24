import { type Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/prisma";

const analyticsSchema = z.object({
  slug: z.string().min(3),
  type: z.enum(["PAGE_VIEW", "CTA_CLICK", "RSVP_SUBMITTED", "MESSAGE_SUBMITTED", "UPLOAD_SUBMITTED"]),
  path: z.string().optional(),
  metadata: z.unknown().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = analyticsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const site = await prisma.weddingSite.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json({ ok: true });
    }

    await prisma.analyticsEvent.create({
      data: {
        weddingSiteId: site.id,
        type: parsed.data.type,
        path: parsed.data.path ?? null,
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

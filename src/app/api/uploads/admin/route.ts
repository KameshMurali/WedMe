import { z } from "zod";
import { NextResponse } from "next/server";

import { validateImageFile } from "@/lib/validations/upload";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";
import { storage } from "@/server/storage";

const adminUploadSchema = z.object({
  category: z.enum(["HERO", "STORY", "EVENT_BANNER", "GALLERY", "DRESS_CODE"]),
  title: z.string().optional().or(z.literal("")),
  altText: z.string().optional().or(z.literal("")),
  caption: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const site = await getWeddingSiteForUser(user.id);
    if (!site) {
      return NextResponse.json({ error: "No wedding site was found for this account." }, { status: 404 });
    }

    const formData = await request.formData();
    const parsed = adminUploadSchema.safeParse({
      category: formData.get("category"),
      title: formData.get("title"),
      altText: formData.get("altText"),
      caption: formData.get("caption"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please review the upload details." },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please select an image file." }, { status: 400 });
    }

    validateImageFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storage.upload({
      buffer,
      filename: file.name,
      mimeType: file.type,
      folder: site.slug,
    });

    await prisma.$transaction(async (transaction) => {
      await transaction.mediaAsset.create({
        data: {
          weddingSiteId: site.id,
          category: parsed.data.category,
          title: parsed.data.title || null,
          altText: parsed.data.altText || null,
          caption: parsed.data.caption || null,
          url: stored.url,
          storageKey: stored.storageKey,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });

      if (parsed.data.category === "HERO") {
        await transaction.weddingSite.update({
          where: { id: site.id },
          data: { heroImageUrl: stored.url },
        });
      }

      await transaction.publishSettings.update({
        where: { weddingSiteId: site.id },
        data: { lastDraftSavedAt: new Date() },
      });
    });

    return NextResponse.json({
      success: parsed.data.category === "HERO" ? "Hero image uploaded to your draft." : "Media uploaded to your draft gallery.",
      url: stored.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 500 },
    );
  }
}

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";

import { adminSignedUploadSchema, validateImageFile } from "@/lib/validations/upload";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { getEditableWeddingSiteForUser } from "@/server/repositories/wedding-site";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { demoWorkspaceReadOnlyMessage, isDemoSiteId } from "@/server/services/demo-site";
import { storage } from "@/server/storage";
import {
  storageUploadsConfigurationMessage,
  storageUploadsConfigured,
} from "@/server/storage/upload-config";

const adminUploadSchema = z.object({
  category: z.enum(["HERO", "STORY", "EVENT_BANNER", "GALLERY", "DRESS_CODE"]),
  title: z.string().optional().or(z.literal("")),
  altText: z.string().optional().or(z.literal("")),
  caption: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    if (!storageUploadsConfigured) {
      return NextResponse.json(
        {
          error:
            storageUploadsConfigurationMessage ??
            "Uploads are not configured for this deployment yet.",
        },
        { status: 503 },
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to upload media." }, { status: 401 });
    }

    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) {
      return NextResponse.json({ error: "No wedding site was found for this account." }, { status: 404 });
    }
    if (isDemoSiteId(site.id)) {
      return NextResponse.json({ error: demoWorkspaceReadOnlyMessage }, { status: 400 });
    }

    const rateLimit = await consumeRateLimit({
      action: "admin_upload",
      source: request,
      limit: 25,
      windowMs: 15 * 60 * 1000,
      keyParts: [user.id, site.slug],
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many uploads were attempted from this dashboard. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
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
    const uploadedUrl = formData.get("uploadedUrl");

    let stored: { url: string; storageKey: string };
    let mimeType: string;
    let sizeBytes: number;

    if (file instanceof File && file.size > 0) {
      validateImageFile(file);

      const buffer = Buffer.from(await file.arrayBuffer());
      stored = await storage.upload({
        buffer,
        filename: file.name,
        mimeType: file.type,
        folder: site.slug,
      });
      mimeType = file.type;
      sizeBytes = file.size;
    } else if (typeof uploadedUrl === "string" && uploadedUrl) {
      const signedUpload = adminSignedUploadSchema.safeParse({
        uploadedUrl,
        storageKey: formData.get("storageKey"),
        mimeType: formData.get("mimeType"),
        sizeBytes: formData.get("sizeBytes"),
      });

      if (!signedUpload.success) {
        return NextResponse.json(
          { error: signedUpload.error.issues[0]?.message ?? "Please review the uploaded file details." },
          { status: 400 },
        );
      }

      stored = {
        url: signedUpload.data.uploadedUrl,
        storageKey: signedUpload.data.storageKey,
      };
      mimeType = signedUpload.data.mimeType;
      sizeBytes = signedUpload.data.sizeBytes;
    } else {
      return NextResponse.json({ error: "Please select an image file." }, { status: 400 });
    }

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.mediaAsset.create({
        data: {
          weddingSiteId: site.id,
          category: parsed.data.category,
          title: parsed.data.title || null,
          altText: parsed.data.altText || null,
          caption: parsed.data.caption || null,
          url: stored.url,
          storageKey: stored.storageKey,
          mimeType,
          sizeBytes,
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

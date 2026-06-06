import { NextResponse } from "next/server";
import { z } from "zod";

import {
  maxSiteImageBytes,
  maxSiteVideoBytes,
  siteImageMimeTypes,
  siteVideoMimeTypes,
  validateSiteAssetFile,
} from "@/lib/validations/upload";
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

const siteAssetFieldSchema = z.enum(["heroImageUrl", "heroVideoUrl", "ogImageUrl"]);

const siteAssetRequestSchema = z.object({
  field: siteAssetFieldSchema,
});

const signedUploadSchema = z.object({
  uploadedUrl: z.string().url("Please provide a valid uploaded file URL."),
  storageKey: z.string().min(1, "Missing uploaded file reference."),
  mimeType: z.string().min(1, "Missing uploaded file type."),
  sizeBytes: z.coerce.number().int().positive(),
});

function validateSignedUpload(field: z.infer<typeof siteAssetFieldSchema>, uploaded: z.infer<typeof signedUploadSchema>) {
  if (field === "heroVideoUrl") {
    if (!siteVideoMimeTypes.includes(uploaded.mimeType as (typeof siteVideoMimeTypes)[number])) {
      throw new Error("Please upload an MP4, MOV, or WEBM video.");
    }

    if (uploaded.sizeBytes > maxSiteVideoBytes) {
      throw new Error("Videos must be 20MB or smaller.");
    }

    return;
  }

  if (!siteImageMimeTypes.includes(uploaded.mimeType as (typeof siteImageMimeTypes)[number])) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (uploaded.sizeBytes > maxSiteImageBytes) {
    throw new Error("Images must be 2MB or smaller after optimisation.");
  }
}

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
      action: "site_asset_upload",
      source: request,
      limit: 20,
      windowMs: 15 * 60 * 1000,
      keyParts: [user.id, site.slug],
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many media uploads were attempted from this workspace. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const formData = await request.formData();
    const parsed = siteAssetRequestSchema.safeParse({
      field: formData.get("field"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please review the media field details." },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    const uploadedUrl = formData.get("uploadedUrl");

    let stored: { url: string; storageKey: string };
    let mimeType: string;
    let sizeBytes: number;

    if (file instanceof File && file.size > 0) {
      validateSiteAssetFile(parsed.data.field, file);

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
      const signedUpload = signedUploadSchema.safeParse({
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

      validateSignedUpload(parsed.data.field, signedUpload.data);

      stored = {
        url: signedUpload.data.uploadedUrl,
        storageKey: signedUpload.data.storageKey,
      };
      mimeType = signedUpload.data.mimeType;
      sizeBytes = signedUpload.data.sizeBytes;
    } else {
      return NextResponse.json({ error: "Please select a file to upload." }, { status: 400 });
    }

    await prisma.publishSettings.update({
      where: { weddingSiteId: site.id },
      data: { lastDraftSavedAt: new Date() },
    });

    return NextResponse.json({
      success:
        parsed.data.field === "heroVideoUrl"
          ? "Video uploaded. Save site basics to use it in the hero section."
          : "Image uploaded. Save site basics to apply it to the site.",
      url: stored.url,
      storageKey: stored.storageKey,
      mimeType,
      sizeBytes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload media." },
      { status: 500 },
    );
  }
}

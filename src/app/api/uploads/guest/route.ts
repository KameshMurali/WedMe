import { NextResponse } from "next/server";

import { guestUploadSchema } from "@/lib/validations/guest";
import { getGuestUploadType, guestSignedUploadSchema, validateGuestMedia } from "@/lib/validations/upload";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { storage } from "@/server/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = guestUploadSchema.safeParse({
      slug: formData.get("slug"),
      submitterName: formData.get("submitterName"),
      caption: formData.get("caption"),
      message: formData.get("message"),
      externalUrl: formData.get("externalUrl"),
      eventId: formData.get("eventId"),
    });

    const rateLimit = await consumeRateLimit({
      action: "guest_upload",
      source: request,
      limit: 6,
      windowMs: 15 * 60 * 1000,
      keyParts: [parsed.success ? parsed.data.slug : "unknown"],
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many uploads were submitted from this connection. Please wait a little while and try again." },
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
        { error: parsed.error.issues[0]?.message ?? "Please review your upload details." },
        { status: 400 },
      );
    }

    const site = await prisma.weddingSite.findUnique({
      where: { slug: parsed.data.slug },
      include: { publishSettings: true },
    });

    if (!site || !site.publishSettings?.isUploadsOpen) {
      return NextResponse.json({ error: "Guest uploads are currently closed." }, { status: 400 });
    }

    const file = formData.get("file");
    const externalUrl = parsed.data.externalUrl || null;
    const uploadedUrl = formData.get("uploadedUrl");

    const hasBinaryFile = file instanceof File && file.size > 0;
    const hasSignedFile = typeof uploadedUrl === "string" && uploadedUrl.length > 0;

    if ((hasBinaryFile || hasSignedFile) && externalUrl) {
      return NextResponse.json(
        { error: "Please choose either a file upload or an external video link, not both." },
        { status: 400 },
      );
    }

    if (!hasBinaryFile && !hasSignedFile && !externalUrl) {
      return NextResponse.json({ error: "Please upload a file or submit a link." }, { status: 400 });
    }

    let uploadResult:
      | {
          url?: string;
          storageKey?: string;
          mimeType?: string;
          sizeBytes?: number;
          type: "IMAGE" | "VIDEO" | "LINK";
        }
      | undefined;

    if (hasBinaryFile && file instanceof File) {
      validateGuestMedia(file);
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await storage.upload({
        buffer,
        filename: file.name,
        mimeType: file.type,
        folder: site.slug,
      });

      uploadResult = {
        url: stored.url,
        storageKey: stored.storageKey,
        mimeType: file.type,
        sizeBytes: file.size,
        type: getGuestUploadType(file.type),
      };
    } else if (hasSignedFile && typeof uploadedUrl === "string") {
      const signedUpload = guestSignedUploadSchema.safeParse({
        uploadedUrl,
        storageKey: formData.get("storageKey"),
        mimeType: formData.get("mimeType"),
        sizeBytes: formData.get("sizeBytes"),
      });

      if (!signedUpload.success) {
        return NextResponse.json(
          { error: signedUpload.error.issues[0]?.message ?? "Please review the uploaded media details." },
          { status: 400 },
        );
      }

      uploadResult = {
        url: signedUpload.data.uploadedUrl,
        storageKey: signedUpload.data.storageKey,
        mimeType: signedUpload.data.mimeType,
        sizeBytes: signedUpload.data.sizeBytes,
        type: getGuestUploadType(signedUpload.data.mimeType),
      };
    } else {
      uploadResult = {
        type: "LINK",
      };
    }

    await prisma.$transaction([
      prisma.guestUpload.create({
        data: {
          weddingSiteId: site.id,
          eventId: parsed.data.eventId || null,
          submitterName: parsed.data.submitterName,
          caption: parsed.data.caption || null,
          message: parsed.data.message || null,
          url: uploadResult.url ?? null,
          storageKey: uploadResult.storageKey ?? null,
          mimeType: uploadResult.mimeType ?? null,
          sizeBytes: uploadResult.sizeBytes ?? null,
          externalUrl,
          type: uploadResult.type,
          status: "PENDING",
        },
      }),
      prisma.analyticsEvent.create({
        data: {
          weddingSiteId: site.id,
          type: "UPLOAD_SUBMITTED",
          path: `/${site.slug}/memories`,
        },
      }),
    ]);

    return NextResponse.json({
      success: "Your memory has been submitted and is awaiting approval.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit upload." },
      { status: 500 },
    );
  }
}

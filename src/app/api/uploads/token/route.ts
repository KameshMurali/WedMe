import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import {
  guestMediaMimeTypes,
  imageMimeTypes,
  maxGuestVideoBytes,
  maxImageBytes,
  uploadTokenPayloadSchema,
} from "@/lib/validations/upload";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";
import { consumeRateLimit } from "@/server/security/rate-limit";

function isSafeUploadPath(pathname: string, expectedFolder: string) {
  return pathname.startsWith(`${expectedFolder}/`) && !pathname.includes("..");
}

function parseClientPayload(payload: string | null) {
  const parsedJson = payload ? JSON.parse(payload) : {};
  return uploadTokenPayloadSchema.parse(parsedJson);
}

export async function POST(request: Request) {
  if (env.STORAGE_DRIVER !== "blob" || !env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Signed uploads are not enabled in this environment." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    if (body.type === "blob.generate-client-token") {
      const payload = parseClientPayload(body.payload.clientPayload);
      const rateLimit = await consumeRateLimit({
        action: payload.scope === "admin" ? "admin_upload_token" : "guest_upload_token",
        source: request,
        limit: payload.scope === "admin" ? 30 : 6,
        windowMs: 15 * 60 * 1000,
        keyParts: payload.scope === "admin" ? [payload.category] : [payload.slug],
      });

      if (!rateLimit.ok) {
        return NextResponse.json(
          { error: "Too many upload attempts were started from this connection. Please try again shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          },
        );
      }
    }

    const response = await handleUpload({
      body,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload);

        if (payload.scope === "admin") {
          const user = await getCurrentUser();
          if (!user) {
            throw new Error("Please sign in to upload media.");
          }

          const site = await getWeddingSiteForUser(user.id);
          if (!site) {
            throw new Error("No wedding site was found for this account.");
          }

          if (!isSafeUploadPath(pathname, site.slug)) {
            throw new Error("Upload destination is invalid for this workspace.");
          }

          return {
            allowedContentTypes: [...imageMimeTypes],
            maximumSizeInBytes: maxImageBytes,
            addRandomSuffix: true,
            validUntil: Date.now() + 5 * 60 * 1000,
            tokenPayload: JSON.stringify({
              scope: "admin",
              siteId: site.id,
              slug: site.slug,
              category: payload.category,
            }),
          };
        }

        const site = await prisma.weddingSite.findUnique({
          where: { slug: payload.slug },
          include: { publishSettings: true },
        });

        if (!site || !site.publishSettings?.isUploadsOpen) {
          throw new Error("Guest uploads are currently closed.");
        }

        if (!isSafeUploadPath(pathname, payload.slug)) {
          throw new Error("Upload destination is invalid for this wedding.");
        }

        return {
          allowedContentTypes: [...guestMediaMimeTypes],
          maximumSizeInBytes: maxGuestVideoBytes,
          addRandomSuffix: true,
          validUntil: Date.now() + 5 * 60 * 1000,
          tokenPayload: JSON.stringify({
            scope: "guest",
            slug: payload.slug,
          }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to prepare signed upload." },
      { status: 400 },
    );
  }
}

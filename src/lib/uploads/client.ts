"use client";

import { upload } from "@vercel/blob/client";

import { slugify } from "@/lib/utils";

type UploadTokenPayload =
  | {
      scope: "admin";
      category: "HERO" | "STORY" | "EVENT_BANNER" | "GALLERY" | "DRESS_CODE";
    }
  | {
      scope: "guest";
      slug: string;
    };

function buildUploadPath(folder: string, filename: string) {
  const extension = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
  const nameWithoutExtension = extension ? filename.slice(0, -extension.length) : filename;
  const safeName = slugify(nameWithoutExtension) || "upload";
  return `${folder}/${safeName}${extension.toLowerCase()}`;
}

export async function uploadFileWithSignedUrl({
  folder,
  file,
  payload,
  onProgress,
}: {
  folder: string;
  file: File;
  payload: UploadTokenPayload;
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
}) {
  const result = await upload(buildUploadPath(folder, file.name), file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/uploads/token",
    clientPayload: JSON.stringify(payload),
    multipart: file.size > 6 * 1024 * 1024,
    onUploadProgress: onProgress,
  });

  return {
    uploadedUrl: result.url,
    storageKey: result.pathname,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

import { z } from "zod";

export const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const guestVideoMimeTypes = ["video/mp4", "video/quicktime"] as const;
export const guestMediaMimeTypes = [...imageMimeTypes, ...guestVideoMimeTypes] as const;

export const maxImageBytes = 8 * 1024 * 1024;
export const maxGuestVideoBytes = 40 * 1024 * 1024;

const adminMimeTypeSchema = z.string().refine((value) => imageMimeTypes.includes(value as (typeof imageMimeTypes)[number]), {
  message: "Only JPG, PNG, and WEBP images are allowed.",
});

const guestMimeTypeSchema = z.string().refine(
  (value) => guestMediaMimeTypes.includes(value as (typeof guestMediaMimeTypes)[number]),
  {
    message: "Only JPG, PNG, WEBP, MP4, and MOV uploads are allowed.",
  },
);

export const adminSignedUploadSchema = z.object({
  uploadedUrl: z.string().url("Please provide a valid uploaded image URL."),
  storageKey: z.string().min(1, "Missing uploaded file reference."),
  mimeType: adminMimeTypeSchema,
  sizeBytes: z.coerce
    .number()
    .int("Image size must be a whole number.")
    .positive("Image size must be greater than 0.")
    .max(maxImageBytes, "Images must be 8MB or smaller."),
});

export const guestSignedUploadSchema = z.object({
  uploadedUrl: z.string().url("Please provide a valid uploaded media URL."),
  storageKey: z.string().min(1, "Missing uploaded file reference."),
  mimeType: guestMimeTypeSchema,
  sizeBytes: z.coerce
    .number()
    .int("Upload size must be a whole number.")
    .positive("Upload size must be greater than 0.")
    .max(maxGuestVideoBytes, "Guest uploads must be 40MB or smaller."),
});

export const uploadTokenPayloadSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("admin"),
    category: z.enum(["HERO", "STORY", "EVENT_BANNER", "GALLERY", "DRESS_CODE"]),
  }),
  z.object({
    scope: z.literal("guest"),
    slug: z.string().min(3, "A wedding slug is required for guest uploads."),
  }),
]);

export function validateImageFile(file: File) {
  if (!imageMimeTypes.includes(file.type as (typeof imageMimeTypes)[number])) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > maxImageBytes) {
    throw new Error("Images must be 8MB or smaller.");
  }
}

export function validateGuestMedia(file: File) {
  if (!guestMediaMimeTypes.includes(file.type as (typeof guestMediaMimeTypes)[number])) {
    throw new Error("Please upload an image or a short MP4/MOV video.");
  }

  if (file.type.startsWith("image/")) {
    validateImageFile(file);
    return;
  }

  if (file.size > maxGuestVideoBytes) {
    throw new Error("Guest videos must be 40MB or smaller.");
  }
}

export function getGuestUploadType(mimeType: string) {
  return mimeType.startsWith("image/") ? "IMAGE" : "VIDEO";
}

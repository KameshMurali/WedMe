"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bytesToSize } from "@/lib/utils";
import { uploadFileWithSignedUrl } from "@/lib/uploads/client";
import { maxSiteImageBytes, maxSiteVideoBytes } from "@/lib/validations/upload";

type SiteAssetField = "heroImageUrl" | "heroVideoUrl" | "ogImageUrl";

async function readImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("We couldn't read this image."));
      element.src = objectUrl;
    });

    return { width: image.width, height: image.height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function optimizeImageForSiteUpload(file: File) {
  if (file.size <= maxSiteImageBytes) {
    return file;
  }

  const { width, height } = await readImageDimensions(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser couldn't prepare this image for upload.");
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("We couldn't decode this image."));
      element.src = imageUrl;
    });

    let scale = Math.min(1, 2200 / Math.max(width, height));
    let quality = 0.9;
    let bestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });

      if (blob) {
        bestBlob = blob;
        if (blob.size <= maxSiteImageBytes) {
          const baseName = file.name.replace(/\.[^.]+$/, "") || "site-image";
          return new File([blob], `${baseName}.webp`, { type: "image/webp" });
        }
      }

      quality = quality > 0.65 ? quality - 0.1 : 0.82;
      scale *= 0.88;
    }

    if (bestBlob && bestBlob.size <= maxSiteImageBytes) {
      const baseName = file.name.replace(/\.[^.]+$/, "") || "site-image";
      return new File([bestBlob], `${baseName}.webp`, { type: "image/webp" });
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  throw new Error("This image is still larger than 2MB after optimisation. Try a smaller file.");
}

export function SiteAssetUploadField({
  field,
  label,
  slug,
  currentUrl,
  kind,
  useSignedUploads,
  uploadsEnabled,
  disabledReason,
  onUploaded,
  onClear,
}: {
  field: SiteAssetField;
  label: string;
  slug: string;
  currentUrl: string;
  kind: "image" | "video";
  useSignedUploads: boolean;
  uploadsEnabled: boolean;
  disabledReason?: string | null;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : currentUrl || null), [currentUrl, file]);

  useEffect(() => {
    if (!file || !previewUrl || previewUrl === currentUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [currentUrl, file, previewUrl]);

  async function handleUpload() {
    if (!uploadsEnabled) {
      toast.error(disabledReason ?? "Uploads are not available right now.");
      return;
    }

    if (!file) {
      toast.error(`Choose a ${kind} file to upload.`);
      return;
    }

    try {
      setIsUploading(true);

      const preparedFile = kind === "image" ? await optimizeImageForSiteUpload(file) : file;
      const formData = new FormData();
      formData.append("field", field);

      if (useSignedUploads) {
        const uploaded = await uploadFileWithSignedUrl({
          folder: slug,
          file: preparedFile,
          payload: {
            scope: "site_asset",
            field,
          },
        });

        formData.append("uploadedUrl", uploaded.uploadedUrl);
        formData.append("storageKey", uploaded.storageKey);
        formData.append("mimeType", uploaded.mimeType);
        formData.append("sizeBytes", String(uploaded.sizeBytes));
      } else {
        formData.append("file", preparedFile);
      }

      const response = await fetch("/api/uploads/site-assets", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; success?: string; url?: string };
      if (!response.ok || !data.url) {
        toast.error(data.error ?? `Unable to upload ${label.toLowerCase()}.`);
        return;
      }

      onUploaded(data.url);
      setFile(null);
      toast.success(
        data.success ??
          `${label} uploaded. ${kind === "image" ? `Optimised to stay under ${bytesToSize(maxSiteImageBytes)}.` : ""}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to upload ${label.toLowerCase()}.`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-[1.3rem] border border-black/8 bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[color:var(--text)]">{label}</p>
          <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
            {kind === "image"
              ? `Upload JPG, PNG, or WEBP. Images are kept at or below ${bytesToSize(maxSiteImageBytes)} for faster rendering.`
              : `Upload MP4, MOV, or WEBM up to ${bytesToSize(maxSiteVideoBytes)}. Shorter files will perform best in the hero section.`}
          </p>
        </div>
        {currentUrl ? (
          <Button type="button" variant="ghost" className="sm:w-auto" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      {!uploadsEnabled && disabledReason ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
          {disabledReason}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="file"
          accept={kind === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/quicktime,video/webm"}
          disabled={!uploadsEnabled}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Button type="button" disabled={isUploading || !uploadsEnabled} onClick={handleUpload}>
          {isUploading ? "Uploading..." : kind === "image" ? "Upload image" : "Upload video"}
        </Button>
      </div>
      {previewUrl ? (
        <div className="overflow-hidden rounded-[1.2rem] border border-black/8 bg-white/90 p-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={`${label} preview`} className="max-h-72 w-full rounded-[1rem] object-cover" />
          ) : (
            <video src={previewUrl} controls className="max-h-72 w-full rounded-[1rem]" />
          )}
        </div>
      ) : null}
    </div>
  );
}

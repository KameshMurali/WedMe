"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { uploadFileWithSignedUrl } from "@/lib/uploads/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function AdminMediaUploader({ slug, useSignedUploads }: { slug: string; useSignedUploads: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<"HERO" | "STORY" | "EVENT_BANNER" | "GALLERY" | "DRESS_CODE">("GALLERY");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function handleUpload() {
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("altText", altText);
    formData.append("caption", caption);

    try {
      setIsUploading(true);

      if (useSignedUploads) {
        const uploaded = await uploadFileWithSignedUrl({
          folder: slug,
          file,
          payload: {
            scope: "admin",
            category,
          },
        });

        formData.append("uploadedUrl", uploaded.uploadedUrl);
        formData.append("storageKey", uploaded.storageKey);
        formData.append("mimeType", uploaded.mimeType);
        formData.append("sizeBytes", String(uploaded.sizeBytes));
      } else {
        formData.append("file", file);
      }

      const response = await fetch("/api/uploads/admin", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; success?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }

      toast.success(data.success ?? "Image uploaded.");
      setFile(null);
      setTitle("");
      setAltText("");
      setCaption("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-display text-4xl text-[color:var(--text)]">Upload media</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Upload hero images, gallery media, and supporting visuals directly from the dashboard.
        </p>
      </div>
      <Select
        value={category}
        onChange={(event) =>
          setCategory(event.target.value as "HERO" | "STORY" | "EVENT_BANNER" | "GALLERY" | "DRESS_CODE")
        }
      >
        <option value="HERO">Hero image</option>
        <option value="GALLERY">Gallery</option>
        <option value="STORY">Story</option>
        <option value="EVENT_BANNER">Event banner</option>
        <option value="DRESS_CODE">Dress code</option>
      </Select>
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Upload preview" className="max-h-80 w-full rounded-[1.4rem] object-cover" />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input placeholder="Alt text" value={altText} onChange={(event) => setAltText(event.target.value)} />
      </div>
      <Input placeholder="Caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
      <Button type="button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload image"}
      </Button>
    </Card>
  );
}

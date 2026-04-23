"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const clientUploadSchema = z.object({
  submitterName: z.string().min(2),
  eventId: z.string().optional(),
  caption: z.string().optional(),
  message: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

type UploadValues = z.infer<typeof clientUploadSchema>;

export function GuestUploadForm({
  slug,
  events,
  isOpen,
}: {
  slug: string;
  events: Array<{ id: string; title: string }>;
  isOpen: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UploadValues>({
    resolver: zodResolver(clientUploadSchema),
  });

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onSubmit = handleSubmit(
    (values) =>
      new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("slug", slug);
        formData.append("submitterName", values.submitterName);
        formData.append("eventId", values.eventId ?? "");
        formData.append("caption", values.caption ?? "");
        formData.append("message", values.message ?? "");
        formData.append("externalUrl", values.externalUrl ?? "");

        if (file) {
          formData.append("file", file);
        }

        const request = new XMLHttpRequest();
        request.open("POST", "/api/uploads/guest");
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        request.onload = () => {
          const response = JSON.parse(request.responseText) as { error?: string; success?: string };
          if (request.status >= 400) {
            toast.error(response.error ?? "Upload failed.");
          } else {
            toast.success(response.success ?? "Upload submitted for moderation.");
            setFile(null);
            setProgress(0);
            reset();
          }
          resolve();
        };

        request.onerror = () => {
          toast.error("Upload failed.");
          resolve();
        };

        request.send(formData);
      }),
  );

  if (!isOpen) {
    return <p className="text-sm text-[color:var(--muted)]">Guest uploads are not open right now.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Your name" {...register("submitterName")} />
        <Select {...register("eventId")}>
          <option value="">Select event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </Select>
      </div>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Input placeholder="Or paste an external video link" {...register("externalUrl")} />
      {preview ? (
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-2">
          {file?.type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-80 w-full rounded-[1.2rem] object-cover" />
          ) : (
            <video src={preview} controls className="max-h-80 w-full rounded-[1.2rem]" />
          )}
        </div>
      ) : null}
      <Input placeholder="Caption" {...register("caption")} />
      <Textarea placeholder="Optional note with your upload" {...register("message")} />
      {progress > 0 ? (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-black/5">
            <div
              className="h-2 rounded-full bg-[color:var(--primary)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[color:var(--muted)]">Uploading: {progress}%</p>
        </div>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Share memory"}
      </Button>
    </form>
  );
}

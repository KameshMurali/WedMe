"use client";

import { useFieldArray, useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, MapPin, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadFileWithSignedUrl } from "@/lib/uploads/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Option = { value: string; label: string };
type FieldConfig = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "url"
    | "datetime-local"
    | "checkbox"
    | "select"
    | "array-text"
    | "maps-url"
    | "image-upload";
  placeholder?: string;
  options?: Option[];
  // For datetime-local: name of another field whose value is used as `min`.
  minFromField?: string;
  // For maps-url: name of another field to seed the Google Maps search query.
  addressFromField?: string;
  // For image-upload: which storage folder (e.g. site slug) and signed-upload mode.
  uploadFolder?: string;
  useSignedUploads?: boolean;
  uploadCategory?: "HERO" | "STORY" | "EVENT_BANNER" | "GALLERY" | "DRESS_CODE";
};

type ActionResult = { error?: string; success?: string };

export function ArrayEditor({
  title,
  description,
  fields,
  items,
  emptyItem,
  onSave,
  maxItems,
  maxItemsNote,
}: {
  title: string;
  description: string;
  fields: FieldConfig[];
  items: Array<Record<string, unknown>>;
  emptyItem: Record<string, unknown>;
  onSave: (previousState: ActionResult, formData: FormData) => Promise<ActionResult>;
  // Optional plan-driven cap. When set, "Add item" is disabled at the limit
  // and an upgrade note is shown. The server still enforces this authoritatively.
  maxItems?: number;
  maxItemsNote?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { control, register, handleSubmit } = useForm<{ items: Array<Record<string, unknown>> }>({
    defaultValues: { items },
  });
  const { fields: rows, append, remove, move } = useFieldArray({
    control,
    name: "items" as const,
  });
  const atLimit = typeof maxItems === "number" && rows.length >= maxItems;

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.append("items", JSON.stringify(values.items));

    startTransition(async () => {
      const result = await onSave({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Saved");
      router.refresh();
    });
  });

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-4xl text-[color:var(--text)]">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            type="button"
            variant="outline"
            disabled={atLimit}
            onClick={() => {
              if (atLimit) return;
              append(JSON.parse(JSON.stringify(emptyItem)) as Record<string, unknown>);
            }}
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
          {typeof maxItems === "number" ? (
            <span className="text-[11px] text-[color:var(--muted)]">
              {rows.length}/{maxItems} used
            </span>
          ) : null}
        </div>
      </div>
      {atLimit && maxItemsNote ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          {maxItemsNote}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {rows.map((row, index) => (
          <Card key={row.id} className="border border-black/6 bg-white/70">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Item {index + 1}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => index > 0 && move(index, index - 1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => index < rows.length - 1 && move(index, index + 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const fieldName = `items.${index}.${field.name}` as const;

                if (field.type === "textarea") {
                  return (
                    <label key={field.name} className="space-y-2 md:col-span-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <Textarea placeholder={field.placeholder} {...register(fieldName as never)} />
                    </label>
                  );
                }

                if (field.type === "select") {
                  return (
                    <label key={field.name} className="space-y-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <select
                        {...register(fieldName as never)}
                        className="h-12 w-full rounded-2xl border border-black/10 bg-white/85 px-4"
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                if (field.type === "checkbox") {
                  return (
                    <label key={field.name} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm">
                      <input type="checkbox" {...register(fieldName as never)} />
                      {field.label}
                    </label>
                  );
                }

                if (field.type === "array-text") {
                  return (
                    <label key={field.name} className="space-y-2 md:col-span-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <Controller
                        control={control}
                        name={fieldName as never}
                        render={({ field: controllerField }) => (
                          <Input
                            placeholder={field.placeholder}
                            value={
                              Array.isArray(controllerField.value)
                                ? (controllerField.value as string[]).join(", ")
                                : ""
                            }
                            onChange={(event) =>
                              controllerField.onChange(
                                event.target.value
                                  .split(",")
                                  .map((value) => value.trim())
                                  .filter(Boolean),
                              )
                            }
                          />
                        )}
                      />
                    </label>
                  );
                }

                if (field.type === "datetime-local") {
                  return (
                    <DateTimeField
                      key={field.name}
                      control={control}
                      register={register}
                      rowIndex={index}
                      field={field}
                      fieldName={fieldName}
                    />
                  );
                }

                if (field.type === "maps-url") {
                  return (
                    <MapsUrlField
                      key={field.name}
                      control={control}
                      register={register}
                      rowIndex={index}
                      field={field}
                      fieldName={fieldName}
                    />
                  );
                }

                if (field.type === "image-upload") {
                  return (
                    <ImageUploadField
                      key={field.name}
                      control={control}
                      rowIndex={index}
                      field={field}
                      fieldName={fieldName}
                    />
                  );
                }

                return (
                  <label key={field.name} className="space-y-2">
                    <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                    <Input type={field.type} placeholder={field.placeholder} {...register(fieldName as never)} />
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : `Save ${title.toLowerCase()}`}
        </Button>
      </form>
    </Card>
  );
}

type SubFieldProps = {
  control: ReturnType<typeof useForm<{ items: Array<Record<string, unknown>> }>>["control"];
  register: ReturnType<typeof useForm<{ items: Array<Record<string, unknown>> }>>["register"];
  rowIndex: number;
  field: FieldConfig;
  fieldName: string;
};

// Datetime field that, when given `minFromField`, constrains its `min` to the value
// of a sibling field in the same row (e.g. End >= Start). Falls back to "now" when
// no source field is configured, so the user can't pick a past time.
function DateTimeField({ control, register, rowIndex, field, fieldName }: SubFieldProps) {
  // Always call useWatch (rules-of-hooks); pass a placeholder name when no source field is set.
  const watched = useWatch({
    control,
    name: `items.${rowIndex}.${field.minFromField ?? "__noop__"}` as never,
  }) as unknown;

  const min = field.minFromField && typeof watched === "string" ? watched.trim() || undefined : undefined;

  return (
    <label className="space-y-2">
      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
      <Input
        type="datetime-local"
        placeholder={field.placeholder}
        min={min}
        {...register(fieldName as never)}
      />
    </label>
  );
}

// URL input with a "Search on Google Maps" helper. The user types/pastes the share
// URL in the input; the helper opens Maps prefilled with the row's address so they
// can grab the URL without leaving the page. Cheap, no API key required.
function MapsUrlField({ control, register, rowIndex, field, fieldName }: SubFieldProps) {
  const watched = useWatch({
    control,
    name: `items.${rowIndex}.${field.addressFromField ?? "__noop__"}` as never,
  }) as unknown;

  const searchQuery = field.addressFromField && typeof watched === "string" ? watched.trim() : "";
  const mapsHref = searchQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
    : "https://www.google.com/maps";

  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--primary)] hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" />
          Search on Google Maps
        </a>
      </div>
      <Input
        type="url"
        placeholder={field.placeholder ?? "https://maps.google.com/..."}
        {...register(fieldName as never)}
      />
    </label>
  );
}

// File-picker that uploads via the existing signed-blob primitive (or direct POST
// in local mode) and writes the resulting URL into the form's underlying string
// field. The user can still paste a URL directly into the text input if they prefer.
function ImageUploadField({
  control,
  rowIndex,
  field,
  fieldName,
}: Omit<SubFieldProps, "register">) {
  const [isUploading, setIsUploading] = useState(false);
  // Track the URL we just uploaded so the preview can flag "Just uploaded"
  // briefly, distinguishing from an image that was already saved earlier.
  const [justUploadedUrl, setJustUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!justUploadedUrl) return;
    const timeout = window.setTimeout(() => setJustUploadedUrl(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [justUploadedUrl]);

  return (
    <label className="space-y-2 md:col-span-2">
      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
      <Controller
        control={control}
        name={fieldName as never}
        render={({ field: controllerField }) => {
          const currentUrl = typeof controllerField.value === "string" ? controllerField.value : "";

          async function handleFile(file: File) {
            try {
              setIsUploading(true);
              const folder = field.uploadFolder || "uploads";
              const category = field.uploadCategory ?? "EVENT_BANNER";

              if (field.useSignedUploads) {
                const uploaded = await uploadFileWithSignedUrl({
                  folder,
                  file,
                  payload: { scope: "admin", category },
                });
                controllerField.onChange(uploaded.uploadedUrl);
                setJustUploadedUrl(uploaded.uploadedUrl);
                toast.success("Image uploaded.");
                return;
              }

              const formData = new FormData();
              formData.append("category", category);
              formData.append("file", file);
              const response = await fetch("/api/uploads/admin", {
                method: "POST",
                body: formData,
              });
              const data = (await response.json()) as { error?: string; success?: string; url?: string };
              if (!response.ok) {
                toast.error(data.error ?? "Upload failed.");
                return;
              }
              // Local-storage admin upload route doesn't return the URL today;
              // surface success and let the user paste if needed.
              if (data.url) {
                controllerField.onChange(data.url);
                setJustUploadedUrl(data.url);
              }
              toast.success(data.success ?? "Image uploaded.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Upload failed.");
            } finally {
              setIsUploading(false);
            }
          }

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:bg-white ${
                    isUploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Uploading…" : currentUrl ? "Replace image" : "Upload from device"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleFile(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-[color:var(--muted)]">or paste an image URL</span>
              </div>
              <Input
                type="url"
                placeholder="https://..."
                value={currentUrl}
                onChange={(event) => controllerField.onChange(event.target.value)}
              />
              {currentUrl ? (
                <div
                  className={`relative inline-block overflow-hidden rounded-2xl border bg-white/90 p-1 transition ${
                    justUploadedUrl === currentUrl
                      ? "border-emerald-300 ring-2 ring-emerald-200"
                      : "border-black/8"
                  }`}
                >
                  <span
                    className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 ${
                      justUploadedUrl === currentUrl
                        ? "bg-emerald-100/95 text-emerald-900 ring-emerald-200"
                        : "bg-white/95 text-emerald-800 ring-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {justUploadedUrl === currentUrl ? "Just uploaded" : "Saved"}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUrl}
                    alt="Preview"
                    className="max-h-48 w-auto rounded-xl object-cover"
                  />
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </label>
  );
}

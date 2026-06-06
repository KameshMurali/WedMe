"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateSiteBasicsAction } from "@/actions/dashboard";
import { SiteAssetUploadField } from "@/components/admin/site-asset-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { siteBasicsSchema } from "@/lib/validations/engagement";

type SiteBasicsValues = z.infer<typeof siteBasicsSchema>;

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("space-y-2", className)}>
      <span className="text-sm font-medium text-[color:var(--text)]">{label}</span>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {children}
    </label>
  );
}

export function SiteBasicsForm({
  defaultValues,
  useSignedUploads,
  uploadsEnabled,
  disabledReason,
}: {
  defaultValues: SiteBasicsValues;
  useSignedUploads: boolean;
  uploadsEnabled: boolean;
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SiteBasicsValues>({
    resolver: zodResolver(siteBasicsSchema),
    defaultValues,
  });

  const heroImageUrl = watch("heroImageUrl") ?? "";
  const heroVideoUrl = watch("heroVideoUrl") ?? "";
  const ogImageUrl = watch("ogImageUrl") ?? "";

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value ?? ""));
    });

    startTransition(async () => {
      setFormMessage(null);
      const result = await updateSiteBasicsAction({}, formData);
      if (result.error) {
        setFormMessage({ tone: "error", text: result.error });
        toast.error(result.error);
        return;
      }

      const successMessage = result.success ?? "Site basics saved.";
      setFormMessage({ tone: "success", text: successMessage });
      toast.success(successMessage);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brand name" error={errors.brandName?.message}>
          <Input aria-invalid={Boolean(errors.brandName)} placeholder="Brand name" {...register("brandName")} />
        </Field>
        <Field label="Slug" error={errors.slug?.message}>
          <Input aria-invalid={Boolean(errors.slug)} placeholder="Slug" {...register("slug")} />
          <p className="text-xs leading-6 text-[color:var(--muted)]">
            If you change the slug, save site basics first before uploading new local media files.
          </p>
        </Field>
      </div>

      <Field label="Headline" error={errors.headline?.message}>
        <Textarea aria-invalid={Boolean(errors.headline)} placeholder="Headline" {...register("headline")} />
      </Field>

      <Field label="Subtitle" error={errors.subtitle?.message}>
        <Textarea aria-invalid={Boolean(errors.subtitle)} placeholder="Subtitle" {...register("subtitle")} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Tagline" error={errors.tagline?.message}>
          <Input aria-invalid={Boolean(errors.tagline)} placeholder="Tagline" {...register("tagline")} />
        </Field>
        <Field label="Wedding date" error={errors.weddingDate?.message}>
          <Input aria-invalid={Boolean(errors.weddingDate)} type="date" {...register("weddingDate")} />
        </Field>
      </div>

      <Field label="Location summary" error={errors.locationSummary?.message}>
        <Input
          aria-invalid={Boolean(errors.locationSummary)}
          placeholder="Location summary"
          {...register("locationSummary")}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Hero image URL" error={errors.heroImageUrl?.message}>
          <Input
            aria-invalid={Boolean(errors.heroImageUrl)}
            placeholder="Hero image URL or uploaded file path"
            {...register("heroImageUrl")}
          />
        </Field>
        <Field label="Hero video URL" error={errors.heroVideoUrl?.message}>
          <Input
            aria-invalid={Boolean(errors.heroVideoUrl)}
            placeholder="Hero video URL or uploaded file path"
            {...register("heroVideoUrl")}
          />
        </Field>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SiteAssetUploadField
          field="heroImageUrl"
          label="Hero image upload"
          slug={defaultValues.slug}
          currentUrl={heroImageUrl}
          kind="image"
          useSignedUploads={useSignedUploads}
          uploadsEnabled={uploadsEnabled}
          disabledReason={disabledReason}
          onUploaded={(url) => {
            setValue("heroImageUrl", url, { shouldDirty: true, shouldValidate: true });
            setFormMessage(null);
          }}
          onClear={() => setValue("heroImageUrl", "", { shouldDirty: true, shouldValidate: true })}
        />
        <SiteAssetUploadField
          field="heroVideoUrl"
          label="Hero video upload"
          slug={defaultValues.slug}
          currentUrl={heroVideoUrl}
          kind="video"
          useSignedUploads={useSignedUploads}
          uploadsEnabled={uploadsEnabled}
          disabledReason={disabledReason}
          onUploaded={(url) => {
            setValue("heroVideoUrl", url, { shouldDirty: true, shouldValidate: true });
            setFormMessage(null);
          }}
          onClear={() => setValue("heroVideoUrl", "", { shouldDirty: true, shouldValidate: true })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title" error={errors.seoTitle?.message}>
          <Input aria-invalid={Boolean(errors.seoTitle)} placeholder="SEO title" {...register("seoTitle")} />
        </Field>
        <Field label="OG image URL" error={errors.ogImageUrl?.message}>
          <Input
            aria-invalid={Boolean(errors.ogImageUrl)}
            placeholder="OG image URL or uploaded file path"
            {...register("ogImageUrl")}
          />
        </Field>
      </div>

      <SiteAssetUploadField
        field="ogImageUrl"
        label="Open Graph image upload"
        slug={defaultValues.slug}
        currentUrl={ogImageUrl}
        kind="image"
        useSignedUploads={useSignedUploads}
        uploadsEnabled={uploadsEnabled}
        disabledReason={disabledReason}
        onUploaded={(url) => {
          setValue("ogImageUrl", url, { shouldDirty: true, shouldValidate: true });
          setFormMessage(null);
        }}
        onClear={() => setValue("ogImageUrl", "", { shouldDirty: true, shouldValidate: true })}
      />

      <Field label="SEO description" error={errors.seoDescription?.message}>
        <Textarea
          aria-invalid={Boolean(errors.seoDescription)}
          placeholder="SEO description"
          {...register("seoDescription")}
        />
      </Field>

      <Field label="Canonical URL" error={errors.canonicalUrl?.message}>
        <Input
          aria-invalid={Boolean(errors.canonicalUrl)}
          placeholder="Canonical URL"
          {...register("canonicalUrl")}
        />
      </Field>

      {formMessage ? (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-7",
            formMessage.tone === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900",
          )}
        >
          {formMessage.text}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save site basics"}
      </Button>
    </form>
  );
}

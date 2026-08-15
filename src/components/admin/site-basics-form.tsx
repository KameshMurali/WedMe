"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateSiteBasicsAction } from "@/actions/dashboard";
import { AiDraftButton } from "@/components/admin/ai-draft-button";
import { SiteAssetUploadField } from "@/components/admin/site-asset-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deriveCanonicalUrl, deriveSeoDescription, deriveSeoTitle } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";
import { siteBasicsSchema } from "@/lib/validations/engagement";

type SiteBasicsValues = z.infer<typeof siteBasicsSchema>;

function Field({
  label,
  error,
  children,
  className,
  action,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  // Optional trailing control (e.g. the AI draft button). When present the
  // wrapper is a div, not a label — a button inside a label becomes the
  // label's activation target, so caption clicks would trigger it.
  action?: React.ReactNode;
}) {
  const Wrapper = action ? "div" : "label";
  return (
    <Wrapper className={cn("space-y-2", className)}>
      <span className="flex flex-wrap items-end justify-between gap-2">
        <span className="text-sm font-medium text-[color:var(--text)]">{label}</span>
        {action ?? null}
      </span>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {children}
    </Wrapper>
  );
}

export function SiteBasicsForm({
  defaultValues,
  useSignedUploads,
  uploadsEnabled,
  disabledReason,
  aiEnabled = false,
  aiRemainingToday = 0,
  aiRemainingLifetime = null,
}: {
  defaultValues: SiteBasicsValues;
  useSignedUploads: boolean;
  uploadsEnabled: boolean;
  disabledReason?: string | null;
  aiEnabled?: boolean;
  aiRemainingToday?: number;
  aiRemainingLifetime?: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<SiteBasicsValues>({
    resolver: zodResolver(siteBasicsSchema),
    defaultValues,
  });

  const heroImageUrl = watch("heroImageUrl") ?? "";
  const heroVideoUrl = watch("heroVideoUrl") ?? "";
  const ogImageUrl = watch("ogImageUrl") ?? "";

  // Live preview of what we'll publish when the SEO fields are left blank, so
  // the placeholders update as the couple edits their names/date/location.
  const partnerOneName = watch("partnerOneName") ?? "";
  const partnerTwoName = watch("partnerTwoName") ?? "";
  const brandName = watch("brandName") ?? "";
  const weddingDate = watch("weddingDate") ?? "";
  const locationSummary = watch("locationSummary") ?? "";
  const autoMeta = useMemo(() => {
    const coupleNames = [partnerOneName, partnerTwoName].filter(Boolean).join(" & ");
    const source = {
      slug: defaultValues.slug,
      brandName,
      coupleNames,
      weddingDate: weddingDate || null,
      locationSummary: locationSummary || null,
      heroImageUrl: heroImageUrl || null,
    };
    return {
      title: deriveSeoTitle(source),
      description: deriveSeoDescription(source),
      canonicalUrl: deriveCanonicalUrl(source),
    };
  }, [
    partnerOneName,
    partnerTwoName,
    brandName,
    weddingDate,
    locationSummary,
    heroImageUrl,
    defaultValues.slug,
  ]);

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
        <Field label="Partner one name" error={errors.partnerOneName?.message}>
          <Input
            aria-invalid={Boolean(errors.partnerOneName)}
            placeholder="Partner one name"
            {...register("partnerOneName")}
          />
        </Field>
        <Field label="Partner two name" error={errors.partnerTwoName?.message}>
          <Input
            aria-invalid={Boolean(errors.partnerTwoName)}
            placeholder="Partner two name"
            {...register("partnerTwoName")}
          />
        </Field>
      </div>

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

      <Field
        label="Subtitle"
        error={errors.subtitle?.message}
        action={
          aiEnabled ? (
            <AiDraftButton
              kind="welcome_hero"
              getHint={() => String(getValues("subtitle") ?? "")}
              onDraft={(text) =>
                setValue("subtitle", text, { shouldDirty: true, shouldValidate: true })
              }
              initialRemainingToday={aiRemainingToday}
              initialRemainingLifetime={aiRemainingLifetime}
            />
          ) : undefined
        }
      >
        <Textarea aria-invalid={Boolean(errors.subtitle)} placeholder="Subtitle" {...register("subtitle")} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Tagline"
          error={errors.tagline?.message}
          action={
            aiEnabled ? (
              <AiDraftButton
                kind="welcome_hero"
                getHint={() => String(getValues("tagline") ?? "")}
                onDraft={(text) =>
                  setValue("tagline", text, { shouldDirty: true, shouldValidate: true })
                }
                initialRemainingToday={aiRemainingToday}
                initialRemainingLifetime={aiRemainingLifetime}
              />
            ) : undefined
          }
        >
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

      {/* Search & sharing is handled automatically from the couple's own
          content — these overrides are collapsed so nobody has to understand
          "Open Graph" or "canonical URL" to publish a good-looking site. Each
          placeholder shows the exact value that will be used when left blank. */}
      <details className="group rounded-3xl border border-black/8 bg-white/60 p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-semibold text-[color:var(--text)]">
              Search &amp; sharing (optional)
            </span>
            <span className="mt-1 block text-xs leading-6 text-[color:var(--muted)]">
              We fill these in automatically from your names, date, and photos. Open only if you
              want to override what Google and WhatsApp show.
            </span>
          </span>
          <span className="flex-none rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[color:var(--muted)] transition group-open:bg-[color:var(--accent)]/15 group-open:text-[color:var(--primary)]">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span>
          </span>
        </summary>

        <div className="mt-5 space-y-4 border-t border-black/5 pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Search title" error={errors.seoTitle?.message}>
              <Input
                aria-invalid={Boolean(errors.seoTitle)}
                placeholder={autoMeta.title}
                {...register("seoTitle")}
              />
            </Field>
            <Field label="Share image URL" error={errors.ogImageUrl?.message}>
              <Input
                aria-invalid={Boolean(errors.ogImageUrl)}
                placeholder={heroImageUrl ? "Using your hero photo" : "Using the ToNewBeginning card"}
                {...register("ogImageUrl")}
              />
            </Field>
          </div>

          <SiteAssetUploadField
            field="ogImageUrl"
            label="Share image upload"
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

          <Field label="Search description" error={errors.seoDescription?.message}>
            <Textarea
              aria-invalid={Boolean(errors.seoDescription)}
              placeholder={autoMeta.description}
              {...register("seoDescription")}
            />
          </Field>

          <Field label="Canonical URL" error={errors.canonicalUrl?.message}>
            <Input
              aria-invalid={Boolean(errors.canonicalUrl)}
              placeholder={autoMeta.canonicalUrl}
              {...register("canonicalUrl")}
            />
          </Field>

          <p className="text-xs leading-6 text-[color:var(--muted)]">
            Leave any field blank and we use the greyed-out value shown in it.
          </p>
        </div>
      </details>

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

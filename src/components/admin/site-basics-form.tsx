"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { updateSiteBasicsAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteBasicsSchema } from "@/lib/validations/engagement";

type SiteBasicsValues = z.infer<typeof siteBasicsSchema>;

export function SiteBasicsForm({ defaultValues }: { defaultValues: SiteBasicsValues }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteBasicsValues>({
    resolver: zodResolver(siteBasicsSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value ?? ""));
    });

    startTransition(async () => {
      const result = await updateSiteBasicsAction({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? "Saved");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Brand name" {...register("brandName")} />
        <Input placeholder="Slug" {...register("slug")} />
      </div>
      <Textarea placeholder="Headline" {...register("headline")} />
      <Textarea placeholder="Subtitle" {...register("subtitle")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Tagline" {...register("tagline")} />
        <Input type="date" {...register("weddingDate")} />
      </div>
      <Input placeholder="Location summary" {...register("locationSummary")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Hero image URL" {...register("heroImageUrl")} />
        <Input placeholder="Hero video URL" {...register("heroVideoUrl")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="SEO title" {...register("seoTitle")} />
        <Input placeholder="OG image URL" {...register("ogImageUrl")} />
      </div>
      <Textarea placeholder="SEO description" {...register("seoDescription")} />
      <Input placeholder="Canonical URL" {...register("canonicalUrl")} />
      {errors.headline ? <p className="text-sm text-rose-600">{errors.headline.message}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save site basics"}
      </Button>
    </form>
  );
}

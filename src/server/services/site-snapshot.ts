import { type SiteStatus, type SiteVisibility } from "@prisma/client";

import { findTemplateByKey } from "@/lib/template-registry";
import type { SiteSnapshot } from "@/types";
import {
  getWeddingSiteBySlug,
  getWeddingSiteForUser,
  type WeddingSiteRecord,
} from "@/server/repositories/wedding-site";

function buildSnapshot(record: WeddingSiteRecord): SiteSnapshot {
  const template = findTemplateByKey(record.templatePreset.key);

  return {
    site: {
      id: record.id,
      slug: record.slug,
      brandName: record.brandName,
      headline: record.headline,
      subtitle: record.subtitle,
      tagline: record.tagline,
      weddingDate: record.weddingDate.toISOString(),
      heroImageUrl: record.heroImageUrl,
      heroVideoUrl: record.heroVideoUrl,
      locationSummary: record.locationSummary,
      seoTitle: record.seoTitle,
      seoDescription: record.seoDescription,
      ogImageUrl: record.ogImageUrl,
      canonicalUrl: record.canonicalUrl,
      coupleNames: `${record.couple.partnerOneName} & ${record.couple.partnerTwoName}`,
    },
    theme: {
      templateKey: record.templatePreset.key,
      templateName: record.templatePreset.name,
      paletteKey: record.theme?.paletteKey ?? template.themeDefaults.paletteKey,
      headingFontKey: record.theme?.headingFontKey ?? template.themeDefaults.headingFontKey,
      bodyFontKey: record.theme?.bodyFontKey ?? template.themeDefaults.bodyFontKey,
      primaryColor: record.theme?.primaryColor ?? template.themeDefaults.primaryColor,
      accentColor: record.theme?.accentColor ?? template.themeDefaults.accentColor,
      backgroundColor: record.theme?.backgroundColor ?? template.themeDefaults.backgroundColor,
      surfaceColor: record.theme?.surfaceColor ?? template.themeDefaults.surfaceColor,
      textColor: record.theme?.textColor ?? template.themeDefaults.textColor,
      mutedColor: record.theme?.mutedColor ?? template.themeDefaults.mutedColor,
      borderRadius: record.theme?.borderRadius ?? template.themeDefaults.borderRadius,
      buttonVariant: record.theme?.buttonVariant ?? template.themeDefaults.buttonVariant,
      shadowStyle: record.theme?.shadowStyle ?? template.themeDefaults.shadowStyle,
    },
    publish: {
      status: (record.publishSettings?.status ?? "DRAFT") as SiteStatus,
      visibility: (record.publishSettings?.visibility ?? "PUBLIC") as SiteVisibility,
      noIndex: record.publishSettings?.noIndex ?? false,
      isRsvpOpen: record.publishSettings?.isRsvpOpen ?? true,
      isUploadsOpen: record.publishSettings?.isUploadsOpen ?? true,
      isMessagesOpen: record.publishSettings?.isMessagesOpen ?? true,
      publishedAt: record.publishSettings?.publishedAt?.toISOString() ?? null,
    },
    sections: record.sectionConfigs.map((section) => ({
      type: section.type,
      enabled: section.enabled,
      position: section.position,
      label: section.label,
    })),
    storyMilestones: record.storyMilestones.map((item) => ({
      id: item.id,
      title: item.title,
      shortLabel: item.shortLabel,
      eventDateLabel: item.eventDateLabel,
      description: item.description,
      imageUrl: item.imageUrl,
    })),
    events: record.events.map((event) => ({
      id: event.id,
      title: event.title,
      subtitle: event.subtitle,
      description: event.description,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime.toISOString(),
      dayLabel: event.dayLabel,
      locationName: event.locationName,
      fullAddress: event.fullAddress,
      googleMapsUrl: event.googleMapsUrl,
      dressCode: event.dressCode,
      notes: event.notes,
      imageUrl: event.imageUrl,
      rsvpRequired: event.rsvpRequired,
      audience: event.audience,
      contactName: event.contactName,
      contactPhone: event.contactPhone,
    })),
    scheduleItems: record.scheduleItems.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      startDateTime: item.startDateTime.toISOString(),
      endDateTime: item.endDateTime?.toISOString() ?? null,
      dayLabel: item.dayLabel,
      locationName: item.locationName,
    })),
    tidbits: record.tidbits.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      category: item.category,
      iconKey: item.iconKey,
    })),
    faqItems: record.faqItems.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
    })),
    travelGuideItems: record.travelGuideItems.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      description: item.description,
      url: item.url,
    })),
    dressCodeGuides: record.dressCodeGuides.map((item) => ({
      id: item.id,
      title: item.title,
      guidance: item.guidance,
      inspirationImage: item.inspirationImage,
      palette: Array.isArray(item.palette) ? item.palette.map(String) : [],
      eventTitle: item.event?.title ?? null,
    })),
    mediaAssets: record.mediaAssets.map((asset) => ({
      id: asset.id,
      category: asset.category,
      title: asset.title,
      altText: asset.altText,
      caption: asset.caption,
      url: asset.url,
    })),
    embeddedVideos: record.embeddedVideos.map((video) => ({
      id: video.id,
      title: video.title,
      typeLabel: video.typeLabel,
      youtubeUrl: video.youtubeUrl,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
    })),
  };
}

export async function getPublishedSiteSnapshot(slug: string) {
  const record = await getWeddingSiteBySlug(slug);
  if (!record || !record.publishSettings) {
    return null;
  }

  if (record.publishSettings.status !== "PUBLISHED") {
    return null;
  }

  if (record.publishSettings.publishedSnapshot) {
    return record.publishSettings.publishedSnapshot as SiteSnapshot;
  }

  return buildSnapshot(record);
}

export async function getDraftSiteSnapshotForUser(userId: string) {
  const record = await getWeddingSiteForUser(userId);
  if (!record) {
    return null;
  }

  return buildSnapshot(record);
}

export function buildPublishSnapshot(record: WeddingSiteRecord) {
  return buildSnapshot(record);
}

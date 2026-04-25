import { type SiteStatus, type SiteVisibility } from "@prisma/client";

import { findTemplateByKey } from "@/lib/template-registry";
import type { SiteSnapshot } from "@/types";
import { demoSiteSnapshot, isDemoSiteSlug, isDemoUserId } from "@/server/services/demo-site";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asNullableString(value: unknown, fallback: string | null = null) {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizePublishedSnapshot(record: WeddingSiteRecord, snapshotValue: unknown): SiteSnapshot {
  const base = buildSnapshot(record);

  if (!isRecord(snapshotValue)) {
    return base;
  }

  const snapshotSite = isRecord(snapshotValue.site) ? snapshotValue.site : {};
  const snapshotTheme = isRecord(snapshotValue.theme) ? snapshotValue.theme : {};
  const snapshotPublish = isRecord(snapshotValue.publish) ? snapshotValue.publish : {};

  const storyMilestones = Array.isArray(snapshotValue.storyMilestones)
    ? snapshotValue.storyMilestones
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `story-${index}`),
          title: asString(item.title, "Story milestone"),
          shortLabel: asNullableString(item.shortLabel),
          eventDateLabel: asString(item.eventDateLabel, "Coming soon"),
          description: asString(item.description, ""),
          imageUrl: asNullableString(item.imageUrl),
        }))
    : base.storyMilestones;

  const events = Array.isArray(snapshotValue.events)
    ? snapshotValue.events
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `event-${index}`),
          title: asString(item.title, "Wedding event"),
          subtitle: asNullableString(item.subtitle),
          description: asString(item.description, ""),
          startDateTime: asString(item.startDateTime, base.site.weddingDate),
          endDateTime: asString(item.endDateTime, asString(item.startDateTime, base.site.weddingDate)),
          dayLabel: asString(item.dayLabel, "Celebration day"),
          locationName: asString(item.locationName, "Venue details coming soon"),
          fullAddress: asString(item.fullAddress, ""),
          googleMapsUrl: asNullableString(item.googleMapsUrl),
          dressCode: asNullableString(item.dressCode),
          notes: asNullableString(item.notes),
          imageUrl: asNullableString(item.imageUrl),
          rsvpRequired: asBoolean(item.rsvpRequired, true),
          audience: asString(item.audience, "ALL_GUESTS"),
          contactName: asNullableString(item.contactName),
          contactPhone: asNullableString(item.contactPhone),
        }))
    : base.events;

  const scheduleItems = Array.isArray(snapshotValue.scheduleItems)
    ? snapshotValue.scheduleItems
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `schedule-${index}`),
          title: asString(item.title, "Schedule item"),
          category: asString(item.category, "Timeline"),
          description: asNullableString(item.description),
          startDateTime: asString(item.startDateTime, base.site.weddingDate),
          endDateTime: asNullableString(item.endDateTime),
          dayLabel: asString(item.dayLabel, "Celebration day"),
          locationName: asNullableString(item.locationName),
        }))
    : base.scheduleItems;

  const tidbits = Array.isArray(snapshotValue.tidbits)
    ? snapshotValue.tidbits
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `tidbit-${index}`),
          title: asString(item.title, "Tidbit"),
          body: asString(item.body, ""),
          category: asString(item.category, "Things to know"),
          iconKey: asNullableString(item.iconKey),
        }))
    : base.tidbits;

  const faqItems = Array.isArray(snapshotValue.faqItems)
    ? snapshotValue.faqItems
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `faq-${index}`),
          question: asString(item.question, "Question"),
          answer: asString(item.answer, ""),
          category: asString(item.category, "General"),
        }))
    : base.faqItems;

  const travelGuideItems = Array.isArray(snapshotValue.travelGuideItems)
    ? snapshotValue.travelGuideItems
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `travel-${index}`),
          category: asString(item.category, "FAQ"),
          title: asString(item.title, "Guest guide"),
          description: asString(item.description, ""),
          url: asNullableString(item.url),
        }))
    : base.travelGuideItems;

  const dressCodeGuides = Array.isArray(snapshotValue.dressCodeGuides)
    ? snapshotValue.dressCodeGuides
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `dress-${index}`),
          title: asString(item.title, "Dress code"),
          guidance: asString(item.guidance, ""),
          inspirationImage: asNullableString(item.inspirationImage),
          palette: Array.isArray(item.palette) ? item.palette.map((value) => String(value)) : [],
          eventTitle: asNullableString(item.eventTitle),
        }))
    : base.dressCodeGuides;

  const mediaAssets = Array.isArray(snapshotValue.mediaAssets)
    ? snapshotValue.mediaAssets
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `media-${index}`),
          category: asString(item.category, "GALLERY"),
          title: asNullableString(item.title),
          altText: asNullableString(item.altText),
          caption: asNullableString(item.caption),
          url: asString(item.url, base.site.heroImageUrl ?? ""),
        }))
        .filter((item) => item.url.length > 0)
    : base.mediaAssets;

  const embeddedVideos = Array.isArray(snapshotValue.embeddedVideos)
    ? snapshotValue.embeddedVideos
        .filter(isRecord)
        .map((item, index) => ({
          id: asString(item.id, `video-${index}`),
          title: asString(item.title, "Wedding video"),
          typeLabel: asString(item.typeLabel, "Video"),
          youtubeUrl: asString(item.youtubeUrl, ""),
          youtubeId: asString(item.youtubeId, ""),
          thumbnailUrl: asNullableString(item.thumbnailUrl),
        }))
        .filter((item) => item.youtubeId.length > 0)
    : base.embeddedVideos;

  const sections = Array.isArray(snapshotValue.sections)
    ? snapshotValue.sections
        .filter(isRecord)
        .map((item, index) => ({
          type: asString(item.type, `SECTION_${index}`),
          enabled: asBoolean(item.enabled, true),
          position: typeof item.position === "number" ? item.position : index,
          label: asString(item.label, "Section"),
        }))
    : base.sections;

  return {
    site: {
      ...base.site,
      brandName: asString(snapshotSite.brandName, base.site.brandName),
      headline: asString(snapshotSite.headline, base.site.headline),
      subtitle: asNullableString(snapshotSite.subtitle, base.site.subtitle),
      tagline: asNullableString(snapshotSite.tagline, base.site.tagline),
      weddingDate: asString(snapshotSite.weddingDate, base.site.weddingDate),
      heroImageUrl: asNullableString(snapshotSite.heroImageUrl, base.site.heroImageUrl),
      heroVideoUrl: asNullableString(snapshotSite.heroVideoUrl, base.site.heroVideoUrl),
      locationSummary: asNullableString(snapshotSite.locationSummary, base.site.locationSummary),
      seoTitle: asNullableString(snapshotSite.seoTitle, base.site.seoTitle),
      seoDescription: asNullableString(snapshotSite.seoDescription, base.site.seoDescription),
      ogImageUrl: asNullableString(snapshotSite.ogImageUrl, base.site.ogImageUrl),
      canonicalUrl: base.site.canonicalUrl,
      coupleNames: asString(snapshotSite.coupleNames, base.site.coupleNames),
    },
    theme: {
      ...base.theme,
      templateKey: asString(snapshotTheme.templateKey, base.theme.templateKey),
      templateName: asString(snapshotTheme.templateName, base.theme.templateName),
      paletteKey: asString(snapshotTheme.paletteKey, base.theme.paletteKey),
      headingFontKey: asString(snapshotTheme.headingFontKey, base.theme.headingFontKey),
      bodyFontKey: asString(snapshotTheme.bodyFontKey, base.theme.bodyFontKey),
      primaryColor: asString(snapshotTheme.primaryColor, base.theme.primaryColor),
      accentColor: asString(snapshotTheme.accentColor, base.theme.accentColor),
      backgroundColor: asString(snapshotTheme.backgroundColor, base.theme.backgroundColor),
      surfaceColor: asString(snapshotTheme.surfaceColor, base.theme.surfaceColor),
      textColor: asString(snapshotTheme.textColor, base.theme.textColor),
      mutedColor: asString(snapshotTheme.mutedColor, base.theme.mutedColor),
      borderRadius: asString(snapshotTheme.borderRadius, base.theme.borderRadius),
      buttonVariant: asString(snapshotTheme.buttonVariant, base.theme.buttonVariant),
      shadowStyle: asString(snapshotTheme.shadowStyle, base.theme.shadowStyle),
    },
    publish: {
      ...base.publish,
      status: base.publish.status,
      visibility: base.publish.visibility,
      noIndex: base.publish.noIndex,
      isRsvpOpen: base.publish.isRsvpOpen,
      isUploadsOpen: base.publish.isUploadsOpen,
      isMessagesOpen: base.publish.isMessagesOpen,
      publishedAt: base.publish.publishedAt ?? asNullableString(snapshotPublish.publishedAt),
    },
    sections,
    storyMilestones,
    events,
    scheduleItems,
    tidbits,
    faqItems,
    travelGuideItems,
    dressCodeGuides,
    mediaAssets,
    embeddedVideos,
  };
}

export async function getPublishedSiteSnapshot(slug: string) {
  try {
    const record = await getWeddingSiteBySlug(slug);
    if (!record || !record.publishSettings) {
      return isDemoSiteSlug(slug) ? demoSiteSnapshot : null;
    }

    if (record.publishSettings.status !== "PUBLISHED") {
      if (isDemoSiteSlug(slug)) {
        return record.publishSettings.publishedSnapshot
          ? normalizePublishedSnapshot(record, record.publishSettings.publishedSnapshot)
          : buildSnapshot(record);
      }

      return null;
    }

    if (record.publishSettings.publishedSnapshot) {
      return normalizePublishedSnapshot(record, record.publishSettings.publishedSnapshot);
    }

    return buildSnapshot(record);
  } catch (error) {
    console.error("Failed to load published site snapshot", error);
    return isDemoSiteSlug(slug) ? demoSiteSnapshot : null;
  }
}

export async function getDraftSiteSnapshotForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoSiteSnapshot;
  }

  try {
    const record = await getWeddingSiteForUser(userId);
    if (!record) {
      return null;
    }

    return buildSnapshot(record);
  } catch (error) {
    console.error("Failed to load draft site snapshot", error);
    return null;
  }
}

export function buildPublishSnapshot(record: WeddingSiteRecord) {
  return buildSnapshot(record);
}

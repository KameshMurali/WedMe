import { type Prisma } from "@prisma/client";

import { reservedSlugs, sectionLabels, sectionOrder } from "@/lib/constants";
import { findTemplateByKey } from "@/lib/template-registry";
import { slugify } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import {
  demoDashboardSite,
  demoDashboardSummary,
  isDemoSiteId,
  isDemoSiteSlug,
  isDemoUserId,
} from "@/server/services/demo-site";
import { ensureTemplatePresetByKey } from "@/server/services/template-presets";

export const weddingSiteInclude = {
  couple: true,
  templatePreset: true,
  theme: true,
  publishSettings: true,
  sectionConfigs: {
    orderBy: {
      position: "asc",
    },
  },
  storyMilestones: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  events: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  scheduleItems: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  tidbits: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  faqItems: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  travelGuideItems: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  dressCodeGuides: {
    include: {
      event: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  mediaAssets: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  embeddedVideos: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  inviteGroups: {
    include: {
      guests: true,
      responses: {
        include: {
          eventSelections: true,
        },
      },
    },
  },
  rsvpResponses: {
    include: {
      eventSelections: {
        include: {
          event: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  guestUploads: {
    include: {
      event: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  guestMessages: {
    orderBy: {
      createdAt: "desc",
    },
  },
  analyticsEvents: {
    orderBy: {
      occurredAt: "desc",
    },
  },
} satisfies Prisma.WeddingSiteInclude;

const editableWeddingSiteSelect = {
  id: true,
  slug: true,
} satisfies Prisma.WeddingSiteSelect;

const workspaceShellSelect = {
  id: true,
  slug: true,
  brandName: true,
  couple: {
    select: {
      partnerOneName: true,
      partnerTwoName: true,
    },
  },
  publishSettings: {
    select: {
      status: true,
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const dashboardOverviewSelect = {
  id: true,
  rsvpResponses: {
    select: {
      id: true,
      guestName: true,
      status: true,
      attendeeCount: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  },
} satisfies Prisma.WeddingSiteSelect;

const templateSettingsSelect = {
  templatePreset: {
    select: {
      key: true,
    },
  },
  theme: {
    select: {
      paletteKey: true,
      headingFontKey: true,
      bodyFontKey: true,
      primaryColor: true,
      accentColor: true,
      backgroundColor: true,
      surfaceColor: true,
      textColor: true,
      mutedColor: true,
      borderRadius: true,
      buttonVariant: true,
      shadowStyle: true,
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const contentEditorSelect = {
  slug: true,
  storyMilestones: {
    select: {
      title: true,
      shortLabel: true,
      eventDateLabel: true,
      description: true,
      imageUrl: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  tidbits: {
    select: {
      title: true,
      body: true,
      category: true,
      iconKey: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  faqItems: {
    select: {
      question: true,
      answer: true,
      category: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  travelGuideItems: {
    select: {
      category: true,
      title: true,
      description: true,
      url: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  dressCodeGuides: {
    select: {
      eventId: true,
      title: true,
      guidance: true,
      inspirationImage: true,
      palette: true,
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  events: {
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  embeddedVideos: {
    select: {
      title: true,
      typeLabel: true,
      youtubeUrl: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const eventsEditorSelect = {
  events: {
    select: {
      title: true,
      subtitle: true,
      description: true,
      startDateTime: true,
      endDateTime: true,
      dayLabel: true,
      locationName: true,
      fullAddress: true,
      googleMapsUrl: true,
      dressCode: true,
      notes: true,
      imageUrl: true,
      rsvpRequired: true,
      audience: true,
      contactName: true,
      contactPhone: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  scheduleItems: {
    select: {
      title: true,
      category: true,
      description: true,
      startDateTime: true,
      endDateTime: true,
      dayLabel: true,
      locationName: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const rsvpManagerSelect = {
  slug: true,
  rsvpResponses: {
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      status: true,
      attendeeCount: true,
      inviteCode: true,
      mealPreference: true,
      accessibilityNeeds: true,
      travelNotes: true,
      noteToCouple: true,
      eventSelections: {
        select: {
          id: true,
          status: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const uploadManagerSelect = {
  guestUploads: {
    select: {
      id: true,
      caption: true,
      submitterName: true,
      message: true,
      type: true,
      status: true,
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  guestMessages: {
    select: {
      id: true,
      authorName: true,
      visibility: true,
      status: true,
      message: true,
      feedback: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.WeddingSiteSelect;

const settingsSiteSelect = {
  id: true,
  slug: true,
  brandName: true,
  headline: true,
  subtitle: true,
  tagline: true,
  weddingDate: true,
  locationSummary: true,
  heroImageUrl: true,
  heroVideoUrl: true,
  seoTitle: true,
  seoDescription: true,
  ogImageUrl: true,
  canonicalUrl: true,
  publishSettings: {
    select: {
      visibility: true,
      status: true,
      noIndex: true,
      isRsvpOpen: true,
      isUploadsOpen: true,
      isMessagesOpen: true,
    },
  },
} satisfies Prisma.WeddingSiteSelect;

export type WeddingSiteRecord = Prisma.WeddingSiteGetPayload<{
  include: typeof weddingSiteInclude;
}>;

export type EditableWeddingSiteRecord = Prisma.WeddingSiteGetPayload<{
  select: typeof editableWeddingSiteSelect;
}>;

export type WorkspaceShellRecord = Prisma.WeddingSiteGetPayload<{
  select: typeof workspaceShellSelect;
}>;

function toTitleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getFallbackProfile(email: string) {
  const localPart = email.split("@")[0] ?? "celebration";
  const title = toTitleCase(localPart) || "Celebration";
  const partnerOneName = title;
  const partnerTwoName = "Partner";
  const brandName = `${partnerOneName} & ${partnerTwoName}`;
  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 6);

  return {
    partnerOneName,
    partnerTwoName,
    brandName,
    weddingDate,
  };
}

async function createAvailableSlug(
  transaction: Prisma.TransactionClient,
  preferredValue: string,
) {
  const normalizedBase = slugify(preferredValue).replace(/_/g, "-");
  const fallbackBase = normalizedBase.length >= 3 ? normalizedBase : "wedding-site";
  const base = reservedSlugs.includes(fallbackBase) ? `${fallbackBase}-site` : fallbackBase;

  for (let index = 0; index < 25; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await transaction.weddingSite.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36).slice(-6)}`;
}

async function bootstrapWorkspaceForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      couple: true,
    },
  });

  if (!user) {
    return null;
  }

  const template = findTemplateByKey("classic-elegant");

  return prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const existingSite = await transaction.weddingSite.findFirst({
      where: {
        couple: {
          primaryUserId: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingSite) {
      return existingSite;
    }

    const templatePreset = await ensureTemplatePresetByKey(template.key, transaction);
    const fallbackProfile = getFallbackProfile(user.email);
    const couple =
      user.couple ??
      (await transaction.couple.create({
        data: {
          primaryUserId: user.id,
          partnerOneName: fallbackProfile.partnerOneName,
          partnerTwoName: fallbackProfile.partnerTwoName,
          brandName: fallbackProfile.brandName,
          weddingDate: fallbackProfile.weddingDate,
        },
      }));

    const weddingDate = couple.weddingDate ?? fallbackProfile.weddingDate;
    const slug = await createAvailableSlug(
      transaction,
      couple.brandName || `${couple.partnerOneName}-${couple.partnerTwoName}`,
    );

    return transaction.weddingSite.create({
      data: {
        coupleId: couple.id,
        templatePresetId: templatePreset.id,
        slug,
        brandName: couple.brandName,
        headline: `${couple.partnerOneName} & ${couple.partnerTwoName} are getting married`,
        subtitle:
          "A joyful celebration filled with family, rituals, music, and beautiful memories.",
        tagline: "Welcome to our wedding website",
        weddingDate,
        locationSummary: "Location details coming soon",
        theme: {
          create: template.themeDefaults,
        },
        publishSettings: {
          create: {
            status: "DRAFT",
            visibility: "PUBLIC",
            isRsvpOpen: true,
            isUploadsOpen: true,
            isMessagesOpen: true,
            lastDraftSavedAt: new Date(),
          },
        },
        sectionConfigs: {
          create: sectionOrder.map((type, index) => ({
            type,
            label: sectionLabels[type],
            position: index,
            enabled: true,
          })),
        },
      },
      select: {
        id: true,
      },
    });
  });
}

async function ensureWeddingSiteIdForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite.id;
  }

  try {
    const site = await prisma.weddingSite.findFirst({
      where: {
        couple: {
          primaryUserId: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (site) {
      return site.id;
    }
  } catch (error) {
    console.error("ensureWeddingSiteIdForUser lookup failed", error);
  }

  try {
    const createdSite = await bootstrapWorkspaceForUser(userId);
    return createdSite?.id ?? null;
  } catch (error) {
    console.error("bootstrapWorkspaceForUser failed", error);
    return null;
  }
}

export async function getWeddingSiteBySlug(slug: string) {
  try {
    const site = await prisma.weddingSite.findUnique({
      where: { slug },
      include: weddingSiteInclude,
    });

    return site ?? (isDemoSiteSlug(slug) ? (demoDashboardSite as unknown as WeddingSiteRecord) : null);
  } catch (error) {
    console.error("getWeddingSiteBySlug failed", error);
    return isDemoSiteSlug(slug) ? (demoDashboardSite as unknown as WeddingSiteRecord) : null;
  }
}

export async function ensureWeddingSiteForUser(userId: string) {
  return ensureWeddingSiteIdForUser(userId);
}

export async function getEditableWeddingSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as EditableWeddingSiteRecord;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: editableWeddingSiteSelect,
    });
  } catch (error) {
    console.error("getEditableWeddingSiteForUser failed", error);
    return null;
  }
}

export async function getWorkspaceShellForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as WorkspaceShellRecord;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: workspaceShellSelect,
    });
  } catch (error) {
    console.error("getWorkspaceShellForUser failed", error);
    return null;
  }
}

export async function getDashboardOverviewForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof dashboardOverviewSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: dashboardOverviewSelect,
    });
  } catch (error) {
    console.error("getDashboardOverviewForUser failed", error);
    return null;
  }
}

export async function getTemplateSettingsForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof templateSettingsSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: templateSettingsSelect,
    });
  } catch (error) {
    console.error("getTemplateSettingsForUser failed", error);
    return null;
  }
}

export async function getContentEditorSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof contentEditorSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: contentEditorSelect,
    });
  } catch (error) {
    console.error("getContentEditorSiteForUser failed", error);
    return null;
  }
}

export async function getEventsEditorSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof eventsEditorSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: eventsEditorSelect,
    });
  } catch (error) {
    console.error("getEventsEditorSiteForUser failed", error);
    return null;
  }
}

export async function getRsvpManagerSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof rsvpManagerSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: rsvpManagerSelect,
    });
  } catch (error) {
    console.error("getRsvpManagerSiteForUser failed", error);
    return null;
  }
}

export async function getUploadManagerSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof uploadManagerSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: uploadManagerSelect,
    });
  } catch (error) {
    console.error("getUploadManagerSiteForUser failed", error);
    return null;
  }
}

export async function getSettingsSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as Prisma.WeddingSiteGetPayload<{
      select: typeof settingsSiteSelect;
    }>;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: settingsSiteSelect,
    });
  } catch (error) {
    console.error("getSettingsSiteForUser failed", error);
    return null;
  }
}

export async function getWeddingSiteForUser(userId: string) {
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as WeddingSiteRecord;
  }

  const siteId = await ensureWeddingSiteIdForUser(userId);
  if (!siteId) {
    return null;
  }

  try {
    return await prisma.weddingSite.findUnique({
      where: { id: siteId },
      include: weddingSiteInclude,
    });
  } catch (error) {
    console.error("getWeddingSiteForUser failed", error);
    return null;
  }
}

export async function getDashboardSummary(siteId: string) {
  if (isDemoSiteId(siteId)) {
    return demoDashboardSummary;
  }

  try {
    const [rsvpCount, attendingCount, uploadCount, messageCount, pageViews] = await Promise.all([
      prisma.rSVPResponse.count({ where: { weddingSiteId: siteId } }),
      prisma.rSVPResponse.aggregate({
        where: {
          weddingSiteId: siteId,
          status: "ATTENDING",
        },
        _sum: {
          attendeeCount: true,
        },
      }),
      prisma.guestUpload.count({ where: { weddingSiteId: siteId } }),
      prisma.guestMessage.count({ where: { weddingSiteId: siteId } }),
      prisma.analyticsEvent.count({
        where: {
          weddingSiteId: siteId,
          type: "PAGE_VIEW",
        },
      }),
    ]);

    return {
      rsvpCount,
      attendingCount: attendingCount._sum.attendeeCount ?? 0,
      uploadCount,
      messageCount,
      pageViews,
    };
  } catch (error) {
    console.error("getDashboardSummary failed", error);
    return {
      rsvpCount: 0,
      attendingCount: 0,
      uploadCount: 0,
      messageCount: 0,
      pageViews: 0,
    };
  }
}

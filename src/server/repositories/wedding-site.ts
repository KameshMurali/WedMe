import { type Prisma } from "@prisma/client";

import { reservedSlugs, sectionLabels, sectionOrder } from "@/lib/constants";
import { findTemplateByKey } from "@/lib/template-registry";
import { slugify } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import { demoDashboardSite, demoDashboardSummary, isDemoSiteId, isDemoSiteSlug, isDemoUserId } from "@/server/services/demo-site";
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

export type WeddingSiteRecord = Prisma.WeddingSiteGetPayload<{
  include: typeof weddingSiteInclude;
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
      include: weddingSiteInclude,
    });

    if (existingSite) {
      return existingSite as WeddingSiteRecord;
    }

    const templatePreset = await ensureTemplatePresetByKey(template.key, transaction);

    if (!templatePreset) {
      return null;
    }

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

    return (await transaction.weddingSite.create({
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
      include: weddingSiteInclude,
    })) as WeddingSiteRecord;
  });
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
  if (isDemoUserId(userId)) {
    return demoDashboardSite as unknown as WeddingSiteRecord;
  }

  try {
    const site = await prisma.weddingSite.findFirst({
      where: {
        couple: {
          primaryUserId: userId,
        },
      },
      include: weddingSiteInclude,
    });

    if (site) {
      return site;
    }
  } catch (error) {
    console.error("getWeddingSiteForUser failed", error);
  }

  try {
    return await bootstrapWorkspaceForUser(userId);
  } catch (error) {
    console.error("bootstrapWorkspaceForUser failed", error);
    return null;
  }
}

export async function getWeddingSiteForUser(userId: string) {
  return ensureWeddingSiteForUser(userId);
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

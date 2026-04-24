import { cache } from "react";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/server/prisma";

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

export const getWeddingSiteBySlug = cache(async (slug: string) =>
  prisma.weddingSite.findUnique({
    where: { slug },
    include: weddingSiteInclude,
  }),
);

export const getWeddingSiteForUser = cache(async (userId: string) =>
  prisma.weddingSite.findFirst({
    where: {
      couple: {
        primaryUserId: userId,
      },
    },
    include: weddingSiteInclude,
  }),
);

export async function getDashboardSummary(siteId: string) {
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
}

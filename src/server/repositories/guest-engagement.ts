import { demoGuestMessages, demoGuestUploads, isDemoSiteSlug, type PublicGuestMessage, type PublicGuestUpload } from "@/server/services/demo-site";
import { prisma } from "@/server/prisma";

export async function getApprovedGuestUploadsBySlug(slug: string): Promise<PublicGuestUpload[]> {
  try {
    const uploads = await prisma.guestUpload.findMany({
      where: {
        weddingSite: {
          slug,
        },
        status: "APPROVED",
      },
      select: {
        id: true,
        type: true,
        submitterName: true,
        caption: true,
        message: true,
        url: true,
        externalUrl: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return uploads.length === 0 && isDemoSiteSlug(slug) ? demoGuestUploads : uploads;
  } catch (error) {
    console.error("Failed to load approved guest uploads", error);
    return isDemoSiteSlug(slug) ? demoGuestUploads : [];
  }
}

export async function getApprovedGuestMessagesBySlug(slug: string): Promise<PublicGuestMessage[]> {
  try {
    const messages = await prisma.guestMessage.findMany({
      where: {
        weddingSite: {
          slug,
        },
        status: "APPROVED",
        visibility: "PUBLIC",
      },
      select: {
        id: true,
        authorName: true,
        message: true,
        feedback: true,
        visibility: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return messages.length === 0 && isDemoSiteSlug(slug) ? demoGuestMessages : messages;
  } catch (error) {
    console.error("Failed to load approved guest messages", error);
    return isDemoSiteSlug(slug) ? demoGuestMessages : [];
  }
}

import { prisma } from "@/server/prisma";

export async function getApprovedGuestUploadsBySlug(slug: string) {
  return prisma.guestUpload.findMany({
    where: {
      weddingSite: {
        slug,
      },
      status: "APPROVED",
    },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApprovedGuestMessagesBySlug(slug: string) {
  return prisma.guestMessage.findMany({
    where: {
      weddingSite: {
        slug,
      },
      status: "APPROVED",
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

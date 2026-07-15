import "server-only";

import { prisma } from "@/server/prisma";

export type WorkspaceFeedbackRow = {
  id: string;
  userEmail: string;
  siteSlug: string;
  category: string;
  rating: number | null;
  message: string;
  createdAt: Date;
};

export async function getWorkspaceFeedback(): Promise<WorkspaceFeedbackRow[]> {
  try {
    return await prisma.workspaceFeedback.findMany({
      select: {
        id: true,
        userEmail: true,
        siteSlug: true,
        category: true,
        rating: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getWorkspaceFeedback failed", error);
    return [];
  }
}

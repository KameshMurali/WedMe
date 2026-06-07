import "server-only";

import { prisma } from "@/server/prisma";

export type WaitlistRow = {
  id: string;
  email: string;
  planKey: string;
  currency: string;
  source: string | null;
  createdAt: Date;
};

export async function getWaitlistSignups(): Promise<WaitlistRow[]> {
  try {
    return await prisma.waitlistSignup.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getWaitlistSignups failed", error);
    return [];
  }
}

export type WaitlistSummary = {
  total: number;
  byPlan: Record<string, number>;
  byCurrency: Record<string, number>;
};

export function summarizeWaitlist(rows: WaitlistRow[]): WaitlistSummary {
  const byPlan: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};
  for (const row of rows) {
    byPlan[row.planKey] = (byPlan[row.planKey] ?? 0) + 1;
    byCurrency[row.currency] = (byCurrency[row.currency] ?? 0) + 1;
  }
  return { total: rows.length, byPlan, byCurrency };
}

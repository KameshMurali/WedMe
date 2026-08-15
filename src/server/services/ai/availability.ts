import "server-only";

import { env } from "@/lib/env";
import { isAdminUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { peekRateLimit } from "@/server/security/rate-limit";
import {
  AI_DRAFT_DAILY_ACTION,
  AI_DRAFT_DAILY_WINDOW_MS,
  aiDraftingEnabled,
} from "@/server/services/ai/config";
import { isDemoUserId } from "@/server/services/demo-site";
import { getPlanLimits, resolvePlanKey, type PlanUser } from "@/server/services/plan";

export type AiDraftAvailability = {
  enabled: boolean;
  // Attempts left in today's window ("You can attempt N more times today").
  remainingToday: number;
  // Free-tier lifetime teaser remaining; null = unlimited (paid plan / admin).
  remainingLifetime: number | null;
};

const disabledAvailability: AiDraftAvailability = {
  enabled: false,
  remainingToday: 0,
  remainingLifetime: 0,
};

// Server-component helper: initial values for the Draft-with-AI buttons.
// Non-consuming — reads the daily bucket via peekRateLimit so rendering a
// dashboard page never spends an attempt.
export async function getAiDraftAvailability(
  user: PlanUser & { id: string },
): Promise<AiDraftAvailability> {
  // No key ⇒ feature hidden. Demo workspace is read-only, so the buttons are
  // hidden there too rather than dead-ending on the read-only guard.
  if (!aiDraftingEnabled || isDemoUserId(user.id)) {
    return disabledAvailability;
  }

  const daily = await peekRateLimit({
    action: AI_DRAFT_DAILY_ACTION,
    limit: env.AI_DRAFT_DAILY_LIMIT,
    windowMs: AI_DRAFT_DAILY_WINDOW_MS,
    keyParts: [user.id],
  });

  // Admins see the paid experience — no lifetime teaser. Role OR allowlist,
  // matching isAdminUser everywhere else.
  if (isAdminUser(user)) {
    return { enabled: true, remainingToday: daily.remaining, remainingLifetime: null };
  }

  try {
    const couple = await prisma.couple.findUnique({
      where: { primaryUserId: user.id },
      select: { planKey: true, planExpiresAt: true, aiDraftCount: true },
    });

    const planKey = resolvePlanKey(couple?.planKey, couple?.planExpiresAt);
    const lifetimeLimit = getPlanLimits(planKey).aiLifetimeDrafts;
    const remainingLifetime =
      lifetimeLimit === null
        ? null
        : Math.max(0, lifetimeLimit - (couple?.aiDraftCount ?? 0));

    return { enabled: true, remainingToday: daily.remaining, remainingLifetime };
  } catch (error) {
    console.error("getAiDraftAvailability failed", error);
    // Don't falsely disable the button on a transient read failure — the
    // server action re-checks all quotas authoritatively before drafting.
    return {
      enabled: true,
      remainingToday: daily.remaining,
      remainingLifetime: getPlanLimits("hello").aiLifetimeDrafts,
    };
  }
}

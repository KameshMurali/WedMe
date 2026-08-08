"use server";

import { headers } from "next/headers";

import { env } from "@/lib/env";
import { findTemplateByKey } from "@/lib/template-registry";
import { formatDate } from "@/lib/utils";
import { aiDraftRequestSchema } from "@/lib/validations/ai";
import { isAdminEmail, requireUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { getEditableWeddingSiteForUser } from "@/server/repositories/wedding-site";
import { consumeRateLimit } from "@/server/security/rate-limit";
import {
  AI_DRAFT_BURST_ACTION,
  AI_DRAFT_BURST_LIMIT,
  AI_DRAFT_BURST_WINDOW_MS,
  AI_DRAFT_DAILY_ACTION,
  AI_DRAFT_DAILY_WINDOW_MS,
  aiDraftingEnabled,
} from "@/server/services/ai/config";
import { generateAiDraft } from "@/server/services/ai/draft";
import { demoWorkspaceReadOnlyMessage, isDemoSiteId } from "@/server/services/demo-site";
import { getPlanLimits, resolvePlanKey } from "@/server/services/plan";

// Deliberately NOT the FormData/ActionState signature — this returns data, not
// a mutation result. It never writes site content: the draft only lands in the
// form field, and the couple still clicks Save, so the existing replace*Action
// validation/authz path stays the single write path.
export type AiDraftActionResult = {
  draft?: string;
  remainingToday?: number;
  remainingLifetime?: number | null;
  error?: string;
};

export async function generateAiDraftAction(input: unknown): Promise<AiDraftActionResult> {
  const user = await requireUser();
  const site = await getEditableWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  if (isDemoSiteId(site.id)) return { error: demoWorkspaceReadOnlyMessage };

  // Defensive re-check — the UI already hides the buttons when no key is set.
  if (!aiDraftingEnabled) {
    return { error: "AI drafting isn't configured on this deployment yet." };
  }

  const parsed = aiDraftRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please review the drafting request and try again." };
  }

  // All drafting context comes from DB truth, never from the client.
  const record = await prisma.weddingSite.findUnique({
    where: { id: site.id },
    select: {
      weddingDate: true,
      locationSummary: true,
      templatePreset: { select: { key: true } },
      couple: {
        select: {
          id: true,
          partnerOneName: true,
          partnerTwoName: true,
          planKey: true,
          planExpiresAt: true,
          aiDraftCount: true,
        },
      },
    },
  });
  if (!record?.couple) {
    return { error: "No wedding site was found for this account." };
  }

  // Admin accounts (ADMIN_EMAILS) get the paid tier automatically for testing.
  const planKey = isAdminEmail(user.email)
    ? "forever"
    : resolvePlanKey(record.couple.planKey, record.couple.planExpiresAt);
  const lifetimeLimit = getPlanLimits(planKey).aiLifetimeDrafts;

  if (lifetimeLimit !== null && record.couple.aiDraftCount >= lifetimeLimit) {
    return {
      error: `You've used all ${lifetimeLimit} free drafts. Upgrade to Together for unlimited AI drafting.`,
      remainingLifetime: 0,
    };
  }

  const headerSource = await headers();

  // Burst abuse guard (IP/UA + user in the key).
  const burst = await consumeRateLimit({
    action: AI_DRAFT_BURST_ACTION,
    source: headerSource,
    limit: AI_DRAFT_BURST_LIMIT,
    windowMs: AI_DRAFT_BURST_WINDOW_MS,
    keyParts: [user.id],
  });
  if (!burst.ok) {
    return { error: "You're drafting very fast — give it a minute and try again." };
  }

  // Daily cap, keyed on userId ONLY so it stays stable across devices and
  // networks (and matches the non-consuming peek in availability.ts).
  const daily = await consumeRateLimit({
    action: AI_DRAFT_DAILY_ACTION,
    source: headerSource,
    limit: env.AI_DRAFT_DAILY_LIMIT,
    windowMs: AI_DRAFT_DAILY_WINDOW_MS,
    keyParts: [user.id],
    keyByPartsOnly: true,
  });
  if (!daily.ok) {
    return { error: "Daily limit reached — resets tomorrow.", remainingToday: 0 };
  }

  const template = findTemplateByKey(record.templatePreset?.key ?? "");
  const coupleNames =
    [record.couple.partnerOneName, record.couple.partnerTwoName].filter(Boolean).join(" & ") ||
    "The couple";

  const result = await generateAiDraft(parsed.data.kind, {
    coupleNames,
    weddingDate: record.weddingDate ? formatDate(record.weddingDate) : null,
    locationSummary: record.locationSummary,
    templateMood: template.mood,
    hint: parsed.data.hint,
    title: parsed.data.context?.title,
    question: parsed.data.context?.question,
  });

  if (!result.ok) {
    // Off-topic misuse and provider errors still burn the daily attempt
    // (already consumed above — abuse should cost quota), but the free-tier
    // LIFETIME counter is only spent on drafts actually delivered.
    return {
      error: result.error,
      remainingToday: daily.remaining,
      remainingLifetime:
        lifetimeLimit === null ? null : Math.max(0, lifetimeLimit - record.couple.aiDraftCount),
    };
  }

  let remainingLifetime: number | null = null;
  if (lifetimeLimit !== null) {
    // Conditional increment (count-guarded updateMany) so two concurrent
    // requests can't double-spend the last free draft.
    const updated = await prisma.couple.updateMany({
      where: { id: record.couple.id, aiDraftCount: { lt: lifetimeLimit } },
      data: { aiDraftCount: { increment: 1 } },
    });
    if (updated.count === 0) {
      return {
        error: `You've used all ${lifetimeLimit} free drafts. Upgrade to Together for unlimited AI drafting.`,
        remainingLifetime: 0,
        remainingToday: daily.remaining,
      };
    }
    remainingLifetime = Math.max(0, lifetimeLimit - (record.couple.aiDraftCount + 1));
  }

  return { draft: result.draft, remainingToday: daily.remaining, remainingLifetime };
}

"use server";

import { type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  dressCodeInputSchema,
  eventInputSchema,
  faqInputSchema,
  publishSettingsSchema,
  scheduleItemInputSchema,
  siteBasicsSchema,
  storyMilestoneInputSchema,
  templateSelectionSchema,
  tidbitInputSchema,
  travelGuideInputSchema,
  youtubeVideoSchema,
} from "@/lib/validations/engagement";
import { hashPassword } from "@/server/auth/password";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { getEditableWeddingSiteForUser, getWeddingSiteForUser } from "@/server/repositories/wedding-site";
import { demoWorkspaceReadOnlyMessage, isDemoSiteId } from "@/server/services/demo-site";
import { buildPublishSnapshot } from "@/server/services/site-snapshot";
import { ensureTemplatePresetByKey } from "@/server/services/template-presets";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";

function touchSite(siteId: string) {
  return prisma.publishSettings.update({
    where: { weddingSiteId: siteId },
    data: { lastDraftSavedAt: new Date() },
  });
}

function revalidateSitePaths(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/templates");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/story`);
  revalidatePath(`/${slug}/events`);
  revalidatePath(`/${slug}/schedule`);
  revalidatePath(`/${slug}/gallery`);
  revalidatePath(`/${slug}/experience`);
  revalidatePath(`/${slug}/rsvp`);
  revalidatePath(`/${slug}/memories`);
  revalidatePath(`/${slug}/wishes`);
}

function readOnlyDemoState(): ActionState {
  return { error: demoWorkspaceReadOnlyMessage };
}

function guardEditableSite(site: { id: string }): ActionState | null {
  return isDemoSiteId(site.id) ? readOnlyDemoState() : null;
}

export async function updateSiteBasicsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const site = await getEditableWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  const readOnlyState = guardEditableSite(site);
  if (readOnlyState) return readOnlyState;

  const parsed = siteBasicsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please review the site basics form." };
  }

  await prisma.$transaction([
    prisma.weddingSite.update({
      where: { id: site.id },
      data: {
        brandName: parsed.data.brandName,
        headline: parsed.data.headline,
        subtitle: parsed.data.subtitle || null,
        tagline: parsed.data.tagline || null,
        weddingDate: new Date(parsed.data.weddingDate),
        locationSummary: parsed.data.locationSummary || null,
        heroImageUrl: parsed.data.heroImageUrl || null,
        heroVideoUrl: parsed.data.heroVideoUrl || null,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        ogImageUrl: parsed.data.ogImageUrl || null,
        canonicalUrl: parsed.data.canonicalUrl || null,
        slug: parsed.data.slug,
      },
    }),
    touchSite(site.id),
  ]);

  revalidateSitePaths(parsed.data.slug);
  return { success: "Site basics saved to draft." };
}

export async function updateTemplateThemeAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const parsed = templateSelectionSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please review the template settings." };
    }

    const { templateKey, ...themeData } = parsed.data;
    const template = await ensureTemplatePresetByKey(templateKey, prisma);

    await prisma.$transaction([
      prisma.weddingSite.update({
        where: { id: site.id },
        data: { templatePresetId: template.id },
      }),
      prisma.siteTheme.upsert({
        where: { weddingSiteId: site.id },
        update: themeData,
        create: {
          weddingSiteId: site.id,
          ...themeData,
        },
      }),
      touchSite(site.id),
    ]);

    revalidateSitePaths(site.slug);
    return { success: "Template and theme settings saved." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save template settings.") };
  }
}

export async function updatePublishSettingsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const site = await getEditableWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  const readOnlyState = guardEditableSite(site);
  if (readOnlyState) return readOnlyState;

  const parsed = publishSettingsSchema.safeParse({
    visibility: formData.get("visibility"),
    status: formData.get("status"),
    noIndex: formData.get("noIndex") === "on",
    isRsvpOpen: formData.get("isRsvpOpen") === "on",
    isUploadsOpen: formData.get("isUploadsOpen") === "on",
    isMessagesOpen: formData.get("isMessagesOpen") === "on",
    sitePassword: formData.get("sitePassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please review the publish settings." };
  }

  await prisma.publishSettings.update({
    where: { weddingSiteId: site.id },
    data: {
      visibility: parsed.data.visibility,
      status: parsed.data.status,
      noIndex: parsed.data.noIndex,
      isRsvpOpen: parsed.data.isRsvpOpen,
      isUploadsOpen: parsed.data.isUploadsOpen,
      isMessagesOpen: parsed.data.isMessagesOpen,
      sitePasswordHash: parsed.data.sitePassword ? await hashPassword(parsed.data.sitePassword) : undefined,
      lastDraftSavedAt: new Date(),
    },
  });

  revalidateSitePaths(site.slug);
  return { success: "Publish settings saved." };
}

export async function publishSiteAction() {
  const user = await requireUser();
  const site = await getWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  const readOnlyState = guardEditableSite(site);
  if (readOnlyState) return readOnlyState;

  const snapshot = buildPublishSnapshot(site);

  await prisma.publishSettings.update({
    where: { weddingSiteId: site.id },
    data: {
      status: "PUBLISHED",
      publishedSnapshot: snapshot,
      publishedAt: new Date(),
      lastDraftSavedAt: new Date(),
    },
  });

  revalidateSitePaths(site.slug);
  return { success: "Your wedding site is now published." };
}

async function replaceCollection<T>(
  siteId: string,
  slug: string,
  items: T[],
  replace: (tx: Prisma.TransactionClient, items: T[]) => Promise<unknown>,
) {
  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await replace(transaction, items);
    await transaction.publishSettings.update({
      where: { weddingSiteId: siteId },
      data: { lastDraftSavedAt: new Date() },
    });
  });

  revalidateSitePaths(slug);
}

function parseJsonArray<T>(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string") {
    throw new Error("The submitted data payload was missing.");
  }

  return JSON.parse(raw) as T[];
}

function formatFieldLabel(pathSegment: PropertyKey | undefined) {
  if (typeof pathSegment !== "string") {
    return "Field";
  }

  return pathSegment
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatIssueMessage(issue: z.ZodIssue) {
  if (issue.code === "too_small" && issue.origin === "string") {
    if (issue.minimum === 1) {
      return `${formatFieldLabel(issue.path[1])} is required.`;
    }

    return `${formatFieldLabel(issue.path[1])} must be at least ${issue.minimum} characters.`;
  }

  if (issue.code === "too_big" && issue.origin === "string") {
    return `${formatFieldLabel(issue.path[1])} must be ${issue.maximum} characters or fewer.`;
  }

  if (issue.code === "invalid_format") {
    if (issue.format === "url") {
      return `${formatFieldLabel(issue.path[1])} must be a valid URL.`;
    }

    if (issue.format === "datetime") {
      return `${formatFieldLabel(issue.path[1])} must be a valid date and time.`;
    }
  }

  return issue.message;
}

function formatDashboardActionError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    const messages = error.issues.map((issue) => {
      const itemPrefix = typeof issue.path[0] === "number" ? `Item ${issue.path[0] + 1}: ` : "";
      return `${itemPrefix}${formatIssueMessage(issue)}`;
    });

    return Array.from(new Set(messages)).join(" ");
  }

  return error instanceof Error ? error.message : fallback;
}

export async function replaceStoryMilestonesAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = storyMilestoneInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, milestones) => {
      await transaction.storyMilestone.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.storyMilestone.createMany({
        data: milestones.map((item, index) => ({
          weddingSiteId: site.id,
          title: item.title,
          shortLabel: item.shortLabel || null,
          eventDateLabel: item.eventDateLabel,
          description: item.description,
          imageUrl: item.imageUrl || null,
          sortOrder: index,
        })),
      });
    });

    return { success: "Story timeline saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save story milestones.") };
  }
}

export async function replaceEventsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = eventInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, events) => {
      await transaction.event.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.event.createMany({
        data: events.map((item, index) => ({
          weddingSiteId: site.id,
          title: item.title,
          subtitle: item.subtitle || null,
          description: item.description,
          startDateTime: new Date(item.startDateTime),
          endDateTime: new Date(item.endDateTime),
          dayLabel: item.dayLabel,
          locationName: item.locationName,
          fullAddress: item.fullAddress,
          googleMapsUrl: item.googleMapsUrl || null,
          dressCode: item.dressCode || null,
          notes: item.notes || null,
          imageUrl: item.imageUrl || null,
          rsvpRequired: item.rsvpRequired,
          audience: item.audience,
          contactName: item.contactName || null,
          contactPhone: item.contactPhone || null,
          sortOrder: index,
        })),
      });
    });

    return { success: "Events saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save events.") };
  }
}

export async function replaceScheduleItemsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = scheduleItemInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, scheduleItems) => {
      await transaction.scheduleItem.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.scheduleItem.createMany({
        data: scheduleItems.map((item, index) => ({
          weddingSiteId: site.id,
          title: item.title,
          category: item.category,
          description: item.description || null,
          startDateTime: new Date(item.startDateTime),
          endDateTime: item.endDateTime ? new Date(item.endDateTime) : null,
          dayLabel: item.dayLabel,
          locationName: item.locationName || null,
          sortOrder: index,
        })),
      });
    });

    return { success: "Schedule items saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save schedule items.") };
  }
}

export async function replaceTidbitsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = tidbitInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, tidbits) => {
      await transaction.tidbit.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.tidbit.createMany({
        data: tidbits.map((item, index) => ({
          weddingSiteId: site.id,
          title: item.title,
          body: item.body,
          category: item.category,
          iconKey: item.iconKey || null,
          sortOrder: index,
        })),
      });
    });

    return { success: "Tidbits saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save tidbits.") };
  }
}

export async function replaceFaqItemsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = faqInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, faqItems) => {
      await transaction.faqItem.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.faqItem.createMany({
        data: faqItems.map((item, index) => ({
          weddingSiteId: site.id,
          question: item.question,
          answer: item.answer,
          category: item.category,
          sortOrder: index,
        })),
      });
    });

    return { success: "FAQ items saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save FAQ items.") };
  }
}

export async function replaceTravelGuideItemsAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = travelGuideInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, guideItems) => {
      await transaction.travelGuideItem.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.travelGuideItem.createMany({
        data: guideItems.map((item, index) => ({
          weddingSiteId: site.id,
          category: item.category,
          title: item.title,
          description: item.description,
          url: item.url || null,
          sortOrder: index,
        })),
      });
    });

    return { success: "Guest experience items saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save guest experience items.") };
  }
}

export async function replaceDressCodesAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = dressCodeInputSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, guides) => {
      await transaction.dressCodeGuide.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.dressCodeGuide.createMany({
        data: guides.map((item, index) => ({
          weddingSiteId: site.id,
          eventId: item.eventId || null,
          title: item.title,
          guidance: item.guidance,
          inspirationImage: item.inspirationImage || null,
          palette: item.palette,
          sortOrder: index,
        })),
      });
    });

    return { success: "Dress code guidance saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save dress code guidance.") };
  }
}

export async function replaceVideosAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const site = await getEditableWeddingSiteForUser(user.id);
    if (!site) return { error: "No wedding site was found for this account." };
    const readOnlyState = guardEditableSite(site);
    if (readOnlyState) return readOnlyState;

    const items = youtubeVideoSchema.array().parse(parseJsonArray(formData, "items"));

    await replaceCollection(site.id, site.slug, items, async (transaction, videos) => {
      await transaction.embeddedVideo.deleteMany({ where: { weddingSiteId: site.id } });
      await transaction.embeddedVideo.createMany({
        data: videos.map((item, index) => {
          const youtubeId = extractYoutubeId(item.youtubeUrl)!;
          return {
            weddingSiteId: site.id,
            title: item.title,
            typeLabel: item.typeLabel,
            youtubeUrl: item.youtubeUrl,
            youtubeId,
            thumbnailUrl: getYoutubeThumbnail(youtubeId),
            sortOrder: index,
          };
        }),
      });
    });

    return { success: "Videos saved to draft." };
  } catch (error) {
    return { error: formatDashboardActionError(error, "Unable to save videos.") };
  }
}

export async function moderateUploadAction(uploadId: string, status: "APPROVED" | "REJECTED") {
  const user = await requireUser();
  const site = await getEditableWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  const readOnlyState = guardEditableSite(site);
  if (readOnlyState) return readOnlyState;

  await prisma.guestUpload.updateMany({
    where: {
      id: uploadId,
      weddingSiteId: site.id,
    },
    data: {
      status,
      moderatedAt: new Date(),
    },
  });

  revalidateSitePaths(site.slug);
  return { success: `Upload ${status.toLowerCase()}.` };
}

export async function moderateMessageAction(messageId: string, status: "APPROVED" | "REJECTED") {
  const user = await requireUser();
  const site = await getEditableWeddingSiteForUser(user.id);
  if (!site) return { error: "No wedding site was found for this account." };
  const readOnlyState = guardEditableSite(site);
  if (readOnlyState) return readOnlyState;

  await prisma.guestMessage.updateMany({
    where: {
      id: messageId,
      weddingSiteId: site.id,
    },
    data: {
      status,
      moderatedAt: new Date(),
    },
  });

  revalidateSitePaths(site.slug);
  return { success: `Message ${status.toLowerCase()}.` };
}

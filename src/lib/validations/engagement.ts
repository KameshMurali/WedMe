import { z } from "zod";

import { extractYoutubeId } from "@/lib/youtube";

export const siteBasicsSchema = z.object({
  brandName: z.string().min(3).max(120),
  headline: z.string().min(10).max(180),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  tagline: z.string().max(200).optional().or(z.literal("")),
  weddingDate: z.string().min(1),
  locationSummary: z.string().max(200).optional().or(z.literal("")),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  heroVideoUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional().or(z.literal("")),
  seoDescription: z.string().max(160).optional().or(z.literal("")),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
});

export const templateSelectionSchema = z.object({
  templateKey: z.string().min(3),
  paletteKey: z.string().min(2),
  headingFontKey: z.string().min(2),
  bodyFontKey: z.string().min(2),
  primaryColor: z.string().min(4),
  accentColor: z.string().min(4),
  backgroundColor: z.string().min(4),
  surfaceColor: z.string().min(4),
  textColor: z.string().min(4),
  mutedColor: z.string().min(4),
  borderRadius: z.string().min(2),
  buttonVariant: z.string().min(2),
  shadowStyle: z.string().min(2),
});

export const publishSettingsSchema = z.object({
  visibility: z.enum(["PUBLIC", "PASSWORD_PROTECTED", "INVITE_ONLY"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  noIndex: z.boolean(),
  isRsvpOpen: z.boolean(),
  isUploadsOpen: z.boolean(),
  isMessagesOpen: z.boolean(),
  sitePassword: z.string().max(100).optional().or(z.literal("")),
});

export const storyMilestoneInputSchema = z.object({
  title: z.string().min(2).max(120),
  shortLabel: z.string().max(40).optional().or(z.literal("")),
  eventDateLabel: z.string().min(2).max(80),
  description: z.string().min(10).max(400),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const eventInputSchema = z.object({
  title: z.string().min(2).max(120),
  subtitle: z.string().max(120).optional().or(z.literal("")),
  description: z.string().min(20).max(500),
  startDateTime: z.string().min(1),
  endDateTime: z.string().min(1),
  dayLabel: z.string().min(2).max(60),
  locationName: z.string().min(3).max(140),
  fullAddress: z.string().min(10).max(240),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  dressCode: z.string().max(140).optional().or(z.literal("")),
  notes: z.string().max(300).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  rsvpRequired: z.boolean(),
  audience: z.enum(["ALL_GUESTS", "FAMILY_ONLY", "INVITE_ONLY"]),
  contactName: z.string().max(80).optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
});

export const youtubeVideoSchema = z.object({
  title: z.string().min(2).max(120),
  typeLabel: z.string().min(2).max(60),
  youtubeUrl: z
    .string()
    .url()
    .refine((value) => Boolean(extractYoutubeId(value)), "Please provide a valid YouTube URL"),
});

export const scheduleItemInputSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  description: z.string().max(300).optional().or(z.literal("")),
  startDateTime: z.string().min(1),
  endDateTime: z.string().optional().or(z.literal("")),
  dayLabel: z.string().min(2).max(60),
  locationName: z.string().max(120).optional().or(z.literal("")),
});

export const tidbitInputSchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(10).max(350),
  category: z.string().min(2).max(60),
  iconKey: z.string().max(50).optional().or(z.literal("")),
});

export const faqInputSchema = z.object({
  question: z.string().min(8).max(160),
  answer: z.string().min(10).max(350),
  category: z.string().min(2).max(60),
});

export const travelGuideInputSchema = z.object({
  category: z.enum([
    "AIRPORT",
    "TRANSPORT",
    "HOTELS",
    "PARKING",
    "FAQ",
    "RECOMMENDATIONS",
    "WHAT_TO_BRING",
    "EMERGENCY",
  ]),
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(350),
  url: z.string().url().optional().or(z.literal("")),
});

export const dressCodeInputSchema = z.object({
  eventId: z.string().optional().or(z.literal("")),
  title: z.string().min(2).max(120),
  guidance: z.string().min(10).max(350),
  inspirationImage: z.string().url().optional().or(z.literal("")),
  palette: z.array(z.string().min(4)).max(6),
});

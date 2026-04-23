import { z } from "zod";

export const guestMessageSchema = z.object({
  slug: z.string().min(3),
  authorName: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10).max(500),
  feedback: z.string().max(500).optional().or(z.literal("")),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

export const guestUploadSchema = z.object({
  slug: z.string().min(3),
  submitterName: z.string().min(2).max(100),
  caption: z.string().max(180).optional().or(z.literal("")),
  message: z.string().max(280).optional().or(z.literal("")),
  externalUrl: z.string().url().optional().or(z.literal("")),
  eventId: z.string().optional().or(z.literal("")),
});

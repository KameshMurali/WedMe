import { z } from "zod";

export const rsvpSchema = z.object({
  slug: z.string().min(3),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email().optional().or(z.literal("")),
  inviteCode: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
  attendeeCount: z.coerce.number().min(1).max(10),
  mealPreference: z.string().max(120).optional().or(z.literal("")),
  accommodationNeeds: z.string().max(200).optional().or(z.literal("")),
  travelNotes: z.string().max(300).optional().or(z.literal("")),
  specialRequests: z.string().max(300).optional().or(z.literal("")),
  accessibilityNeeds: z.string().max(300).optional().or(z.literal("")),
  noteToCouple: z.string().max(500).optional().or(z.literal("")),
  selectedEvents: z
    .array(
      z.object({
        eventId: z.string().min(1),
        status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
      }),
    )
    .min(1),
});

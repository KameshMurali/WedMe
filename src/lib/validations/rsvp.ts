import { z } from "zod";

export const rsvpSchema = z.object({
  slug: z.string().min(3).transform((value) => value.trim().toLowerCase()),
  guestName: z.string().min(2).max(120),
  // Required: together with the name these form the identity used to block
  // duplicate RSVPs, and the couple needs a way to reach every guest.
  guestEmail: z.string().min(1, "An email address is required.").email("Enter a valid email address."),
  guestPhone: z
    .string()
    .min(1, "A contact number is required.")
    .max(30)
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a valid contact number."),
  inviteCode: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
  attendeeCount: z.coerce.number().min(1).max(10),
  // Neutral keys; the guest-facing labels are rendered from the couple's names.
  guestSide: z.enum(["PARTNER_ONE", "PARTNER_TWO", "BOTH"]).optional().or(z.literal("")),
  mealPreference: z.string().max(120).optional().or(z.literal("")),
  accommodationNeeds: z.string().max(200).optional().or(z.literal("")),
  travelNotes: z.string().max(300).optional().or(z.literal("")),
  specialRequests: z.string().max(300).optional().or(z.literal("")),
  accessibilityNeeds: z.string().max(300).optional().or(z.literal("")),
  noteToCouple: z.string().max(500).optional().or(z.literal("")),
  // Sites published without events send an empty list; the route already
  // persists a general RSVP when no event selections exist.
  selectedEvents: z.array(
    z.object({
      eventId: z.string().min(1),
      status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
    }),
  ),
});

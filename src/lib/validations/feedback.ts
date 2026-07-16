import { z } from "zod";

export const feedbackCategories = ["PRAISE", "BUG", "IDEA", "OTHER"] as const;

export const workspaceFeedbackSchema = z.object({
  category: z.enum(feedbackCategories),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
  message: z.string().min(5, "Tell us a little more — at least 5 characters.").max(1000),
});

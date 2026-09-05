import { z } from "zod";

// The field kinds the AI drafting assistant can write. Each maps to an
// existing free-text field edited through ArrayEditor or the site-basics form.
export const aiDraftKinds = [
  "story_milestone",
  "event_description",
  "welcome_hero",
  "faq_answer",
  "dress_code",
  "tidbit",
  "registry_note",
] as const;

export type AiDraftKind = (typeof aiDraftKinds)[number];

// Note: deliberately NO siteId from the client — tenancy always derives from
// the session inside the server action.
export const aiDraftRequestSchema = z.object({
  kind: z.enum(aiDraftKinds),
  // The current field text doubles as the couple's rough notes ("met at IIT
  // fest 2019, long distance 3 years"). Length-capped: it is a hint, not a chat.
  hint: z.string().max(600),
  // Presentation context only — the couple's LIVE, still-unsaved form values so
  // a draft reflects what they are typing right now instead of the last-saved
  // record. Never used for tenancy, plan, or quota decisions.
  context: z
    .object({
      title: z.string().max(160).optional(),
      question: z.string().max(200).optional(),
      coupleNames: z.string().max(170).optional(),
      weddingDate: z.string().max(60).optional(),
      locationSummary: z.string().max(200).optional(),
    })
    .optional(),
});

export type AiDraftRequestInput = z.infer<typeof aiDraftRequestSchema>;

// Shape the client may hand to the drafting action alongside the hint.
export type AiDraftClientContext = NonNullable<AiDraftRequestInput["context"]>;

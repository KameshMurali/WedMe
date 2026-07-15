// Wedding site readiness scoring — deterministic checks over draft content
// that tell a couple what guests will miss before (and after) they publish.
// Pure module: safe to import from both server pages and client components.

export type ReadinessSeverity = "critical" | "high" | "nice";

export type ReadinessInput = {
  eventCount: number;
  storyCount: number;
  galleryCount: number;
  dressCodeCount: number;
  hasHeroImage: boolean;
  status: "DRAFT" | "PUBLISHED";
  isRsvpOpen: boolean;
  publishedAt: Date | null;
  lastDraftSavedAt: Date | null;
};

export type ReadinessItem = {
  key: string;
  label: string;
  description: string;
  severity: ReadinessSeverity;
  href: string;
  done: boolean;
};

export type Readiness = {
  score: number; // 0–100
  items: ReadinessItem[];
};

const severityWeight: Record<ReadinessSeverity, number> = {
  critical: 3,
  high: 2,
  nice: 1,
};

export function computeReadiness(input: ReadinessInput): Readiness {
  const isPublished = input.status === "PUBLISHED";
  const hasUnpublishedChanges =
    isPublished &&
    input.publishedAt !== null &&
    input.lastDraftSavedAt !== null &&
    input.lastDraftSavedAt > input.publishedAt;

  const items: ReadinessItem[] = [
    {
      key: "events",
      label: "Add your wedding events",
      description: "Guests can't RSVP until at least one event exists.",
      severity: "critical",
      href: "/dashboard/events",
      done: input.eventCount > 0,
    },
    {
      key: "published",
      label: "Publish your site",
      description: "Guests can only open your link after you publish.",
      severity: "critical",
      href: "/dashboard/settings",
      done: isPublished,
    },
    {
      key: "fresh",
      label: "Republish your latest changes",
      description: "Your draft has edits guests can't see yet.",
      severity: "high",
      href: "/dashboard/settings",
      done: !hasUnpublishedChanges,
    },
    {
      key: "hero",
      label: "Set a hero image",
      description: "The first thing guests (and WhatsApp previews) see.",
      severity: "high",
      href: "/dashboard/settings",
      done: input.hasHeroImage,
    },
    {
      key: "story",
      label: "Tell your story",
      description: "Add at least one milestone — it's the most-visited section.",
      severity: "high",
      href: "/dashboard/content",
      done: input.storyCount > 0,
    },
    {
      key: "rsvp-open",
      label: "Open RSVPs",
      description: "Your site is live but guests can't respond yet.",
      severity: "high",
      href: "/dashboard/settings",
      // Only meaningful once published; treat as done while drafting.
      done: !isPublished || input.isRsvpOpen,
    },
    {
      key: "gallery",
      label: "Add 3+ gallery photos",
      description: "A filled gallery makes the site feel alive.",
      severity: "nice",
      href: "/dashboard/content",
      done: input.galleryCount >= 3,
    },
    {
      key: "dress-code",
      label: "Add a dress code guide",
      description: "The question guests ask most, answered once.",
      severity: "nice",
      href: "/dashboard/content",
      done: input.dressCodeCount > 0,
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + severityWeight[item.severity], 0);
  const doneWeight = items.reduce(
    (sum, item) => sum + (item.done ? severityWeight[item.severity] : 0),
    0,
  );

  return {
    score: Math.round((doneWeight / totalWeight) * 100),
    items,
  };
}

// Critical problems worth interrupting a publish for. "Publish your site"
// itself is excluded — clicking Publish is how you complete that one.
export function getPublishBlockers(input: ReadinessInput): string[] {
  return computeReadiness(input)
    .items.filter((item) => !item.done && item.severity === "critical" && item.key !== "published")
    .map((item) => item.label);
}

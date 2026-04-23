export type SiteSnapshot = {
  site: {
    id: string;
    slug: string;
    brandName: string;
    headline: string;
    subtitle: string | null;
    tagline: string | null;
    weddingDate: string;
    heroImageUrl: string | null;
    heroVideoUrl: string | null;
    locationSummary: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageUrl: string | null;
    canonicalUrl: string | null;
    coupleNames: string;
  };
  theme: {
    templateKey: string;
    templateName: string;
    paletteKey: string;
    headingFontKey: string;
    bodyFontKey: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    mutedColor: string;
    borderRadius: string;
    buttonVariant: string;
    shadowStyle: string;
  };
  publish: {
    status: "DRAFT" | "PUBLISHED";
    visibility: "PUBLIC" | "PASSWORD_PROTECTED" | "INVITE_ONLY";
    noIndex: boolean;
    isRsvpOpen: boolean;
    isUploadsOpen: boolean;
    isMessagesOpen: boolean;
    publishedAt: string | null;
  };
  sections: Array<{
    type: string;
    enabled: boolean;
    position: number;
    label: string;
  }>;
  storyMilestones: Array<{
    id: string;
    title: string;
    shortLabel: string | null;
    eventDateLabel: string;
    description: string;
    imageUrl: string | null;
  }>;
  events: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    description: string;
    startDateTime: string;
    endDateTime: string;
    dayLabel: string;
    locationName: string;
    fullAddress: string;
    googleMapsUrl: string | null;
    dressCode: string | null;
    notes: string | null;
    imageUrl: string | null;
    rsvpRequired: boolean;
    audience: string;
    contactName: string | null;
    contactPhone: string | null;
  }>;
  scheduleItems: Array<{
    id: string;
    title: string;
    category: string;
    description: string | null;
    startDateTime: string;
    endDateTime: string | null;
    dayLabel: string;
    locationName: string | null;
  }>;
  tidbits: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    iconKey: string | null;
  }>;
  faqItems: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
  }>;
  travelGuideItems: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    url: string | null;
  }>;
  dressCodeGuides: Array<{
    id: string;
    title: string;
    guidance: string;
    inspirationImage: string | null;
    palette: string[];
    eventTitle: string | null;
  }>;
  mediaAssets: Array<{
    id: string;
    category: string;
    title: string | null;
    altText: string | null;
    caption: string | null;
    url: string;
  }>;
  embeddedVideos: Array<{
    id: string;
    title: string;
    typeLabel: string;
    youtubeUrl: string;
    youtubeId: string;
    thumbnailUrl: string | null;
  }>;
};

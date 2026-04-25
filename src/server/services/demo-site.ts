import "server-only";

import type { SiteSnapshot } from "@/types";
import { sectionLabels, sectionOrder } from "@/lib/constants";

export const demoSiteSlug = "kammonbeginnings";

export type PublicGuestUpload = {
  id: string;
  type: "IMAGE" | "VIDEO" | "LINK";
  submitterName: string;
  caption: string | null;
  message: string | null;
  url: string | null;
  externalUrl: string | null;
  createdAt: Date;
  event: {
    id: string;
    title: string;
  } | null;
};

export type PublicGuestMessage = {
  id: string;
  authorName: string;
  message: string;
  feedback: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: Date;
};

export function isDemoSiteSlug(slug: string) {
  return slug === demoSiteSlug;
}

const baseUrl = `https://wed.tonewbeginning.com/${demoSiteSlug}`;

export const demoSiteSnapshot = {
  site: {
    id: "demo-site-kammonbeginnings",
    slug: demoSiteSlug,
    brandName: "KamMonBeginnings",
    headline: "Kamesh weds Monisha",
    subtitle:
      "Join us for a joyful wedding weekend filled with music, tradition, warmth, and the people we love most.",
    tagline: "A celebration of love, family, and new beginnings",
    weddingDate: "2027-02-14T09:30:00.000Z",
    heroImageUrl:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80",
    heroVideoUrl: null,
    locationSummary: "Dubai, United Arab Emirates",
    seoTitle: "KamMonBeginnings | Kamesh & Monisha Wedding",
    seoDescription:
      "Celebrate Kamesh and Monisha’s wedding journey with event details, RSVP, gallery, memories, and guest guidance.",
    ogImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    canonicalUrl: baseUrl,
    coupleNames: "Kamesh & Monisha",
  },
  theme: {
    templateKey: "classic-elegant",
    templateName: "Classic Elegant",
    paletteKey: "champagne",
    headingFontKey: "display",
    bodyFontKey: "body",
    primaryColor: "#6e4f35",
    accentColor: "#b88c4a",
    backgroundColor: "#fdf8f3",
    surfaceColor: "#fffaf6",
    textColor: "#1f1115",
    mutedColor: "#5d4346",
    borderRadius: "2rem",
    buttonVariant: "solid",
    shadowStyle: "glow",
  },
  publish: {
    status: "PUBLISHED",
    visibility: "PUBLIC",
    noIndex: false,
    isRsvpOpen: true,
    isUploadsOpen: true,
    isMessagesOpen: true,
    publishedAt: "2026-04-01T12:00:00.000Z",
  },
  sections: sectionOrder.map((type, position) => ({
    type,
    enabled: true,
    position,
    label: sectionLabels[type],
  })),
  storyMilestones: [
    {
      id: "story-how-we-met",
      title: "How we met",
      shortLabel: "First hello",
      eventDateLabel: "2019",
      description:
        "What started as a thoughtful conversation quickly became our favourite part of every week. We found ease, humour, and home in each other.",
      imageUrl:
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "story-first-trip",
      title: "Our first trip",
      shortLabel: "Adventure",
      eventDateLabel: "2021",
      description:
        "A spontaneous getaway turned into one of our favourite memories, full of long walks, coffee stops, and the feeling that this was becoming something real.",
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "story-proposal",
      title: "The proposal",
      shortLabel: "The yes",
      eventDateLabel: "2025",
      description:
        "With family close in spirit and a setting that felt deeply us, one question turned into the easiest yes of our lives.",
      imageUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "story-engagement",
      title: "Engagement season",
      shortLabel: "Celebrating",
      eventDateLabel: "2026",
      description:
        "From intimate dinners to joyful gatherings, this season reminded us how held and loved we are by the people around us.",
      imageUrl:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "story-wedding-journey",
      title: "The wedding journey",
      shortLabel: "Forever begins",
      eventDateLabel: "2027",
      description:
        "We’re now counting down to a weekend of colour, family, music, and vows. Thank you for being part of this beginning.",
      imageUrl:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  events: [
    {
      id: "event-mehendi",
      title: "Mehendi",
      subtitle: "Henna, laughter, and an intimate evening",
      description:
        "An elegant opening celebration with live music, henna artists, and warm family energy to begin the wedding weekend.",
      startDateTime: "2027-02-12T15:30:00.000Z",
      endDateTime: "2027-02-12T19:00:00.000Z",
      dayLabel: "Friday",
      locationName: "Palm Garden Terrace",
      fullAddress: "Palm Garden Terrace, Jumeirah Beach Road, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Palm+Garden+Terrace+Dubai",
      dressCode: "Pastel festive wear",
      notes: "Traditional wear encouraged. Comfortable sandals recommended for lawn areas.",
      imageUrl:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      rsvpRequired: true,
      audience: "ALL_GUESTS",
      contactName: "Asha",
      contactPhone: "+971 50 000 1111",
    },
    {
      id: "event-haldi",
      title: "Haldi",
      subtitle: "Sunshine, turmeric, and close family moments",
      description:
        "A vibrant morning ceremony filled with colour, laughter, and heartfelt blessings shared in a close family setting.",
      startDateTime: "2027-02-13T07:30:00.000Z",
      endDateTime: "2027-02-13T10:00:00.000Z",
      dayLabel: "Saturday",
      locationName: "Azure Courtyard",
      fullAddress: "Azure Courtyard, Downtown Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Azure+Courtyard+Dubai",
      dressCode: "Yellow, ivory, or floral festive wear",
      notes: "Bring a change of footwear if you plan to join the playful haldi moments.",
      imageUrl:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      rsvpRequired: true,
      audience: "FAMILY_ONLY",
      contactName: "Ritika",
      contactPhone: "+971 50 000 2222",
    },
    {
      id: "event-sangeet",
      title: "Sangeet",
      subtitle: "Performances, dinner, and dance floor energy",
      description:
        "An evening of performances, speeches, and a joyful dance floor that stretches late into the night.",
      startDateTime: "2027-02-13T17:30:00.000Z",
      endDateTime: "2027-02-13T22:30:00.000Z",
      dayLabel: "Saturday",
      locationName: "The Grand Ballroom",
      fullAddress: "The Grand Ballroom, Business Bay, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=The+Grand+Ballroom+Dubai",
      dressCode: "Jewel tones and evening glam",
      notes: "Guest performances begin at 7 PM sharp.",
      imageUrl:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
      rsvpRequired: true,
      audience: "ALL_GUESTS",
      contactName: "Nivetha",
      contactPhone: "+971 50 000 3333",
    },
    {
      id: "event-wedding",
      title: "Wedding Ceremony",
      subtitle: "Sacred rituals and vows",
      description:
        "A morning ceremony rooted in tradition, followed by blessings, family portraits, and a celebratory lunch.",
      startDateTime: "2027-02-14T09:30:00.000Z",
      endDateTime: "2027-02-14T13:30:00.000Z",
      dayLabel: "Sunday",
      locationName: "Lotus Pavilion",
      fullAddress: "Lotus Pavilion, Al Barari, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Lotus+Pavilion+Dubai",
      dressCode: "Traditional wedding attire",
      notes: "Please be seated by 9:10 AM. Ceremony photography is permitted only from designated areas.",
      imageUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      rsvpRequired: true,
      audience: "ALL_GUESTS",
      contactName: "Karthik",
      contactPhone: "+971 50 000 4444",
    },
    {
      id: "event-reception",
      title: "Reception",
      subtitle: "Dinner, speeches, and a final celebration",
      description:
        "The closing celebration of the weekend, with dinner, speeches, and a relaxed evening to dance and celebrate together.",
      startDateTime: "2027-02-14T18:30:00.000Z",
      endDateTime: "2027-02-14T23:00:00.000Z",
      dayLabel: "Sunday",
      locationName: "Skyline Ballroom",
      fullAddress: "Skyline Ballroom, Dubai Marina",
      googleMapsUrl: "https://maps.google.com/?q=Skyline+Ballroom+Dubai",
      dressCode: "Black tie optional",
      notes: "Dinner seating opens at 7 PM. Valet service is available on arrival.",
      imageUrl:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      rsvpRequired: true,
      audience: "ALL_GUESTS",
      contactName: "Asha",
      contactPhone: "+971 50 000 1111",
    },
  ],
  scheduleItems: [
    {
      id: "schedule-mehendi-arrival",
      title: "Henna artists and welcome refreshments",
      category: "Arrival",
      description: "Light bites, welcome drinks, and time to settle in before the celebrations begin.",
      startDateTime: "2027-02-12T15:30:00.000Z",
      endDateTime: "2027-02-12T16:30:00.000Z",
      dayLabel: "Friday",
      locationName: "Palm Garden Terrace",
    },
    {
      id: "schedule-mehendi-main",
      title: "Mehendi seating and live acoustic set",
      category: "Main event",
      description: "A relaxed flow of henna moments, family mingling, and live music through sunset.",
      startDateTime: "2027-02-12T16:30:00.000Z",
      endDateTime: "2027-02-12T19:00:00.000Z",
      dayLabel: "Friday",
      locationName: "Palm Garden Terrace",
    },
    {
      id: "schedule-haldi",
      title: "Haldi ritual",
      category: "Ceremony",
      description: "Immediate family and closest friends gather for blessings and haldi rituals.",
      startDateTime: "2027-02-13T07:30:00.000Z",
      endDateTime: "2027-02-13T09:00:00.000Z",
      dayLabel: "Saturday",
      locationName: "Azure Courtyard",
    },
    {
      id: "schedule-sangeet",
      title: "Sangeet performances",
      category: "Performances",
      description: "Family and friends take the stage for choreographed performances and speeches.",
      startDateTime: "2027-02-13T19:00:00.000Z",
      endDateTime: "2027-02-13T21:00:00.000Z",
      dayLabel: "Saturday",
      locationName: "The Grand Ballroom",
    },
    {
      id: "schedule-wedding",
      title: "Wedding ceremony",
      category: "Main ceremony",
      description: "Guests are requested to arrive early for seating before the ceremony begins.",
      startDateTime: "2027-02-14T09:30:00.000Z",
      endDateTime: "2027-02-14T11:30:00.000Z",
      dayLabel: "Sunday",
      locationName: "Lotus Pavilion",
    },
    {
      id: "schedule-reception",
      title: "Reception dinner and dancing",
      category: "Reception",
      description: "Dinner service, speeches, and an evening dance celebration.",
      startDateTime: "2027-02-14T19:00:00.000Z",
      endDateTime: "2027-02-14T23:00:00.000Z",
      dayLabel: "Sunday",
      locationName: "Skyline Ballroom",
    },
  ],
  tidbits: [
    {
      id: "tidbit-before-you-come",
      title: "Before you come",
      body: "Dubai evenings can cool down quickly in February, so bring a light shawl or blazer for outdoor segments.",
      category: "Things to know",
      iconKey: null,
    },
    {
      id: "tidbit-favourites",
      title: "Couple favourites",
      body: "Coffee before anything, sunset walks, and a strong preference for dance floors that stay open late.",
      category: "Fun facts",
      iconKey: null,
    },
    {
      id: "tidbit-traditions",
      title: "Traditions explained",
      body: "We’ll include a few ceremony notes throughout the weekend so friends from different cultures can enjoy every ritual with context.",
      category: "Traditions explained",
      iconKey: null,
    },
  ],
  faqItems: [
    {
      id: "faq-selected-events",
      question: "Can I attend only selected events?",
      answer: "Yes. Please RSVP only for the celebrations listed on your invitation or confirmed by your invite code.",
      category: "RSVP",
    },
    {
      id: "faq-parking",
      question: "Will there be parking at the venues?",
      answer: "Yes, each venue includes valet or guided parking. Detailed notes are listed in the guest experience section.",
      category: "Travel",
    },
    {
      id: "faq-memories",
      question: "Can I share photos after the wedding?",
      answer: "Absolutely. The guest memories page will stay open after the event weekend for uploads and video links.",
      category: "Memories",
    },
  ],
  travelGuideItems: [
    {
      id: "travel-airport",
      category: "AIRPORT",
      title: "Fly into DXB",
      description: "Dubai International Airport is the closest option. Most venues are 20 to 35 minutes away by car.",
      url: null,
    },
    {
      id: "travel-transport",
      category: "TRANSPORT",
      title: "Ride-share friendly weekend",
      description: "Uber and Careem are both reliable for venue transfers. We’ll also share family shuttle timings closer to the date.",
      url: null,
    },
    {
      id: "travel-hotels",
      category: "HOTELS",
      title: "Nearby stays",
      description: "Recommended hotels include Address Downtown, Vida Creek Harbour, and Grosvenor House for convenience and comfort.",
      url: null,
    },
    {
      id: "travel-parking",
      category: "PARKING",
      title: "Valet and self-parking",
      description: "Reception and sangeet venues offer valet. Ceremony venue includes guided self-parking with attendants.",
      url: null,
    },
    {
      id: "travel-recommendations",
      category: "RECOMMENDATIONS",
      title: "A few local favourites",
      description: "If you’re extending your trip, we recommend an early morning old Dubai walk and a sunset dinner by the marina.",
      url: null,
    },
    {
      id: "travel-emergency",
      category: "EMERGENCY",
      title: "Weekend emergency contact",
      description: "For urgent wedding-weekend questions, contact Asha at +971 50 000 1111.",
      url: null,
    },
  ],
  dressCodeGuides: [
    {
      id: "dress-mehendi",
      title: "Mehendi palette",
      guidance: "Pastels, florals, and easy festive silhouettes that move well for an outdoor evening.",
      inspirationImage:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      palette: ["#E9C7B8", "#C8D9C0", "#F6E3B4"],
      eventTitle: "Mehendi",
    },
    {
      id: "dress-ceremony",
      title: "Ceremony styling",
      guidance: "Traditional wear is warmly encouraged. Rich silks, elegant jewellery, and classic palettes will fit beautifully.",
      inspirationImage:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      palette: ["#8C2F39", "#E6C58A", "#F5EFE6"],
      eventTitle: "Wedding Ceremony",
    },
    {
      id: "dress-reception",
      title: "Reception elegance",
      guidance: "Black tie optional. Think tailored eveningwear, statement jewellery, and refined formal looks.",
      inspirationImage:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      palette: ["#111827", "#D4AF37", "#F9FAFB"],
      eventTitle: "Reception",
    },
  ],
  mediaAssets: [
    {
      id: "media-hero",
      category: "HERO",
      title: "Hero portrait",
      altText: "Kamesh and Monisha smiling together",
      caption: "The beginning of KamMonBeginnings",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "media-gallery-1",
      category: "GALLERY",
      title: "Pre-wedding portrait",
      altText: "Couple portrait by the water",
      caption: "Quiet moments before the celebrations begin.",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "media-gallery-2",
      category: "GALLERY",
      title: "Celebration detail",
      altText: "Wedding celebration details",
      caption: "Details that feel like us.",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "media-gallery-3",
      category: "GALLERY",
      title: "Proposal memory",
      altText: "Proposal memory photo",
      caption: "The yes that changed everything.",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "media-gallery-4",
      category: "GALLERY",
      title: "Editorial portrait",
      altText: "Elegant editorial couple portrait",
      caption: "A frame from our favourite season of life.",
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "media-gallery-5",
      category: "GALLERY",
      title: "Weekend teaser",
      altText: "Celebration teaser image",
      caption: "See you on the dance floor.",
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  embeddedVideos: [
    {
      id: "video-teaser",
      title: "KamMonBeginnings invitation teaser",
      typeLabel: "Invitation teaser",
      youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      youtubeId: "jfKfPfyJRdk",
      thumbnailUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    },
    {
      id: "video-prewedding",
      title: "Our pre-wedding film",
      typeLabel: "Pre-wedding film",
      youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      youtubeId: "ysz5S6PUM-U",
      thumbnailUrl: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    },
  ],
} satisfies SiteSnapshot;

export const demoGuestUploads: PublicGuestUpload[] = [
  {
    id: "guest-upload-sangeet",
    type: "IMAGE",
    submitterName: "Priya Nair",
    caption: "Dance floor rehearsal joy",
    message: "Already obsessed with the sangeet energy.",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    externalUrl: null,
    createdAt: new Date("2027-02-15T10:00:00.000Z"),
    event: {
      id: "event-sangeet",
      title: "Sangeet",
    },
  },
];

export const demoGuestMessages: PublicGuestMessage[] = [
  {
    id: "guest-message-priya",
    authorName: "Priya Nair",
    message: "Wishing you both a marriage full of laughter, patience, and many more adventures together.",
    feedback: "The schedule page was super helpful.",
    visibility: "PUBLIC",
    createdAt: new Date("2027-02-15T12:00:00.000Z"),
  },
];

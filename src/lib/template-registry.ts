import type { SectionType } from "@prisma/client";

type TemplateRegistryEntry = {
  key: string;
  name: string;
  description: string;
  mood: string;
  previewGradient: string;
  heroVariant: "classic" | "split" | "cinematic" | "editorial" | "celebration";
  cardVariant: "glass" | "soft" | "outline" | "shadow";
  navigationVariant: "pill" | "underline" | "ghost";
  themeDefaults: {
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
  supportedSections: SectionType[];
};

export const templateRegistry: TemplateRegistryEntry[] = [
  {
    key: "classic-elegant",
    name: "Classic Elegant",
    description: "A luminous editorial layout with refined serif typography and warm ivory surfaces.",
    mood: "Timeless luxury",
    previewGradient: "linear-gradient(135deg, #fffaf5 0%, #f1e7dc 45%, #d8b98c 100%)",
    heroVariant: "classic",
    cardVariant: "glass",
    navigationVariant: "pill",
    themeDefaults: {
      paletteKey: "champagne",
      headingFontKey: "display",
      bodyFontKey: "body",
      primaryColor: "#6e4f35",
      accentColor: "#b88c4a",
      backgroundColor: "#fdf8f3",
      surfaceColor: "#fffaf6",
      textColor: "#2b1a18",
      mutedColor: "#8b6f68",
      borderRadius: "2rem",
      buttonVariant: "solid",
      shadowStyle: "glow",
    },
    supportedSections: [
      "HERO",
      "STORY",
      "EVENTS",
      "SCHEDULE",
      "TIDBITS",
      "DRESS_CODE",
      "EXPERIENCE",
      "GALLERY",
      "VIDEOS",
      "RSVP",
      "MEMORIES",
      "MESSAGES",
    ],
  },
  {
    key: "floral-romantic",
    name: "Floral Romantic",
    description: "Soft petals, layered blush gradients, and a dreamy tone built for emotionally rich storytelling.",
    mood: "Garden romance",
    previewGradient: "linear-gradient(135deg, #fff8fb 0%, #f9dce5 40%, #f0b3c6 100%)",
    heroVariant: "editorial",
    cardVariant: "soft",
    navigationVariant: "underline",
    themeDefaults: {
      paletteKey: "petal",
      headingFontKey: "display",
      bodyFontKey: "body",
      primaryColor: "#7e4b58",
      accentColor: "#d98aa2",
      backgroundColor: "#fff7fa",
      surfaceColor: "#fff9fc",
      textColor: "#3d2730",
      mutedColor: "#88656f",
      borderRadius: "2.2rem",
      buttonVariant: "soft",
      shadowStyle: "card",
    },
    supportedSections: [
      "HERO",
      "STORY",
      "EVENTS",
      "SCHEDULE",
      "TIDBITS",
      "DRESS_CODE",
      "EXPERIENCE",
      "GALLERY",
      "VIDEOS",
      "RSVP",
      "MEMORIES",
      "MESSAGES",
    ],
  },
  {
    key: "minimal-luxury",
    name: "Minimal Luxury",
    description: "A crisp, restrained system with generous whitespace, elegant contrast, and premium restraint.",
    mood: "Modern luxury",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #f1f0ed 50%, #c8c0b4 100%)",
    heroVariant: "split",
    cardVariant: "outline",
    navigationVariant: "ghost",
    themeDefaults: {
      paletteKey: "stone",
      headingFontKey: "luxe",
      bodyFontKey: "body",
      primaryColor: "#2f2b28",
      accentColor: "#9f8360",
      backgroundColor: "#fcfbf8",
      surfaceColor: "#ffffff",
      textColor: "#1f1a17",
      mutedColor: "#6e6862",
      borderRadius: "1.5rem",
      buttonVariant: "outline",
      shadowStyle: "none",
    },
    supportedSections: [
      "HERO",
      "STORY",
      "EVENTS",
      "SCHEDULE",
      "TIDBITS",
      "DRESS_CODE",
      "EXPERIENCE",
      "GALLERY",
      "VIDEOS",
      "RSVP",
      "MEMORIES",
      "MESSAGES",
    ],
  },
  {
    key: "cinematic-modern",
    name: "Cinematic Modern",
    description: "Darker, moodier layers designed for video-led storytelling and dramatic event presentation.",
    mood: "Cinematic celebration",
    previewGradient: "linear-gradient(135deg, #1f1c2c 0%, #3a2f4f 45%, #7f5f89 100%)",
    heroVariant: "cinematic",
    cardVariant: "glass",
    navigationVariant: "pill",
    themeDefaults: {
      paletteKey: "midnight",
      headingFontKey: "luxe",
      bodyFontKey: "body",
      primaryColor: "#f2d4ab",
      accentColor: "#c79559",
      backgroundColor: "#140f18",
      surfaceColor: "#201625",
      textColor: "#f9f3ec",
      mutedColor: "#cdbdb5",
      borderRadius: "1.75rem",
      buttonVariant: "solid",
      shadowStyle: "glow",
    },
    supportedSections: [
      "HERO",
      "STORY",
      "EVENTS",
      "SCHEDULE",
      "TIDBITS",
      "DRESS_CODE",
      "EXPERIENCE",
      "GALLERY",
      "VIDEOS",
      "RSVP",
      "MEMORIES",
      "MESSAGES",
    ],
  },
  {
    key: "traditional-celebration",
    name: "Traditional Celebration",
    description: "A vibrant cultural template that balances ceremony richness with practical event guidance.",
    mood: "Festive heritage",
    previewGradient: "linear-gradient(135deg, #fff6ec 0%, #f4d8b2 45%, #c45d24 100%)",
    heroVariant: "celebration",
    cardVariant: "shadow",
    navigationVariant: "underline",
    themeDefaults: {
      paletteKey: "saffron",
      headingFontKey: "display",
      bodyFontKey: "body",
      primaryColor: "#8b3a10",
      accentColor: "#cf7a24",
      backgroundColor: "#fff7ef",
      surfaceColor: "#fffdf8",
      textColor: "#341b14",
      mutedColor: "#7d5b4d",
      borderRadius: "1.9rem",
      buttonVariant: "solid",
      shadowStyle: "card",
    },
    supportedSections: [
      "HERO",
      "STORY",
      "EVENTS",
      "SCHEDULE",
      "TIDBITS",
      "DRESS_CODE",
      "EXPERIENCE",
      "GALLERY",
      "VIDEOS",
      "RSVP",
      "MEMORIES",
      "MESSAGES",
    ],
  },
];

export function findTemplateByKey(templateKey: string) {
  return (
    templateRegistry.find((template) => template.key === templateKey) ?? templateRegistry[0]
  );
}

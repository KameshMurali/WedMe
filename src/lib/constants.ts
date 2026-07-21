// Canonical public origin for absolute URLs (metadataBase, canonicals, OG,
// robots, sitemap). Falls back to the production domain so a missing APP_URL in
// prod never leaks a `http://localhost:3000` canonical to search engines; dev
// still honors a localhost APP_URL from .env.local.
export const siteUrl = process.env.APP_URL ?? "https://wed.tonewbeginning.com";

export const sectionLabels = {
  HERO: "Hero",
  STORY: "Our Story",
  EVENTS: "Events",
  SCHEDULE: "Schedule",
  TIDBITS: "Tidbits",
  DRESS_CODE: "Dress Codes",
  EXPERIENCE: "Guest Experience",
  GALLERY: "Gallery",
  VIDEOS: "Videos",
  RSVP: "RSVP",
  MEMORIES: "Guest Memories",
  MESSAGES: "Wishes",
  REGISTRY: "Registry",
  SAVE_THE_DATE: "Save the Date",
} as const;

export const reservedSlugs = [
  "dashboard",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "pricing",
  "admin",
  "api",
  "kammonbeginnings",
];

export const authCookieName = "wedme_session";
export const workspaceResumeCookieName = "wedme_workspace_resume";

export const dashboardRoutes = [
  "/dashboard",
  "/dashboard/templates",
  "/dashboard/content",
  "/dashboard/events",
  "/dashboard/rsvps",
  "/dashboard/uploads",
  "/dashboard/settings",
  "/dashboard/preview",
] as const;

export function resolveWorkspaceResumePath(pathname?: string | null) {
  if (!pathname) {
    return "/dashboard";
  }

  return dashboardRoutes.includes(pathname as (typeof dashboardRoutes)[number]) ? pathname : "/dashboard";
}

export const sectionOrder = [
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
] as const;

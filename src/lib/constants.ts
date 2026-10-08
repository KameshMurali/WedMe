// Canonical public origin for absolute URLs (metadataBase, canonicals, OG,
// robots, sitemap). Falls back to the production domain so a missing APP_URL in
// prod never leaks a `http://localhost:3000` canonical to search engines; dev
// still honors a localhost APP_URL from .env.local.
export const siteUrl = process.env.APP_URL ?? "https://wed.tonewbeginning.com";

// Display-only, and safe to use from a client component.
//
// siteUrl reads process.env.APP_URL. Referencing that from client code makes
// Next inline the value into the browser bundle at build time, which both bakes
// in whatever host the build happened to run on — a local build rendered
// "127.0.0.1:3000" into the signup page's URL preview — and drags a server
// variable somewhere it does not belong. A couple reading "your guests will
// visit ..." wants the real public address regardless of where the build ran.
export const publicSiteDomain = "wed.tonewbeginning.com";

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
  // The password / invite-code gate lives at /unlock/[slug]. It is a top-level
  // route rather than /[slug]/unlock so that the gate in [slug]/layout.tsx
  // cannot redirect to a page it also guards, which would loop forever.
  "unlock",
  // Sixteen public design pages live at /templates and /templates/[key].
  "templates",
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
  "REGISTRY",
  "RSVP",
  "MEMORIES",
  "MESSAGES",
] as const;

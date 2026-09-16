import { KolamEdgeBorder } from "@/components/public/kolam";
import { ScrollProgressBar } from "@/components/public/motion-primitives";
import {
  ornamentKindFor,
  usesKolamOrnament,
  usesPalaceOrnament,
  usesTempleOrnament,
} from "@/components/public/motifs";
import { ChapelFrame } from "@/components/public/chapel-ornament";
import { DesertFrame } from "@/components/public/desert-ornament";
import { GirihFrame } from "@/components/public/girih-ornament";
import { LanternFrame } from "@/components/public/lantern-ornament";
import { PalaceFrame } from "@/components/public/palace-ornament";
import { TempleFrame } from "@/components/public/temple-ornament";
import { SiteActivityTracker } from "@/components/public/site-activity-tracker";
import { SiteHeader } from "@/components/public/site-header";
import { isDarkColor } from "@/lib/color";
import { findTemplateByKey } from "@/lib/template-registry";
import { cn, formatDate } from "@/lib/utils";
import type { SiteSnapshot } from "@/types";

// Resolves a stored font key to the CSS variable next/font generated for it.
// Unknown keys fall through to the default face rather than emitting an invalid
// var(), so a stale key from an older theme can never break rendering.
function headingFontFace(key: string | null | undefined): string {
  if (key === "luxe") return "var(--font-cinzel)";
  if (key === "tamil") return "var(--font-tamil)";
  if (key === "arabic") return "var(--font-arabic)";
  if (key === "sc") return "var(--font-sc)";
  return "var(--font-cormorant)";
}

function bodyFontFace(key: string | null | undefined): string {
  if (key === "tamil") return "var(--font-tamil)";
  if (key === "arabic") return "var(--font-arabic)";
  if (key === "sc") return "var(--font-sc)";
  return "var(--font-manrope)";
}

// Maps route suffix → the SectionType that gates it. "Home" has no gate (always shown).
const navigationConfig: Array<{ href: string; label: string; sectionType?: string }> = [
  { href: "", label: "Home" },
  { href: "/story", label: "Story", sectionType: "STORY" },
  { href: "/events", label: "Events", sectionType: "EVENTS" },
  { href: "/schedule", label: "Schedule", sectionType: "SCHEDULE" },
  { href: "/rsvp", label: "RSVP", sectionType: "RSVP" },
  { href: "/gallery", label: "Gallery", sectionType: "GALLERY" },
  { href: "/experience", label: "Guest Experience", sectionType: "EXPERIENCE" },
  { href: "/registry", label: "Registry", sectionType: "REGISTRY" },
  { href: "/memories", label: "Memories", sectionType: "MEMORIES" },
  { href: "/wishes", label: "Wishes", sectionType: "MESSAGES" },
];

function filterNavItems(
  config: typeof navigationConfig,
  sections: SiteSnapshot["sections"],
) {
  const enabledTypes = new Set(
    sections.filter((s) => s.enabled).map((s) => s.type),
  );
  return config.filter((item) => !item.sectionType || enabledTypes.has(item.sectionType));
}

// Page backdrop. One class per chromeStyle; every gradient inside it is
// composed from the template's own tokens in globals.css, so the palette drives
// the page. The switch has no default arm on purpose — TypeScript then requires
// a case for every member of the union, which is what stops a newly added
// template from silently inheriting another one's colours.
function getShellBackdropClass(
  chromeStyle: ReturnType<typeof findTemplateByKey>["chromeStyle"],
) {
  switch (chromeStyle) {
    case "wash":
      return "chrome-wash";
    case "grid":
      return "chrome-grid";
    case "vignette":
      return "chrome-vignette";
    case "radiant":
      return "chrome-radiant";
    case "veil":
      return "chrome-veil";
    case "horizon":
      return "chrome-horizon";
  }
}

export function SiteShell({
  snapshot,
  activeHref,
  children,
}: {
  snapshot: SiteSnapshot;
  activeHref?: string;
  children: React.ReactNode;
}) {
  const template = findTemplateByKey(snapshot.theme.templateKey);
  // Derived from the palette, not the template key. The old check was
  // `template.key === "cinematic-modern"`, so any other dark template — and any
  // couple who darkened their own background in the customizer — kept the light
  // nav treatment and got near-white text on a white pill.
  const isDark = isDarkColor(snapshot.theme.backgroundColor);
  const showBackToPlatformHome = snapshot.site.slug === "kammonbeginnings";
  const visibleNavItems = filterNavItems(navigationConfig, snapshot.sections);

  return (
    <>
    <ScrollProgressBar />
    <div
      style={
        {
          "--background": snapshot.theme.backgroundColor,
          "--surface": snapshot.theme.surfaceColor,
          "--text": snapshot.theme.textColor,
          "--muted": snapshot.theme.mutedColor,
          "--primary": snapshot.theme.primaryColor,
          "--accent": snapshot.theme.accentColor,
          "--radius": snapshot.theme.borderRadius,
          // The customizer has always let couples pick a heading font, but the
          // public site hardcoded font-display and ignored it. Resolving the
          // key to a face here makes every existing `font-display` usage honour
          // the choice, without touching each call site.
          "--font-heading-face": headingFontFace(snapshot.theme.headingFontKey),
          "--font-body-face": bodyFontFace(snapshot.theme.bodyFontKey),
        } as React.CSSProperties
      }
      // theme-scope is what derives --border and --elevation from this
      // element's own --primary; data-tone lets CSS branch on light/dark
      // without threading a prop through every panel.
      className="theme-scope relative min-h-screen bg-[color:var(--background)]"
      data-tone={isDark ? "dark" : "light"}
      // shadowStyle has been editable in the customizer, validated and stored
      // since the theme table existed, and no public component ever read it.
      // Now that elevation is a token it can finally mean something.
      data-shadow={snapshot.theme.shadowStyle}
    >
      {/* Decorations live in their own overflow-hidden layer that is a SIBLING
          of the sticky header, not an ancestor. An overflow-hidden ancestor
          silently disables position: sticky, which was why the header didn't
          stay pinned on scroll. This clips the gradients without trapping the
          header. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn("absolute inset-0", getShellBackdropClass(template.chromeStyle))} />
        {/* A lift at the top of the page. This was from-white/25, which on a dark
            template washed the header area grey; mixing from --surface keeps the
            same lift in the template's own material. */}
        <div
          className="absolute inset-x-0 top-0 h-[32rem]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, color-mix(in srgb, var(--surface) 25%, transparent), transparent)",
          }}
        />
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/30 to-transparent" />
      </div>
      {/* AFTER the backdrop: that layer is a later sibling with its own
          gradients and painted straight over the ornament when this sat above
          it. z-[1] keeps it above the backdrop but under the content (z-10). */}
      {usesKolamOrnament(template.key) ? <KolamEdgeBorder /> : null}
      {usesTempleOrnament(template.key) ? <TempleFrame /> : null}
      {usesPalaceOrnament(template.key) ? <PalaceFrame /> : null}
      {ornamentKindFor(template.key) === "girih" ? <GirihFrame /> : null}
      {ornamentKindFor(template.key) === "chapel" ? <ChapelFrame /> : null}
      {ornamentKindFor(template.key) === "lantern" ? <LanternFrame /> : null}
      {ornamentKindFor(template.key) === "desert" ? <DesertFrame /> : null}
      <SiteActivityTracker slug={snapshot.site.slug} />

      <SiteHeader
        templateKey={template.key}
        brandName={snapshot.site.brandName}
        coupleNames={snapshot.site.coupleNames}
        weddingDate={snapshot.site.weddingDate}
        locationSummary={snapshot.site.locationSummary ?? null}
        slug={snapshot.site.slug}
        visibility={snapshot.publish.visibility}
        visibleNavItems={visibleNavItems}
        activeHref={activeHref}
        showBackToPlatformHome={showBackToPlatformHome}
        isDark={isDark}
      />

      <div className="relative z-10 pb-24">{children}</div>
      {snapshot.ownerPreview ? (
        <div className="relative z-20">
          <div className="section-shell pt-6">
            <div className="rounded-3xl border border-amber-200 bg-amber-50/95 px-5 py-4 text-sm leading-7 text-amber-950">
              You&apos;re viewing your unpublished draft at this slug because you&apos;re signed in as
              the workspace owner. Guests will only be able to open this URL after you publish the
              site from Settings.
            </div>
          </div>
        </div>
      ) : null}

      <footer className="relative z-10 pt-6">
        <div className="section-shell pb-10">
          <div
            className={cn(
              "chrome-footer overflow-hidden rounded-[calc(var(--radius)+0.8rem)] border px-6 py-8 sm:px-8 sm:py-10",
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Wedding website</p>
                <p className="mt-3 font-display text-4xl text-[color:var(--text)] sm:text-5xl">
                  {snapshot.site.brandName}
                </p>
                <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                  Crafted for {snapshot.site.coupleNames} with a guided guest experience, polished details, and a
                  celebration-first design system.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                <div className="rounded-[1.6rem] panel-faint border border-[color:var(--accent)]/18 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Celebration</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">
                    {snapshot.site.locationSummary ?? "Destination to be revealed"}
                  </p>
                </div>
                <div className="rounded-[1.6rem] panel-faint border border-[color:var(--accent)]/18 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Date</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">
                    {formatDate(snapshot.site.weddingDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

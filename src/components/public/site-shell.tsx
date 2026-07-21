import { SiteActivityTracker } from "@/components/public/site-activity-tracker";
import { SiteHeader } from "@/components/public/site-header";
import { findTemplateByKey } from "@/lib/template-registry";
import { cn, formatDate } from "@/lib/utils";
import type { SiteSnapshot } from "@/types";

// Maps route suffix → the SectionType that gates it. "Home" has no gate (always shown).
const navigationConfig: Array<{ href: string; label: string; sectionType?: string }> = [
  { href: "", label: "Home" },
  { href: "/story", label: "Story", sectionType: "STORY" },
  { href: "/events", label: "Events", sectionType: "EVENTS" },
  { href: "/schedule", label: "Schedule", sectionType: "SCHEDULE" },
  { href: "/rsvp", label: "RSVP", sectionType: "RSVP" },
  { href: "/gallery", label: "Gallery", sectionType: "GALLERY" },
  { href: "/experience", label: "Guest Experience", sectionType: "EXPERIENCE" },
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

function getShellBackdropClasses(templateKey: string) {
  switch (templateKey) {
    case "floral-romantic":
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_32%),radial-gradient(circle_at_22%_18%,rgba(217,138,162,0.18),transparent_26%),radial-gradient(circle_at_78%_12%,rgba(255,207,220,0.22),transparent_24%),linear-gradient(180deg,rgba(255,250,252,0.9)_0%,rgba(255,247,250,0.96)_38%,rgba(255,244,248,1)_100%)]";
    case "minimal-luxury":
      return "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,248,244,0.98)_100%),linear-gradient(90deg,rgba(44,36,29,0.03)_1px,transparent_1px),linear-gradient(rgba(44,36,29,0.03)_1px,transparent_1px)] [background-size:auto,52px_52px,52px_52px]";
    case "cinematic-modern":
      return "bg-[radial-gradient(circle_at_top_left,rgba(199,149,89,0.2),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,#120d16_0%,#17111d_38%,#120d16_100%)]";
    case "traditional-celebration":
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(207,122,36,0.16),transparent_26%),radial-gradient(circle_at_18%_12%,rgba(207,122,36,0.12),transparent_24%),linear-gradient(180deg,#fff9f2_0%,#fff5ea_52%,#fffaf6_100%)]";
    default:
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(184,140,74,0.14),transparent_24%),linear-gradient(180deg,#fffaf5_0%,#fcf6f0_42%,#fcf8f3_100%)]";
  }
}

function getFooterPanelClasses(templateKey: string) {
  switch (templateKey) {
    case "cinematic-modern":
      return "border-white/10 bg-[linear-gradient(135deg,rgba(32,22,37,0.96),rgba(20,15,24,0.92))]";
    case "traditional-celebration":
      return "border-[color:var(--accent)]/28 bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(255,244,227,0.86))]";
    case "minimal-luxury":
      return "border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,243,238,0.92))]";
    default:
      return "border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,244,0.88))]";
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
  const isDark = template.key === "cinematic-modern";
  const showBackToPlatformHome = snapshot.site.slug === "kammonbeginnings";
  const visibleNavItems = filterNavItems(navigationConfig, snapshot.sections);

  return (
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
        } as React.CSSProperties
      }
      className="relative min-h-screen bg-[color:var(--background)]"
    >
      {/* Decorations live in their own overflow-hidden layer that is a SIBLING
          of the sticky header, not an ancestor. An overflow-hidden ancestor
          silently disables position: sticky, which was why the header didn't
          stay pinned on scroll. This clips the gradients without trapping the
          header. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn("absolute inset-0", getShellBackdropClasses(template.key))} />
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-white/25 to-transparent" />
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/30 to-transparent" />
      </div>
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
              "overflow-hidden rounded-[calc(var(--radius)+0.8rem)] border px-6 py-8 sm:px-8 sm:py-10",
              getFooterPanelClasses(template.key),
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
                <div className="rounded-[1.6rem] border border-[color:var(--accent)]/18 bg-white/35 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Celebration</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">
                    {snapshot.site.locationSummary ?? "Destination to be revealed"}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-[color:var(--accent)]/18 bg-white/35 px-4 py-4">
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
  );
}

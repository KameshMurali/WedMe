import { siteUrl } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

// Couples shouldn't have to know what "Open Graph" or "canonical URL" means.
// Everything search engines and chat apps need is derived from content the
// couple has already entered; the Settings fields are optional overrides.
//
// Shared by the published-site metadata (app/[slug]/layout.tsx) and the
// Settings form, so the placeholders a couple sees are exactly what will ship.

type MetadataSource = {
  slug: string;
  brandName: string;
  coupleNames: string;
  weddingDate: string | Date | null;
  locationSummary: string | null;
  heroImageUrl: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
};

function cleaned(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

// "Kamesh & Monisha's Wedding · May 2027" — the couple's names first, because
// that's what guests actually search for and recognise in a browser tab.
export function deriveSeoTitle(source: MetadataSource) {
  const names = cleaned(source.coupleNames) ?? cleaned(source.brandName) ?? "Our Wedding";
  const date = source.weddingDate
    ? formatDate(source.weddingDate, { month: "long", year: "numeric", day: undefined })
    : null;
  return date && date !== "Date to be announced"
    ? `${names}'s Wedding · ${date}`
    : `${names}'s Wedding`;
}

export function deriveSeoDescription(source: MetadataSource) {
  const names = cleaned(source.coupleNames) ?? cleaned(source.brandName) ?? "The couple";
  const date = source.weddingDate ? formatDate(source.weddingDate) : null;
  const place = cleaned(source.locationSummary);

  const when = date && date !== "Date to be announced" ? ` on ${date}` : "";
  const where = place ? ` in ${place}` : "";

  return `${names} invite you to celebrate their wedding${when}${where}. Explore the events, RSVP, browse the gallery, and leave your wishes.`;
}

// Falls back to the couple's hero photo before the platform card, so a shared
// link is never imageless just because nobody filled in an "OG image" field.
export function deriveOgImageUrl(source: MetadataSource) {
  return cleaned(source.ogImageUrl) ?? cleaned(source.heroImageUrl) ?? `${siteUrl}/og-image.png`;
}

export function deriveCanonicalUrl(source: MetadataSource) {
  return cleaned(source.canonicalUrl) ?? `${siteUrl}/${source.slug}`;
}

// Resolved values actually used when rendering the published site: an explicit
// override when the couple set one, otherwise the derived default.
export function resolveSiteMetadata(source: MetadataSource) {
  return {
    title: cleaned(source.seoTitle) ?? deriveSeoTitle(source),
    description: cleaned(source.seoDescription) ?? deriveSeoDescription(source),
    ogImageUrl: deriveOgImageUrl(source),
    canonicalUrl: deriveCanonicalUrl(source),
  };
}

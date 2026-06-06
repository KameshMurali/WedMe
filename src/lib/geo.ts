// Currency localization for pricing. The Vercel edge populates an
// `x-vercel-ip-country` header on every request; we map that to one of our
// supported currencies. Falls back to USD when the country is unknown or
// outside our pricing matrix.

import { headers } from "next/headers";

import { currencies, type CurrencyCode } from "@/lib/pricing";

// Country (ISO 3166-1 alpha-2) → currency we display. Bias toward the
// "biggest neighbor" currency rather than a literal FX swap (e.g. all Eurozone
// countries → EUR, all GCC countries → AED so we don't have to add separate
// SAR/QAR/OMR rows yet).
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: "INR",
  US: "USD",
  CA: "USD",
  GB: "GBP",
  IE: "EUR",
  // Eurozone members (and a few near-neighbors we'd rather price in EUR).
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR",
  PT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
  // Gulf & nearby — show AED.
  AE: "AED", SA: "AED", QA: "AED", OM: "AED", BH: "AED", KW: "AED",
};

export const COOKIE_NAME = "tnb-currency";
const FALLBACK: CurrencyCode = "USD";

function isCurrency(value: string | undefined): value is CurrencyCode {
  return Boolean(value && value in currencies);
}

/**
 * Server-side currency detection used to render the right price on first paint
 * — no client-side flash or geolocation API needed.
 *
 *   1. Honor an explicit cookie (set by the CurrencySwitcher).
 *   2. Else read Vercel's edge country header and look up the currency.
 *   3. Else fall back to USD.
 */
export async function detectCurrency(): Promise<CurrencyCode> {
  const h = await headers();

  const cookieHeader = h.get("cookie") ?? "";
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const cookieValue = cookieMatch ? decodeURIComponent(cookieMatch[1]) : undefined;
  if (isCurrency(cookieValue)) return cookieValue;

  const country = (h.get("x-vercel-ip-country") ?? "").toUpperCase();
  const mapped = COUNTRY_TO_CURRENCY[country];
  if (isCurrency(mapped)) return mapped;

  return FALLBACK;
}

// A guest's identity for duplicate detection: name + email + contact number,
// normalised so trivial differences ("  Priya Sharma", "PRIYA@x.com",
// "+91 98765 43210") resolve to the same person.

export function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

// Digits only, so formatting and punctuation never create a "new" guest.
// The trailing 10 digits are used so +91 98765 43210 and 09876543210 match.
export function normalizePhone(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Stored on RSVPResponse.dedupeKey and backed by a unique index, so a
// double-submit races into a constraint violation rather than a duplicate row.
export function buildRsvpDedupeKey(input: {
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
}) {
  return [
    normalizeName(input.guestName),
    normalizeEmail(input.guestEmail),
    normalizePhone(input.guestPhone),
  ].join("|");
}

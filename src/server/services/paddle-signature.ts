import "server-only";

import crypto from "node:crypto";

// Paddle signs every webhook with the header:
//   Paddle-Signature: ts=1700000000;h1=<hex hmac>
// where the HMAC is SHA-256 over `${ts}:${rawBody}` keyed with the endpoint's
// signing secret. This verification IS the security boundary for the webhook:
// without it, anyone who knows the URL could POST a JSON body and grant
// themselves a paid plan.

const MAX_SKEW_SECONDS = 5 * 60;

export type SignatureResult =
  | { ok: true }
  | { ok: false; reason: "missing_secret" | "malformed_header" | "stale" | "mismatch" };

function parseHeader(header: string) {
  const parts = header.split(";");
  let ts: string | null = null;
  let h1: string | null = null;
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value ?? null;
    if (key === "h1") h1 = value ?? null;
  }
  return { ts, h1 };
}

export function verifyPaddleSignature({
  header,
  rawBody,
  secret,
  now = new Date(),
}: {
  header: string | null;
  rawBody: string;
  secret: string | undefined;
  now?: Date;
}): SignatureResult {
  // Fail closed. An unset secret must never mean "accept everything".
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!header) return { ok: false, reason: "malformed_header" };

  const { ts, h1 } = parseHeader(header);
  if (!ts || !h1) return { ok: false, reason: "malformed_header" };

  // Replay protection: a captured payload can't be re-sent later.
  const timestampSeconds = Number.parseInt(ts, 10);
  if (!Number.isFinite(timestampSeconds)) return { ok: false, reason: "malformed_header" };
  const skew = Math.abs(Math.floor(now.getTime() / 1000) - timestampSeconds);
  if (skew > MAX_SKEW_SECONDS) return { ok: false, reason: "stale" };

  const expected = crypto.createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");

  // Constant-time compare; timingSafeEqual throws on length mismatch, so guard.
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(h1, "utf8");
  if (expectedBuffer.length !== providedBuffer.length) return { ok: false, reason: "mismatch" };
  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) return { ok: false, reason: "mismatch" };

  return { ok: true };
}

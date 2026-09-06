import "server-only";

import crypto from "node:crypto";

import { prisma } from "@/server/prisma";
import { getClientIp, getRequestUserAgent } from "@/server/security/request";

type HeaderReader = Pick<Headers, "get">;
type HeaderSource = HeaderReader | Request;

export type RateLimitConfig = {
  action: string;
  source: HeaderSource;
  limit: number;
  windowMs: number;
  keyParts?: Array<string | number | null | undefined>;
  // When true the bucket key is derived from keyParts ONLY (no IP/UA mixing),
  // so a limit stays stable for a user across devices and networks. Use for
  // per-account quotas (e.g. the AI daily cap); leave off for abuse buckets.
  keyByPartsOnly?: boolean;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  // null = unknown. Set when the limiter failed open on an error: the request
  // is allowed, but no honest count can be reported and callers must not
  // display one.
  remaining: number | null;
  retryAfterSeconds: number;
};

type RateLimitRow = {
  count: number;
};

let rateLimitTableReady: Promise<void> | null = null;

function hashIdentifier(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeKeyParts(keyParts: RateLimitConfig["keyParts"]) {
  return (keyParts ?? []).map((part) => String(part ?? "").trim().toLowerCase());
}

function buildKey(
  source: HeaderSource,
  keyParts: RateLimitConfig["keyParts"],
  keyByPartsOnly?: boolean,
) {
  const parts = (
    keyByPartsOnly
      ? normalizeKeyParts(keyParts)
      : [getClientIp(source), getRequestUserAgent(source), ...normalizeKeyParts(keyParts)]
  ).filter(Boolean);

  return hashIdentifier(parts.join(":"));
}

function buildPartsOnlyKey(keyParts: RateLimitConfig["keyParts"]) {
  return hashIdentifier(normalizeKeyParts(keyParts).filter(Boolean).join(":"));
}

function getWindowStart(now: Date, windowMs: number) {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

async function ensureRateLimitTable() {
  if (!rateLimitTableReady) {
    // NOTE: the promise is cleared on failure below. Caching a REJECTED promise
    // here would make every later await re-throw, so a single transient error
    // would silently disable every rate limit for the life of the instance.
    rateLimitTableReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "RateLimitBucket" (
          "id" TEXT PRIMARY KEY,
          "action" TEXT NOT NULL,
          "keyHash" TEXT NOT NULL,
          "windowStart" TIMESTAMP(3) NOT NULL,
          "count" INTEGER NOT NULL DEFAULT 1,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "rate_limit_bucket_action_key_window"
        ON "RateLimitBucket" ("action", "keyHash", "windowStart");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "RateLimitBucket_expiresAt_idx"
        ON "RateLimitBucket" ("expiresAt");
      `);
    })();
  }

  try {
    await rateLimitTableReady;
  } catch (error) {
    // Clear the cached promise so the next call retries. Leaving a REJECTED
    // promise memoised would make every later await re-throw, so one transient
    // failure would disable every rate limit for the life of the instance.
    rateLimitTableReady = null;
    throw error;
  }
}

export async function consumeRateLimit({
  action,
  source,
  limit,
  windowMs,
  keyParts,
  keyByPartsOnly,
}: RateLimitConfig): Promise<RateLimitResult> {
  try {
    await ensureRateLimitTable();

    const now = new Date();
    const windowStart = getWindowStart(now, windowMs);
    const windowEnd = new Date(windowStart.getTime() + windowMs);
    const expiresAt = new Date(windowEnd.getTime() + windowMs);
    const keyHash = buildKey(source, keyParts, keyByPartsOnly);

    const [bucket] = await prisma.$queryRawUnsafe<RateLimitRow[]>(
      `
        INSERT INTO "RateLimitBucket" ("id", "action", "keyHash", "windowStart", "count", "expiresAt", "updatedAt")
        VALUES ($1, $2, $3, $4, 1, $5, CURRENT_TIMESTAMP)
        ON CONFLICT ("action", "keyHash", "windowStart")
        DO UPDATE
          SET "count" = "RateLimitBucket"."count" + 1,
              "expiresAt" = EXCLUDED."expiresAt",
              "updatedAt" = CURRENT_TIMESTAMP
        RETURNING "count";
      `,
      crypto.randomUUID(),
      action,
      keyHash,
      windowStart,
      expiresAt,
    );

    const count = bucket?.count ?? 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowEnd.getTime() - now.getTime()) / 1000));
    const remaining = Math.max(0, limit - count);

    if (Math.random() < 0.02) {
      void prisma.$executeRawUnsafe(`DELETE FROM "RateLimitBucket" WHERE "expiresAt" < $1`, now).catch(() => undefined);
    }

    return {
      ok: count <= limit,
      limit,
      remaining,
      retryAfterSeconds,
    };
  } catch (error) {
    console.error("consumeRateLimit failed; allowing request", { action, error });

    // Fail open so a database blip cannot lock people out of login, but report
    // the count as UNKNOWN rather than as the full limit.
    return {
      ok: true,
      limit,
      remaining: null,
      retryAfterSeconds: 0,
    };
  }
}

export type RateLimitPeekConfig = {
  action: string;
  limit: number;
  windowMs: number;
  // Peek keys are always derived from keyParts only (no request headers), so a
  // peek can run from a server component without a Request and still match a
  // consume call made with `keyByPartsOnly: true` and identical keyParts.
  keyParts: Array<string | number | null | undefined>;
};

// Non-consuming read of a parts-only bucket: how many attempts remain in the
// current window WITHOUT spending one. Used to render "You can attempt N more
// times today" in the dashboard. Fails open (full remaining) on DB error,
// consistent with consumeRateLimit.
export async function peekRateLimit({
  action,
  limit,
  windowMs,
  keyParts,
}: RateLimitPeekConfig): Promise<RateLimitResult> {
  try {
    await ensureRateLimitTable();

    const now = new Date();
    const windowStart = getWindowStart(now, windowMs);
    const windowEnd = new Date(windowStart.getTime() + windowMs);
    const keyHash = buildPartsOnlyKey(keyParts);

    const [bucket] = await prisma.$queryRawUnsafe<RateLimitRow[]>(
      `
        SELECT "count" FROM "RateLimitBucket"
        WHERE "action" = $1 AND "keyHash" = $2 AND "windowStart" = $3
        LIMIT 1;
      `,
      action,
      keyHash,
      windowStart,
    );

    const count = bucket?.count ?? 0;
    return {
      ok: count < limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)),
    };
  } catch (error) {
    console.error("peekRateLimit failed; reporting full allowance", { action, error });

    return {
      ok: true,
      limit,
      remaining: limit,
      retryAfterSeconds: 0,
    };
  }
}

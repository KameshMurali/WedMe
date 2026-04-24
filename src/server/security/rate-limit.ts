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
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitRow = {
  count: number;
};

let rateLimitTableReady: Promise<void> | null = null;

function hashIdentifier(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function buildKey(source: HeaderSource, keyParts: RateLimitConfig["keyParts"]) {
  const parts = [
    getClientIp(source),
    getRequestUserAgent(source),
    ...(keyParts ?? []).map((part) => String(part ?? "").trim().toLowerCase()),
  ].filter(Boolean);

  return hashIdentifier(parts.join(":"));
}

function getWindowStart(now: Date, windowMs: number) {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

async function ensureRateLimitTable() {
  if (!rateLimitTableReady) {
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

  await rateLimitTableReady;
}

export async function consumeRateLimit({
  action,
  source,
  limit,
  windowMs,
  keyParts,
}: RateLimitConfig): Promise<RateLimitResult> {
  await ensureRateLimitTable();

  const now = new Date();
  const windowStart = getWindowStart(now, windowMs);
  const windowEnd = new Date(windowStart.getTime() + windowMs);
  const expiresAt = new Date(windowEnd.getTime() + windowMs);
  const keyHash = buildKey(source, keyParts);

  const [bucket] = await prisma.$queryRawUnsafe<RateLimitRow[]>(
    `
      INSERT INTO "RateLimitBucket" ("id", "action", "keyHash", "windowStart", "count", "expiresAt")
      VALUES ($1, $2, $3, $4, 1, $5)
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
}

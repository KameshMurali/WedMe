-- "updatedAt" is NOT NULL with no database default, because Prisma's @updatedAt
-- is a CLIENT-side feature (unlike @default(now()), which does emit a DB
-- default). The raw upsert in src/server/security/rate-limit.ts omitted the
-- column and therefore threw on every call, and the limiter's fail-open catch
-- swallowed it -- silently disabling every rate limit in the app.
--
-- The INSERT now supplies the column explicitly. This default is belt and
-- braces so a future raw write cannot reintroduce the same fault.
ALTER TABLE "RateLimitBucket" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

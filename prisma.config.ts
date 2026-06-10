import { defineConfig, env } from "prisma/config";

// Prisma migration commands need a session-level connection (advisory locks,
// prepared statements) which pgbouncer's transaction mode can't provide.
// Prefer DIRECT_URL when set; fall back to DATABASE_URL for local dev where
// they're the same database.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL") ?? env("DATABASE_URL"),
  },
});

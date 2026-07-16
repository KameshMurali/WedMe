import { defineConfig } from "prisma/config";

// Prisma migration commands need a session-level connection (advisory locks,
// prepared statements) which pgbouncer's transaction mode can't provide.
// Prefer DIRECT_URL when set; fall back to DATABASE_URL. Plain process.env is
// used instead of Prisma's env() helper — the helper throws at config-load
// time (PrismaConfigEnvError) in environments it can't resolve, which broke
// the Vercel build. The final localhost placeholder keeps URL-less commands
// (e.g. postinstall `prisma generate`) loading the config without throwing;
// anything that actually connects will fail loudly at connect time instead.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/wedme",
  },
});

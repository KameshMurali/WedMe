# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WedMe is a multi-tenant wedding website SaaS platform. Couples register, pick a design template, build their wedding site in a private dashboard, then publish it. Guests visit the public `/{slug}` site to RSVP, upload photos, and leave messages.

## Commands

```bash
# Development
npm run dev               # Start Next.js dev server (port 3000)
npm run build             # Run prisma migrate deploy + prisma generate + next build
npm run lint              # ESLint (quiet mode)
npx tsc --noEmit          # Type-check without emitting

# Database
npm run db:migrate        # Interactive migration (prisma migrate dev)
npm run db:push           # Push schema changes without migration files
npm run db:generate       # Regenerate Prisma client after schema changes
npm run db:seed           # Seed demo data (KamMonBeginnings couple)
```

No test framework is configured.

## Architecture

### Request flow

- **Middleware** (`middleware.ts`): Edge-level auth guard; redirects unauthenticated requests to `/login` for any path under `/dashboard/*`.
- **Dashboard pages** (`src/app/dashboard/`): Always call `requireUser()` or `requireAdmin()` server-side as a second auth check — the middleware alone is not sufficient.
- **Server Actions** (`src/actions/`): Primary mutation pattern for all dashboard operations. Each action validates session via `requireUser()` before touching the database.
- **API routes** (`src/app/api/`): Used for guest-facing flows (RSVP, messages, uploads, analytics) and admin CSV exports. All public endpoints have rate limiting.
- **Public wedding pages** (`src/app/[slug]/`): Read from `publishedSnapshot` only — guests never see draft data.

### Publish model

Couples edit content in draft state. The "Publish" action serializes the entire current site state into a JSON `publishedSnapshot` column. Public pages render from that snapshot, completely decoupled from the live editing tables.

### Auth

Custom email/password auth — no OAuth. Passwords hashed with bcryptjs. Sessions are signed JWTs (jose) stored as httpOnly cookies (`AUTH_COOKIE_NAME` from `src/lib/constants.ts`). Session max-age is 14 days. Key session functions live in `src/server/auth/session.ts`:
- `getSession()` / `getCurrentUser()` — returns null if unauthenticated
- `requireUser()` — throws redirect to `/login` if unauthenticated
- `requireAdmin()` — checks against `ADMIN_EMAILS` env var

### Template system

Five premium templates are defined in `src/lib/template-registry.ts`. Each template has a set of theme defaults (CSS variable values). When a couple switches templates or customizes colors, the new values are stored per-couple and injected as CSS variables at render time.

### Storage abstraction

`src/server/storage/index.ts` exports a factory driven by `STORAGE_DRIVER` env var. Swap between `"local"` (filesystem under `public/uploads/`), `"blob"` (Vercel Blob), and `"s3"` (AWS S3) without touching upload logic.

### Email abstraction

`src/server/services/email.ts` routes via `EMAIL_DELIVERY_MODE`: `"console"` logs to stdout, `"smtp"` uses Nodemailer, `"resend"` uses the Resend API.

### Rate limiting

Database-backed via the `RateLimitBucket` Prisma model. Applied to login, RSVP, messages, and upload endpoints. Implementation in `src/server/security/rate-limit.ts`.

## Key Conventions

### Path alias
`@/*` maps to `src/*`. Always use this alias for imports within the project.

### Server / client boundary
- Files with `"use server"` are server actions — never import client-only code there.
- Prisma is only ever imported from `@/server/prisma` (singleton). Never instantiate it elsewhere.
- `src/lib/env.ts` exports a Zod-validated environment object — use it instead of `process.env` directly.

### Validation
Zod schemas live in `src/lib/validations/`. Server actions re-validate with the same schemas used by the frontend forms (React Hook Form + Zod).

### Server action response shape
All server actions return `ActionState` from `src/lib/action-state.ts` — a discriminated union with `{ success: true, data }` or `{ success: false, error }`.

### Constants
Reserved slugs, section labels, and the auth cookie name are in `src/lib/constants.ts`. Don't hardcode these values inline.

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection (pooled) |
| `DIRECT_URL` | Direct connection for migrations (optional, falls back to DATABASE_URL) |
| `AUTH_SECRET` | 16+ char secret for JWT signing |
| `APP_URL` | Base URL (e.g. `http://localhost:3000`) |
| `STORAGE_DRIVER` | `local` \| `s3` \| `blob` |
| `EMAIL_DELIVERY_MODE` | `console` \| `smtp` \| `resend` |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses |

See `.env.example` for the full list including optional S3/Resend/SMTP variables.

## Local Setup

```bash
cp .env.example .env.local   # Fill in DATABASE_URL and AUTH_SECRET at minimum
npm install
npm run db:migrate            # Create tables
npm run db:seed               # Optional: seed demo couple
npm run dev
```

Demo couple after seeding: `kammon@example.com` / `KamMon2027!` → public site at `/kammonbeginnings`.

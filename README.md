# ToNewBeginning.com

ToNewBeginning.com is a premium wedding website platform for **KamMonBeginnings** built with **Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma**.

This repo is not a single static wedding page. It is structured as a scalable wedding website SaaS starter with:

- a polished public wedding website experience for guests
- a secure couple/admin dashboard
- a reusable template and theme system
- RSVP management and CSV export
- guest wishes/messages with moderation
- guest photo/video memory uploads with moderation
- publish-vs-draft content workflow
- Prisma-backed data modelling for future multi-tenant growth

## What’s included

### Public experience

- `/{slug}` wedding homepage with hero, story, events, schedule, tidbits, dress codes, guest experience, gallery, and video sections
- dedicated subpages for `story`, `events`, `schedule`, `rsvp`, `gallery`, `experience`, `memories`, and `wishes`
- template-aware design system with 5 premium presets
- SEO metadata generation and noindex/privacy controls
- analytics event capture for page views and guest actions

### Couple dashboard

- email/password registration and login
- forgot/reset password flow
- email verification route
- template selector and theme customisation
- site settings and publish controls
- story, tidbits, FAQ, guest-experience, dress code, video, event, and itinerary editors
- media upload flow for couple-side images
- RSVP response management
- guest upload moderation
- guest message moderation
- draft preview that uses the same public renderer

### Backend foundation

- Prisma schema for users, couples, wedding sites, templates, sections, events, RSVP responses, uploads, messages, and analytics
- Prisma 7 config via `prisma.config.ts`
- PostgreSQL runtime via Prisma’s official `@prisma/adapter-pg`
- local storage adapter for uploaded media with clean abstraction for future S3 support
- Zod validation across auth, RSVP, content, and upload workflows

## Demo seed

The repo seeds a full **KamMonBeginnings** experience with:

- couple names: `Kam & Monisha`
- wedding brand: `KamMonBeginnings`
- 5 sample events: `Mehendi`, `Haldi`, `Sangeet`, `Wedding Ceremony`, `Reception`
- realistic sample itinerary, tidbits, FAQs, dress codes, gallery assets, videos, invite groups, RSVP data, uploads, messages, and analytics

After seeding, you can log in with:

- Email: `kammon@example.com`
- Password: `KamMon2027!`

Public demo slug:

- `http://localhost:3000/kammonbeginnings`

## Tech stack

- Frontend: Next.js 16 App Router, React 19, TypeScript
- Styling: Tailwind CSS
- Forms: React Hook Form + Zod
- Database: PostgreSQL + Prisma ORM
- Auth: custom secure email/password auth with hashed passwords and signed cookies
- Storage: local filesystem adapter today, S3-ready abstraction in `src/server/storage`

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update at least:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`

For local development, the default storage driver can stay:

```env
STORAGE_DRIVER="local"
LOCAL_UPLOAD_DIR="public/uploads"
EMAIL_DELIVERY_MODE="console"
```

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Push the schema to PostgreSQL

```bash
npx prisma db push
```

### 5. Seed the demo workspace

```bash
npm run db:seed
```

### 6. Start the app

```bash
npm run dev
```

## Verification

These checks were run successfully in this workspace:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Key routes

### Public

- `/`
- `/{slug}`
- `/{slug}/story`
- `/{slug}/events`
- `/{slug}/schedule`
- `/{slug}/rsvp`
- `/{slug}/gallery`
- `/{slug}/experience`
- `/{slug}/memories`
- `/{slug}/wishes`

### Auth

- `/register`
- `/login`
- `/forgot-password`
- `/reset-password/[token]`
- `/verify-email/[token]`

### Dashboard

- `/dashboard`
- `/dashboard/templates`
- `/dashboard/content`
- `/dashboard/events`
- `/dashboard/rsvps`
- `/dashboard/uploads`
- `/dashboard/settings`
- `/dashboard/preview`

## Project structure

```text
src/
  app/
    [slug]/                public wedding routes
    dashboard/             couple/admin dashboard
    api/                   RSVP, uploads, messages, analytics, export
  actions/                 server actions for auth and dashboard updates
  components/
    admin/                 dashboard UX
    forms/                 auth + guest flows
    public/                public wedding rendering
    ui/                    shared UI primitives
  lib/                     utilities, validation, template registry
  server/
    auth/                  sessions, password hashing, token helpers
    repositories/          Prisma-backed query modules
    services/              snapshot publishing, email
    storage/               storage abstraction
prisma/
  schema.prisma
  seed.ts
prisma.config.ts
```

## Publish model

ToNewBeginning.com uses a simple **draft vs published snapshot** approach:

- dashboard edits update normalized relational content
- public guests see the last `publishedSnapshot`
- the couple can preview draft content in `/dashboard/preview`
- publishing refreshes the public snapshot

This keeps the platform extensible while preserving a safe editing workflow.

## Deployment notes

### Recommended production setup

- Managed PostgreSQL: Neon, Supabase, RDS, or Railway Postgres
- Object storage: S3, Cloudflare R2, or Supabase Storage
- Email: Resend, Postmark, SES, or SMTP
- Hosting: Vercel or a Node-compatible platform

### Before deploying

- replace local `AUTH_SECRET`
- point `DATABASE_URL` to production PostgreSQL
- set `APP_URL=https://www.ToNewBeginning.com`
- finish `src/server/storage/s3-storage.ts` for real object storage
- wire `src/server/services/email.ts` to your provider
- optionally add custom domains and invite-only password UX polish

## Notes

- Couple-side image uploads are supported through the dashboard media uploader and guest-side uploads are available on the public memories page.
- Public/private/invite-only settings are modelled and dashboard-managed; the current demo focuses on the public workflow and publish controls.
- The repo is intentionally structured as a platform starter that can be extended into a full multi-tenant wedding SaaS.

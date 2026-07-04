# Implemented Architecture

This document describes the architecture that is currently implemented in the repository. It is an as-built view of the system, not a target-state roadmap.

Stakeholder-ready visual exports:

- `docs/architecture-stakeholder.svg`
- `output/architecture-stakeholder.png`

## System overview

```mermaid
flowchart LR
  subgraph Clients
    Guest["Guest browser"]
    Couple["Couple or admin browser"]
  end

  subgraph NextApp["Next.js 16 App Router application"]
    Middleware["middleware.ts<br/>Dashboard cookie gate only"]
    PublicPages["Public routes<br/>/{slug}, /story, /events, /schedule,<br/>/rsvp, /gallery, /experience, /memories, /wishes"]
    AuthPages["Auth routes<br/>/login, /register, /forgot-password, /reset-password"]
    DashboardPages["Dashboard routes<br/>/dashboard/*"]
    GuestApis["Guest APIs<br/>/api/rsvp, /api/messages,<br/>/api/analytics, /api/uploads/guest"]
    AdminApis["Admin and upload APIs<br/>/api/uploads/admin, /api/uploads/site-assets,<br/>/api/uploads/token, /api/dashboard/rsvps/export"]
    ServerActions["Server actions<br/>src/actions/auth.ts<br/>src/actions/dashboard.ts"]
  end

  subgraph Domain["Server domain layer"]
    Auth["Auth and session<br/>src/server/auth/session.ts"]
    Repos["Repositories<br/>src/server/repositories/*"]
    Services["Services<br/>site-snapshot, template-presets,<br/>demo-site, email, plan"]
    Security["Security<br/>src/server/security/rate-limit.ts"]
    Storage["Storage abstraction<br/>local | blob | s3"]
  end

  subgraph Data["Persistence and external services"]
    Prisma["Prisma client<br/>src/server/prisma.ts"]
    Postgres["PostgreSQL"]
    Blob["Vercel Blob"]
    LocalFs["Local filesystem uploads"]
    S3["S3-ready upload driver"]
    Email["Console | SMTP | Resend"]
  end

  Guest --> PublicPages
  Guest --> GuestApis
  Couple --> AuthPages
  Couple --> Middleware
  Middleware --> DashboardPages
  Couple --> DashboardPages
  Couple --> AdminApis

  AuthPages --> ServerActions
  DashboardPages --> ServerActions
  GuestApis --> Security
  AdminApis --> Security

  ServerActions --> Auth
  ServerActions --> Repos
  ServerActions --> Services
  PublicPages --> Services
  GuestApis --> Repos
  GuestApis --> Services
  AdminApis --> Auth
  AdminApis --> Repos
  AdminApis --> Storage

  Auth --> Prisma
  Repos --> Prisma
  Services --> Prisma
  Security --> Prisma
  Prisma --> Postgres

  Storage --> Blob
  Storage --> LocalFs
  Storage --> S3
  Services --> Email
```

## Request and content lifecycle

```mermaid
flowchart TD
  Editors["Dashboard editors<br/>templates, settings, content, events,<br/>RSVP moderation, uploads moderation"] --> Validate["Zod validation<br/>forms + server actions"]
  Validate --> Persist["Prisma writes<br/>WeddingSite + related normalized tables"]
  Persist --> Revalidate["Selective revalidation<br/>dashboard paths first,<br/>public paths when required"]

  Publish["Publish action"] --> SnapshotBuild["buildPublishSnapshot()"]
  SnapshotBuild --> PublishJson["WeddingSite.publishSnapshot JSON"]
  PublishJson --> LiveStatus["PublishSettings.status = PUBLISHED"]

  GuestRequest["Public request to /{slug}"] --> SnapshotRead["getPublishedSiteSnapshot(slug)"]
  SnapshotRead -->|published site| PublishedSnapshot["normalizePublishedSnapshot()"]
  SnapshotRead -->|signed-in owner on draft| OwnerPreview["buildSnapshot() from live draft data"]
  SnapshotRead -->|demo slug fallback| DemoFallback["demo-site fallback snapshot"]

  PublishedSnapshot --> Renderer["Public renderer<br/>src/components/public/*"]
  OwnerPreview --> Renderer
  DemoFallback --> Renderer
```

## Upload flow

```mermaid
sequenceDiagram
  actor Couple as Couple dashboard
  participant UI as Upload UI
  participant Token as /api/uploads/token
  participant Blob as Vercel Blob
  participant Route as Admin upload route
  participant DB as Prisma and PostgreSQL

  Couple->>UI: Select image or video
  UI->>Token: Request signed upload token
  Token->>Token: Auth check, rate limit, MIME and size validation
  Token-->>UI: Short-lived signed token
  UI->>Blob: Upload file directly
  UI->>Route: Save metadata or attach uploaded URL
  Route->>DB: Create MediaAsset or update WeddingSite fields
```

## Implemented responsibilities by layer

| Layer | What it currently owns |
| --- | --- |
| `src/app` | App Router pages, layouts, route-level metadata, API routes, dashboard shells |
| `src/components` | Public site renderer, dashboard forms, builders, upload widgets, auth UI |
| `src/actions` | Auth flows, dashboard save/update flows, publish/unpublish, moderation |
| `src/server/auth` | JWT cookie session parsing, current-user lookup, route guards |
| `src/server/repositories` | Prisma-backed read models for dashboard pages and public lookups |
| `src/server/services` | Snapshot building, template preset seeding, demo fallbacks, email helpers |
| `src/server/security` | Database-backed rate limiting |
| `src/server/storage` | Storage-driver abstraction across local, Blob, and S3-ready adapters |
| `prisma/schema.prisma` | Core relational data model for users, couples, sites, content, RSVPs, uploads, messages, and analytics |

## Key implementation notes

- Authentication is intentionally split:
  - `middleware.ts` only checks whether the auth cookie exists for `/dashboard/*`
  - real verification happens server-side in `src/server/auth/session.ts`
  - this keeps the edge bundle smaller and avoids pulling Prisma into middleware

- Public rendering is snapshot-driven:
  - published sites prefer `WeddingSite.publishSnapshot`
  - unpublished sites can still render for the signed-in owner as a draft preview
  - the demo slug has a seeded fallback so the marketing demo still works even if the database is unavailable

- Dashboard data loading is page-specific:
  - repository functions such as `getWorkspaceShellForUser`, `getContentEditorSiteForUser`, `getTemplateSettingsForUser`, and `getSettingsSiteForUser` avoid loading the entire site graph on every page

- Uploads are environment-aware:
  - local development can use local storage
  - production can use Vercel Blob with signed uploads
  - the storage layer is abstracted so S3 can be wired in without changing dashboard or API callers

- Guest writes are protected:
  - RSVP, message, and upload endpoints use Zod validation plus database-backed rate limiting before persistence

## Primary runtime dependencies

- Next.js App Router for UI, routing, layouts, metadata, and API routes
- Prisma with PostgreSQL for persistence
- `jose` for signed JWT cookies
- `bcryptjs` for password hashing
- `react-hook-form` plus `zod` for form validation
- Vercel Blob client uploads when `STORAGE_DRIVER=blob`

# ToNewBeginning.com App Summary

Generated: 2026-04-25

## Product summary

ToNewBeginning.com is a premium wedding website platform built as a multi-module product rather than a single static event page.

The platform currently includes:

- A public wedding website with story, events, schedule, dress code, guest experience, gallery, RSVP, memories, and wishes flows
- A secure couple dashboard for registration, login, editing, template switching, previewing, and publishing
- A reusable template system with multiple visual directions driven by a shared content model
- RSVP collection, moderation flows, guest uploads, guest messages, and publish-vs-draft behavior

## Demo workspace included

- Demo brand: KamMonBeginnings
- Couple: Kamesh and Monisha
- Public demo route: /kammonbeginnings
- Seeded modules: story timeline, events, itinerary, dress codes, FAQs, gallery, videos, RSVP data, guest uploads, and guest messages

## Technology stack

- Frontend: Next.js 16, App Router, React 19, TypeScript
- Styling: Tailwind CSS
- Forms and validation: React Hook Form and Zod
- Database: PostgreSQL with Prisma
- Authentication: secure email/password auth with hashed passwords and signed cookies
- Media: pluggable storage layer with local and S3-style drivers
- Rendering: template-aware public-site renderer with draft preview support

## Core modules

### Public site

- Hero and landing experience
- Story timeline
- Event cards and schedules
- Tidbits and travel guidance
- Dress code guidance
- Gallery and video embeds
- RSVP, memories, and wishes

### Couple dashboard

- Registration and login
- Last-session resume flow from home screen
- Content editing UI
- Template and theme selection
- Preview studio
- Publish controls
- RSVP management
- Upload and message moderation
- Settings and SEO controls

## Current production readiness notes

The product now includes the key production hardening needed for a real Vercel deployment:

1. Server-only secrets and Prisma boundaries
   DATABASE_URL, SMTP credentials, and storage tokens remain server-only, and Prisma is imported only through server modules.

2. Auth and abuse protection
   Dashboard routes are protected by signed-session auth, and login, RSVP, message, and upload flows now use database-backed rate limiting.

3. Upload hardening
   Uploads validate file type and size, and Vercel Blob can now use signed client uploads instead of proxying raw production files through the app server.

4. Email delivery
   SMTP delivery is supported, but production still needs real SMTP/provider credentials configured.

## Vercel launch checklist for wed.tonewbeginning.com

### 1. Prepare Vercel project

- Import the Git repository into Vercel
- Confirm the production branch is the branch you want to deploy
- Run one successful production deployment before attaching the final custom domain

### 2. Configure production environment variables

Set these in Vercel Project Settings -> Environment Variables for Production:

- APP_URL=https://wed.tonewbeginning.com
- AUTH_SECRET=<long random secret>
- DATABASE_URL=<production Postgres connection string>
- STORAGE_DRIVER=blob
- BLOB_READ_WRITE_TOKEN=<vercel blob read-write token>
- EMAIL_DELIVERY_MODE=smtp
- SMTP_HOST=<provider host>
- SMTP_PORT=<provider port>
- SMTP_USER=<provider username>
- SMTP_PASSWORD=<provider password>
- SMTP_FROM=ToNewBeginning.com <noreply@tonewbeginning.com>

If you do not finish Blob and SMTP setup first, uploads and outbound emails will not be production-ready.

### 3. Add the production subdomain to the Vercel project

Add:

- wed.tonewbeginning.com

This app can live directly on the `wed` subdomain.

### 4. Configure the custom domain

In Vercel Project Settings -> Domains:

- Add `wed.tonewbeginning.com`
- Let Vercel verify the domain before switching production traffic

If you later want apex-domain redirects, configure those separately at the registrar or in another Vercel project rule.

### 5. Configure DNS at your registrar or DNS provider

If you use external DNS, configure the records Vercel shows for your project.

General pattern from Vercel documentation:

- Subdomain CNAME:
  Host: wed
  Value: use the exact target Vercel shows for your project

Always copy the exact CNAME target shown in the Vercel domain settings or `vercel domains inspect` output.

### 6. Verify domain ownership and SSL

- Wait for Vercel to verify DNS
- Confirm SSL certificate provisioning completes
- Re-test the production host:
  - https://wed.tonewbeginning.com

Expected result:

- wed.tonewbeginning.com loads the app over HTTPS

### 7. Align app-level settings after deployment

- Confirm APP_URL is set to https://wed.tonewbeginning.com
- Confirm metadataBase resolves from APP_URL
- Confirm canonical URLs use the `wed` host
- Update any seeded or dashboard-entered canonical URLs to the final `wed` host

### 8. Post-launch smoke test

Run this checklist against the live deployment:

- Home page loads on www
- Apex redirects to www
- Registration works
- Login works
- Resume workspace from home page works
- Public demo site loads
- Template switching persists
- Dashboard preview matches live publishing behavior
- RSVP submission works
- Guest message submission works
- Guest upload flow works with your real storage provider
- Verification and reset-password emails send from the real email provider

## Recommended deployment sequence

1. Finish S3 storage wiring
2. Set the Vercel Blob token and SMTP credentials
3. Set production environment variables in Vercel
4. Deploy successfully on the default Vercel domain
5. Add `wed.tonewbeginning.com`
6. Validate SSL and app flows
7. Publish the real wedding workspace

## Official Vercel references used for the checklist

- Setting up a custom domain:
  https://vercel.com/docs/domains/set-up-custom-domain
- Adding and configuring a custom domain:
  https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Deploying and redirecting domains:
  https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting

## Repo notes

- Root metadata now respects APP_URL through metadataBase
- Seeded canonical URL now uses https://wed.tonewbeginning.com/kammonbeginnings
- Local development should remain on http://localhost:3000

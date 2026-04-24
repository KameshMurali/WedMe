# ToNewBeginning.com App Summary

Generated: 2026-04-19

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

The product is close to investor-demo ready, but there are two important production items to address before a true live launch:

1. Storage
   The current code supports local file storage and S3-style storage, but Vercel production should not use local filesystem uploads because that storage is not durable across deployments and instances.

2. Email delivery
   The current email service falls back to console preview output. For real production email, the implementation in src/server/services/email.ts must be wired to SMTP or a provider such as Resend, Postmark, SES, or similar.

## Vercel launch checklist for www.ToNewBeginning.com

### 1. Prepare Vercel project

- Import the Git repository into Vercel
- Confirm the production branch is the branch you want to deploy
- Run one successful production deployment before attaching the final custom domain

### 2. Configure production environment variables

Set these in Vercel Project Settings -> Environment Variables for Production:

- APP_URL=https://www.ToNewBeginning.com
- AUTH_SECRET=<long random secret>
- DATABASE_URL=<production Postgres connection string>
- STORAGE_DRIVER=s3
- AWS_REGION=<your bucket region>
- AWS_S3_BUCKET=<your production bucket>
- AWS_ACCESS_KEY_ID=<bucket access key>
- AWS_SECRET_ACCESS_KEY=<bucket secret>
- EMAIL_DELIVERY_MODE=smtp
- SMTP_HOST=<provider host>
- SMTP_PORT=<provider port>
- SMTP_USER=<provider username>
- SMTP_PASSWORD=<provider password>
- SMTP_FROM=ToNewBeginning.com <noreply@ToNewBeginning.com>

If you do not finish S3 and SMTP setup first, uploads and outbound emails will not be production-ready.

### 3. Add both domains to the same Vercel project

Add:

- ToNewBeginning.com
- www.ToNewBeginning.com

Vercel recommends adding both and using www as the primary domain.

### 4. Make www the primary domain

In Vercel Project Settings -> Domains:

- Set www.ToNewBeginning.com as the primary domain
- Edit ToNewBeginning.com and redirect it to www.ToNewBeginning.com

This is the recommended setup because Vercel states that using the www subdomain as the primary domain gives the CDN better control for reliability, speed, and security.

### 5. Configure DNS at your registrar or DNS provider

If you use external DNS, configure the records Vercel shows for your project.

General pattern from Vercel documentation:

- Apex domain A record:
  Host: @
  Value: 76.76.21.21

- www subdomain CNAME:
  Host: www
  Value: use the exact target Vercel shows for your project

Vercel's documentation shows a general-purpose CNAME example of cname.vercel-dns-0.com, but also notes that each project may have its own specific CNAME target. Always copy the exact record shown in the Vercel domain settings or vercel domains inspect output.

### 6. Verify domain ownership and SSL

- Wait for Vercel to verify DNS
- Confirm SSL certificate provisioning completes
- Re-test both hosts:
  - https://ToNewBeginning.com
  - https://www.ToNewBeginning.com

Expected result:

- www.ToNewBeginning.com loads the app
- ToNewBeginning.com redirects to www.ToNewBeginning.com

### 7. Align app-level settings after deployment

- Confirm APP_URL is set to https://www.ToNewBeginning.com
- Confirm metadataBase resolves from APP_URL
- Confirm canonical URLs use the www host
- Update any seeded or dashboard-entered canonical URLs to the final www host

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
2. Finish SMTP or provider email wiring
3. Set production environment variables in Vercel
4. Deploy successfully on the default Vercel domain
5. Add both custom domains
6. Set www as primary
7. Add apex redirect to www
8. Validate SSL, redirects, and app flows
9. Publish the real wedding workspace

## Official Vercel references used for the checklist

- Setting up a custom domain:
  https://vercel.com/docs/domains/set-up-custom-domain
- Adding and configuring a custom domain:
  https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Deploying and redirecting domains:
  https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting

## Repo notes

- Root metadata now respects APP_URL through metadataBase
- Seeded canonical URL now uses https://www.ToNewBeginning.com/kammonbeginnings
- Local development should remain on http://localhost:3000

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('COUPLE', 'ADMIN');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SiteVisibility" AS ENUM ('PUBLIC', 'PASSWORD_PROTECTED', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('HERO', 'STORY', 'EVENTS', 'SCHEDULE', 'TIDBITS', 'DRESS_CODE', 'EXPERIENCE', 'GALLERY', 'VIDEOS', 'RSVP', 'MEMORIES', 'MESSAGES', 'REGISTRY', 'SAVE_THE_DATE');

-- CreateEnum
CREATE TYPE "EventAudience" AS ENUM ('ALL_GUESTS', 'FAMILY_ONLY', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('ATTENDING', 'MAYBE', 'DECLINED');

-- CreateEnum
CREATE TYPE "TravelGuideCategory" AS ENUM ('AIRPORT', 'TRANSPORT', 'HOTELS', 'PARKING', 'FAQ', 'RECOMMENDATIONS', 'WHAT_TO_BRING', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('HERO', 'STORY', 'EVENT_BANNER', 'GALLERY', 'DRESS_CODE');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('IMAGE', 'VIDEO', 'LINK');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessageVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'CTA_CLICK', 'RSVP_SUBMITTED', 'MESSAGE_SUBMITTED', 'UPLOAD_SUBMITTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COUPLE',
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Couple" (
    "id" TEXT NOT NULL,
    "primaryUserId" TEXT NOT NULL,
    "partnerOneName" TEXT NOT NULL,
    "partnerTwoName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "storyBlurb" TEXT,
    "weddingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePreset" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "previewGradient" TEXT NOT NULL,
    "supportedSections" "SectionType"[],
    "themeDefaults" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplatePreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingSite" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "templatePresetId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subtitle" TEXT,
    "tagline" TEXT,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "heroImageUrl" TEXT,
    "heroVideoUrl" TEXT,
    "locationSummary" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "paletteKey" TEXT NOT NULL,
    "headingFontKey" TEXT NOT NULL,
    "bodyFontKey" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "surfaceColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "mutedColor" TEXT NOT NULL,
    "borderRadius" TEXT NOT NULL,
    "buttonVariant" TEXT NOT NULL,
    "shadowStyle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishSettings" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "SiteVisibility" NOT NULL DEFAULT 'PUBLIC',
    "sitePasswordHash" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "isRsvpOpen" BOOLEAN NOT NULL DEFAULT true,
    "isUploadsOpen" BOOLEAN NOT NULL DEFAULT true,
    "isMessagesOpen" BOOLEAN NOT NULL DEFAULT true,
    "publishedSnapshot" JSONB,
    "publishedAt" TIMESTAMP(3),
    "lastDraftSavedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionConfig" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryMilestone" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortLabel" TEXT,
    "eventDateLabel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "dressCode" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "rsvpRequired" BOOLEAN NOT NULL DEFAULT true,
    "audience" "EventAudience" NOT NULL DEFAULT 'ALL_GUESTS',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "dayLabel" TEXT NOT NULL,
    "locationName" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tidbit" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tidbit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelGuideItem" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "category" "TravelGuideCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelGuideItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DressCodeGuide" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "palette" JSONB,
    "inspirationImage" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DressCodeGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddedVideo" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "typeLabel" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmbeddedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteGroup" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "directLinkToken" TEXT NOT NULL,
    "maxAttendees" INTEGER NOT NULL,
    "plusOneAllowed" BOOLEAN NOT NULL DEFAULT false,
    "responseDeadline" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "inviteGroupId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVPResponse" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "inviteGroupId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "inviteCode" TEXT,
    "status" "RSVPStatus" NOT NULL,
    "attendeeCount" INTEGER NOT NULL,
    "mealPreference" TEXT,
    "accommodationNeeds" TEXT,
    "travelNotes" TEXT,
    "specialRequests" TEXT,
    "accessibilityNeeds" TEXT,
    "noteToCouple" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RSVPResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVPEventSelection" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "RSVPStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVPEventSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestUpload" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "eventId" TEXT,
    "type" "UploadType" NOT NULL,
    "submitterName" TEXT NOT NULL,
    "caption" TEXT,
    "message" TEXT,
    "url" TEXT,
    "externalUrl" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "GuestUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestMessage" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "feedback" TEXT,
    "visibility" "MessageVisibility" NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "GuestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "path" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Couple_primaryUserId_key" ON "Couple"("primaryUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePreset_key_key" ON "TemplatePreset"("key");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingSite_coupleId_key" ON "WeddingSite"("coupleId");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingSite_slug_key" ON "WeddingSite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteTheme_weddingSiteId_key" ON "SiteTheme"("weddingSiteId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishSettings_weddingSiteId_key" ON "PublishSettings"("weddingSiteId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionConfig_weddingSiteId_type_key" ON "SectionConfig"("weddingSiteId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "InviteGroup_code_key" ON "InviteGroup"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InviteGroup_directLinkToken_key" ON "InviteGroup"("directLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "RSVPEventSelection_responseId_eventId_key" ON "RSVPEventSelection"("responseId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_bucket_action_key_window" ON "RateLimitBucket"("action", "keyHash", "windowStart");

-- AddForeignKey
ALTER TABLE "Couple" ADD CONSTRAINT "Couple_primaryUserId_fkey" FOREIGN KEY ("primaryUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingSite" ADD CONSTRAINT "WeddingSite_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingSite" ADD CONSTRAINT "WeddingSite_templatePresetId_fkey" FOREIGN KEY ("templatePresetId") REFERENCES "TemplatePreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTheme" ADD CONSTRAINT "SiteTheme_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishSettings" ADD CONSTRAINT "PublishSettings_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionConfig" ADD CONSTRAINT "SectionConfig_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryMilestone" ADD CONSTRAINT "StoryMilestone_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tidbit" ADD CONSTRAINT "Tidbit_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelGuideItem" ADD CONSTRAINT "TravelGuideItem_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DressCodeGuide" ADD CONSTRAINT "DressCodeGuide_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DressCodeGuide" ADD CONSTRAINT "DressCodeGuide_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedVideo" ADD CONSTRAINT "EmbeddedVideo_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteGroup" ADD CONSTRAINT "InviteGroup_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_inviteGroupId_fkey" FOREIGN KEY ("inviteGroupId") REFERENCES "InviteGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPResponse" ADD CONSTRAINT "RSVPResponse_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPResponse" ADD CONSTRAINT "RSVPResponse_inviteGroupId_fkey" FOREIGN KEY ("inviteGroupId") REFERENCES "InviteGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPEventSelection" ADD CONSTRAINT "RSVPEventSelection_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "RSVPResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPEventSelection" ADD CONSTRAINT "RSVPEventSelection_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestUpload" ADD CONSTRAINT "GuestUpload_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestUpload" ADD CONSTRAINT "GuestUpload_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestMessage" ADD CONSTRAINT "GuestMessage_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


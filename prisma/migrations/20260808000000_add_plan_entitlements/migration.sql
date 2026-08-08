-- AlterTable
ALTER TABLE "Couple" ADD COLUMN     "aiDraftCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "planActivatedAt" TIMESTAMP(3),
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planKey" TEXT NOT NULL DEFAULT 'hello',
ADD COLUMN     "planSource" TEXT;

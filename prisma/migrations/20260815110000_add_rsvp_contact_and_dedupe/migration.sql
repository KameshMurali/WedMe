-- AlterTable
ALTER TABLE "RSVPResponse" ADD COLUMN     "guestPhone" TEXT,
ADD COLUMN     "dedupeKey" TEXT;

-- CreateIndex
-- Safe on a live table: every pre-existing row has dedupeKey = NULL, and
-- Postgres treats NULLs as distinct, so this can never conflict with existing
-- data. Only rows written after this migration participate in the constraint.
CREATE UNIQUE INDEX "RSVPResponse_weddingSiteId_dedupeKey_key" ON "RSVPResponse"("weddingSiteId", "dedupeKey");

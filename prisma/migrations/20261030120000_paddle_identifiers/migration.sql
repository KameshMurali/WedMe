-- Paddle identifiers, so a payment can be traced back to the couple it paid for.
--
-- Every column is nullable with no default and no backfill, so this is safe to
-- apply to a live table: existing rows are untouched and nothing locks beyond
-- the brief catalog update.
--
-- Deliberately no "paddleSubscriptionId". Both paid tiers are one-time
-- purchases (src/lib/pricing.ts `recurrence`), so there is no subscription.

ALTER TABLE "Couple" ADD COLUMN "paddleCustomerId" TEXT;
ALTER TABLE "Couple" ADD COLUMN "paddleTransactionId" TEXT;

ALTER TABLE "PaymentEvent" ADD COLUMN "paddleTransactionId" TEXT;

CREATE INDEX "Couple_paddleCustomerId_idx" ON "Couple"("paddleCustomerId");
CREATE INDEX "PaymentEvent_userId_idx" ON "PaymentEvent"("userId");
CREATE INDEX "PaymentEvent_paddleTransactionId_idx" ON "PaymentEvent"("paddleTransactionId");

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitlistSignup_planKey_idx" ON "WaitlistSignup"("planKey");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_email_planKey_key" ON "WaitlistSignup"("email", "planKey");

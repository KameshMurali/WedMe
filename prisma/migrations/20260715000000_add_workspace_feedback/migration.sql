-- CreateTable
CREATE TABLE "WorkspaceFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "siteSlug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceFeedback_createdAt_idx" ON "WorkspaceFeedback"("createdAt");

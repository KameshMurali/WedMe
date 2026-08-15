-- CreateTable
CREATE TABLE "RegistryLink" (
    "id" TEXT NOT NULL,
    "weddingSiteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistryLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegistryLink" ADD CONSTRAINT "RegistryLink_weddingSiteId_fkey" FOREIGN KEY ("weddingSiteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

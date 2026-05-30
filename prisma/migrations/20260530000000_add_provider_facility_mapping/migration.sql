-- CreateTable
CREATE TABLE "provider_facilities" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_facilities_providerId_facilityId_key" ON "provider_facilities"("providerId", "facilityId");

-- AddForeignKey
ALTER TABLE "provider_facilities" ADD CONSTRAINT "provider_facilities_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "community_health_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_facilities" ADD CONSTRAINT "provider_facilities_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

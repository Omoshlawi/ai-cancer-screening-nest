/*
  Warnings:

  - Added the required column `typeId` to the `HealthFacility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthFacility" ADD COLUMN     "typeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "health_facility_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facility_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HealthFacility" ADD CONSTRAINT "HealthFacility_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "health_facility_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

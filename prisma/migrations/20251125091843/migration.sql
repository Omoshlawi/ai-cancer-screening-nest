-- CreateEnum
CREATE TYPE "ScreenBoolean" AS ENUM ('YES', 'NO', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('CURRENTLY', 'NEVER', 'PAST');

-- CreateTable
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "lifeTimePatners" INTEGER NOT NULL,
    "firstIntercourseAge" INTEGER NOT NULL,
    "everDiagnosedWithHIV" "ScreenBoolean" NOT NULL,
    "everDiagnosedWithHPV" "ScreenBoolean" NOT NULL,
    "everDiagnosedWithSTI" "ScreenBoolean" NOT NULL,
    "totalBirths" INTEGER NOT NULL,
    "everScreenedForCervicalCancer" "ScreenBoolean" NOT NULL,
    "usedOralContraceptivesForMoreThan5Years" "ScreenBoolean" NOT NULL,
    "smokingStatus" "SmokingStatus" NOT NULL,
    "familyMemberDiagnosedWithCervicalCancer" "ScreenBoolean" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CommunityHealthProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

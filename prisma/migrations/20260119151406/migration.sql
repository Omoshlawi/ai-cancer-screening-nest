/*
  Warnings:

  - The values [CANCELLED] on the enum `ReferralStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TestOutcome" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('PHONE_CALL', 'HOME_VISIT', 'SMS_SENT', 'FACILITY_VERIFICATION');

-- CreateEnum
CREATE TYPE "OutreachOutcome" AS ENUM ('PATIENT_CONTACTED', 'PATIENT_UNAVAILABLE', 'PATIENT_COMMITTED', 'PATIENT_VISITED_FACILITY', 'PATIENT_REFUSED', 'BARRIER_IDENTIFIED', 'LOST_CONTACT');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PHONE', 'IN_PERSON', 'SMS', 'WHATSAPP', 'COMMUNITY_LEADER');

-- CreateEnum
CREATE TYPE "FollowUpCategory" AS ENUM ('REFERRAL_ADHERENCE', 'RE_SCREENING_RECALL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CancelReason" AS ENUM ('DECEASED', 'RELOCATED', 'UNREACHABLE', 'REFUSED_SERVICE', 'INCORRECT_DATA', 'HOSPITALIZED_OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "ReferralStatus_new" AS ENUM ('PENDING', 'VISITED_PENDING_RESULTS', 'COMPLETED', 'REFUSED');
ALTER TABLE "Referral" ALTER COLUMN "status" TYPE "ReferralStatus_new" USING ("status"::text::"ReferralStatus_new");
ALTER TYPE "ReferralStatus" RENAME TO "ReferralStatus_old";
ALTER TYPE "ReferralStatus_new" RENAME TO "ReferralStatus";
DROP TYPE "public"."ReferralStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "HealthFacility" DROP CONSTRAINT "HealthFacility_typeId_fkey";

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "finalDiagnosis" TEXT,
ADD COLUMN     "financialSupport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "testResult" "TestOutcome",
ADD COLUMN     "transportNeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visitedDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Screening" ADD COLUMN     "nextScreeningDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "referralId" TEXT,
    "triggerScreeningId" TEXT NOT NULL,
    "category" "FollowUpCategory" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "outcomeNotes" TEXT,
    "resolvingScreeningId" TEXT,
    "cancelReason" "CancelReason",
    "cancelNotes" TEXT,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachAction" (
    "id" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "actionType" "OutreachType" NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL,
    "outcome" "OutreachOutcome" NOT NULL,
    "contactMethod" "ContactMethod",
    "location" TEXT,
    "duration" INTEGER,
    "notes" TEXT,
    "barriers" TEXT,
    "nextPlannedDate" TIMESTAMP(3),
    "verifiedAtFacility" BOOLEAN NOT NULL DEFAULT false,
    "hospitalRegisterPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_referralId_key" ON "FollowUp"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_resolvingScreeningId_key" ON "FollowUp"("resolvingScreeningId");

-- CreateIndex
CREATE INDEX "FollowUp_referralId_idx" ON "FollowUp"("referralId");

-- CreateIndex
CREATE INDEX "FollowUp_providerId_idx" ON "FollowUp"("providerId");

-- CreateIndex
CREATE INDEX "FollowUp_clientId_idx" ON "FollowUp"("clientId");

-- CreateIndex
CREATE INDEX "OutreachAction_followUpId_idx" ON "OutreachAction"("followUpId");

-- CreateIndex
CREATE INDEX "OutreachAction_actionDate_idx" ON "OutreachAction"("actionDate");

-- AddForeignKey
ALTER TABLE "HealthFacility" ADD CONSTRAINT "HealthFacility_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "health_facility_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CommunityHealthProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_triggerScreeningId_fkey" FOREIGN KEY ("triggerScreeningId") REFERENCES "Screening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_resolvingScreeningId_fkey" FOREIGN KEY ("resolvingScreeningId") REFERENCES "Screening"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachAction" ADD CONSTRAINT "OutreachAction_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

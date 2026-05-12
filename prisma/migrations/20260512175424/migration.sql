/*
  Warnings:

  - You are about to drop the column `testResult` on the `referrals` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('VIA', 'PAP_SMEAR', 'HPV_TEST');

-- CreateEnum
CREATE TYPE "ActionTaken" AS ENUM ('TREATED', 'BIOPSY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TestOutcome" ADD VALUE 'SUSPICIOUS';
ALTER TYPE "TestOutcome" ADD VALUE 'CYTOLOGY_POSITIVE';
ALTER TYPE "TestOutcome" ADD VALUE 'CYTOLOGY_NEGATIVE';

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "testResult";

-- CreateTable
CREATE TABLE "referral_tests" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "testType" "TestType" NOT NULL,
    "testResult" "TestOutcome" NOT NULL,
    "actionTaken" "ActionTaken",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referral_tests_referralId_idx" ON "referral_tests"("referralId");

-- AddForeignKey
ALTER TABLE "referral_tests" ADD CONSTRAINT "referral_tests_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

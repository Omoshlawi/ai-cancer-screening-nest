/*
  Warnings:

  - The values [PATIENT_CONTACTED] on the enum `OutreachOutcome` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OutreachOutcome_new" AS ENUM ('PATIENT_UNAVAILABLE', 'PATIENT_COMMITTED', 'PATIENT_VISITED_FACILITY', 'PATIENT_REFUSED', 'BARRIER_IDENTIFIED', 'LOST_CONTACT');
ALTER TABLE "outreach_actions" ALTER COLUMN "outcome" TYPE "OutreachOutcome_new" USING ("outcome"::text::"OutreachOutcome_new");
ALTER TYPE "OutreachOutcome" RENAME TO "OutreachOutcome_old";
ALTER TYPE "OutreachOutcome_new" RENAME TO "OutreachOutcome";
DROP TYPE "public"."OutreachOutcome_old";
COMMIT;

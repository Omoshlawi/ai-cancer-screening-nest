/*
  Warnings:

  - The values [COMMUNITY_LEADER] on the enum `ContactMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactMethod_new" AS ENUM ('PHONE', 'IN_PERSON', 'SMS', 'WHATSAPP');
ALTER TABLE "OutreachAction" ALTER COLUMN "contactMethod" TYPE "ContactMethod_new" USING ("contactMethod"::text::"ContactMethod_new");
ALTER TYPE "ContactMethod" RENAME TO "ContactMethod_old";
ALTER TYPE "ContactMethod_new" RENAME TO "ContactMethod";
DROP TYPE "public"."ContactMethod_old";
COMMIT;

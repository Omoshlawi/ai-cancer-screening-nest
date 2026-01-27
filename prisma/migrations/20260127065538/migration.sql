/*
  Warnings:

  - You are about to drop the column `contactMethod` on the `outreach_actions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "outreach_actions" DROP COLUMN "contactMethod";

-- DropEnum
DROP TYPE "ContactMethod";

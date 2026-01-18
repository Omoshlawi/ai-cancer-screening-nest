/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.
  - Added the required column `county` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcounty` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ward` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "address",
ADD COLUMN     "county" TEXT NOT NULL,
ADD COLUMN     "subcounty" TEXT NOT NULL,
ADD COLUMN     "ward" TEXT NOT NULL;

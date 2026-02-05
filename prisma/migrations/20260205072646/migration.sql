-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "nationalId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "health_facilities" ADD COLUMN     "address" TEXT;

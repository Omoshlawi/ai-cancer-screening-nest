-- Add REFERRED value to ActionTaken enum
ALTER TYPE "ActionTaken" ADD VALUE 'REFERRED';

-- Add notes column to referral_tests
ALTER TABLE "referral_tests" ADD COLUMN "notes" TEXT;

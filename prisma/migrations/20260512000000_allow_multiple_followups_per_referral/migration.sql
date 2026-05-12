-- AlterTable: remove unique constraint on follow_ups.referralId to allow multiple follow-ups per referral
DROP INDEX "follow_ups_referralId_key";

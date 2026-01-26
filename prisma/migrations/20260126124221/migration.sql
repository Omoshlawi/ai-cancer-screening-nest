-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "ScreenBoolean" AS ENUM ('YES', 'NO', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('CURRENTLY', 'NEVER', 'PAST');

-- CreateEnum
CREATE TYPE "TestOutcome" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "OutreachType" AS ENUM ('PHONE_CALL', 'HOME_VISIT', 'SMS_SENT', 'FACILITY_VERIFICATION');

-- CreateEnum
CREATE TYPE "OutreachOutcome" AS ENUM ('PATIENT_CONTACTED', 'PATIENT_UNAVAILABLE', 'PATIENT_COMMITTED', 'PATIENT_VISITED_FACILITY', 'PATIENT_REFUSED', 'BARRIER_IDENTIFIED', 'LOST_CONTACT');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PHONE', 'IN_PERSON', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'VISITED_PENDING_RESULTS', 'COMPLETED', 'REFUSED');

-- CreateEnum
CREATE TYPE "FollowUpCategory" AS ENUM ('REFERRAL_ADHERENCE', 'RE_SCREENING_RECALL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CancelReason" AS ENUM ('DECEASED', 'RELOCATED', 'UNREACHABLE', 'REFUSED_SERVICE', 'INCORRECT_DATA', 'HOSPITALIZED_OTHER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "displayUsername" TEXT,
    "role" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_health_providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_health_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "subcounty" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "createdById" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenings" (
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
    "smoking" "SmokingStatus" NOT NULL,
    "familyMemberDiagnosedWithCervicalCancer" "ScreenBoolean" NOT NULL,
    "scoringResult" JSONB,
    "nextScreeningDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screenings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facility_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facility_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities" (
    "id" TEXT NOT NULL,
    "kmflCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "subcounty" TEXT NOT NULL,
    "ward" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "coordinates" JSONB,
    "owner" TEXT,
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frequently_asked_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frequently_asked_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_heirarchy" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "voided" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "address_heirarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "screeningId" TEXT NOT NULL,
    "healthFacilityId" TEXT NOT NULL,
    "appointmentTime" TIMESTAMP(3) NOT NULL,
    "additionalNotes" TEXT,
    "transportNeeded" BOOLEAN NOT NULL DEFAULT false,
    "financialSupport" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "visitedDate" TIMESTAMP(3),
    "testResult" "TestOutcome",
    "finalDiagnosis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
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

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_actions" (
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
    "hospitalRegisterPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "community_health_providers_userId_key" ON "community_health_providers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_facilities_kmflCode_key" ON "health_facilities"("kmflCode");

-- CreateIndex
CREATE INDEX "user_activities_userId_idx" ON "user_activities"("userId");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "user_activities"("createdAt");

-- CreateIndex
CREATE INDEX "user_activities_resource_resourceId_idx" ON "user_activities"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "address_heirarchy_country_level_idx" ON "address_heirarchy"("country", "level");

-- CreateIndex
CREATE INDEX "address_heirarchy_parentId_idx" ON "address_heirarchy"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "address_heirarchy_country_code_key" ON "address_heirarchy"("country", "code");

-- CreateIndex
CREATE UNIQUE INDEX "follow_ups_referralId_key" ON "follow_ups"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "follow_ups_resolvingScreeningId_key" ON "follow_ups"("resolvingScreeningId");

-- CreateIndex
CREATE INDEX "follow_ups_referralId_idx" ON "follow_ups"("referralId");

-- CreateIndex
CREATE INDEX "follow_ups_providerId_idx" ON "follow_ups"("providerId");

-- CreateIndex
CREATE INDEX "follow_ups_clientId_idx" ON "follow_ups"("clientId");

-- CreateIndex
CREATE INDEX "outreach_actions_followUpId_idx" ON "outreach_actions"("followUpId");

-- CreateIndex
CREATE INDEX "outreach_actions_actionDate_idx" ON "outreach_actions"("actionDate");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_health_providers" ADD CONSTRAINT "community_health_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "community_health_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "community_health_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_facilities" ADD CONSTRAINT "health_facilities_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "health_facility_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frequently_asked_questions" ADD CONSTRAINT "frequently_asked_questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "faq_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_heirarchy" ADD CONSTRAINT "address_heirarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "address_heirarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_healthFacilityId_fkey" FOREIGN KEY ("healthFacilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "community_health_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_triggerScreeningId_fkey" FOREIGN KEY ("triggerScreeningId") REFERENCES "screenings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_resolvingScreeningId_fkey" FOREIGN KEY ("resolvingScreeningId") REFERENCES "screenings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_actions" ADD CONSTRAINT "outreach_actions_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "follow_ups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

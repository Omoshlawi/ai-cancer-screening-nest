-- CreateTable
CREATE TABLE "user_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_userId_idx" ON "user_activity"("userId");

-- CreateIndex
CREATE INDEX "user_activity_createdAt_idx" ON "user_activity"("createdAt");

-- CreateIndex
CREATE INDEX "user_activity_resource_resourceId_idx" ON "user_activity"("resource", "resourceId");

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

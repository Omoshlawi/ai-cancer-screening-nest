-- Rename the table (atomic metadata change, no data movement, safe in production)
ALTER TABLE "community_health_providers" RENAME TO "health_providers";

-- Rename the primary key constraint
ALTER TABLE "health_providers" RENAME CONSTRAINT "community_health_providers_pkey" TO "health_providers_pkey";

-- Rename the unique index on userId
ALTER INDEX "community_health_providers_userId_key" RENAME TO "health_providers_userId_key";

-- Rename the FK from this table to user
ALTER TABLE "health_providers" RENAME CONSTRAINT "community_health_providers_userId_fkey" TO "health_providers_userId_fkey";

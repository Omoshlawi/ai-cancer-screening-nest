#!/bin/sh
set -e

echo "📦 Starting container entrypoint..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set. Exiting."
  exit 1
fi

echo "🔁 Running Prisma migrations against: $DATABASE_URL"

until npx prisma migrate deploy; do
  echo "⚠️ Prisma migrate deploy failed (database not ready yet?). Retrying in 5 seconds..."
  sleep 5
done

echo "✅ Prisma migrations applied successfully"

echo "🌱 Running seed scripts..."
# Run compiled JavaScript seed scripts to avoid ts-node/ESM issues in production
if node dist/scripts/seed-address-hierarchy.js \
  && node dist/scripts/seed-admin-user.js \
  && node dist/scripts/seed-facility-types.js \
  && node dist/scripts/seed-health-facilities.js; then
  echo "✅ Seed scripts completed successfully"
else
  echo "⚠️ Seed scripts failed. Continuing to start the app..."
fi

echo "🚀 Starting NestJS application..."
# main.ts compiles to dist/src/main.js when using tsc with current tsconfig
exec node dist/src/main.js


FROM node:22-alpine AS base

# Enable pnpm via corepack
RUN corepack enable

WORKDIR /app

# Install OS dependencies (if needed later) and ensure openssl is present for Prisma
RUN apk add --no-cache openssl

# Dummy DATABASE_URL so prisma.config.ts can resolve it during build
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Install dependencies separately for better caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client and build the NestJS app
# Use tsc directly to avoid file watcher issues in Nest CLI
RUN pnpm exec prisma generate && pnpm exec tsc -p tsconfig.build.json

# Runtime stage (can be the same image to keep things simple)
FROM node:22-alpine
RUN corepack enable


WORKDIR /app

RUN apk add --no-cache openssl

# Copy node_modules and built app from build stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/assets ./assets
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma.config.ts ./prisma.config.ts

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]


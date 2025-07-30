# 🚢 Pavement Performance Suite - Multi-Stage Production Dockerfile

# Stage 1: Base Image with Dependencies
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Stage 2: Dependencies Installation
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm build

# Stage 4: Production Runner
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user and expose port
USER nextjs
EXPOSE 3000

# Configure environment
ENV PORT 3000
ENV HOSTNAME localhost

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start command
CMD ["node", "server.js"]

# Metadata
LABEL maintainer="PaveMaster Suite Team <support@pavemastersuit.com>"
LABEL version="1.0.0"
LABEL description="Enterprise Asphalt Paving Management Platform"
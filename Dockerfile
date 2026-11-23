# Multi-stage production build for LabLink (Cloud Run ready)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for compilation
RUN npm ci

# Copy configurations and sources
COPY tsconfig.base.json ./
COPY shared ./shared
COPY server ./server
COPY client ./client

# Compile all workspaces (shared -> server -> client)
RUN npm run build

# Production minimal runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy workspace manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled bundles from builder
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 8080

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/v1/healthz || exit 1

# Run Express server (serves API and client SPA)
CMD ["node", "server/dist/index.js"]

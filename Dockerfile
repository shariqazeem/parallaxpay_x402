# Dockerfile for ParallaxPay Next.js App
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install build dependencies for native modules (bufferutil, utf-8-validate, usb, etc.)
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    linux-headers \
    eudev-dev \
    libusb-dev
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_RPC_ENDPOINT
ARG NEXT_PUBLIC_X402_GATEWAY_URL
ARG NEXT_PUBLIC_PARALLAX_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG GRADIENT_API_KEY
ARG GRADIENT_MODEL

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_RPC_ENDPOINT=$NEXT_PUBLIC_RPC_ENDPOINT
ENV NEXT_PUBLIC_X402_GATEWAY_URL=$NEXT_PUBLIC_X402_GATEWAY_URL
ENV NEXT_PUBLIC_PARALLAX_API_URL=$NEXT_PUBLIC_PARALLAX_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV GRADIENT_API_KEY=$GRADIENT_API_KEY
ENV GRADIENT_MODEL=$GRADIENT_MODEL

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

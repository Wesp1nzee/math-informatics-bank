# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ARG PNPM_VERSION=10.30.3
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate
WORKDIR /app


FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS build
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG API_BASE_URL
ARG NEXT_PUBLIC_TUTOR_NAME
ARG NEXT_PUBLIC_TUTOR_TELEGRAM
ARG NEXT_PUBLIC_TUTOR_EMAIL
ARG NEXT_PUBLIC_TUTOR_PHOTO
ARG NEXT_PUBLIC_TUTOR_VIDEO
ARG NEXT_PUBLIC_TUTOR_ABOUT
ARG NEXT_PUBLIC_YM_ID

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    API_BASE_URL=$API_BASE_URL \
    NEXT_PUBLIC_TUTOR_NAME=$NEXT_PUBLIC_TUTOR_NAME \
    NEXT_PUBLIC_TUTOR_TELEGRAM=$NEXT_PUBLIC_TUTOR_TELEGRAM \
    NEXT_PUBLIC_TUTOR_EMAIL=$NEXT_PUBLIC_TUTOR_EMAIL \
    NEXT_PUBLIC_TUTOR_PHOTO=$NEXT_PUBLIC_TUTOR_PHOTO \
    NEXT_PUBLIC_TUTOR_VIDEO=$NEXT_PUBLIC_TUTOR_VIDEO \
    NEXT_PUBLIC_TUTOR_ABOUT=$NEXT_PUBLIC_TUTOR_ABOUT \
    NEXT_PUBLIC_YM_ID=$NEXT_PUBLIC_YM_ID

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm check:deploy && pnpm build


FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

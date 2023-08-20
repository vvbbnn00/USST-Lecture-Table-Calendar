FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories &&  \
    apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  npm config set registry https://registry.npm.taobao.org/ && \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/run.sh ./

RUN chmod +x ./run.sh
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Environment variables must be redefined at run time
ARG LOGIN_METHOD
ENV LOGIN_METHOD=${LOGIN_METHOD}
ARG JWGL_USERNAME
ENV JWGL_USERNAME=${JWGL_USERNAME}
ARG JWGL_PASSWORD
ENV JWGL_PASSWORD=${JWGL_PASSWORD}
ARG IDS_USERNAME
ENV IDS_USERNAME=${IDS_USERNAME}
ARG IDS_PASSWORD
ENV IDS_PASSWORD=${IDS_PASSWORD}
ARG SECRET_KEY
ENV SECRET_KEY=${SECRET_KEY}
ARG ENABLE_REMINDER
ENV ENABLE_REMINDER=${ENABLE_REMINDER}
ARG REMINDER_SECONDS
ENV REMINDER_SECONDS=${REMINDER_SECONDS}
ARG COURSE_TABLE_CACHE_TIME
ENV COURSE_TABLE_CACHE_TIME=${COURSE_TABLE_CACHE_TIME}
ARG REDIS_URL
ENV REDIS_URL=${REDIS_URL}
ARG REDIS_PREFIX
ENV REDIS_PREFIX=${REDIS_PREFIX}

CMD ["sh", "./run.sh"]
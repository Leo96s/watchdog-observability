FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl \
  && addgroup -S watchdog && adduser -S watchdog -G watchdog

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R watchdog:watchdog /app && chmod +x scripts/docker-entrypoint.sh
USER watchdog

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["sh", "scripts/docker-entrypoint.sh"]

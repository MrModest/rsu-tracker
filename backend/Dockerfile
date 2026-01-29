FROM node:22-slim AS builder

RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-slim

RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.pnpm/better-sqlite3*/node_modules/better-sqlite3/build ./node_modules/.pnpm/better-sqlite3*/node_modules/better-sqlite3/build

ENV DATABASE_URL=/data/rsu.db
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-hostable RSU (Restricted Stock Unit) lifecycle tracker for German tax context. Tracks grants, release events (vesting + sell-to-cover), and sells with two-level FIFO allocation (legally mandated in Germany). See `docs/DOMAIN.md` for full tax rules. To check the plan that was used to initially implement this project, see `docs/PLAN.md` (all tasks are complete — use it as context, not as instructions to implement).

## Architecture

Two independent projects side by side — no monorepo, no shared packages. Types are duplicated between frontend and backend (they're small).

- **`backend/`** — Hono + Drizzle ORM + better-sqlite3 (ESM, Node)
- **`frontend/`** — Vite + React 19 + TanStack Router + TanStack Query + Tailwind v4 + shadcn (base-mira style, base-ui components)
- **`docker-compose.yml`** — Two containers, nginx proxies `/api/` to backend

### Backend Structure
- `src/index.ts` — Hono app entry, registers all route modules
- `src/db/schema.ts` — Drizzle schema for 3 tables: grants, release_events, sells, settings
- `src/db/index.ts` — DB connection + auto-creates tables on import
- `src/routes/` — CRUD routes per entity type + insights + settings
- `src/routes/release-events.ts` — Release event routes with auto-split logic (allocates shares to grants via FIFO)
- `src/services/fifo.ts` — Two-level FIFO engine (release events linked to grants via FK, sells consume release events by settlementDate)
- `src/services/insights.ts` — Computed insight calculations (portfolio, lots, capital gains, tax withholding, sell-to-cover gains, promised vs factual)
- `src/types.ts` — Shared type definitions

### Frontend Structure
- `src/App.tsx` — TanStack Router setup with routes: `/` (dashboard), `/activity`, `/settings`
- `src/types.ts` — Type definitions (duplicated from backend)
- `src/lib/api.ts` — Fetch wrapper for API calls
- `src/hooks/` — TanStack Query hooks per entity type (useGrants, useReleaseEvents, useSells, useInsights)
- `src/pages/` — DashboardPage, ActivityPage, SettingsPage
- `src/components/activity/` — Per-event-type form components (GrantForm, ReleaseEventForm, SellForm) + ActivityTimeline
- `src/components/insights/` — Dashboard insight components (PortfolioSummary, GrantsSummary, LotTracker, CapitalGains, TaxWithholding, SellToCoverGains)
- `src/components/ui/` — shadcn components
- Path alias: `@/` maps to `./src/`

## Commands

### Development
```bash
# Backend (from backend/)
pnpm dev          # tsx watch src/index.ts — runs on port 3001

# Frontend (from frontend/)
pnpm dev          # vite dev server on port 3000, proxies /api/ to localhost:3001
```

Both must run simultaneously for local development.

### Build
```bash
# Backend
pnpm build        # tsc → dist/

# Frontend
pnpm build        # tsc -b && vite build → dist/
```

### Docker
```bash
# From project root
docker compose up --build    # backend:3001, frontend:3000 (nginx)
```

### Database
```bash
# From backend/
pnpm db:generate   # drizzle-kit generate (migrations)
pnpm db:migrate    # drizzle-kit migrate
```

SQLite database path: `DATABASE_URL` env var or `./data/rsu.db` by default. Tables auto-create on backend startup.

## Key Domain Concepts

- **Event types**: grant → release_event (vesting + sell-to-cover) → sell
- **Release event**: Atomic event matching broker report structure (vest date, settlement date, total shares, release price, sell-to-cover details)
- **Two-level FIFO**: (1) Release events linked to grants via explicit FK (auto-split on creation) (2) Sells consume release events by settlementDate (oldest first)
- **Cost basis**: releasePrice (FMV at settlement date, calculated as 30-day average XETRA closing price)
- **Sell-to-cover is REQUIRED**: Tax withholding always happens, generates capital gain/loss if releasePrice ≠ taxSalePrice
- **Sell-to-cover capital gain**: (taxSalePrice - releasePrice) × sharesSoldForTax - brokerFee (can be negative = loss)
- **Grant linkage explicit**: Each release_event has grantId FK (required), system auto-splits releases across grants via FIFO
- **Sells have no FK**: FIFO determines which release_event lots are consumed by settlementDate
- **Fees**: Broker fees on release_events (sell-to-cover) and sells; prorated across lots for capital gains

## Conventions

- Package manager: **pnpm**
- IDs: nanoid (text primary keys)
- Dates: ISO date strings (text columns)
- shadcn style: `base-mira` (base-ui components) — add components via `pnpm dlx shadcn@latest add <component>`
- Frontend icons: lucide-react
- Backend port: 3001, frontend dev port: 3000
- No test framework configured

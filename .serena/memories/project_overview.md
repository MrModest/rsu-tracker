# RSU Tracker — Project Overview

## Purpose
Self-hostable RSU (Restricted Stock Unit) lifecycle tracker for German tax context. Tracks grants, vests, sell-to-cover, releases, and sells with two-level FIFO allocation (legally mandated in Germany).

## Architecture
Two independent projects side by side — no monorepo, no shared packages. Types are duplicated between frontend and backend.

- **`backend/`** — Hono + Drizzle ORM + better-sqlite3 (ESM, Node)
- **`frontend/`** — Vite + React 19 + TanStack Router + TanStack Query + Tailwind v4 + shadcn (base-mira style, base-ui components)
- **`docker-compose.yml`** — Two containers, nginx proxies `/api/` to backend

## Tech Stack

### Backend
- Runtime: Node.js (ESM)
- Framework: Hono v4
- ORM: Drizzle ORM v0.38
- Database: better-sqlite3 (SQLite)
- IDs: nanoid (text primary keys)
- TypeScript strict mode, target ES2022

### Frontend
- Build: Vite v6
- UI: React 19
- Routing: TanStack Router v1
- Data fetching: TanStack Query v5
- Styling: Tailwind CSS v4
- Components: shadcn (base-mira style, base-ui)
- Icons: lucide-react
- TypeScript strict mode, target ES2020

## Key Domain Concepts
- **Event types**: grant → vest/cliff → sell_for_tax + tax_cash_return + release → sell
- **Two-level FIFO**: (1) Vesting consumes from oldest grants first (2) Selling consumes from oldest release lots first
- **FIFO allocations are computed on-the-fly**, not stored in the database
- **vest_id FK** links sell_for_tax, tax_cash_return, and release back to their vest event
- **Sells have no FK** — FIFO determines which release lots are consumed

## Backend Structure
- `src/index.ts` — Hono app entry, registers all route modules
- `src/db/schema.ts` — Drizzle schema for 7 tables: grants, vests, sell_for_tax, tax_cash_returns, releases, sells, settings
- `src/db/index.ts` — DB connection + auto-creates tables on import
- `src/routes/` — CRUD routes per entity type + insights + settings + data (import/export)
- `src/services/fifo.ts` — Two-level FIFO engine (single `computeFifo` function)
- `src/services/insights.ts` — Computed insight calculations
- `src/types.ts` — Shared type definitions (interfaces + Zod-like create types)

## Frontend Structure
- `src/App.tsx` — TanStack Router setup with routes: `/` (dashboard), `/activity`, `/settings`
- `src/types.ts` — Type definitions (duplicated from backend)
- `src/lib/api.ts` — Fetch wrapper (`request` helper + `api` object with all endpoints)
- `src/hooks/` — TanStack Query hooks per entity type (useGrants, useVests, useSells, etc.)
- `src/pages/` — DashboardPage, ActivityPage, SettingsPage
- `src/components/activity/` — Per-event-type form components + ActivityTimeline
- `src/components/insights/` — Dashboard insight components (PortfolioSummary, GrantsSummary, LotTracker, CapitalGains, TaxWithholding)
- `src/components/layout/` — AppLayout, Sidebar
- `src/components/ui/` — shadcn components
- Path alias: `@/` maps to `./src/`

# RSU Tracker — Task Tracking

## Task Status Legend
- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Complete
- `[!]` — Blocked

---

## Phase 1: Project Scaffolding

### T01: Backend scaffold
- **Status:** `[x]`
- **Depends on:** nothing
- **Description:** Create `backend/` with package.json, tsconfig.json, Hono + Drizzle + better-sqlite3 deps, src/index.ts entry point, src/types.ts

### T02: Frontend scaffold
- **Status:** `[x]`
- **Depends on:** nothing
- **Description:** Create `frontend/` with Vite + React + Tailwind + TanStack Router + TanStack Query. Shadcn (new-york style). package.json, tsconfig.json, vite.config.ts, index.html, src/main.tsx, src/App.tsx, src/types.ts

---

## Phase 2: Backend Core

### T03: Database schema
- **Status:** `[x]`
- **Depends on:** T01
- **Description:** Drizzle schema for all 7 tables in src/db/schema.ts. DB connection + auto-create tables in src/db/index.ts. drizzle.config.ts at backend root.

### T04: Grants CRUD routes
- **Status:** `[x]`
- **Depends on:** T03
- **Description:** src/routes/grants.ts — GET list, POST create, GET by id, PUT update, DELETE

### T05: Vests CRUD routes
- **Status:** `[x]`
- **Depends on:** T03
- **Description:** src/routes/vests.ts — GET list (with linked sell_for_tax, tax_cash_return, release), POST, GET by id, PUT, DELETE (cascade linked records)

### T06: Sell-for-tax, tax-cash-returns, releases, sells CRUD routes
- **Status:** `[x]`
- **Depends on:** T03
- **Description:** Four route files with standard CRUD. sell-for-tax/tax-cash-returns/releases require vest_id.

### T07: Settings routes
- **Status:** `[x]`
- **Depends on:** T03
- **Description:** src/routes/settings.ts — GET all settings, PUT upsert settings

### T08: FIFO engine
- **Status:** `[x]`
- **Depends on:** T03
- **Description:** src/services/fifo.ts — Two-level FIFO: (1) vests consume grants by date, (2) sells consume release lots by date.

### T09: Insights routes
- **Status:** `[x]`
- **Depends on:** T08
- **Description:** src/routes/insights.ts + src/services/insights.ts — portfolio, lots, capital-gains, tax-withholding, promised-vs-factual.

---

## Phase 3: Frontend

### T10: API client + TanStack Query hooks
- **Status:** `[x]`
- **Depends on:** T02
- **Description:** src/lib/api.ts, src/lib/utils.ts, hooks for all entities + insights + settings

### T11: App layout + sidebar + routing
- **Status:** `[x]`
- **Depends on:** T02
- **Description:** AppLayout.tsx, Sidebar.tsx, TanStack Router with /, /activity, /settings

### T12: Activity page
- **Status:** `[x]`
- **Depends on:** T10, T11
- **Description:** ActivityPage.tsx with unified timeline, add/edit dialogs for all 6 event types, form components

### T13: Dashboard page
- **Status:** `[x]`
- **Depends on:** T10, T11
- **Description:** DashboardPage.tsx with summary cards, grants table, lots table, capital gains, tax withholding tabs

### T14: Settings page
- **Status:** `[x]`
- **Depends on:** T10, T11
- **Description:** SettingsPage.tsx with currency selector

---

## Phase 4: Docker

### T15: Backend Dockerfile
- **Status:** `[x]`
- **Depends on:** T01
- **Description:** Multi-stage Dockerfile with node:22-slim

### T16: Frontend Dockerfile + nginx
- **Status:** `[x]`
- **Depends on:** T02
- **Description:** Multi-stage Dockerfile + nginx.conf (proxy /api/ to backend)

### T17: docker-compose.yml
- **Status:** `[x]`
- **Depends on:** T15, T16
- **Description:** Root docker-compose.yml with backend + frontend services, volume for SQLite

---

## Dependency Graph

```
T01 (backend scaffold) ──→ T03 (schema) ──→ T04 (grants CRUD)
                                          ──→ T05 (vests CRUD)
                                          ──→ T06 (other CRUD)
                                          ──→ T07 (settings CRUD)
                                          ──→ T08 (FIFO) ──→ T09 (insights)
T01 ──→ T15 (backend Dockerfile)

T02 (frontend scaffold) ──→ T10 (API + hooks) ──→ T12 (activity page)
                         ──→ T11 (layout)      ──→ T13 (dashboard page)
                                               ──→ T14 (settings page)
T02 ──→ T16 (frontend Dockerfile)

T15 + T16 ──→ T17 (docker-compose)
```

## All 17 tasks complete.

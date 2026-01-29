# RSU Tracker — Implementation Plan

## Overview
Self-hostable RSU lifecycle tracker. Two independent projects (`backend/` and `frontend/`) side by side — no monorepo, no shared packages. Types are duplicated (they're small). Each project has its own package.json, tsconfig, Dockerfile. Deployed as two Docker containers via docker-compose.

**Key domain model insight:** A "grant" is just another event type — not a parent entity. FIFO (legally mandated in Germany under § 20 Abs. 4 Satz 7 EStG) governs how vesting consumes from grants and how selling consumes from released lots.

---

## 1. RSU Lifecycle & Data Model

### Event Types & Flow
```
grant ──→ vest/cliff ──→ sell_for_tax ──→ tax_cash_return
                    └──→ release ──→ sell
```

| Type | Description | Creates |
|------|-------------|---------|
| `grant` | Company promises X shares at price Y | Grant pool (promised shares) |
| `vest` | Shares vest. Consumes from grant pools via FIFO | Vest record |
| `cliff` | First vest (functionally identical to vest) | Vest record |
| `sell_for_tax` | Employer sells shares to cover income tax. Linked to a vest. Broker fee recorded separately. | — |
| `tax_cash_return` | Excess cash returned from sell-to-cover. Linked to a vest. | — |
| `release` | Remaining shares released to brokerage. Linked to a vest. **Creates a tax lot.** Unit price defaults to sell_for_tax price but user can override. | Tax lot (cost basis = release unit_price) |
| `sell` | User sells shares. Consumes from release lots via FIFO. Broker fee recorded separately. | Capital gain/loss |

### Two-Level FIFO
1. **Vesting consumes grants (FIFO by grant date):** If Grant A (10 shares, Jan 2023) and Grant B (20 shares, Jul 2023) exist, a vest of 15 shares uses 10 from A + 5 from B.
2. **Selling consumes release lots (FIFO by release date):** Each release event creates a tax lot with a cost basis. Sells consume from oldest lots first. Capital gain = (sell_price - lot_cost_basis) × shares.

### FIFO Allocations
Computed on-the-fly (not stored). The insights API returns which grants/lots each event consumed and in what proportion.

---

## 2. Database Schema

Each event type gets its own table with only the fields it needs. No optional/nullable columns for unrelated data.

### `grants`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| name | text | Unique label, e.g. "2024 Annual" |
| date | text | ISO date — grant date |
| share_amount | real | Total shares promised |
| unit_price | real | Stock price at grant |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `vests`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| date | text | ISO date — vest date |
| share_amount | real | Shares vesting |
| unit_price | real | FMV at vest date |
| is_cliff | integer | 0 or 1 — whether this is the first vest (cliff) |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `sell_for_tax`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| vest_id | text | FK → vests.id |
| date | text | ISO date |
| share_amount | real | Shares sold to cover tax |
| unit_price | real | Market price at sale |
| fee | real | Broker fee (default 0) |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `tax_cash_returns`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| vest_id | text | FK → vests.id |
| date | text | ISO date |
| amount | real | Cash returned (no shares involved) |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `releases`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| vest_id | text | FK → vests.id |
| date | text | ISO date |
| share_amount | real | Shares released to brokerage |
| unit_price | real | Cost basis price (defaults to sell_for_tax price in UI) |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `sells`
| Column | Type | Notes |
|--------|------|-------|
| id | text (nanoid) | PK |
| date | text | ISO date |
| share_amount | real | Shares sold |
| unit_price | real | Sale price |
| fee | real | Broker fee (default 0) |
| notes | text | Optional |
| created_at | text | ISO timestamp |

### `settings`
| Column | Type | Notes |
|--------|------|-------|
| key | text | PK |
| value | text | e.g. key="currency", value="EUR" |

### Design Notes
- Each entity has exactly the fields it needs — no ambiguity
- `fee` exists only on `sell_for_tax` and `sells` (the only types with broker transactions)
- `vest_id` FK exists only on `sell_for_tax`, `tax_cash_returns`, `releases` (linked to their vest)
- `sells` has no FK — FIFO determines which release lots are consumed
- FIFO allocations are computed at query time, not stored
- Relationships: grant ←(FIFO)← vest ←(FK)← sell_for_tax / tax_cash_return / release ←(FIFO)← sell

---

## 3. Project Structure

```
rsu-tracker/
├── docker-compose.yml
├── DOMAIN.md                         # Domain knowledge reference
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── src/
│       ├── index.ts                  # Hono app entry
│       ├── types.ts                  # Entity types, API types (duplicated in frontend)
│       ├── db/
│       │   ├── schema.ts            # Drizzle table definitions (all 7 tables)
│       │   └── index.ts             # DB connection + auto-migrate
│       ├── routes/
│       │   ├── grants.ts            # Grants CRUD
│       │   ├── vests.ts             # Vests CRUD (with linked records)
│       │   ├── sell-for-tax.ts      # Sell-for-tax CRUD
│       │   ├── tax-cash-returns.ts  # Tax cash returns CRUD
│       │   ├── releases.ts          # Releases CRUD
│       │   ├── sells.ts             # Sells CRUD
│       │   ├── insights.ts          # Read-only insight endpoints
│       │   └── settings.ts          # Settings CRUD
│       └── services/
│           ├── fifo.ts              # FIFO allocation engine
│           └── insights.ts          # Insight calculations
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.ts
│   ├── index.html
│   ├── components.json              # shadcn config (style: "base-mira" for base-ui components)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts                 # Entity types, API types (duplicated from backend)
│       ├── lib/
│       │   ├── api.ts               # Fetch wrapper
│       │   └── utils.ts             # cn(), formatCurrency, formatDate
│       ├── hooks/
│       │   ├── use-grants.ts        # Grants CRUD (TanStack Query)
│       │   ├── use-vests.ts         # Vests CRUD
│       │   ├── use-sells.ts         # Sells + sell-for-tax + releases + tax-cash-returns
│       │   ├── use-insights.ts
│       │   └── use-settings.ts
│       ├── pages/
│       │   ├── DashboardPage.tsx     # Portfolio overview + insights
│       │   ├── ActivityPage.tsx      # Unified timeline + add/edit forms
│       │   └── SettingsPage.tsx      # Currency settings
│       └── components/
│           ├── layout/
│           │   ├── AppLayout.tsx
│           │   └── Sidebar.tsx
│           ├── activity/
│           │   ├── ActivityTimeline.tsx
│           │   ├── GrantForm.tsx
│           │   ├── VestForm.tsx
│           │   ├── SellForTaxForm.tsx
│           │   ├── TaxCashReturnForm.tsx
│           │   ├── ReleaseForm.tsx
│           │   └── SellForm.tsx
│           └── insights/
│               ├── PortfolioSummary.tsx
│               ├── GrantsSummary.tsx
│               ├── LotTracker.tsx    # Shows lots with cost basis
│               ├── CapitalGains.tsx
│               └── TaxWithholding.tsx
```

---

## 4. API Endpoints

Each entity type gets its own CRUD routes.

### Grants
- `GET /api/grants` — list all
- `POST /api/grants` — create
- `GET /api/grants/:id` — get one
- `PUT /api/grants/:id` — update
- `DELETE /api/grants/:id` — delete

### Vests
- `GET /api/vests` — list all (with linked sell_for_tax, tax_cash_return, release)
- `POST /api/vests` — create
- `GET /api/vests/:id` — get one (with linked records)
- `PUT /api/vests/:id` — update
- `DELETE /api/vests/:id` — delete (cascade linked records)

### Sell-for-Tax
- `GET /api/sell-for-tax` — list all
- `POST /api/sell-for-tax` — create (requires vest_id)
- `PUT /api/sell-for-tax/:id` — update
- `DELETE /api/sell-for-tax/:id` — delete

### Tax Cash Returns
- `GET /api/tax-cash-returns` — list all
- `POST /api/tax-cash-returns` — create (requires vest_id)
- `PUT /api/tax-cash-returns/:id` — update
- `DELETE /api/tax-cash-returns/:id` — delete

### Releases
- `GET /api/releases` — list all
- `POST /api/releases` — create (requires vest_id)
- `PUT /api/releases/:id` — update
- `DELETE /api/releases/:id` — delete

### Sells
- `GET /api/sells` — list all
- `POST /api/sells` — create
- `PUT /api/sells/:id` — update
- `DELETE /api/sells/:id` — delete

### Insights (read-only, computed)
- `GET /api/insights/portfolio` — portfolio overview across all grants
- `GET /api/insights/lots` — all tax lots (releases) with FIFO status (remaining shares, cost basis)
- `GET /api/insights/capital-gains` — capital gains breakdown per lot consumed by sells
- `GET /api/insights/tax-withholding` — tax withholding summary per vest
- `GET /api/insights/promised-vs-factual` — grant price vs vest price comparison per grant

### Settings
- `GET /api/settings` — get all settings
- `PUT /api/settings` — upsert settings

---

## 5. FIFO Engine (`services/fifo.ts`)

Queries all 6 entity tables and computes allocations. Returns:
1. **Grant pools:** For each grant, how many shares remain unconsumed by vests
2. **Vest allocations:** For each vest, which grant(s) it consumed from and how many shares
3. **Tax lots:** For each release: shares remaining after sells, cost basis (unit_price)
4. **Sell allocations:** For each sell, which lot(s) it consumed from, shares per lot, and per-lot capital gain

Algorithm:
```
1. Load all grants (sorted by date ASC) → build grantPools: Map<grantId, remainingShares>
2. Load all vests (sorted by date ASC)
3. For each vest: consume from grantPools (FIFO by grant date), record vest→grant allocations
4. Load all releases (sorted by date ASC) → build lots: Map<releaseId, {remainingShares, costBasis}>
5. Load all sells (sorted by date ASC)
6. For each sell: consume from lots (FIFO by release date), record sell→lot allocations with per-lot gain
   - gain per lot portion = (sell.unit_price × shares) − (lot.costBasis × shares)
   - fee prorated across lots proportionally
7. Return all allocations + current pool/lot state
```

---

## 6. Key Insight Calculations

### Portfolio Overview
- **Granted**: SUM(grants.share_amount)
- **Vested**: SUM(vests.share_amount)
- **Sold for tax**: SUM(sell_for_tax.share_amount)
- **Released**: SUM(releases.share_amount)
- **Sold**: SUM(sells.share_amount)
- **Currently held**: released − sold
- **Total fees paid**: SUM(sell_for_tax.fee) + SUM(sells.fee)
- **Unrealized value**: held × latest known unit_price

### Lots View
Table showing each release lot:
| Release Date | Grant | Shares | Remaining | Cost Basis | Current Value | Unrealized Gain |

### Capital Gains (from sells)
For each sell event, show which lots were consumed (FIFO) and per-lot gain.
Fee is subtracted from total proceeds (reduces capital gain).
Capital gain per lot = (sell_price × shares) − (cost_basis × shares) − (fee prorated to this lot's share proportion)
| Sell Date | Lot (Release Date) | Shares | Cost Basis | Sell Price | Fee (prorated) | Gain |

### Tax Withholding (per vest)
Fee from sell_for_tax is shown alongside tax proceeds.
Net tax paid = tax_proceeds − cash_returned − sell_for_tax_fee (fee is a cost, not tax)
| Vest Date | Shares Vested | Sold for Tax | Tax Proceeds | Fee | Cash Returned | Net Tax |

### Promised vs Factual (per grant_name)
| Grant | Promised (grant_price × vested_shares) | Factual (vest_price × vest_shares) | Diff |

---

## 7. Frontend Pages

### Dashboard (`/`)
- Summary cards: total granted, vested, held, current value, total capital gains
- Grants summary table
- Tax lots table (releases with remaining shares and cost basis)
- Quick links to add new records

### Activity (`/activity`)
- Unified timeline view of all records across all tables, sorted by date desc
- Each row shows: date, type badge, details (shares, price, fee), linked grant/vest
- Clicking a row opens edit dialog for that record type
- "Add" button with type selector → opens the appropriate form:
  - **Grant form**: name, date, share_amount, unit_price, notes
  - **Vest form**: date, share_amount, unit_price, is_cliff toggle, notes
  - **Sell-for-tax form**: vest selector (dropdown), date, share_amount, unit_price, fee, notes
  - **Tax cash return form**: vest selector, date, amount, notes
  - **Release form**: vest selector, date, share_amount, unit_price (defaults to linked sell_for_tax price), notes
  - **Sell form**: date, share_amount, unit_price, fee, notes

### Settings (`/settings`)
- Currency selector (USD, EUR, GBP, CHF, etc.)

---

## 8. Implementation Order

### Phase 1: Project Scaffolding
1. Create `backend/` — Hono + Drizzle + SQLite skeleton (package.json, tsconfig, types)
2. Create `frontend/` — Vite + React + Tailwind + Shadcn (base-ui / "base-mira" style) + TanStack Router + TanStack Query (package.json, tsconfig, types)
   - Use `pnpm dlx shadcn@latest add <component>` to add components
   - components.json must have `"style": "base-mira"` for base-ui based components
   - When no ready shadcn component exists, compose from smaller shadcn primitives
3. Update DOMAIN.md with fee information

### Phase 2: Backend Core
4. DB schema (7 tables) with Drizzle, auto-migration on startup
5. Grants CRUD routes
6. Vests CRUD routes (with linked records)
7. Sell-for-tax, tax-cash-returns, releases, sells CRUD routes
8. Settings routes
9. FIFO engine (services/fifo.ts)
10. Insights routes (portfolio, lots, capital-gains, tax-withholding, promised-vs-factual)

### Phase 3: Frontend
11. API client + TanStack Query hooks
12. App layout + sidebar navigation + routing
13. Activity page (unified timeline + per-type add/edit form dialogs)
14. Dashboard page (summary cards + grants table + lots table)
15. Settings page

### Phase 4: Docker
16. Backend Dockerfile (multi-stage, node:22-slim)
17. Frontend Dockerfile (multi-stage, nginx for static + API proxy)
18. docker-compose.yml

---

## 9. Docker Setup

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    volumes: ["rsu-data:/data"]
    environment:
      DATABASE_URL: /data/rsu.db
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
volumes:
  rsu-data:
```

nginx.conf proxies `/api/` → `http://backend:3001/api/`

---

## 10. Verification

1. **Backend CRUD**: Create records via curl, verify DB state
2. **FIFO Engine**: Create grant→vest→release→sell sequence, verify lot allocations
3. **Frontend**: Full workflow — create grant, vest, sell_for_tax, tax_cash_return, release, sell — verify dashboard insights
4. **Docker**: `docker compose up`, verify full flow through nginx proxy

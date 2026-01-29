# RSU Tracker

> **⚠️ Disclaimer**: This application was fully vibe-coded by Claude Opus 4.5.
> - Use at your own risk — no warranty is provided for correctness of calculations or tax compliance.
> - That said, best effort has been made to present all data in a way that makes it easy to fact-check and recognize mis-calculations or complete nonsense.

## What is this?

A self-hostable RSU (Restricted Stock Unit) lifecycle tracker designed for the German tax context. Tracks the full lifecycle of equity compensation events:

- **Grants** — Initial RSU awards with vesting schedules
- **Vests/Cliffs** — When shares actually vest
- **Sell-to-Cover** — Automatic sales for tax withholding
- **Tax Cash Returns** — Refunds when too much was withheld
- **Releases** — Shares released to your brokerage account
- **Sells** — When you sell shares

Implements two-level FIFO allocation (legally mandated in Germany):
1. Vesting consumes from oldest grants first
2. Selling consumes from oldest release lots first

Provides insights into portfolio value, capital gains, tax withholding accuracy, and lot tracking.

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

Access at `http://localhost:3000`

Data persists in `./backend/data/rsu.db`

### Local Development

Requires Node.js and pnpm.

```bash
# Backend (terminal 1)
cd backend
pnpm install
pnpm dev          # Runs on port 3001

# Frontend (terminal 2)
cd frontend
pnpm install
pnpm dev          # Runs on port 3000
```

## Architecture

- **Backend**: Hono + Drizzle ORM + SQLite (better-sqlite3)
- **Frontend**: Vite + React 19 + TanStack Router + TanStack Query + Tailwind v4 + shadcn/ui

See `CLAUDE.md` for detailed architecture and domain concepts.

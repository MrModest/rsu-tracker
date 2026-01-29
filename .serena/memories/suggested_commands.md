# Suggested Commands

## Development (both must run simultaneously)

```bash
# Backend (from backend/)
pnpm dev          # tsx watch src/index.ts — runs on port 3001

# Frontend (from frontend/)
pnpm dev          # vite dev server on port 3000, proxies /api/ to localhost:3001
```

## Build

```bash
# Backend (from backend/)
pnpm build        # tsc → dist/

# Frontend (from frontend/)
pnpm build        # tsc -b && vite build → dist/
```

## Docker

```bash
# From project root
docker compose up --build    # backend:3001, frontend:3000 (nginx)
```

## Database

```bash
# From backend/
pnpm db:generate   # drizzle-kit generate (migrations)
pnpm db:migrate    # drizzle-kit migrate
```

SQLite database path: `DATABASE_URL` env var or `./data/rsu.db` by default. Tables auto-create on backend startup.

## Package Management

```bash
# Always use pnpm (from the respective project directory)
pnpm install
pnpm add <package>
pnpm add -D <package>
```

## Adding shadcn Components

```bash
# From frontend/
pnpm dlx shadcn@latest add <component>
```

## System Utils (macOS / Darwin)

- `git` — version control
- `ls` — list directory contents
- `find` — find files (uses BSD find syntax on macOS)
- `grep` — search file contents
- `open` — open files/URLs in default application

## Notes
- No test framework is configured
- No linter/formatter is configured
- There is no root package.json — run commands from `backend/` or `frontend/` directories

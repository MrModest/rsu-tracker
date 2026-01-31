# Code Style & Conventions

## General
- Package manager: **pnpm**
- Language: TypeScript (strict mode in both projects)
- Module system: ESM (`"type": "module"`)
- IDs: nanoid (text primary keys)
- Dates: ISO date strings (text columns in DB)
- No test framework configured
- No linter/formatter configured

## Backend Conventions
- Hono route modules export a sub-app, registered in `src/index.ts`
- Routes grouped by entity: `routes/grants.ts`, `routes/vests.ts`, etc.
- Standard CRUD pattern: GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`
- All routes prefixed with `/api/` (e.g., `/api/grants`)
- Drizzle ORM for database access, schema in `src/db/schema.ts`
- Services contain business logic (FIFO, insights)
- Types defined as interfaces in `src/types.ts` with companion `Create*` type aliases

## Frontend Conventions
- Functional components (no classes)
- Path alias: `@/` maps to `./src/`
- TanStack Query hooks pattern: one file per entity in `src/hooks/`
  - `useX()` → `useQuery` for fetching
  - `useCreateX()` → `useMutation` with `onSuccess` invalidation
  - `useUpdateX()` → `useMutation` with `onSuccess` invalidation
  - `useDeleteX()` → `useMutation` with `onSuccess` invalidation
- API calls centralized in `src/lib/api.ts` via `api` object
- `request()` helper handles fetch + JSON parsing
- shadcn components: base-mira style (base-ui), stored in `src/components/ui/`
- Icons: lucide-react
- Styling: Tailwind CSS v4 (utility classes)
- Routing: TanStack Router (file-based-ish setup in App.tsx)
- Pages in `src/pages/`, form components in `src/components/activity/`
- Types duplicated from backend in `src/types.ts`

## Naming
- camelCase for variables, functions, methods
- PascalCase for components, interfaces, types
- kebab-case for file names (e.g., `use-grants.ts`, `sell-for-tax.ts`)
- Route files named after entity (e.g., `grants.ts`, `release-events.ts`, `sells.ts`)
- Cost basis calculation: FMV at settlement date (30-day average XETRA closing price)
- Sell-to-cover capital gains: (taxSalePrice - releasePrice) × sharesSoldForTax - brokerFee

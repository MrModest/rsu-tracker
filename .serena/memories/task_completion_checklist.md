# Task Completion Checklist

When a coding task is completed, verify the following:

## Always
1. **TypeScript compiles** — Run `pnpm build` in the affected project(s) to check for type errors
   - Backend: `cd backend && pnpm build`
   - Frontend: `cd frontend && pnpm build`
2. **No runtime errors** — If dev servers are running, check for console errors

## When modifying backend
- Ensure route changes are registered in `src/index.ts` if adding new route modules
- Ensure Drizzle schema changes have corresponding migration: `pnpm db:generate && pnpm db:migrate`
- Ensure types in `src/types.ts` are updated if data shapes changed

## When modifying frontend
- Ensure new components follow existing patterns (hooks, api wrapper, shadcn style)
- If types changed on backend, update corresponding types in `frontend/src/types.ts`
- If new API endpoints added, add corresponding methods to `src/lib/api.ts`
- If new entity hooks needed, create in `src/hooks/` following existing pattern

## Notes
- No test framework → no tests to run
- No linter → no lint check needed
- No formatter → no format check needed
- The two projects are independent — changes in one don't require rebuilding the other (unless types diverged)

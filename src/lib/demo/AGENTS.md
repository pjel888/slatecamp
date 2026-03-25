<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# demo

## Purpose

Demo mode configuration and mock data layer. Activated via `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` environment variable. Provides a complete mock Supabase client and fake data for the `/try` landing experience, allowing the app to run without a real Supabase backend.

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `isDemoMode()` -- checks `NEXT_PUBLIC_ENABLE_DEMO_MODE` env var. `DEMO_USER` -- constant demo user identity with fixed UUID and email. |
| **data.ts** | `getDemoProfile(tier)` -- builds a demo user profile for any tier. `getDemoDataForTable(table)` -- returns mock rows for any Supabase table. Provides quiz sessions, questions, wiki articles, taxonomy nodes, mastery data. |
| **mock-supabase.ts** | `createMockSupabaseClient()` -- in-memory Supabase client replacement. Supports `.from().select()`, `.insert()`, `.update()`, `.delete()` with filter chaining. Uses `globalThis` for HMR-safe persistence. |

## For AI Agents

### Working In This Directory

1. **Environment-gated.** Demo mode activates only when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`. Production builds with valid Supabase keys always use real clients.
2. **Do not delete.** This module is env-gated, not import-gated. Other modules dynamically check `isDemoMode()`.
3. **Mock client mimics Supabase API.** The mock client implements chainable query builders (`.from().select().eq().order()` etc.) returning demo data.
4. **Data freshness.** `getRows()` always returns fresh copies from `data.ts` (not cached), so edits to mock data take effect immediately.
5. **Used by `@/lib/supabase/client.ts`** -- browser client returns mock client when demo mode is active.

## Dependencies

### Internal

- `@/types/app` -- `UserTier`
- `@/lib/dev/dev-mode` -- `TIER_CAPABILITIES`

### External

- None (self-contained mock layer)

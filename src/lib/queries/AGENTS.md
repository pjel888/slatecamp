<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# queries

## Purpose

Read-only query functions for server components. These are plain async functions (NOT server actions) that can be called directly from server components without the `'use server'` serialization boundary. Mutations for the same domains live in `@/lib/actions/`.

## Key Files

| File | Description |
|------|-------------|
| **trails.ts** | Trail read queries: `getPublishedTrails()`, `getUserTrailEnrollment()`, `getTrailProgress()`, `getTrailRecommendations()`. Fetches from `camp_trails`, `trail_days`, `trail_steps`, `trail_enrollments` tables. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| **ceo/** | CEO portal queries: auth verification, financial summaries, team data, user engagement metrics. See `ceo/AGENTS.md`. |

## For AI Agents

### Working In This Directory

1. **Not server actions.** Files here do NOT use `'use server'`. They are plain async functions safe for direct import in server components.
2. **Read-only.** No mutations in this directory. All writes go through `@/lib/actions/`.
3. **Supabase reads.** Use `createClient()` from `@/lib/supabase/server` for authenticated queries.
4. **Type imports.** Import domain types from `@/types/app` or `@/types/ceo`.

### Common Patterns

**Server component query:**
```typescript
import { getPublishedTrails } from '@/lib/queries/trails'

// In a server component:
const trails = await getPublishedTrails()
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()`, `getUser()`
- `@/types/app` -- `CampTrail`, `TrailDay`, `TrailStep`, etc.

### External

- `@supabase/supabase-js` -- Supabase client

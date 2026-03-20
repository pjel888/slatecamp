# Code Conventions

## Component Patterns

### Server vs Client Split
- **Default:** Server Components (no directive needed)
- **Client:** `'use client'` only for interactivity (hooks, event handlers, browser APIs)
- **Pattern:** ~30 client components vs hundreds of server components

### Component Organization
- Page-specific components co-located with pages (e.g., `CampDashboard.tsx` in `src/app/dashboard/testing/`)
- Private components in `_components/` directories
- Shared UI in `src/components/ui/` (shadcn primitives)
- Domain components in `src/components/{domain}/` (wiki, quiz, dashboard, etc.)

### Styling
- **Tailwind-first** — All styling via Tailwind utility classes
- **`cn()` utility** — Always use for class merging: `cn('base-class', conditional && 'optional-class')`
- **CVA** — `class-variance-authority` for variant-based component APIs
- **No CSS modules** — All Tailwind, no `.module.css` files
- **Design tokens** — Campfire palette defined in CLAUDE.md, enforced via constants

## Data Patterns

### Server Actions
- All mutations via `'use server'` functions in `src/lib/actions/`
- Pattern: validate → get user → query Supabase → return typed result
- Error handling: try/catch with typed error returns (not throwing)
- Cache invalidation: `revalidatePath()` after mutations

### Supabase Client Usage
- **Server:** `await createClient()` from `src/lib/supabase/server.ts` (cookie-based)
- **Client:** `createClient()` from `src/lib/supabase/client.ts` (browser client)
- **Admin:** `createAdminClient()` from `src/lib/supabase/admin.ts` (service role, bypasses RLS)
- **Demo:** All clients fall back to mock when `NEXT_PUBLIC_SUPABASE_URL` is absent

### State Management
- **Minimal Zustand** — Only `src/stores/dev-store.ts` (dev impersonation)
- **React Context** — `src/lib/context/note-context.tsx`
- **Custom hooks** — `src/hooks/quiz/` for quiz state, timers, telemetry, persistence
- **Server-first** — Most state lives on the server, minimal client state

## Code Style

### TypeScript
- **Strict mode disabled** (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`)
- **`as any` usage:** 25 occurrences across 10 files — mostly in analytics and dashboard actions
- **Arrow functions preferred** — Per user feedback, always use arrow functions
- **Path alias:** `@/*` maps to `src/*`

### Naming
- **Functions:** camelCase (`getPageTitle`, `createClient`, `checkRateLimit`)
- **Components:** PascalCase (`WikiSidebar`, `QuizRenderer`)
- **Files:** kebab-case for utilities/actions, PascalCase for components
- **Types:** PascalCase interfaces and types
- **Constants:** SCREAMING_SNAKE_CASE (`FEATURE_FLAGS`, `DASHBOARD_ROUTES`)

### Error Handling
- Server actions: try/catch returning `{ error: string }` or `{ data: T }`
- API routes: try/catch with `NextResponse.json({ error }, { status })`
- Client: Error boundaries not heavily used; toast notifications for user feedback
- Silent catches in some areas (SSE parsing, cookie setting)

### Imports
- Absolute imports via `@/` alias
- No barrel exports — direct file imports
- Types imported with `import type` where possible

## Feature Flag Pattern

```typescript
// Definition: src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  ai_tutor_access: {
    key: 'ai_tutor_access',
    defaultValue: false,
    description: 'AI Contextual Tutor access',
    category: 'access',
  },
} as const satisfies Record<string, FeatureFlagDefinition>

// Resolution: dev override → DB value → config default
// Hook: src/lib/hooks/useFeatureFlag.ts
// Action: src/lib/actions/feature-flags.ts
```

## Voice & Content Rules

Per CLAUDE.md "Confident Companion" voice:
- Growth-framed messaging ("42 topics covered" not "58 remaining")
- No militaristic language (use "practice" not "drill", "master" not "dominate")
- Minimum text size: 11px (never 8-10px)
- Monospace only on code/data values, never on labels

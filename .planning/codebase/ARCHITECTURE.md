# Architecture

## Pattern

**Next.js App Router with Server-First Architecture**

- Server Components by default, Client Components only for interactivity
- Server Actions (`'use server'`) for all data mutations (47 files)
- Route Handlers for API endpoints, webhooks, and cron jobs
- Supabase as the sole data layer (PostgreSQL + Auth + Storage)

## Layers

```
┌──────────────────────────────────────────┐
│  Presentation (React Components)         │
│  src/components/ — UI, dashboard, wiki   │
│  src/app/**/page.tsx — Page components   │
├──────────────────────────────────────────┤
│  Client State                            │
│  src/stores/ — Zustand (dev-store only)  │
│  src/hooks/ — Quiz state, timers         │
│  src/lib/context/ — React Context        │
├──────────────────────────────────────────┤
│  Server Actions                          │
│  src/lib/actions/ — 46 action files      │
│  'use server' data mutations             │
├──────────────────────────────────────────┤
│  Domain Logic                            │
│  src/lib/srs/ — IRT, SM-2 algorithms     │
│  src/lib/readiness/ — Score computation  │
│  src/lib/blindspot/ — Gap detection      │
│  src/lib/signals/ — Learning signals     │
│  src/lib/workflow/ — Content workflow     │
├──────────────────────────────────────────┤
│  API Routes                              │
│  src/app/api/ai/ — AI endpoints          │
│  src/app/api/cron/ — Scheduled jobs      │
│  src/app/api/payments/ — Checkout        │
│  src/app/api/webhooks/ — Stripe, PayRex  │
├──────────────────────────────────────────┤
│  Data Access                             │
│  src/lib/supabase/ — Client factories    │
│  server.ts, client.ts, admin.ts          │
│  middleware.ts — Auth session refresh     │
├──────────────────────────────────────────┤
│  External Services                       │
│  Supabase (DB, Auth, Storage)            │
│  Anthropic / OpenAI (AI)                 │
│  Stripe / PayRex (Payments)              │
└──────────────────────────────────────────┘
```

## Data Flow

### Read Path (Server Component)
1. Page component renders on server
2. Calls server action or queries Supabase directly
3. `createClient()` from `src/lib/supabase/server.ts` (cookie-based)
4. Data returned, rendered as HTML, streamed to client

### Write Path (Server Action)
1. Client component calls server action
2. Action validates input, calls Supabase
3. Revalidates cache via `revalidatePath()`
4. Client receives updated data

### Auth Flow
1. Middleware (`src/lib/supabase/middleware.ts`) intercepts all requests
2. Bypasses static assets, API routes, auth callbacks
3. Creates Supabase client, checks session
4. Redirects unauthenticated users to login
5. Admin routes gated by `canReviewContent()`

### Demo Mode
1. `isDemoMode()` checks absence of `NEXT_PUBLIC_SUPABASE_URL`
2. All Supabase calls routed to `createMockSupabaseClient()`
3. Returns fake data for demo/try experience

## Entry Points

- `src/app/layout.tsx` — Root layout (Inter font, ThemeProvider, TooltipProvider, Toaster)
- `src/app/page.tsx` — Landing page
- `src/app/dashboard/` — Main authenticated area
- `src/app/admin/` — Admin portal (role-gated)
- `src/app/(auth)/` — Auth flows (login, register, onboarding)
- `src/app/api/` — API routes (ai, cron, payments, webhooks)

## Key Abstractions

### AI Provider (`src/lib/ai/provider.ts`)
- Interface: `AIProvider` with `generateCompletion`, `generateEmbedding`, `streamCompletion`
- Implementations: `OpenAIProvider`, `AnthropicProvider`
- Factory: `getAIProvider()` reads `AI_PROVIDER` env var

### Feature Flags (`src/config/feature-flags.ts`)
- Static definitions with defaults
- Three-layer resolution: dev override → DB → config default
- 7 flags controlling access, org features, dev tools

### Routing (`src/lib/routes.ts`)
- `DASHBOARD_ROUTES` — Single source of truth for nav
- `SIDEBAR_NAVIGATION` — Derived from routes
- `getPageTitle()` — Dynamic title resolution

### SRS Engine (`src/lib/srs/`)
- `irt.ts` — Item Response Theory 2PL model
- `sm2.ts` — SM-2 spaced repetition algorithm
- `update.ts` — SRS state updates
- `retention.ts` — Retention predictions

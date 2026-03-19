# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
slate-camp/
├── .claude/                          # Claude agent configs & docs (not committed to repo)
├── .planning/                        # Planning documents (GSD workflow outputs)
├── src/
│   ├── app/                          # Next.js App Router (pages, layouts, API)
│   │   ├── (auth)/                   # Auth layout group (login, register, onboarding, forgot-password)
│   │   ├── admin/                    # Admin dashboard (questions, wiki, taxonomy, audit)
│   │   ├── api/                      # API routes (routes/)
│   │   │   ├── ai/                   # AI integrations (tutor, study-agent, generate-questions)
│   │   │   ├── cron/                 # Scheduled jobs (blindspot-scan, compute-signals)
│   │   │   ├── payments/             # Payment processing (checkout)
│   │   │   ├── webhooks/             # Webhook handlers (stripe, payrex)
│   │   │   └── pdf/                  # PDF processing
│   │   ├── dashboard/                # Authenticated dashboard (core app)
│   │   │   ├── 3d-lab/               # 3D building code viewer (R3F)
│   │   │   ├── analytics/            # User performance analytics
│   │   │   ├── assessment/           # Initial diagnostic assessment
│   │   │   ├── developer/            # Dev tools (console, db, test-data)
│   │   │   ├── focus-review/         # Blindspot review interface
│   │   │   ├── quiz/                 # Main quiz session interface
│   │   │   ├── settings/             # User settings (profile, billing)
│   │   │   ├── trails/               # Topic-based study trails
│   │   │   ├── wiki/                 # Knowledge base browser
│   │   │   └── page.tsx              # Main dashboard home
│   │   ├── about/                    # Marketing pages
│   │   ├── pricing/                  # Pricing page
│   │   ├── contact/                  # Contact form
│   │   ├── try/                      # Demo mode entry
│   │   ├── auth/                     # Auth callbacks
│   │   ├── layout.tsx                # Root layout (fonts, providers, theme)
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global Tailwind styles
│   │
│   ├── components/                   # React components (organized by feature)
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── quiz/                     # Quiz session components
│   │   ├── assessment/               # Assessment flow components
│   │   ├── wiki/                     # Wiki article & search components
│   │   ├── trails/                   # Trail-based learning components
│   │   ├── 3d/                       # R3F 3D model components
│   │   ├── auth/                     # Auth form components
│   │   ├── admin/                    # Admin interface components
│   │   ├── layouts/                  # Reusable page layouts
│   │   ├── shared/                   # Shared utility components (theme, nav, progress)
│   │   ├── ui/                       # Base UI primitives (buttons, cards, dialogs, shadcn)
│   │   ├── graphics/                 # Decorative graphics (noise filter, gradients)
│   │   ├── motion/                   # Framer Motion animations
│   │   ├── interactive-illustrations/ # Interactive SVG illustrations
│   │   ├── landing/                  # Landing page sections
│   │   ├── marketing/                # Marketing page components
│   │   ├── analytics/                # Analytics dashboard components
│   │   ├── developer/                # Dev tools UI
│   │   ├── notes/                    # Note-taking components
│   │   └── dev/                      # Dev-only components (demo shell)
│   │
│   ├── lib/                          # Utility & business logic
│   │   ├── actions/                  # Server actions (data mutations, reads)
│   │   │   ├── admin/                # Admin operations
│   │   │   └── dev/                  # Dev-only operations
│   │   ├── supabase/                 # Supabase client factory & auth
│   │   │   ├── server.ts             # Server client + cached user fetch
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── admin.ts              # Admin operations client
│   │   │   ├── middleware.ts         # Auth middleware
│   │   │   └── bootstrap.ts          # Initial data bootstrap
│   │   ├── srs/                      # Spaced repetition scheduling
│   │   ├── readiness/                # Readiness score calculation
│   │   │   ├── churn.ts              # User churn prediction
│   │   │   └── velocity.ts           # Learning velocity trend
│   │   ├── signals/                  # Mastery signal computation
│   │   ├── blindspot/                # Blindspot protocol queue generation
│   │   ├── proof-simulation/         # Full exam simulation logic
│   │   ├── outcomes/                 # Exam outcome prediction
│   │   ├── ai/                       # AI helper functions
│   │   ├── audit/                    # Question quality auditing
│   │   ├── payments/                 # Payment integration (Stripe, Payrex)
│   │   │   ├── stripe.ts
│   │   │   └── payrex.ts
│   │   ├── constants/                # App configuration & constants
│   │   │   ├── site.ts               # Site metadata (name, description)
│   │   │   ├── routes.ts             # Route paths (ROUTES object)
│   │   │   ├── readiness.ts          # Readiness scoring thresholds
│   │   │   ├── analytics.ts          # Analytics event names
│   │   │   └── pricing.ts            # Subscription tier configs
│   │   ├── utils/                    # General utilities
│   │   │   ├── helpers.ts            # Misc helper functions
│   │   │   ├── text.ts               # Text formatting & parsing
│   │   │   ├── wiki.ts               # Wiki-specific utilities
│   │   │   └── constants.ts          # Shared constants
│   │   ├── validations/              # Zod validation schemas
│   │   ├── hooks/                    # Custom hooks (use-toast, useFeatureFlag, etc.)
│   │   ├── context/                  # React context providers
│   │   ├── admin/                    # Admin logic (permissions, roles)
│   │   ├── demo/                     # Demo mode utilities & mock data
│   │   ├── dev/                      # Development utilities
│   │   ├── import/                   # CSV/file import utilities
│   │   ├── notes/                    # Note-taking logic
│   │   ├── wiki/                     # Wiki content utilities
│   │   ├── workflow/                 # Workflow state machines
│   │   ├── endurance/                # Extended practice sessions
│   │   ├── audio/                    # Audio playback utilities
│   │   └── analytics-server.ts       # Server-side event tracking
│   │
│   ├── stores/                       # Zustand state management
│   │   └── dev-store.ts              # Dev impersonation & test presets
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── quiz/                     # Quiz-specific hooks
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── app.ts                    # Domain types (User, Question, Session, etc.)
│   │   ├── supabase.ts               # Supabase schema types (auto-generated)
│   │   ├── dashboard.ts              # Dashboard-specific types
│   │   └── payrex-node.d.ts          # External type definitions
│   │
│   ├── config/                       # Application configuration
│   │   └── feature-flags.ts          # Feature flag definitions
│   │
│   └── data/                         # Static data & seeding
│       └── seed/                     # Database seed scripts
│
├── public/                           # Static assets (images, fonts)
├── supabase/                         # Supabase configuration
│   ├── migrations/                   # Database schema migrations
│   └── types/                        # Generated Supabase types
├── scripts/                          # Utility scripts
│   ├── dev.js                        # Development server startup
│   ├── seed.ts                       # Database seed runner
│   └── taxonomy_v50_sql/             # Taxonomy seeding scripts
├── docs/                             # Project documentation (outdated, kept for reference)
├── .planning/                        # GSD planning documents (THIS DIR)
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── tailwind.config.js                # Tailwind CSS configuration
├── vercel.json                       # Vercel deployment config (cron jobs)
└── DATABASE_SCHEMA.sql               # PostgreSQL schema reference
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file structure (pages, layouts, API routes)
- Contains: Route handlers, page components, layout wrappers
- Key files: `layout.tsx` (root), `page.tsx` (route pages), `route.ts` (API endpoints)

**`src/app/api/`:**
- Purpose: Backend API routes for external integrations and scheduled jobs
- Contains: Cron jobs, webhooks, AI/payment endpoints
- Key patterns: GET/POST handlers, auth verification via headers, NextResponse/NextRequest

**`src/components/`:**
- Purpose: Reusable React components organized by feature domain
- Contains: Client components (interactive), server components (data fetching), UI primitives
- Organization: Feature-first (dashboard, quiz, wiki) rather than type-first (buttons, cards)

**`src/lib/actions/`:**
- Purpose: Server action functions for data fetching and mutations
- Contains: `'use server'` functions, Supabase queries, domain logic orchestration
- Pattern: Imported directly into server/client components, invoked via form actions or direct calls

**`src/lib/supabase/`:**
- Purpose: Database access layer and authentication management
- Contains: Client factories, auth helpers, middleware
- Key exports: `createClient()`, `createAdminClient()`, `getUser()`, `getUserIfPresent()`

**`src/lib/` domain modules:**
- **`srs/`**: Spaced repetition scheduling (intervals, review dates)
- **`readiness/`**: Readiness score calculation (churn, velocity metrics)
- **`signals/`**: Mastery signal computation (EMA, discrimination)
- **`blindspot/`**: Blindspot protocol queue generation (weak area identification)
- **`proof-simulation/`**: Full exam simulation (timing, difficulty)
- **`outcomes/`**: Exam outcome prediction (pass probability)
- All follow pattern: Pure functions, typed inputs/outputs, used by actions/API routes

**`src/types/`:**
- Purpose: TypeScript type definitions for app domain and Supabase schema
- Contains: User, Question, Session, TaxonomyNode, WikiArticle, etc.
- Key files: `app.ts` (domain types), `supabase.ts` (schema types)

**`src/lib/constants/`:**
- Purpose: Centralized configuration and constants
- Contains: Route paths, site metadata, readiness thresholds, analytics events
- Used by: All layers (components, actions, utilities)

**`src/lib/validations/`:**
- Purpose: Input validation schemas (Zod)
- Contains: Schemas for API requests, server actions, form inputs
- Pattern: Define once, type-infer, reuse across multiple endpoints

**`src/stores/`:**
- Purpose: Client-side state management (Zustand)
- Contains: UI toggles, dev impersonation, feature flag cache
- Note: Minimal usage; most state lives in Supabase

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` — Root layout (fonts, providers, theme setup)
- `src/app/page.tsx` — Landing page
- `src/app/dashboard/page.tsx` — Authenticated dashboard home
- `src/app/(auth)/login/page.tsx` — Login page
- `src/app/(auth)/onboarding/page.tsx` — First-time setup flow

**Configuration:**
- `next.config.ts` — Next.js config (image patterns, server packages, turbopack)
- `tsconfig.json` — TypeScript compiler options (path aliases: `@/*` → `src/*`)
- `package.json` — Dependencies and npm scripts
- `vercel.json` — Vercel deployment settings (cron jobs configuration)

**Core Logic:**
- `src/lib/actions/dashboard-page.ts` — Dashboard data aggregation
- `src/lib/actions/quiz.ts` — Quiz session operations
- `src/lib/actions/assessment.ts` — Initial assessment
- `src/lib/actions/mastery.ts` — Mastery & signal calculations
- `src/lib/supabase/server.ts` — Database client + auth

**Testing:**
- `src/lib/actions/quiz.test.ts` — Server action tests
- Test files co-located with source (e.g., `file.test.ts` alongside `file.ts`)

**Utilities:**
- `src/lib/validations/index.ts` — Input validation schemas
- `src/lib/utils/helpers.ts` — General utility functions
- `src/lib/utils/text.ts` — Text formatting & markdown parsing

## Naming Conventions

**Files:**
- Pages: `page.tsx` (convention enforced by Next.js App Router)
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Server actions: `*.ts` with `'use server'` directive
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatScore.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useFeatureFlag.ts`)

**Directories:**
- Feature domains: camelCase or kebab-case (e.g., `dashboard`, `3d-lab`)
- Layout groups: Parentheses notation (e.g., `(auth)`)
- Dynamic segments: Brackets (e.g., `[id]`, `[slug]`)

**Types & Interfaces:**
- PascalCase (e.g., `User`, `QuizSession`, `TaxonomyNode`)
- Prefixes for unions: `UserTier`, `TestMode`, `SessionStatus`
- Suffixes for collections: `Users[]` (not `UserList` or `UserArray`)

**Constants:**
- Global constants: UPPER_SNAKE_CASE (e.g., `ROUTES`, `MAX_ATTEMPTS`)
- Export as const objects: lowercase keys with `as const` type assertion

## Where to Add New Code

**New Feature (Complete Flow):**
- Page route: `src/app/dashboard/[feature]/page.tsx`
- Layout (if needed): `src/app/dashboard/[feature]/layout.tsx`
- Components: `src/components/[feature]/`
- Server actions: `src/lib/actions/[feature].ts`
- Types: Add to `src/types/app.ts` or create `src/types/[feature].ts`
- Validation: Add schema to `src/lib/validations/index.ts`

**New Component:**
- Presentation-only: `src/components/[feature]/ComponentName.tsx`
- With data fetching: Split into server + client component
  - Server wrapper: `src/components/[feature]/ComponentName.tsx` (no `'use client'`)
  - Client logic: `src/components/[feature]/ComponentNameClient.tsx` (with `'use client'`)

**New Utility Function:**
- General: `src/lib/utils/[purpose].ts`
- Domain-specific: `src/lib/[domain]/helper.ts`
- Custom hook: `src/lib/hooks/use[Name].ts`

**New API Route:**
- Cron job: `src/app/api/cron/[name]/route.ts` (must verify CRON_SECRET)
- Webhook: `src/app/api/webhooks/[provider]/route.ts`
- AI integration: `src/app/api/ai/[endpoint]/route.ts`

**New Server Action:**
- File: `src/lib/actions/[domain].ts`
- Directive: Always include `'use server'` at top
- Pattern: Async function, Zod input validation, try-catch error handling, typed output
- Import: Used directly in server components or via form `action` prop

**Database Schema Change:**
- Create migration: `supabase/migrations/[version]_description.sql`
- Update types: Run `supabase gen types` (auto-generates `src/types/supabase.ts`)
- Update domain types: Add to `src/types/app.ts` if query pattern changes

## Special Directories

**`src/lib/demo/`:**
- Purpose: Demo mode (when no Supabase configured)
- Generated: No (static mock data)
- Committed: Yes
- Usage: Enables running app without backend; useful for preview builds

**`src/lib/dev/`:**
- Purpose: Development-only utilities
- Generated: No
- Committed: Yes
- Usage: Test data generation, impersonation, internal tools

**`src/app/admin/`:**
- Purpose: Admin panel for content management
- Generated: No
- Committed: Yes
- Access: Gated by role check in middleware

**`supabase/migrations/`:**
- Purpose: Database schema versioning
- Generated: No (written by hand)
- Committed: Yes (version control for schema)
- Pattern: Numbered sequentially (e.g., `001_initial_schema.sql`, `002_add_users_table.sql`)

**`.planning/codebase/`:**
- Purpose: GSD (Get Stuff Done) mapping documents
- Generated: Yes (by `/gsd:map-codebase` agent)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

---

*Structure analysis: 2026-03-19*

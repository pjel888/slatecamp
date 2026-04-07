<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# src

## Purpose

The `src/` directory contains all source code for SlateCamp — a high-performance, discipline-agnostic study engine for professional licensure exams. This directory is organized into layered domains: routing (app), UI components, business logic (lib), state management, types, and static data.

**Design Philosophy:** Next.js App Router with Server Components by default. Use arrow functions exclusively. State is managed via Zustand or React Context. All code follows the Slatecamp design system and adheres to the core constraints in `CLAUDE.md`.

## Key Files

| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout with font configuration, metadata, and global providers |
| `app/globals.css` | Tailwind CSS 4 configuration and global utility overrides |
| `app/page.tsx` | Home page (landing) |
| `app/error.tsx` | Global error boundary component |
| `app/not-found.tsx` | 404 page |
| `app/favicon.ico` | Site favicon |
| `lib/routes.ts` | Central route definitions and navigation helpers |
| `lib/readiness-score.ts` | IRT 2-parameter logistic mastery calculation core |
| `lib/rate-limit.ts` | Request rate limiting utilities |
| `lib/analytics.ts` | Client-side event tracking and analytics |
| `lib/analytics-server.ts` | Server-side analytics and telemetry |
| `lib/lab-analytics.ts` | 3D Lab-specific interaction and performance tracking |
| `lib/wiki-markdown.ts` | Wiki markdown parsing and rendering utilities |
| `config/site.ts` | Global site configuration and constants |

## Subdirectories

### app/ — Next.js App Router Pages

| Directory | Purpose |
|-----------|---------|
| `(auth)/` | Authentication group: login, signup, password reset |
| `about/` | Public about page |
| `admin/` | Admin panel: audit logs, question management, wiki editing, content reviews |
| `api/` | Serverless API routes: payments, webhooks, cron jobs |
| `auth/` | Auth-specific routes (callback, signout, profile) |
| `contact/` | Contact form page |
| `dashboard/` | Main authenticated user interface: quiz, 3D Lab, readiness, focus areas |
| `pricing/` | Pricing and subscription page |
| `tools/` | Utility tools: spaced repetition scheduler, IRT calculator, demo mode |
| `try/` | Trial/freemium experience |

**Key Files:**
- `layout.tsx` — Root layout configuration
- `page.tsx` — Homepage
- `error.tsx` — Error boundary for unhandled exceptions
- `not-found.tsx` — 404 handler
- `globals.css` — Global Tailwind CSS and style overrides

### components/ — React Components by Feature

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `dashboard/` | Dashboard cards, heatmaps, queues, catalyst sessions | 58 files |
| `ui/` | shadcn/ui components: buttons, modals, inputs, tabs, cards, etc. | 30+ files |
| `wiki/` | Wiki editor, viewer, search, markdown rendering | 44 files |
| `quiz/` | Quiz UI: question stem, confidence toggle, rationale drawer, timers | 15+ files |
| `3d/` | 3D geometry rendering components (Three.js, React Three Fiber) | 10+ files |
| `3d-lab/` | 3D Lab interface: module gallery, control panels, compliance violations | 8+ files |
| `notes/` | Note-taking UI: editor, organizer, markdown renderer | 8+ files |
| `auth/` | Auth UI: login form, signup form, social login buttons | 5+ files |
| `admin/` | Admin-only components: audit viewer, question importer, content manager | 6+ files |
| `analytics/` | Analytics dashboard and reporting components | 4+ files |
| `assessment/` | Assessment and progress reporting | 4+ files |
| `sidebar/` | Navigation sidebar and rail (mobile overlay pattern) | 5+ files |
| `layouts/` | Page layout wrappers (auth, dashboard, admin) | 4+ files |
| `shared/` | Reusable utilities: loaders, empty states, tooltips, modals | 6+ files |
| `motion/` | Framer Motion animation wrappers and effects | 3+ files |
| `tools/` | Standalone tool UIs | 3+ files |
| `developer/` | Dev-only debug and testing UI | 2+ files |
| `landing/` | Homepage and marketing components | 3+ files |
| `marketing/` | Marketing pages and promotional elements | 2+ files |
| `trails/` | Learning path and trail visualizations | 2+ files |
| `settings/` | User settings and preferences UI | 2+ files |
| `interactive-illustrations/` | SVG and canvas illustrations for learning | 2+ files |
| `graphics/` | Data visualization (charts, graphs) | 2+ files |
| `dev/` | Development-only components and helpers | 2+ files |

**Convention:** All components use arrow functions and are Server Components by default. Client-side interactivity marked with `'use client'`. No generic gamification (no confetti, badges, currency). Styling via Tailwind CSS 4 with Slatecamp design system tokens.

### lib/ — Business Logic and Utilities

| Directory | Purpose |
|-----------|---------|
| `actions/` | 116 server actions for mutations: quizzes, notes, admin, payments, wiki, analytics, mastery, quiz-v2, daily-dose, progress-reports |
| `supabase/` | Supabase client initialization and type definitions |
| `srs/` | Spaced Repetition System implementation (scheduling, intervals) |
| `ai/` | AI Contextual Tutor integration (Temperature 0.0, cite-verified responses) |
| `readiness/` | Readiness Score calculation, taxonomy heatmap logic |
| `blindspot/` | Focus Review mode orchestration and question selection |
| `proof-simulation/` | Full Exam Simulation mode logic and scoring |
| `outcomes/` | Learning outcomes tracking and mastery mapping |
| `audit/` | Audit logging and compliance tracking |
| `admin/` | Admin-only utilities: content management, user management |
| `analytics-server.ts` | Server-side event tracking |
| `analytics.ts` | Client-side event tracking |
| `lab-analytics.ts` | 3D Lab interaction telemetry |
| `readiness-score.ts` | **CORE:** IRT 2-parameter logistic model for mastery |
| `rate-limit.ts` | Request throttling and DOS protection |
| `wiki-markdown.ts` | Wiki content parsing and rendering |
| `routes.ts` | Route definitions and navigation helpers |
| `utils.ts` | General utility functions |
| `constants/` | Global constants, site config, feature flags |
| `context/` | React Context providers (auth, theme, user state) |
| `hooks/` | Reusable React hooks (note: some also in root hooks/) |
| `validations/` | Zod schemas and input validation |
| `dev/` | Development-only helpers and mock data |
| `demo/` | Demo/trial mode logic |
| `import/` | Question and content import utilities |
| `notes/` | Note-taking logic and storage |
| `payments/` | Payment processing and subscription logic |
| `payrex/` | PayRex integration (payment gateway) |
| `paywall/` | Paywall and subscription enforcement |
| `signals/` | Competence signal calculation (micro-signals) |
| `lemonsqueezy/` | LemonSqueezy integration (if applicable) |
| `workflow/` | Workflow and automation logic |
| `endurance/` | Extended Practice session orchestration |
| `__tests__/` | Business logic unit tests |

**Critical Files:**
- `lib/readiness-score.ts` — **DO NOT MODIFY WITHOUT TESTING.** Contains IRT theta calculation. All mastery decisions depend on this.
- `lib/supabase/` — Database client. Schema-dependent. Verify against `DATABASE_SCHEMA.sql`.
- `lib/actions/` — Server mutations. Always require proper authorization checks.

### hooks/ — React Hooks

| Directory | Purpose |
|-----------|---------|
| `quiz/` | Quiz-specific hooks: state, timing, confidence logic |
| `notes/` | Note-taking hooks: editor state, sync, validation |
| Root hooks | General-purpose hooks: auth, user data, theme, etc. |

**Files:**
- `useComplianceCheck.ts` — 3D Lab compliance rule validation
- `useGuidedSequence.ts` — Guided session orchestration
- `useLabTelemetry.ts` — 3D Lab event tracking

### stores/ — Zustand State Management

| File | Purpose |
|------|---------|
| `dev-store.ts` | Development and debug state |
| `useLabStore.ts` | 3D Lab module, camera, interaction state |

**Pattern:** State is co-located with components when possible. Zustand for global, complex state only. React Context for auth and theming.

### types/ — TypeScript Definitions

| File | Purpose |
|------|---------|
| `app.ts` | Core app types (User, Question, Session, Taxonomy, etc.) |
| `dashboard.ts` | Dashboard-specific types |
| `wiki.ts` | Wiki content types |
| `3d-lab.ts` | 3D Lab module and geometry types |
| `tools.ts` | Tool and utility types |
| `supabase.ts` | Database schema TypeScript mappings |
| `bun-test.d.ts` | Bun test framework type definitions |
| `payrex-node.d.ts` | PayRex Node.js SDK type definitions |

**Convention:** Keep types close to usage. Use discriminated unions for safety. Never use `any` without comment explaining why.

### config/ — Application Configuration

| File | Purpose |
|------|---------|
| `site.ts` | Site metadata, feature flags, environment config |

### features/ — Feature Modules (Vertical Slice Architecture)

| Directory | Purpose |
|-----------|---------|
| `wall-configurator/` | 7-step wall construction configurator with CHB, drywall, plaster, paint, tile engines. Self-contained: components/, engine/, hooks/, store/, types/, __tests__/ |

**Pattern:** Each feature is fully self-contained with its own components, business logic, state, and types. Use `@/` imports only for shared utilities.

### data/ — Static Data and Seeds

| File/Dir | Purpose |
|----------|---------|
| `mock-questions.json` | Mock question data for testing and demo |
| `seed/` | Database seed data |
| `seed/models_3d.json` | Pre-built 3D model configurations |
| `seed/questions.json` | Initial question bank |
| `seed/taxonomy.json` | Exam taxonomy and topic hierarchy |

## For AI Agents

### Working In This Directory

1. **Always verify against source of truth:**
   - Database schema: `DATABASE_SCHEMA.sql` (project root)
   - Core constraints: `CLAUDE.md` (project root)
   - Agent rules: `.claude/agents/` (project root)
   - Design system: Slatecamp tokens in `CLAUDE.md` Section 5

2. **Read before writing:**
   - Examine existing code in the feature area before creating new files
   - Follow established patterns (e.g., all dashboard cards follow a template)
   - Preserve consistency with voice and terminology (never say "pass," always use growth-framed language)

3. **Server Components by default:**
   - Mark interactive components with `'use client'` only when necessary
   - Fetch data in Server Components, pass to Client Components as props
   - Keep server actions in `lib/actions/` with proper auth checks

4. **State management hierarchy:**
   - Local component state: `useState()`
   - Multiple related components: React Context in `lib/context/`
   - Global app state (Lab, debug): Zustand in `stores/`

5. **Type safety:**
   - Import types from `types/` — never inline complex types
   - Use discriminated unions for safety (e.g., SessionMode: 'camp' | 'storm' | 'chill' | 'blindspot')
   - Verify type mappings against `supabase.ts` for database queries

### Testing Requirements

- **Unit tests:** Place alongside source in `__tests__/` subdirectories (e.g., `lib/__tests__/readiness-score.test.ts`)
- **Critical paths to test:** Readiness Score calculation, IRT model, payment webhooks, auth flows
- **Test runner:** Bun (default in project)
- **Coverage minimum:** 80% for business logic, 60% for UI
- **Mock data:** Use `data/mock-questions.json` and seed data for consistency

### Common Patterns

#### Adding a New Page

1. Create route in `app/[feature]/page.tsx`
2. Add layout wrapper if needed: `app/[feature]/layout.tsx`
3. Create feature components in `components/[feature]/`
4. Add server actions in `lib/actions/[feature].ts` if mutating data
5. Add types in `types/` if domain-specific
6. Update `lib/routes.ts` with route definition

#### Adding a New Quiz Mode

1. Define mode type in `types/app.ts` (e.g., `'newmode'`)
2. Create orchestration logic in `lib/[mode]/` (e.g., `lib/newmode/`)
3. Create UI components in `components/quiz/` and `components/dashboard/`
4. Add server actions for progress tracking
5. Wire IRT calculation if affecting mastery
6. Test readiness score impact (always use IRT)

#### Modifying the Design System

1. **Never hardcode colors.** Use Slatecamp tokens from `CLAUDE.md`
2. **Max transition:** 300ms, easing out by default
3. **Shadows:** `shadow-none` (rest), `shadow-sm` (hover), `shadow-lg` (modals only)
4. **Border radius:** `rounded-sm` (buttons), `rounded-md` (cards), `rounded-lg` (modals)
5. **Typography:** Minimum 11px. Monospace only for data values and Readiness Score number.
6. Test visually in dev server (use Chrome MCP, never use preview-specific tools)

#### Working with the 3D Lab

1. Module definitions in `app/dashboard/3d-lab/_config/modules/`
2. 3D components in `components/3d/` using React Three Fiber
3. Compliance checks in `hooks/useComplianceCheck.ts`
4. Telemetry in `lib/lab-analytics.ts`
5. State in `stores/useLabStore.ts`

#### Server Actions (Authentication Critical)

All server actions must:
1. Verify user authentication: `const user = await getCurrentUser()`
2. Check authorization: `if (user.role !== 'admin') throw new Error('Unauthorized')`
3. Validate input: Use Zod schema from `lib/validations/`
4. Return typed response: `{ success: boolean, data?: T, error?: string }`
5. Log audit trail if applicable: `await logAudit()`

#### AI Tutor Integration

- Temperature: 0.0 (deterministic, no hallucination)
- All responses must include citation badges linking to exact Wiki paragraphs
- Use question rationales (Misconception vs. Principle) to tailor responses
- Cite misconceptions first, then principles
- Never provide answers directly; guide understanding

## Dependencies

### Internal

- `@/app` — Next.js routing
- `@/components` — React components (all features)
- `@/lib` — Business logic, utilities, server actions
- `@/hooks` — React hooks (feature-specific and general)
- `@/stores` — Zustand state
- `@/types` — TypeScript definitions
- `@/config` — App configuration
- `@/data` — Static data and seeds
- `.claude/docs/` — PRDs and architecture blueprints (read before coding)
- `DATABASE_SCHEMA.sql` — Source of truth for schema

### External

**Framework & UI:**
- `next@16` — App Router, Server Components, image optimization
- `react@19` — Core rendering engine
- `tailwindcss@4` — Styling with Campfire design tokens
- `shadcn/ui` (@base-ui/react) — UI primitive components
- `framer-motion` — Animations (respect `prefers-reduced-motion`)

**Spatial Computing:**
- `react-three-fiber` (R3F) — React renderer for Three.js
- `three` — 3D graphics and geometry
- `@react-three/controls` — Camera controls

**State & Data:**
- `zustand` — Lightweight state management
- `@supabase/supabase-js` — PostgreSQL client and auth
- `zod` — Schema validation and parsing

**Auth & Payments:**
- `@supabase/auth-helpers-nextjs` — Next.js auth integration
- Payrex or LemonSqueezy — Payment processing

**Utilities:**
- `date-fns` — Date manipulation
- `clsx` — Conditional class names
- `sonner` — Toast notifications

**Development:**
- `bun` — Package manager and test runner
- TypeScript — Type safety
- ESLint — Code linting
- Prettier — Code formatting

## Architecture Notes

### Request Flow

1. User request → Next.js App Router
2. Server Component renders, fetches data from Supabase
3. Interactive zones marked with `'use client'`
4. Client-side state managed by Zustand or Context
5. User action → Server Action in `lib/actions/`
6. Server action validates, mutates database, returns result
7. UI updates optimistically or after confirmation

### Data Validation Layers

1. **Input validation:** Zod schemas in `lib/validations/`
2. **Business logic:** Server actions check rules (auth, domain constraints)
3. **Database constraints:** Supabase RLS policies and foreign keys
4. **Type safety:** TypeScript prevents runtime errors

### Mastery Calculation (IRT Core)

The Readiness Score uses a 2-parameter logistic (2PL) Item Response Theory model:

```
P(correct | theta) = 1 / (1 + exp(-a * (theta - b)))
```

Where:
- `theta` = student ability
- `a` = item discrimination
- `b` = item difficulty

Implementation: `lib/readiness-score.ts`
- Never modify without unit test coverage
- Always run tests: `bun test lib/readiness-score.test.ts`
- Verify against pedagogical team before releasing

### State Persistence & Auto-Save

- All testing sessions auto-save every 10 seconds
- Quiz progress saved after each question
- Notes synced to Supabase with debouncing
- Offline support via local storage (optional feature)

<!-- MANUAL: Keep this section for domain-specific notes and overrides -->


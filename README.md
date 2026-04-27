# SlateCamp

SlateCamp is a Next.js application for Philippine Architecture Licensure Exam (ALE) preparation. It combines adaptive quizzes, a taxonomy-linked wiki, interactive 3D learning modules, study trails, analytics, and admin content tooling into a single student-facing platform.

## Current Status

**Pre-launch MVP.** The repository has broad feature coverage but is actively hardened before launch. Documentation, performance, and operational governance are in active remediation. This is not a backwards-compatibility environment: the priority is launch quality, not legacy accommodation.

## Features

### Student-facing
- **Dashboard** — study hub with progress overview, heatmap, and quick actions
- **Adaptive Quiz Engine** — multiple test modes (Camp, Timed, Subject, Storm, Chill, Focus Review, Full Exam, Endurance), IRT-based difficulty, spaced-repetition integration, and session debrief
- **Wiki** — taxonomy-linked articles with embedded quizzes, code-compliance widgets (BP 344, PD 1096), and bookmarking
- **3D Lab** — interactive React Three Fiber modules for architectural concepts (classical orders, FAR playground, NBCP envelope, stairway geometry, and more)
- **Camp Trails** — structured multi-day study paths with quiz, wiki, lab, and review steps
- **Drills & Flashcards** — rapid-fire practice and SRS-driven card review
- **Notes** — rich-text note-taking linked to topics, questions, and articles
- **Analytics & Readiness Score** — performance dashboards, mastery tracking, and predicted readiness visualization
- **Score Reveal** — exam outcome simulation and shareable results
- **Calculators & Tools** — CHB, drywall, flooring, paint, floor tiles, and lot-plotter utilities

### Admin & Operations
- **Admin Portal** — content editor, question bank (design problems + scenarios), taxonomy management, pipeline, reviews, search, assets, 3D model management, and audit logs
- **Developer Portal** — internal architecture docs, API reference, DB status, console, logs, and test-data tools
- **CEO Portal** — financial entries, cash balance, gate milestones, team metrics, and analytics

### Automation
- **Daily Cron Jobs** — focus-review queue generation and user signal computation
- **Payment Webhooks** — PayRex and LemonSqueezy subscription lifecycle handling

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.3 (App Router) |
| UI Library | React 19.2.5 |
| Language | TypeScript 5.9.3 (strict mode off) |
| Styling | Tailwind CSS 4.2.4 |
| Components | shadcn/ui primitives, Radix UI, Framer Motion |
| Database | PostgreSQL 17 via Supabase |
| Auth | Supabase Auth (OAuth + email) with RLS |
| State | Zustand (client), Server Actions (server) |
| 3D / Viz | React Three Fiber 9.6.0, Three.js 0.183.2, Recharts |
| Payments | PayRex (primary Philippines gateway), LemonSqueezy |
| AI | OpenAI GPT-4o, Anthropic Claude (direct fetch) |
| Testing | Playwright 1.59.1 (e2e), Bun test runner (unit) |
| Storybook | 8.6.17 (Vite-based) |
| Package Manager | Bun 1.3.11+ |
| Deployment | Vercel (inferred from `vercel.json`, cron config, and `.gitignore`) |

## Repository Structure

```
.
├── src/
│   ├── app/              # App Router: pages, layouts, loading/error, route handlers
│   ├── components/       # UI components (wiki, quiz-v2, admin, dashboard, analytics, shared/ui, ...)
│   ├── features/         # Large feature modules: 3d-lab, wall-configurator
│   ├── lib/              # Server actions, queries, entitlements, payments, AI, SRS, PD1096 helpers
│   ├── hooks/            # Shared React hooks
│   ├── stores/           # Zustand client stores
│   ├── config/           # Runtime configuration
│   ├── data/             # Fixtures and static data
│   └── types/            # Shared TypeScript types
├── supabase/             # Migrations (92 files), seed/reset SQL, DB inspection scripts
├── scripts/              # Operational scripts (dev, type-check, Playwright runner, DB checks)
├── e2e/                  # Playwright end-to-end tests
├── .storybook/           # Storybook configuration
├── .ai/                  # Operational intelligence: audits, plans, state, agent docs
├── docs/                 # Root-level bridge docs
└── public/               # Static assets
```

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) 1.3.11 or newer
- Node.js-compatible environment (Next.js 16 requires a modern runtime)
- A `.env.local` with required variables (see below)

### Install

```bash
bun install
```

> Note: There have been reports of manifest resolution failures during `bun install` in some environments. If you encounter this, try `bun install --no-cache` or verify your Bun version.

### Environment Setup

Copy the variables you need from the list below into `.env.local` in the repository root. There is no committed `.env.example`.

### Start Development

```bash
bun run dev
```

This launches Next.js with Turbopack by default. To force Webpack:

```bash
bun run dev:webpack
```

The app runs at `http://localhost:3000` by default.

### Demo Mode

If `NEXT_PUBLIC_SUPABASE_URL` is empty and `NEXT_PUBLIC_ENABLE_DEMO_MODE` is set, the app runs with mock data and no external services. This is useful for local UI development without a live Supabase project.

## Environment Variables

### Required for local development

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (admin ops, scripts, webhooks) |

### Required for specific surfaces

| Variable | Purpose | Surfaces |
|----------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | App origin for redirects, checkout, metadata | `layout.tsx`, checkout, developer portal |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Feature flag for payments | `src/lib/constants/feature-flags.ts` |
| `PAYMENT_PROVIDER` | `payrex` (default) or `lemonsqueezy` | `src/lib/payments/provider.ts` |
| `PAYREX_SECRET_KEY` | PayRex API key | PayRex checkout |
| `PAYREX_WEBHOOK_SECRET` | PayRex webhook verification | `api/webhooks/payrex` |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy API key | LemonSqueezy checkout |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LemonSqueezy webhook verification | `api/webhooks/lemonsqueezy` |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Pro plan variant ID | LemonSqueezy config |
| `LEMONSQUEEZY_PRIME_VARIANT_ID` | Prime plan variant ID | LemonSqueezy config |
| `LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID` | Institutional plan variant ID | LemonSqueezy config |
| `OPENAI_API_KEY` | OpenAI API access | AI provider, content scripts |
| `ANTHROPIC_API_KEY` | Anthropic API access | AI provider, teach-back |
| `AI_PROVIDER` | `openai` (default) or `anthropic` | `src/lib/ai/provider.ts` |
| `CRON_SECRET` | Bearer token for cron route protection | `api/cron/*` |
| `ADMIN_EMAILS` | Comma-separated fallback admin emails | Role resolution |
| `OWNER_EMAILS` | Comma-separated fallback owner emails | Role resolution |

### Optional / Dev-only

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Enable mock-data demo mode |
| `DEV_FORCE_USER_ID` | **Risky.** Local dev user impersonation bypass |
| `DISABLE_DEV_FORCE_USER_ID` | Neutralize `DEV_FORCE_USER_ID` in test/CI environments |
| `DEV_FORCE_TIER` | Override subscription tier locally |
| `ALLOW_DEV_PORTAL_BYPASS` | Bypass developer portal entitlement checks locally |
| `PLAYWRIGHT_DEMO_EMAIL` | Demo auth email for Playwright |
| `PLAYWRIGHT_DEMO_ROLE` | Demo auth role for Playwright |
| `PLAYWRIGHT_DEMO_TIER` | Demo auth tier for Playwright |

### Present in `.env.local` but no code usage found

The following variables exist in local environment files but no implementing code was found in `src/` or `scripts/` as of this audit:

- `NEXT_PUBLIC_PAYREX_PUBLIC_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_MAX_PRICE_ID`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`

These may be planned, legacy, or used in external workflows not tracked in this repository.

## Available Scripts

| Script | What it runs |
|--------|--------------|
| `bun run dev` | Start dev server (Turbopack default) |
| `bun run dev:turbo` | Force Turbopack dev mode |
| `bun run dev:webpack` | Force Webpack dev mode |
| `bun run build` | Production build |
| `bun run start` | Start built app |
| `bun run lint` | ESLint (includes Storybook precheck) |
| `bun run lint:fix` | Auto-fix ESLint issues |
| `bun run type-check` | Clear stale types and run `tsc --noEmit` |
| `bun run test:e2e` | Playwright full suite (desktop + mobile Chromium) |
| `bun run test:e2e:smoke` | Fast Chromium-only smoke suite |
| `bun run test:e2e:prod` | Smoke tests against built app |
| `bun run test:e2e:auth-demo` | Demo-authenticated first-run flows |
| `bun run test:e2e:auth-demo:learning` | Seeded drills + wiki learning flows |
| `bun run test:e2e:auth-demo:restricted` | Restricted-role denial coverage |
| `bun run test:e2e:auth-demo:portals` | Admin, developer, CEO portal checks |
| `bun run test:e2e:auth-demo:3d-lab` | 3D Lab isolated browser checks |
| `bun run test:e2e:headed` | Playwright in headed mode |
| `bun run test:e2e:ui` | Playwright interactive UI mode |
| `bun run validate:release` | Full release gate: type-check → lint → entitlements → audit → build → all e2e suites |
| `bun run storybook` | Run Storybook locally |
| `bun run build-storybook` | Build static Storybook |
| `bun run check:storybook` | Storybook placeholder validation |
| `bun run check:entitlements` | Legacy entitlement usage audit |
| `bun run design:lint` | Validate `DESIGN.md` against Google Labs spec |
| `bun run db:seed` | Seed database via `scripts/seed.ts` |

> There is **no top-level `test` script** in `package.json`. Use the Playwright and Bun test commands above.

## Testing

### End-to-End
- **Framework:** Playwright 1.59.1
- **Config:** `playwright.config.ts`
- **Tests:** 9 spec files in `e2e/`
- **Modes:** smoke, prod, auth-demo (with sub-modes for learning, restricted, portals, 3D Lab)
- **Fixture:** `authenticatedDemoTest` in `e2e/support/authenticated-demo.ts` provides seeded demo-auth state
- **Run:** `bun run test:e2e:smoke` for a fast check; `bun run test:e2e` for full coverage

### Unit / Integration
- **Runner:** Bun native test runner (`bun:test`)
- **Files:** 69 `*.test.ts` files across `src/lib/`, `src/features/`, `src/components/`, and `src/app/`
- **Coverage areas:** readiness scoring, SRS algorithms, entitlements, quiz logic, admin actions, calculator math, 3D Lab store logic, wiki markdown, and webhook handlers
- **Run:** `bun test src/lib/...` (no aggregated test script; run files or directories individually)

### Storybook
- 106+ story files covering UI primitives, shared components, wiki blocks, quiz UI, 3D Lab, and design-system reference scenes
- `check:storybook` enforces that stories import real components and blocks placeholder scaffolds

### Known Limitations
- TypeScript strict mode is off (`strict: false` in `tsconfig.json`)
- Many ESLint React Hooks rules are disabled to prioritize velocity
- No top-level aggregated unit-test script exists

## Architecture Overview

SlateCamp is a Next.js App Router application with a server-first rendering philosophy, though a large portion of the UI is client-heavy (especially 3D Lab, quiz, and admin editors).

### Request Flow
1. `middleware.ts` injects `x-pathname` and calls Supabase session refresh
2. `src/lib/supabase/middleware.ts` handles legacy redirects, demo mode, and role-based gating for `/admin`, `/developer`, `/ceo`
3. Route/layout in `src/app/` composes Server and Client Components
4. Data mutations flow through Next.js Server Actions in `src/lib/actions/`
5. Data reads flow through Server Actions or `src/lib/queries/`
6. Supabase clients: browser (`client.ts`), server (`server.ts`), admin (`admin.ts`)

### Major Layers
- **App layer** — `src/app/`: 112 pages, 15 layouts, 92 loading states, 7 error boundaries, 12 route handlers
- **UI layer** — `src/components/`: 716 files across wiki, quiz-v2, admin, dashboard, analytics, shared/ui, r3f, etc.
- **Feature layer** — `src/features/`: 3D Lab (~500 files) and wall-configurator (~40 files)
- **Logic layer** — `src/lib/`: 156 server actions, 19 queries, entitlements, payments, AI, SRS, PD1096, lot-geometry, wiki logic
- **State layer** — Zustand stores for quiz, timer, notifications, and dev state

### Auth Flow
- Supabase Auth (OAuth + email/password)
- `profiles` table extends `auth.users` with `role`, `discipline_id`, `onboarding_completed_at`, etc.
- `user_roles` table supports multi-role resolution
- `user_subscriptions` table tracks tier (`free` / `pro` / `enterprise`) and status
- `user_capabilities` view joins users, roles, and subscriptions for entitlement checks
- Dev impersonation via `DEV_FORCE_USER_ID` (local only, neutralized by `DISABLE_DEV_FORCE_USER_ID` in CI)

### API Boundaries
- **Route handlers** (`src/app/api/*/route.ts`) for AI streaming, payments checkout, webhooks, cron jobs, and OG image generation
- **Server Actions** (`src/lib/actions/`) for most data mutations (quiz, admin, wiki, analytics, etc.)
- **Edge runtime** used in some route handlers; logging there is console-only (no Supabase persistence)

For deeper architecture detail, see [`.ai/architecture.md`](.ai/architecture.md).

## Documentation

- [`.ai/README.md`](.ai/README.md) — Index of all operational intelligence documents
- [`.ai/app-audit.md`](.ai/app-audit.md) — Current audit summary, stack, and feature inventory
- [`.ai/architecture.md`](.ai/architecture.md) — System architecture, directory structure, data flow
- [`.ai/features.md`](.ai/features.md) — Detailed feature catalogue with evidence
- [`.ai/developer-workflow.md`](.ai/developer-workflow.md) — Setup, scripts, testing, debugging
- [`.ai/environment.md`](.ai/environment.md) — Environment variable reference
- [`.ai/data-model.md`](.ai/data-model.md) — Database schema overview
- [`.ai/api-surface.md`](.ai/api-surface.md) — API routes, server actions, webhooks
- [`.ai/integrations.md`](.ai/integrations.md) — External services and libraries
- [`.ai/testing-and-quality.md`](.ai/testing-and-quality.md) — Test framework and coverage notes
- [`.ai/known-gaps.md`](.ai/known-gaps.md) — Incomplete areas, risks, and open questions

Legacy deep-reference docs live under `.ai/06_specs/deep/`.

## Deployment

Deployment target is **Vercel** (inferred from `vercel.json`, cron job definitions, and `.gitignore`). There is no Docker, Kubernetes, or other platform config in the repository.

- **Build:** `next build` (not static export)
- **Runtime:** Node.js serverless functions on Vercel
- **Cron jobs:** Defined in `vercel.json` (`/api/cron/focus-review-scan` at 16:00 UTC, `/api/cron/compute-signals` at 16:30 UTC)
- **CI:** GitHub Actions (`.github/workflows/storybook.yml`) runs `validate:release` on PR/push to `main`
- **Preview deployments:** Vercel auto-creates preview deployments for pull requests

There is no explicit production deploy script or release branch strategy documented in the repository.

## Contributing & Development Notes

### Code Style
- Use Bun for all package and script execution
- Follow the existing file organization: domain-grouped directories in `src/components/` and `src/lib/`
- Prefer Server Components by default; mark Client Components with `"use client"` only when needed
- Do not add `useEffect` for initial data fetching

### Documentation Discipline
- Update the nearest in-scope `AGENTS.md` when subtree structure or workflows change
- Keep `README.md`, `.ai/`, and `AGENTS.md` hierarchy aligned
- Date time-sensitive claims or omit them
- Do not silently delete historical docs; mark them superseded and point to replacements

### Validation Before Commit
- Run `bun run type-check` when source-behavior claims change
- Run `bun run lint` when workflow or style claims change
- Run `bun run design:lint` when design-system tokens change
- Verify every referenced file path and command against the live repo

### GitNexus
This repository is indexed by GitNexus. Before editing symbols, run impact analysis. Before committing, run change detection. See the root `AGENTS.md` for the full GitNexus contract.

## Known Gaps / Open Questions

- **No committed `.env.example`** — environment setup is inferred from code and local practice
- **Incomplete env contract** — some variables in `.env.local` have no implementing code (PostHog, Resend, Stripe, Google Cloud)
- **Documentation drift risk** — large surface area makes stale instructions an engineering risk
- **Client/server boundary drift** — 677 files use `"use client"`; some may be candidates for server migration
- **Build stability** — historical reports of `ENOENT: .next/required-server-files.json` during build
- **Bun install reliability** — manifest resolution failures have been reported in clean environments
- **RLS completeness** — `DATABASE_SCHEMA.sql` is the strongest snapshot but may lag behind the latest migrations

See [`.ai/known-gaps.md`](.ai/known-gaps.md) for the full register.

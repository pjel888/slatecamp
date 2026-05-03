# System Architecture

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `src/app/AGENTS.md`, `src/AGENTS.md`, `package.json`

---

## Overview

SlateCamp is a cognitive-first, personalized LEA (Architectural Licensure Examination) prep platform for the Philippine Licensure Examination for Architects. The system combines adaptive quiz flows, an expert-linked wiki, analytics, admin tooling, and interactive 3D learning modules under a shared Next.js codebase.

---

## Architecture Diagram

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                    Next.js 16.1.6                       │
                        │                     App Router                           │
                        ├──────────┬──────────┬──────────┬──────────────────────┤
                        │Dashboard │  Admin   │   CEO    │     Developer        │
                        │ /dashboard│  /admin  │   /ceo   │    /developer        │
                        └────┬─────┴────┬─────┴────┬─────┴──────────┬───────────┘
                             │          │          │                 │
              ┌──────────────┴──────────┴──────────┴─────────────────┴──────────┐
              │              Server Components (default)                          │
              │   ┌─────────────────────────────────────────────────────────┐   │
              │   │  src/lib/actions/ (116 server actions)                   │   │
              │   │  src/lib/queries/ (query modules)                        │   │
              │   │  src/lib/srs/ (IRT 2PL + SM-2 SRS)                     │   │
              │   └─────────────────────────────────────────────────────────┘   │
              └────────────────────────────┬────────────────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │         Supabase PostgreSQL          │
                        │         51 tables, 89+ RLS policies  │
                        └─────────────────────────────────────┘
```

---

## Portals

| Portal | Route | Pages | Purpose | Auth |
|--------|-------|-------|---------|------|
| Dashboard | `/dashboard` | 33 | Student-facing study experience | Supabase session |
| Admin | `/admin` | 27 | Content management, taxonomy, reviews | Admin role |
| CEO | `/ceo` | 4 | Business reporting, MRR/ARR, behavioral insights | `ceo` or `super_admin` role |
| Developer | `/developer` | 21 | Engineering docs, API reference, dev tools | Authenticated or `ALLOW_DEV_PORTAL_BYPASS` |

**Note:** CEO portal is nested under `src/app/(protected)/` route group — not a top-level segment.

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.2.2 |
| Database | Supabase (PostgreSQL) | — |
| SSR Auth | @supabase/ssr | 0.9.0 |
| DB Client | @supabase/supabase-js | 2.100.0 |
| Client State | Zustand | 5.0.12 |
| 3D Rendering | React Three Fiber | 9.5.0 |
| 3D Engine | Three.js | 0.183.2 |
| UI Primitives | @base-ui/react + shadcn | — |
| Icons | lucide-react + @phosphor-icons/react | — |
| Payments | LemonSqueezy + Payrex-node | 20.4.1 + 1.7.3 |
| Rich Text | @tiptap/* (13 extensions) | 3.20.4 |
| AI Tutor | @anthropic-ai/sdk | 0.78.0 |
| Animations | framer-motion | 12.38.0 |
| Charts | recharts | 3.8.0 |
| Validation | zod | 4.3.6 |
| Package Manager | Bun | — |

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router (137 pages across 4 portals)
│   ├── layout.tsx         # Root layout: fonts, theme, providers
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Tailwind v4 + Campfire design tokens
│   ├── (auth)/            # Auth route group (public)
│   ├── (protected)/        # Protected route group (CEO portal)
│   ├── dashboard/          # Student portal (33 pages)
│   ├── admin/             # Admin portal (27 pages)
│   ├── developer/          # Developer portal (21 pages)
│   ├── api/                # API routes (payments, webhooks, cron)
│   ├── quiz/               # Quiz routes
│   ├── calculators/         # Construction calculators
│   └── tools/              # Standalone utilities
├── components/             # React components
│   ├── ui/                 # shadcn/ui components (30+)
│   ├── dashboard/           # Dashboard components (58)
│   ├── wiki/               # Wiki editor/viewer (44)
│   ├── quiz/               # Quiz UI components (15+)
│   ├── 3d/                 # 3D geometry (10+)
│   ├── analytics/           # Analytics charts (4+)
│   └── ...
├── lib/                    # Business logic
│   ├── actions/             # 116 server actions
│   ├── queries/            # Query modules
│   ├── srs/                # IRT 2PL + SM-2 SRS
│   ├── supabase/            # Supabase client
│   ├── readiness-score.ts    # 6-vector readiness computation
│   └── ...
├── stores/                 # Zustand stores (5 stores)
├── types/                  # TypeScript definitions
└── hooks/                  # React hooks
```

---

## Key Architectural Patterns

### Server Components by Default
All components are Server Components unless they need interactivity. Client components marked with `'use client'`.

### Portal Shell Pattern
Each portal uses `PortalLayout` from `@/components/portal` with its own navigation, topbar color, and accent. Configurations centralized in `@/config/portals`.

### Data Flow
1. User request → Next.js App Router
2. Server Component fetches data from Supabase
3. Interactive zones use Client Components
4. User action → Server Action in `src/lib/actions/`
5. Server action validates, mutates database, returns result
6. UI updates optimistically or after confirmation

### Spaced Repetition System
- **IRT 2PL Model:** `P(θ) = 1 / (1 + exp(-a * (θ - b)))`
- **SM-2 Algorithm:** Standard spaced repetition with ease floor at 1.3
- **Readiness Score:** 6-vector composite computation in `src/lib/readiness-score.ts`

---

## Authentication & Authorization

| Portal | Auth Method | Role Check |
|--------|-----------|-----------|
| Dashboard | Supabase session (middleware) | Session required |
| Admin | Supabase session | `admin` role |
| CEO | Supabase session | `ceo` or `super_admin` role |
| Developer | Supabase session | Authenticated OR `ALLOW_DEV_PORTAL_BYPASS` env |

Session refresh handled in `middleware.ts` at root.

---

## Cron Jobs (Vercel)

| Job | Schedule | Purpose |
|-----|---------|---------|
| `focus-review-scan` | Daily 4pm UTC | Generate focus-review queues (3 weakest + grey nodes) |
| `compute-signals` | Daily 4:30pm UTC | Recalculate competence signals |

---

## Codebase Statistics

| Metric | Value |
|--------|-------|
| Total .tsx files | ~1044 |
| Pages (App Router) | 137 across 4 portals |
| Server action files | 116 |
| Zustand stores | 5 |
| React Contexts | 10 |
| Database tables | 51 (50 with RLS) |
| RLS policies | 89+ |
| Migrations | 60 |
| Production dependencies | 56 |
| Dev dependencies | 8 |

---

## Related Documents

- `02-architecture/002-portal-breakdown.md` — Portal-by-portal details
- `02-architecture/003-database-schema.md` — Database reference
- `02-architecture/004-api-reference.md` — Server actions and API routes
- `03-design/001-design-system.md` — Design tokens from globals.css

---

## Entitlement Architecture (2026-04-11 execution update)

Canonical entitlement flow:

`request/session -> resolveRole -> applyPolicy -> resolveEntitlements -> enforce route/action -> emit audit event`

Canonical boundary:
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/entitlements/resolve-entitlements.ts`
- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/entitlements/audit.ts`

Compatibility wrappers remain in `src/lib/admin/*`, `src/lib/paywall/check-access.ts`, and `src/lib/subscription/get-tier.ts` during migration.
After the finalization pass, the low-fanout wrappers `src/lib/admin/feature-flags.ts`, `src/lib/admin/get-admin-profile.ts`, `src/lib/paywall/check-access.ts`, `src/lib/subscription/get-tier.ts`, and `src/lib/actions/feature-flags.ts` were removed. The remaining compatibility surface is limited to admin-facing role/policy facades.

Governance:
- `scripts/check-entitlement-legacy-usage.ts`
- `bun run check:entitlements`

The detector currently exists to prevent new raw-tier, raw-role, and raw `target_tier` logic from being introduced outside the canonical entitlement boundary.



## 2026-04-29 audit note

This document may include historical product/reference language. Current codebase route truth for cron jobs is `/api/cron/focus-review-scan` and `/api/cron/compute-signals` from `src/app/api/cron/**/route.ts` and `vercel.json`.

# API Surface

**Last Updated:** 2026-04-27

This document catalogs the API routes, server actions, webhooks, and public interfaces in SlateCamp.

## API Route Handlers

Located in `src/app/api/*/route.ts` (or `route.tsx` for OG images).

### AI Routes

| Route | Method | Purpose | Auth | Notes |
|-------|--------|---------|------|-------|
| `/api/ai/embed` | POST | Generate text embeddings | Inferred session | Uses OpenAI `text-embedding-3-small` |
| `/api/ai/generate-questions` | POST | AI-generated quiz questions | Inferred session | |
| `/api/ai/socratic` | POST | Socratic dialogue tutor | Inferred session | |
| `/api/ai/study-agent` | POST | General study assistant | Inferred session | |
| `/api/ai/tutor` | POST | RAG-based tutor | Inferred session | `match_wiki_articles` RPC → generator → auditor double-pass |

### Payments

| Route | Method | Purpose | Auth | Notes |
|-------|--------|---------|------|-------|
| `/api/payments/checkout` | POST | Create checkout session | Inferred session | Switches provider via `PAYMENT_PROVIDER` env var |

### Webhooks

| Route | Method | Purpose | Auth | Notes |
|-------|--------|---------|------|-------|
| `/api/webhooks/lemonsqueezy` | POST | Subscription lifecycle | Signature verification | Checks `LEMONSQUEEZY_WEBHOOK_SECRET` |
| `/api/webhooks/payrex` | POST | Payment lifecycle | Signature verification | Checks `PAYREX_WEBHOOK_SECRET` |

Both webhooks:
- Verify signature
- Check idempotency against `processed_webhook_events`
- Update `user_subscriptions`
- Log billing events

### Cron Jobs

| Route | Method | Purpose | Auth | Schedule (UTC) |
|-------|--------|---------|------|----------------|
| `/api/cron/focus-review-scan` | GET | Scan weak nodes, create queues | `Bearer ${CRON_SECRET}` | Daily 16:00 |
| `/api/cron/compute-signals` | GET | Compute engagement signals | `Bearer ${CRON_SECRET}` | Daily 16:30 |

### Admin

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/admin/flags` | GET/POST | Feature flag management | Admin role |

### Auth

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/auth/callback` | GET | OAuth callback + UTM attribution + legacy redirects | OAuth flow |

### OG Images

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/og/score` | GET | Open Graph image for score sharing |

## Server Actions

Located in `src/lib/actions/` (156 files). Organized by domain.

### Major Domains

| Domain | Path | Count | Key Actions |
|--------|------|-------|-------------|
| Quiz v2 | `src/lib/actions/quiz-v2/` | ~27 | Session CRUD, answer submission, scoring, review |
| Admin | `src/lib/actions/admin/` | ~23 | Content CRUD, question management, taxonomy edits, pipeline |
| Analytics | `src/lib/actions/analytics/` | ~17 | Event ingestion, dashboard data, readiness computation |
| Mastery | `src/lib/actions/mastery/` | ~6 | Mastery updates, SRS scheduling |
| Wiki | `src/lib/actions/wiki/` | ~8 | Article CRUD, bookmarks, highlights, feedback |
| CEO | `src/lib/actions/ceo/` | ~4 | Financial entries, gate updates |
| Progress Report | `src/lib/actions/progress-report/` | ~4 | Report generation |
| Dev | `src/lib/actions/dev/` | ~3 | Developer utilities |
| Daily Dose | `src/lib/actions/daily-dose/` | ~3 | Daily content curation |
| AI | `src/lib/actions/ai/` | ~2 | AI-assisted content actions |
| Assessment | `src/lib/actions/assessment/` | ~2 | Diagnostic assessments |

### Key Cross-Cutting Actions

- **Teach-back evaluation:** `src/lib/actions/teach-back.ts` — calls Anthropic API directly
- **Entitlement resolution:** `src/lib/entitlements/` — not actions per se, but consumed by actions and components
- **Payment orchestration:** `src/lib/payments/provider.ts` — used by checkout route

## Queries

Located in `src/lib/queries/` (19 files).

| Domain | Path | Purpose |
|--------|------|---------|
| CEO Analytics | `src/lib/queries/ceo/analytics/` | Business metrics queries |
| Dashboard | `src/lib/queries/dashboard/` | Student dashboard data |
| Wiki | `src/lib/queries/wiki/` | Article and taxonomy retrieval |
| Admin | `src/lib/queries/admin/` | Admin panel data |

## Public Interfaces

### Supabase RPC Functions

| Function | Purpose |
|----------|---------|
| `match_wiki_articles(query_embedding, match_threshold, match_count)` | Vector similarity search for AI RAG |
| `get_article_with_node(slug)` | Single-roundtrip article + taxonomy resolver |
| `has_admin_role()` | RBAC check |
| `is_super_admin()` | Super-admin check |

### Feature Flags

- `api/admin/flags` — runtime toggles for features
- `NEXT_PUBLIC_PAYMENTS_ENABLED` — payment feature flag
- `NEXT_PUBLIC_ENABLE_DEMO_MODE` — demo mode flag

## Auth Requirements Summary

| Surface | Auth Required | Role Requirements |
|---------|---------------|-------------------|
| Public pages (`/`, `/about`, `/pricing`) | No | — |
| Auth pages (`/login`, `/register`) | No (redirects if authenticated) | — |
| Dashboard (`/dashboard/*`) | Yes | Any authenticated user |
| Quiz (`/quiz/*`) | Yes | Any authenticated user |
| Wiki (`/dashboard/wiki/*`) | Yes | Any authenticated user |
| Admin (`/admin/*`) | Yes | Admin role |
| Developer (`/developer/*`) | Yes | Developer entitlement |
| CEO (`/ceo/*`) | Yes | CEO/Owner role |
| API routes | Varies | Cron routes need `CRON_SECRET`; webhooks need signature |

## Evidence

- API routes: `src/app/api/`
- Server actions: `src/lib/actions/`
- Queries: `src/lib/queries/`
- Auth middleware: `src/lib/supabase/middleware.ts`
- Schema functions: `DATABASE_SCHEMA.sql`
- Webhook handlers: `src/app/api/webhooks/*/route.ts`
- Cron handlers: `src/app/api/cron/*/route.ts`

# System Overview

**Date:** 2026-04-05
**App:** SlateCamp

SlateCamp is a Next.js App Router application for professional licensure exam prep. The codebase is split across four product portals, uses Supabase for persistence/auth, and centers its pedagogy on IRT-based mastery with spaced repetition.

## Current Snapshot

- `src/app/` currently contains 117 `page.tsx` route entries.
- `src/lib/actions/` currently contains 118 TypeScript files, including tests and submodules.
- `src/stores/` currently contains 5 Zustand stores.
- `supabase/migrations/` currently contains 64 migration files.
- `DATABASE_SCHEMA.sql` currently contains 72 `CREATE TABLE` definitions.

## Product Portals

1. Dashboard: student-facing study experience under `/dashboard`
2. Admin: content and taxonomy operations under `/admin`
3. CEO: business reporting under `/ceo` via `src/app/(protected)/ceo`
4. Developer: internal documentation and tooling under `/developer`

## Pedagogical Engine

- IRT 2PL logic lives in [`src/lib/srs/irt.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/srs/irt.ts).
- SM-2 interval scheduling lives in [`src/lib/srs/sm2.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/srs/sm2.ts).
- SRS update orchestration lives in [`src/lib/srs/update.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/srs/update.ts).
- Readiness scoring lives in [`src/lib/readiness-score.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/readiness-score.ts).
- Active quiz session actions are organized under [`src/lib/actions/quiz-v2/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions/quiz-v2), not `src/lib/actions/testing.ts`.

## Request and Auth Flow

- Root [`middleware.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/middleware.ts) adds an `x-pathname` request header and delegates auth/session refresh to [`src/lib/supabase/middleware.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/supabase/middleware.ts).
- Development bypass behavior is implemented in the Supabase server/middleware helpers, not as a short-circuit inside the root middleware file.

# System Architecture Audit Plan

**Updated:** 2026-04-05

## Goal
Refresh the system-architecture audit so it accurately reflects the current Next.js routing model, state management setup, pedagogical engine, and Supabase-backed data layer.

## Tasks
- [x] T1: Architecture Discovery - Re-verify the four portal surfaces and their route locations in `src/app/`.
- [x] T2: Pedagogical Engine Audit - Reconfirm the active IRT/SM-2 implementation in `src/lib/srs/` and the current quiz/session action paths under `src/lib/actions/quiz-v2/`.
- [x] T3: State Management Audit - Recount the Zustand stores and document the current server/client split.
- [x] T4: Data Model Audit - Refresh the migration and schema facts from `supabase/migrations/` and `DATABASE_SCHEMA.sql`.
- [x] T5: Documentation - Rewrite the markdown files in [`.sisyphus/notepads/system-architecture/`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture) as current ground truth.

## Outcomes
- Refreshed [`system-overview.md`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture/system-overview.md).
- Refreshed [`routing-portals.md`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture/routing-portals.md).
- Refreshed [`state-management.md`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture/state-management.md).
- Refreshed [`data-model.md`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture/data-model.md).
- Refreshed [`pending-features.md`](C:/Users/Philip Lewis/Desktop/slatecamp/.sisyphus/notepads/system-architecture/pending-features.md) as a historical/deprecated backlog note instead of an active roadmap file.

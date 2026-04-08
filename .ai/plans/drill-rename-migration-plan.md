# Implementation Plan: Drills Terminology Alignment (DB & Code)

**Status:** 📝 Planned  
**Date:** 2026-04-08  
**Objective:** Align the underlying database schema and codebase with the user-facing "Drills" terminology to ensure consistency and maintainability.

## Phase 1: Database Migration
*Note: Use `mcp_supabase_apply_migration` for DDL changes.*

- [ ] Rename tables:
    - `quiz_sessions` -> `drill_sessions`
    - `session_questions` -> `drill_session_questions` (if it exists as a separate table, otherwise check `quiz_sessions.question_ids`)
- [ ] Update Foreign Key references in:
    - `user_interactions.session_id`
    - `session_trail_credits.session_id`
- [ ] Create view `quiz_sessions` pointing to `drill_sessions` for backward compatibility during rollout (Optional/Temporary).
- [ ] Update RLS policies to reflect new table names.

## Phase 2: Codebase Refactor
*Note: Perform surgical `replace` calls.*

- [ ] **Directory Renames:**
    - `src/lib/actions/quiz-v2` -> `src/lib/actions/drills`
    - `src/lib/quiz` -> `src/lib/drills`
- [ ] **Type & Interface Renames:**
    - `QuizMode` -> `DrillMode`
    - `QuizSession` -> `DrillSession`
    - `QuizAnswerState` -> `DrillAnswerState`
- [ ] **Hook & Store Renames:**
    - `useQuizStore` -> `useDrillStore`
- [ ] **API & Route Updates:**
    - Update all imports referencing renamed directories.
    - Update Supabase client calls to use new table names.

## Phase 3: Validation & Sync
- [ ] Run `bun run type-check` to catch broken references.
- [ ] Run `bun run lint`.
- [ ] Update `DATABASE_SCHEMA.sql` to reflect new names.
- [ ] Regenerate TypeScript types: `npx supabase gen types --linked > src/types/supabase.ts`.

## Phase 4: Rollback Strategy
- [ ] Prepare `supabase/migrations/rollback_drill_rename.sql`.
- [ ] Ensure `quiz_sessions` view exists if gradual rollout is required.

---
*This plan follows the 2026-04-08 Drills PRD mandate.*

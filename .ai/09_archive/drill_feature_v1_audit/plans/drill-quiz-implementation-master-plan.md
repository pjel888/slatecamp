# Drill / Quiz Implementation Master Plan

**Status:** Ready for Execution
**Version:** 1.0 (Post-Audit Consensus)
**Objective:** Settle all UX, architectural, and data integrity debt identified during the Drill Feature Audit to ensure a "Pro-Grade" pre-launch experience.

---

## 1. Phase 0: Absolute Unification (Structural Foundation)
*Goal: Eliminate the mapping layer and align the entire stack to canonical underscored keys.*

### 1.1 Database Normalization
- **Task**: Create a migration to rename `TEST_MODE` enum values and table/column names.
- **Actions**:
  - `ALTER TYPE test_mode RENAME VALUE 'blindspot' TO 'focus_review'`
  - `ALTER TYPE test_mode RENAME VALUE 'proof_sim' TO 'full_exam'`
  - `ALTER TYPE test_mode RENAME VALUE 'practice' TO 'subject'` (or ensure consistency)
  - `ALTER TABLE blindspot_queues RENAME TO focus_review_queues`
  - `ALTER TABLE quiz_sessions RENAME COLUMN is_proof_simulation TO is_full_exam`
  - `ALTER TABLE user_global_stats RENAME COLUMN proof_simulation_unlocked_at TO full_exam_unlocked_at`

### 1.2 Code Cleanup
- **Task**: Remove the `DB_TEST_MODE_BY_APP_MODE` mapping in `start-session.ts`.
- **Task**: Update all repository references from `blindspot` to `focus_review` in `src/lib/blindspot/` and related queries.
- **Task**: Standardize `article-review` (UI) to `article_review` across all layers.

---

## 2. Phase 1: Hardening & Performance (Reliability)
*Goal: Tighten data contracts and reduce perceived/actual latency.*

### 2.1 Schema Hardening (CAGE)
- **Task**: Define strict Zod schemas for `GestureSignalEvent` and `CAGEBindingToken` in `src/lib/actions/quiz-v2/schemas.ts`.
- **Task**: Replace `z.unknown()` in `submitAnswerInputSchema` with the new strict types.

### 2.2 Latency Reduction
- **Task**: Parallelize `endSession` writes. Wrap Readiness Score recompute and Theta writes in `Promise.allSettled` or `after()` hooks where safe.
- **Task**: Optimize `recomputeAndSaveReadinessScore` by batching taxonomy lookups.

---

## 3. Phase 2: UX Trust & Clarity (User Experience)
*Goal: Eradicate "Progress Blindness" and ensure feedback loops feel intentional, not laggy.*

### 3.1 Progress Visualization
- **Task**: Implement a multi-stage message cycle in `CalculatingResultsOverlay.tsx`.
  - Stages: "Syncing final interactions...", "Analyzing subject mastery...", "Computing Readiness Score...", "Curating recommendations..."
- **Task**: Update the `endSession` action to return current stage metadata if possible, or use time-based cycling in the UI.

### 3.2 State Feedback
- **Task**: Remove `hidden md:flex` from `SyncStatus` in `QuizHeader.tsx`.
- **Task**: Add a pulsing "Wait" state to the Next button in `FeedbackPanel.tsx` during the gated delay (3000ms+).

### 3.3 Error Surface
- **Task**: Implement a dedicated `not-found.tsx` for `/quiz/[mode]/session/[sessionId]` to handle invalid sessions gracefully.

---

## 4. Phase 3: Data Protection (Integrity)
*Goal: Enforce numeric boundaries at the database level.*

### 4.1 Check Constraints
- **Task**: Migration to add `CHECK` constraints (0.0 to 1.0) for:
  - `user_interactions.accuracy`
  - `user_node_mastery.current_mastery_weight`
  - `user_global_stats.global_readiness_score` (0-100)

---

## 5. Verification Strategy
1. **Static Analysis**: `bun run type-check` must pass after global renaming.
2. **Migration Smoke Test**: Verify existing sessions can still be ended post-renaming.
3. **UX Walkthrough**: Follow the [Runtime Validation Plan](./drill-quiz-runtime-validation-plan.md).

## 6. Sequence of Operations
1. **PR 1**: Absolute Unification (DB + Mapping removal).
2. **PR 2**: Schema Hardening + Parallelization.
3. **PR 3**: UX Hardening (Overlay + Header + Delay).
4. **PR 4**: Final Integrity Constraints.

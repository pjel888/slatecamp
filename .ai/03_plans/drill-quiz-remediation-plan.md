# Drill / Quiz Remediation Plan

## 1. Objective
Harden the functional correctness, reliability, and performance of the Drill / Quiz system, focusing on resolving latency bottlenecks and enforcing strict data contracts.

## 2. Linked Findings
- **Q-001**: Loose CAGE Schema
- **Q-004**: Results Race Condition / Latency
- **SCHEMA-001**: Mode Key Fragmentation

## 3. Implementation Sequence

### Phase 1: Performance & UX Feedback (Latency Reduction)
- **Task 1.1**: Background non-critical post-session work. Move `writeUserTheta` and `runPostSessionHooks` to `after()` callbacks or fire-and-forget background tasks if they are not already.
- **Task 1.2**: Optimize `recomputeAndSaveReadinessScore`. Cache taxonomy node lookups and parallelize tree traversal queries.
- **Task 1.3**: Implement "Syncing..." status indicator in `QuizHeader.tsx` for all devices.

### Phase 2: Schema Hardening (Behavioral Integrity)
- **Task 2.1**: Define strict Zod schemas for `GestureSignalEvent` and `CAGEBindingToken` in `src/lib/actions/quiz-v2/schemas.ts`.
- **Task 2.2**: Update `submitAnswerInputSchema` to reject malformed behavioral traces.
- **Task 2.3**: Update CAGE verification logic to handle the new strict types.

### Phase 3: Structural Debt (Unification)
- **Task 3.1**: Create a canonical `MODE_KEYS` constant and migrate UI, internal logic, and DB mapping to use it.
- **Task 3.2**: Add DB-level `CHECK` constraints to `accuracy` and `difficulty` columns via migration.

## 4. Risks
- Parallelizing DB writes might lead to deadlocks if not carefully sequenced.
- Tightening schemas might break older, un-migrated offline submissions (need migration strategy for `pendingSubmissions`).
- Mode renaming is a global change and could break deep-linked URLs if not handled with redirects.

# Drill / Quiz Network and Schema Alignment Plan

## 1. Objective
Unify the naming conventions for quiz modes, introduce database-level protections for score data, and tighten Zod validation for behavioral signal data.

## 2. Linked Findings
- **Q-001**: Loose CAGE Schema
- **Q-002**: Mode Key Inconsistency
- **Consistency Finding**: Missing DB constraints.

## 3. Implementation Sequence

### Phase 1: Naming Unification
- **Task 1.1**: Migrate `MODE_DEFINITIONS` and `MODE_PRESETS` to use a single set of keys (e.g., all underscored: `focus_review`, `article_review`).
- **Task 1.2**: Update `quiz_sessions` table check constraint to include the new canonical mode names.

### Phase 2: Schema Hardening (CAGE)
- **Task 2.1**: Define strict Zod schemas for `GestureSignalEvent` and `CAGEBindingToken` in `src/lib/actions/quiz-v2/schemas.ts`.
- **Task 2.2**: Replace `z.unknown()` with the new strict schemas in `submitAnswerInputSchema`.
- **Task 2.3**: Update `generateBindingToken.ts` and `verifyBindingToken.ts` to ensure type compatibility with the new schemas.

### Phase 3: Database Integrity
- **Task 3.1**: Create a migration adding `CHECK` constraints to `accuracy` (0.0-1.0), `global_readiness_score` (0-100), and `difficulty` (0.0-1.0) columns.
- **Task 3.2**: Enforce `NOT NULL` on critical columns in `user_interactions`.

## 4. Risks
- Renaming modes is a high-risk change that requires careful search-and-replace across the entire project.
- Strict CAGE validation may cause submission failures if the client-side data format drifts from the server schema.

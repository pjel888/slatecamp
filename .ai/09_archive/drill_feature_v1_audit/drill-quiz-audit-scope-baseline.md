# Drill / Quiz Audit Scope Baseline

**Timestamp:** 2026-04-18
**Status:** Frozen Baseline

## 1. Overview
This document defines the frozen scope for the full audit of the Drill / Quiz / Testing system in SlateCamp.

## 2. In-Scope Areas
The audit covers the end-to-end flow from session configuration to results and review.

### Routes & Surfaces
- `src/app/quiz`: Main entry point (redirects), layout, and loading.
- `src/app/quiz/[mode]/setup`: Session configuration and start.
- `src/app/quiz/[mode]/session/[sessionId]`: Active quiz interface.
- `src/app/quiz/[mode]/session/[sessionId]/results`: Score reveal and session summary.
- `src/app/quiz/[mode]/session/[sessionId]/review`: Question-by-question review.
- `src/app/dashboard/drills`: The Drills / Testing Hub.

### Components
- `src/components/testing/hub/*`: Hub and mode selection UI.
- `src/components/quiz-v2/*`: The unified quiz engine (Shells, Body, Options, Feedback, etc.).
- `src/components/quiz-v2/results/*`: Result visualization panels.
- `src/components/quiz-v2/review/*`: Review mode components.

### Logic & Actions
- `src/lib/actions/quiz-v2/*`: Session lifecycle (start, submit, end, review).
- `src/lib/quiz/*`: Question selection, routing, interleaving, and adaptive difficulty.
- `src/lib/srs/*`: Spaced repetition and SM-2 logic.
- `src/lib/irt/*`: Item Response Theory scoring.
- `src/lib/readiness/*`: Readiness score calculations.
- `src/lib/entitlements/*`: Tier-gating and access control.
- `src/lib/cage/*`: Behavioral signal capture and verification (CAGE).

### Data Layer
- `DATABASE_SCHEMA.sql`: Relevant tables (`quiz_sessions`, `user_interactions`, `user_question_states`, etc.).
- `supabase/migrations`: Relevant migrations for quiz tables and enums.

## 3. Excluded Areas
- **3D Lab Features**: Unless directly participating in a quiz mode (e.g., specific interactive questions).
- **Wiki Content**: Auditing the content of wiki articles is excluded; only the linkage and navigation from the quiz is in-scope.
- **Notes Feature**: Independent notes are excluded unless they interact with the quiz state.
- **Payment Processing**: Payment flows are excluded; only the *results* of entitlements (access vs no-access) are in-scope.

## 4. Anti-Recursion Statement
New docs created during this run do not expand the audit universe. This audit is restricted to the code and artifacts present at the start of the session.

## 5. Explicit Constraints
- No editing of product code.
- No mutation of production data.
- Audit, verification, and planning only.

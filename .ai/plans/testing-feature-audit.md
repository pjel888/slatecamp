# Comprehensive Audit: Testing & Quizzing Feature

**Date:** 2026-04-06  
**Status:** Audit Complete / Implementation Plan Pending  
**Core Objective:** Identify and eliminate performance bottlenecks in the quizzing session lifecycle, specifically targeting the "sluggish" feedback during immediate correctness reveals.

---

## Section 1: The Comprehensive Audit

### 1.1 Network & Data Flow Analysis (The "Path of a Question")

The lifecycle of a single question-answer interaction currently follows a high-latency sequential path:

| Stage | Action | Network / DB Operations | Latency Impact |
| :--- | :--- | :--- | :--- |
| **1. View** | `QuizShell` renders question | 0 (Local State) | Instant |
| **2. Submit** | `submitCurrentAnswer` called | 1 Server Action (`submitAnswer`) | Starts Round-trip |
| **3. Validate** | `submitAnswer` Action starts | `getUser()` + `createServiceClient()` | ~50ms (Supabase Auth) |
| **4. Fetch** | Lookup Session + Question | `SELECT` on `quiz_sessions` + `questions` | **~150ms** (Redundant DB IO) |
| **5. Insert** | Record Interaction | `UPSERT` on `user_interactions` | ~100ms (Critical Write) |
| **6. Stats** | Calculate Session Progress | RPC or `COUNT` on `user_interactions` | **~150ms** (Aggressive IO) |
| **7. Wiki** | Lookup Primary Wiki Article | `SELECT` on `wiki_article_taxonomy` | ~80ms (Redundant) |
| **8. Classify** | `classifyAndStoreError` | **RE-FETCH** `questions` + `COUNT` interactions | **~250ms** (Critical Redundancy) |
| **9. Mastery** | `runPostInteractionHooks` | 3-4 `UPDATE`/`INSERT` (SRS, Mastery) | **~300ms** (Sequential Await) |
| **10. Cache** | Revalidate Cache Tags | `revalidatePath` + `revalidateTag` | **~100ms** (Next.js Overhead) |
| **11. Feedback** | Action Returns | State update -> `status: 'feedback'` | **TOTAL: ~1.2s - 1.8s** |

### 1.2 Bottleneck Identification

1.  **Redundant Question Lookups:** The `questions` row is fetched at least **twice** per answer (once in `submitAnswer`, once in `classifyAndStoreError`).
2.  **Redundant Session Lookups:** The `quiz_sessions` row is fetched at every answer to verify status/config, even though the client already has the config.
3.  **Aggregated Interaction Counting:** `getSessionInteractionStats` counts all interactions for the session on every single answer. As the session grows (e.g., 200 questions), this query becomes increasingly expensive.
4.  **Sequential Awaiting of Non-UI Updates:** The user does **not** need the Mastery, SRS, or Behavioral analysis to be *saved* before they see if they were correct. These are currently blocking the response.
5.  **Global Cache Invalidation:** `revalidatePath('/dashboard')` is called on every answer. This purges the entire dashboard's data cache, causing subsequent dashboard visits to be slow and adding overhead to the current action.

### 1.3 Database Schema Analysis

*   **`quiz_sessions`:** Currently stores `question_ids` as an array. It does *not* store running stats (correct/answered counts).
*   **`user_interactions`:** High-traffic table. Every answer is a row. Counting this table for session stats is an $O(N)$ operation per answer.
*   **`questions`:** Read-only during quiz. Metadata (difficulty, topic_id) is fetched repeatedly.

---

## Section 2: The Implementation Plan

### Phase 1: Zero-Latency Data Passing (Short-term)
*   **Consolidate Fetching:** Refactor `submitAnswer` to pass the already-fetched `question` and `session` objects into all sub-actions (`classifyAndStoreError`, `runPostInteractionHooks`).
*   **Client-Side Metadata:** Update `SubmitAnswerInput` to include `topicId` and `difficulty`. The server will verify these against the `question_ids` array but can skip the full `questions` table `SELECT` if they match.

### Phase 2: Decoupled Mastery & SRS (Medium-term)
*   **Fire-and-Forget Updates:** Move `postInteractionPromise` and `revalidateDashboardCacheTags` out of the awaited block. Return the response to the user as soon as the interaction is recorded and the correctness is determined.
*   **Background Revalidation:** Only revalidate the dashboard cache every X questions or at the end of the session, rather than every single answer.

### Phase 3: The "Super-Interaction" RPC (Long-term)
*   **Postgres RPC `submit_quiz_answer_v2`:** Move the core logic into a single SQL function:
    1.  `INSERT` into `user_interactions`.
    2.  `UPDATE` the `quiz_sessions` row (increment `answered_count` and `correct_count` in a new `stats` column).
    3.  `SELECT` the `rationale` and `wiki_slug` in the same statement.
    4.  Return everything in one DB round-trip.

### Phase 4: Session State Optimization
*   **Running Totals:** Add `answered_count` and `correct_count` columns to `quiz_sessions`. Update these via triggers or the RPC. Stop querying `user_interactions` for session-level stats.

---

## Section 3: Execution Steps & Updates

### 3.1 Initialize Optimization
1.  **Refactor `classifyAndStoreError`** to accept optional `questionData` to avoid the extra fetch.
2.  **Refactor `submitAnswer`** to use `Promise.all` for *only* UI-blocking tasks (Correctness, Interaction Record, Error Classification).
3.  **Remove `await`** from `runPostInteractionHooks` and `revalidateDashboardCacheTags` in the happy path.

### 3.2 File Updates
*   `src/lib/actions/quiz-v2/submit-answer.ts`
*   `src/lib/actions/quiz-v2/classify-and-store-error.ts`
*   `src/lib/actions/mastery/post-interaction-hooks.ts`

---

## Terminal Commands for State Management

```bash
# Update Current Task
bun run ai:update-task "Optimizing Quizzing Feature Performance" --status "active"

# Export Audit
# (Already handled by write_file to .ai/plans/testing-feature-audit.md)
```

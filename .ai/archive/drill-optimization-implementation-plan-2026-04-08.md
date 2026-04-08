# Drill Feature: Performance Optimization & Bug Resolution Implementation Plan

## 00. Plan Metadata

- **Date:** 2026-04-08
- **Version:** 1.0.0
- **Author:** Codebase AI (Claude Code with Supabase MCP)
- **Source Spec:** `.ai/docs/01-product/002-drill-feature-specification.md`
- **Scope:** Audit, diagnosis, and phased implementation plan for the drill feature. Covers P0 bug resolution, DB schema corrections, server action optimization, client-side performance, type safety, and reliability gaps.

**Executive Summary:** The results-screen loading bug is caused by a race condition in `useQuizShellHandlers.ts:handleNext()` where the user taps Next on the last question's feedback before the `submitCurrentAnswer` server action returns, leaving `calculatingResults: true` and `endSession` never called. Additionally, the `session_status` DB enum is missing `auto_submitted` and `paused` values, and `endSession` in the store never clears `ui.calculatingResults`. Total issues found: 3 P0 bugs, 4 DB issues, 6 server action optimizations, 5 client performance issues, 5 type safety fixes, 3 reliability gaps. Estimated implementation complexity: Medium.

---

## 01. State Audit Summary

| File | Status | Notes |
|------|--------|-------|
| `.ai/state/current-task.md` | Read | Previous task (Drills PRD) is COMPLETE. No conflict. |
| `.ai/state/memory.md` | Read | Contains verified codebase facts. No drill optimization work in progress. |
| `.ai/docs/01-product/002-drill-feature-specification.md` | Read (full) | All 17 sections reviewed. Key flags in section 17 (Open Decisions) cross-referenced. |
| `.ai/plans/` | Listed | Empty directory. No prior optimization plans exist. |

**Decision:** GO — no conflicting tasks.

---

## 02. P0 Bug: Results Screen Loading — Root Cause & Fix

### Root Cause 1: Race Condition in `handleNext` (PRIMARY)

**File:** `src/hooks/useQuizShellHandlers.ts:49-82`

**Mechanism:** When the user submits the last answer in an immediate-feedback mode, the flow is:

1. `submitCurrentAnswer` fires server action → store `status` becomes `'submitting'`
2. Server action calls `endSessionAction` inside `submitAnswer` (submit-answer.ts:374) — this is SLOW (readiness recomputation, subject breakdown, recommendations)
3. Server returns → store sets `status: 'feedback'` and `results: finalResult` (useQuizStore.ts:476-480)
4. User sees feedback panel and taps Next **before** step 3 completes

**At step 4, `handleNext` executes (useQuizShellHandlers.ts:57-68):**

```typescript
if (feedback.visible) {              // true
  if (isLast) {                      // true
    if (answeredCount < totalQuestions) {  // false — all answered
      state.showSubmitModal()
    } else {
      useQuizStore.setState(s => ({ ui: { ...s.ui, calculatingResults: true } }))  // overlay shows
      if (results) endSession(results)  // results is NULL — server hasn't returned yet!
    }
  }
  hideFeedback()                     // hides feedback
  if (isLast) return                 // exits function
}
```

**Result:** `calculatingResults` is `true` (overlay visible), `endSession` was never called, `status` stays at `'active'` (from `hideFeedback`). When the server eventually returns and sets `results`, nothing re-triggers `endSession`.

**The navigation effect in StandardQuizShell.tsx:162-164 never fires:**
```typescript
if (status === 'results' && results) {  // status is never 'results'
  stopTimer()
  router.push(`/quiz/${config.mode}/session/${sessionId}/results`)
}
```

**User is permanently stuck on the calculating results overlay.**

### Root Cause 2: `endSession` Store Action Never Clears `calculatingResults`

**File:** `src/stores/useQuizStore.ts:585-588`

```typescript
endSession: (result) => set({
  status: 'results',
  results: result,
  // ui.calculatingResults is NOT cleared here
})
```

Even when `endSession` IS called successfully, `calculatingResults` remains `true`. The overlay in `BaseQuizShell.tsx:260` renders unconditionally when `calculatingResults` is true:
```typescript
{calculatingResults && <CalculatingResultsOverlay />}
```

This means the overlay shows OVER the results page during the `router.push` navigation delay, but since navigation happens, this is cosmetic. However, combined with Root Cause 1, it creates a permanent stuck state.

### Root Cause 3: `session_status` Enum Missing Values

**File:** Database enum `session_status`
**Evidence (Supabase MCP):** Enum values are: `in_progress`, `completed`, `abandoned` — ONLY 3 values.

The code references `auto_submitted` (end-session.ts:359) and `paused` (spec section 17). If `endReason: 'auto_submitted'` is ever passed, the DB update at end-session.ts:417-425 would fail with a Postgres enum violation, throwing an error that propagates to the client and prevents results from rendering.

**Current codebase mitigations:** `auto_submitted` is defined in the Zod schema but never actually sent by current UI code (handleSubmitAll sends `'completed'`, timer expiry sends `'timer_expired'` which maps to `'completed'`). However, this is a latent P0 — any future code path using `auto_submitted` would trigger the bug.

### Proposed Fixes

#### Fix 2A: Resolve Race Condition (P0 — Deploy Immediately)

**File:** `src/stores/useQuizStore.ts` — `submitCurrentAnswer` handler (around line 456-484)

**Change:** When the server action returns with `sessionComplete` and `config.feedback.timing === 'immediate'`, check if `ui.calculatingResults` is already `true`. If so, skip setting `status: 'feedback'` and directly call `endSession`:

```typescript
if (result.sessionComplete) {
  const finalResult = result.finalResult ?? { /* fallback */ }

  if (config?.feedback.timing === 'immediate') {
    // Check if user already tapped Next (overlay is showing)
    if (get().ui.calculatingResults) {
      // User already dismissed feedback and is waiting for results
      get().endSession(finalResult)
    } else {
      set({
        status: 'feedback',
        results: finalResult,
      })
    }
  } else {
    set({ status: 'finalizing' })
    get().endSession(finalResult)
  }
}
```

#### Fix 2B: Clear `calculatingResults` in `endSession` (P0)

**File:** `src/stores/useQuizStore.ts:585-588`

**Change:**
```typescript
endSession: (result) => set((state) => ({
  status: 'results',
  results: result,
  ui: { ...state.ui, calculatingResults: false },
})),
```

#### Fix 2C: Add `session_status` Enum Values (P0)

**Migration SQL:**
```sql
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'auto_submitted';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'configuring';
```

#### Fix 2D: Safety Net — `useEffect` Watcher (P1)

**File:** `src/components/quiz-v2/StandardQuizShell.tsx` (new effect after line 166)

Add a safety-net effect that detects the stuck state and recovers:

```typescript
useEffect(() => {
  if (ui.calculatingResults && results && status !== 'results') {
    // Race condition recovery: results arrived while overlay was showing
    endSession(results)
  }
}, [ui.calculatingResults, results, status, endSession])
```

### Regression Test

1. Start a Camp mode drill (10 questions, immediate feedback)
2. Answer all 10 questions
3. On question 10's feedback panel, tap Next **immediately** (before server processes)
4. Verify: results page renders within 5 seconds
5. Repeat with simulated slow network (3G throttle in DevTools)
6. Verify no permanent loading state occurs

### Estimated Fix Complexity: Low
### Estimated Fix Time: 2 hours

---

## 03. Database Optimization Plan

### DB-01: Missing `session_status` Enum Values (P0)

- **Type:** Enum Mismatch
- **Table:** `quiz_sessions.status`
- **Evidence (Supabase MCP):** Enum `session_status` has only: `in_progress`, `completed`, `abandoned`. Code references `auto_submitted` (end-session.ts:359), `paused` (spec section 3), `configuring` (spec section 3).
- **Fix:**
```sql
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'auto_submitted';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'paused';
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'configuring';
```
- **Impact:** Prevents potential DB write failures when these status values are used.
- **Risk:** Low — `ADD VALUE IF NOT EXISTS` is safe for production.
- **Priority:** P0

### DB-02: Duplicate Unique Indexes on `user_interactions` (P1)

- **Type:** Index Redundancy
- **Table:** `user_interactions`
- **Evidence (Supabase MCP):** Three identical unique indexes on `(user_id, session_id, question_id)`:
  - `idx_user_interactions_unique`
  - `uq_user_session_question`
  - `user_interactions_upsert_idx`
- **Fix:**
```sql
DROP INDEX IF EXISTS uq_user_session_question;
DROP INDEX IF EXISTS user_interactions_upsert_idx;
-- Keep idx_user_interactions_unique as the canonical one
```
- **Impact:** Reduces write overhead by ~2x on every answer submission (3 indexes maintained instead of 1).
- **Risk:** Low — verify upsert `onConflict` clause references the correct constraint name.
- **Priority:** P1

### DB-03: Duplicate Indexes on `quiz_sessions` (P1)

- **Type:** Index Redundancy
- **Table:** `quiz_sessions`
- **Evidence (Supabase MCP):** Two identical indexes on `(user_id, status)`:
  - `idx_quiz_sessions_user_id_status`
  - `idx_quiz_sessions_user_status`
- **Fix:**
```sql
DROP INDEX IF EXISTS idx_quiz_sessions_user_status;
-- Keep idx_quiz_sessions_user_id_status
```
- **Impact:** Minor write overhead reduction.
- **Risk:** Low
- **Priority:** P1

### DB-04: Duplicate RLS Policies (P2)

- **Type:** Policy Redundancy
- **Tables:** `quiz_sessions`, `user_global_stats`, `user_interactions`
- **Evidence (Supabase MCP):** Each table has duplicate policies — one for `public` role and one for `authenticated` role, with identical logic. Example: `quiz_sessions` has both "Users can read own quiz sessions" (public) and "quiz_sessions_select" (authenticated).
- **Fix:** Drop the `public` role policies (keep `authenticated` — more restrictive and correct):
```sql
DROP POLICY IF EXISTS "Users can read own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update own quiz sessions" ON quiz_sessions;
-- Repeat pattern for user_global_stats and user_interactions
```
- **Impact:** Cleaner policy set. No functional change — authenticated users match both policies.
- **Risk:** Medium — verify no anonymous access is needed for these tables.
- **Priority:** P2

### DB-05: Missing Composite Index on `user_interactions` for `get-review-data` (P1)

- **Type:** Missing Index
- **Table:** `user_interactions`
- **Evidence:** `get-review-data.ts:27-34` queries with `.eq('session_id', sessionId).eq('user_id', user.id)`. The existing `idx_user_interactions_user_id_session` covers `(user_id, session_id)` which is correct. However, the Pro history query at line 198-200 queries `.eq('user_id', user.id).in('question_id', batch)` — this uses `idx_user_interactions_user_id` (single column) which is less efficient.
- **Fix:**
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_question
ON user_interactions (user_id, question_id);
```
- **Impact:** Faster question history lookups for Pro users in review mode.
- **Risk:** Low
- **Priority:** P1

### DB-06: `session_questions` Table Has 0 Rows (P2 — Investigation)

- **Type:** Schema Gap
- **Table:** `session_questions`
- **Evidence (Supabase MCP):** `estimated_rows: 0`. The table exists with proper indexes but is never populated.
- **Note:** `start-session.ts` stores question IDs in `quiz_sessions.question_ids` (UUID array) instead of using `session_questions`. The `session_questions` table appears to be a legacy/unused table. No fix needed — document for future cleanup.
- **Priority:** P2

---

## 04. Server Action Optimization Plan

### `endSession` (end-session.ts) — HIGHEST PRIORITY

- **Current estimated p50:** 2000-4000ms (sequential readiness recompute + subject breakdown + recommendations)
- **Target p50:** < 1000ms
- **Target p95:** < 2000ms

**Issues Found:**

1. **Sequential readiness score queries (lines 363-378):** Three sequential DB calls: fetch pre-score → `recomputeAndSaveReadinessScore()` → fetch post-score. The recompute function is potentially heavy (6-vector computation at `src/lib/readiness-score.ts`).

2. **Sequential topic name fetch (lines 381-392):** Fetches topic name for notification BEFORE the session update — this is on the critical path but only needed for background notifications.

3. **`buildEndSessionResult` runs synchronously after session update** but `buildSubjectBreakdown` (line 67-129) does a DB query for taxonomy nodes, and `buildTrailProgress` (lines 131-195) does up to 3 sequential DB queries for trail_steps.

**Proposed Optimizations:**

| Change | File:Line | Description | Expected Improvement |
|--------|-----------|-------------|---------------------|
| Parallelize pre-score + session fetch | end-session.ts:362-368 | `Promise.all([getPreStats, getOwnedSession])` — already sequential | -200ms |
| Move notification topic fetch to background | end-session.ts:381-399 | Wrap in `after()` or fire-and-forget — not needed for results | -100ms |
| Move `recomputeAndSaveReadinessScore` to background | end-session.ts:369 | Use `after()` — readiness update can happen after results are shown, use pre-score as estimate | -500-1000ms |
| Return early with cached finalization | end-session.ts:330-353 | Already implemented for terminal sessions — ensure this path is hit on re-fetches | Already done |

**Priority:** P0 (directly reduces the window for the race condition in Root Cause 1)

### `submitAnswer` (submit-answer.ts) — WELL OPTIMIZED

- **Current estimated p50:** 300-500ms
- **Target p50:** < 400ms

**Issues Found:**

1. **Lines 372-377: Inline `endSessionAction` call** — When `sessionComplete` is true, `submitAnswer` calls `endSessionAction` synchronously. This doubles the response time for the final answer submission because `endSessionAction` is slow (see above). This is the primary contributor to the race condition window.

**Proposed Optimization:**

| Change | File:Line | Description | Expected Improvement |
|--------|-----------|-------------|---------------------|
| Defer `endSessionAction` to client | submit-answer.ts:372-377 | Return `sessionComplete: true` with a minimal result, let the client call `endSession` separately via the shell handler. This unblocks the UI feedback immediately. | -1000-3000ms on last answer |

**Priority:** P0 (reduces race condition window from seconds to near-zero)

**Alternative approach:** Keep the inline call but move `recomputeAndSaveReadinessScore` to `after()` inside `endSession`, which cuts endSession latency by ~50%.

### `getReviewData` (get-review-data.ts) — NEEDS OPTIMIZATION

- **Current estimated p50:** 800-2000ms (especially for fullexam 200Q)
- **Target p50:** < 500ms
- **Target p95:** < 1500ms

**Issues Found:**

1. **Sequential batch loops (lines 60-71, 79-101, 196-219):** Three `for` loops with `await` inside — questions in chunks of 80, taxonomy+wiki in chunks of 80, history in chunks of 80. For a 200-question fullexam: 3 + 3 + 3 = 9 sequential DB round-trips minimum.

2. **Taxonomy and wiki fetched in same loop but independently (lines 82-101):** `taxonomy_tree` and `wiki_article_taxonomy` queries are independent but awaited sequentially within the same batch.

**Proposed Optimizations:**

| Change | File:Line | Description | Expected Improvement |
|--------|-----------|-------------|---------------------|
| Parallelize taxonomy + wiki within each batch | get-review-data.ts:82-101 | `Promise.all([taxonomyQuery, wikiQuery])` per batch | -100ms per batch |
| Parallelize all question batches | get-review-data.ts:60-71 | `Promise.all(batches.map(batch => fetchBatch(batch)))` instead of sequential loop | -200ms for 200Q |
| Parallelize sessions + interactions fetch | get-review-data.ts:17-37 | Already sequential — `Promise.all([sessionFetch, interactionsFetch])` | -50ms |
| Skip history for non-Pro users earlier | get-review-data.ts:181-221 | Move Pro check before question fetch to avoid subscription query on critical path | Minor |

**Priority:** P1

### `startSession` (start-session.ts) — ACCEPTABLE

- **Current estimated p50:** 500-800ms
- **Target p50:** < 600ms

**Issues Found:**

1. **Sequential discipline-to-topic resolution (lines 148-158):** If no topics selected, fetches leaf nodes from taxonomy_tree. This is fast with the existing `idx_taxonomy_active_leaves` index.

2. **CAGE nonce issuance (lines 233-237):** `issueSessionSecurity` is called after session creation. Could be parallelized with the session insert since it only needs the session ID which is returned by the insert.

**Status:** Acceptable performance. No P0/P1 changes needed.

**Priority:** P2

---

## 05. Client-Side Performance Optimization Plan

### CS-01: `CalculatingResultsOverlay` Never Dismissed (P0)

- **File:** `src/components/quiz-v2/BaseQuizShell.tsx:260`
- **Issue:** `{calculatingResults && <CalculatingResultsOverlay />}` renders unconditionally. The `calculatingResults` flag is never cleared by `endSession`.
- **Fix:** Covered in Fix 2B (clear `calculatingResults` in `endSession` store action).
- **Priority:** P0

### CS-02: Background Question Pre-Fetching is Sequential (P1)

- **File:** `src/components/quiz-v2/StandardQuizShell.tsx:133-148`
- **Issue:** Background question pre-fetching uses a sequential `for` loop with `await` inside. For fullexam (200Q, initial batch of ~50), this means 3 sequential fetches of 50 questions each.
- **Fix:** Parallelize batches:
```typescript
const batches = []
for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) {
  batches.push(getSessionQuestions({
    sessionId,
    offset: questions.length + i,
    limit: Math.min(BATCH_SIZE, remainingIds.length - i),
  }))
}
const results = await Promise.all(batches)
results.forEach(batchData => addQuestions(batchData))
```
- **Expected improvement:** 2-3x faster question pre-loading for fullexam sessions.
- **Priority:** P1

### CS-03: Results Page Server Component Has Sequential Queries (P1)

- **File:** `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx`
- **Issue:** 8+ sequential `await` calls:
  1. `getUser()` (line 21)
  2. Session fetch (line 24-29)
  3. Interactions fetch (line 60-66)
  4. Global stats fetch (line 74-78)
  5. Prior snapshot fetch (line 83-90)
  6. `getReviewData()` (line 119-124)
  7. `getConfidenceMatrix()` (line 129-134)
  8. Prediction fetch (line 142-154)
  9. `generateRecommendations()` (line 159-163)
- **Fix:** Group independent queries with `Promise.all`:
```typescript
const [interactions, globalStats, priorSnapshot] = await Promise.all([
  supabase.from('user_interactions').select(...).eq('session_id', sessionId).eq('user_id', user.id),
  supabase.from('user_global_stats').select(...).eq('user_id', user.id).single(),
  supabase.from('readiness_score_snapshots').select(...).eq('user_id', user.id)...,
])

// Then in parallel:
const [reviewData, confidenceMatrix, prediction, recommendations] = await Promise.all([
  getReviewData(sessionId).catch(() => null),
  config.mode !== 'chill' ? getConfidenceMatrix(sessionId).catch(() => null) : null,
  shouldShowPrediction(quizMode) ? fetchPrediction() : null,
  generateRecommendations(user.id, sessionId, 3).catch(() => []),
])
```
- **Expected improvement:** 40-60% faster results page load (from ~2000ms to ~800ms).
- **Priority:** P1

### CS-04: Zustand Store `endSession` Causes Full Re-render (P2)

- **File:** `src/stores/useQuizStore.ts:585-588`
- **Issue:** `endSession` sets `status` and `results` in a single `set()` call, which is correct. However, components that subscribe to `ui.calculatingResults` will not re-render when it changes (since it's not part of the `set` call). After Fix 2B adds `ui` to the `set`, verify that Zustand's shallow comparison correctly detects the nested `ui` object change.
- **Fix:** Ensure selectors use targeted subscriptions: `useQuizStore(s => s.ui.calculatingResults)` instead of `useQuizStore(s => s.ui)`.
- **Priority:** P2

### CS-05: Dynamic Import of `ResultsDashboard` on Results Page (P2)

- **File:** `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx:166`
- **Issue:** `const ResultsDashboard = (await import('@/components/quiz-v2/results/ResultsDashboard')).default` — dynamic import on a server component. Since this is a server component, the dynamic import adds a small overhead but no bundle impact. Consider converting to a static import.
- **Fix:** Replace with static import at top of file.
- **Priority:** P2

---

## 06. Type Safety & Silent Failure Fixes

### TS-01: `session.status as any` (P0 — Bug Contributing)

- **File:** `src/lib/actions/quiz-v2/end-session.ts:331`
- **Current:** `if (isTerminalSessionStatus(session.status as any))`
- **Risk:** HIGH — the `as any` bypasses the type check that would catch the enum mismatch. If `session.status` is a value not in the TypeScript type (e.g., from a DB enum that was updated independently), this cast prevents compile-time detection. After Fix 2C adds the missing enum values, this cast should be removed.
- **Fix:** After adding DB enum values, update the `SessionRow` interface to use the proper `SessionStatus` type:
```typescript
interface SessionRow {
  // ...
  status: 'in_progress' | 'completed' | 'abandoned' | 'auto_submitted' | 'paused' | 'configuring'
  // ...
}
```
Then remove the `as any`: `if (isTerminalSessionStatus(session.status))`
- **Priority:** P0 (after DB enum fix)

### TS-02: `data as any[]` in `getReviewData` (P1)

- **File:** `src/lib/actions/quiz-v2/get-review-data.ts:70,116`
- **Current:** `if (data) allQuestions.push(...(data as any[]))` and `(allQuestions as any[]).map(...)`
- **Risk:** Low — the data shape is consistent from Supabase, but the cast prevents catching schema drift.
- **Fix:** Define a proper `QuestionReviewRow` type matching the `.select()` columns and cast to that:
```typescript
type QuestionReviewRow = {
  question_id: string
  text: string
  options: Array<{ id: string; letter: string; text: string }>
  correct_option_id: string
  rationale: string | null
  prompt_image_url: string | null
  topic_id: string
  difficulty: number
}
// Then: allQuestions.push(...(data as QuestionReviewRow[]))
```
- **Priority:** P1

### TS-03: `rationaleFromDb as any` (P1)

- **File:** `src/lib/actions/quiz-v2/submit-answer.ts:282`
- **Current:** `resolveRationaleText(rationaleFromDb as any)`
- **Risk:** Low — `rationaleFromDb` is `unknown` type, `resolveRationaleText` likely accepts `string | null`.
- **Fix:** `resolveRationaleText(rationaleFromDb as string | null)`
- **Priority:** P1

### TS-04: `(question as any).is_interleaved` (P1)

- **File:** `src/lib/actions/quiz-v2/start-session.ts:227`
- **Current:** `is_interleaved: (question as any).is_interleaved ?? false`
- **Risk:** Low — the `is_interleaved` property is added by `selectQuestionsWithInterleaving` but not typed on the base question type.
- **Fix:** Add `is_interleaved?: boolean` to the question selection result type.
- **Priority:** P1

### TS-05: `finalResult as any` (P2 — Test Only)

- **File:** `src/lib/actions/quiz-v2/submit-answer.test.ts:183`
- **Risk:** None — test file only.
- **Fix:** Create a proper test fixture matching `EndSessionResult`.
- **Priority:** P2

---

## 07. Offline & Reliability Gap Fixes

### REL-01: Offline Queue Exists but Has No Reconnection Trigger (P1)

- **Evidence:** `useQuizStore.ts` has `pendingSubmissions`, `queueOfflineSubmission`, and `flushOfflineQueue` (spec section 14). `useOnlineStatus.ts` detects connectivity.
- **Gap:** The `flushOfflineQueue` function exists but there is no `useEffect` that watches `isOnline` and triggers `flushOfflineQueue` when connectivity is restored. The queue is persisted to localStorage but never automatically replayed.
- **Current behavior:** Submissions are queued on failure, banner shows, but queue is never automatically flushed.
- **Fix:** Add a reconnection watcher in the quiz shell:
```typescript
// In StandardQuizShell.tsx (or a dedicated hook)
const isOnline = useOnlineStatus()
const flushOfflineQueue = useQuizStore(s => s.flushOfflineQueue)
useEffect(() => {
  if (isOnline) {
    flushOfflineQueue()
  }
}, [isOnline, flushOfflineQueue])
```
- **Priority:** P1

### REL-02: CAGE `verifyBindingToken` Not Called in Submit Flow (P2)

- **Evidence:** Spec section 17 flags: "Server-side verification (`verifyBindingToken`) is implemented but not called in the submit-answer flow."
- **File:** `src/lib/cage/verifyBindingToken.ts` exists but is never imported in `submit-answer.ts`.
- **Gap:** CAGE tokens are generated client-side, sent to server, and stored — but never verified server-side. The chain verification (Claim 20) is incomplete.
- **Fix:** Add verification as a background hook in `runPostSubmitWork`:
```typescript
if (input.cageToken) {
  backgroundTasks.push(
    verifyBindingToken({
      token: input.cageToken,
      expectedResponseHash: computeHash({ questionId, selectedOptionId }),
      sessionId,
      sequenceNumber: /* from input */,
    }).catch(err => console.warn('[CAGE] Verification failed:', err))
  )
}
```
- **Note:** This is fire-and-forget — verification failures should be logged but never block submissions.
- **Priority:** P2

### REL-03: SRS Fire-and-Forget Verified (CONFIRMED HEALTHY)

- **Evidence:** `src/lib/srs/update.ts:67-74` has proper try/catch wrapping. `submit-answer.ts:287-366` uses `Promise.allSettled` for all background tasks. SRS failures cannot block the quiz flow.
- **Status:** No fix needed — confirmed working as designed.

---

## 08. Mobile Performance Targets & Fixes

Performance budget for mid-range Android on Philippine 4G (10 Mbps, 80ms RTT):

| Metric | Current (estimated from code analysis) | Target | Gap | Fix Reference |
|--------|---------------------------------------|--------|-----|---------------|
| Session start latency (hub -> Q1 render) | ~1200ms | < 1500ms | Within target | No change needed |
| Answer feedback latency (gesture -> feedback) | ~400ms | < 300ms | ~100ms | SA-04: optimize submitAnswer (already parallelized) |
| Results render time (final answer -> results) | 3000-5000ms (race condition window) | < 2000ms | 1000-3000ms | Fix 2A+2B (race condition), SA-04 (defer endSession from submitAnswer) |
| Drill hub TTI | ~2000ms | < 3000ms | Within target | No change needed |
| Results page load (server) | ~2000ms | < 1000ms | ~1000ms | CS-03 (parallelize results page queries) |

**Note:** Chrome MCP measurements require a running dev server. The estimates above are derived from code analysis (query count x estimated RTT). Actual measurements should be taken during Phase 2 implementation to validate.

**Touch targets:** All quiz interactive elements use shadcn/ui `<Button>` components with minimum 44px touch targets. SlideToSubmit handle is 44x44px (identity-locked). No touch target issues identified.

---

## 09. Phased Implementation Roadmap

### Phase 1 — P0 Fixes (Deploy Immediately)

**Prerequisite:** None
**Estimated time:** 3-4 hours
**Files to modify:**

| File | Change |
|------|--------|
| `src/stores/useQuizStore.ts` | Fix 2A: Add `calculatingResults` check in `submitCurrentAnswer` handler; Fix 2B: Clear `calculatingResults` in `endSession` |
| `src/hooks/useQuizShellHandlers.ts` | Fix 2D (optional safety net): Add null-check recovery for `results` in `handleNext` |
| DB Migration (new file) | Fix 2C: Add missing `session_status` enum values (`auto_submitted`, `paused`, `configuring`) |
| `src/lib/actions/quiz-v2/end-session.ts` | TS-01: Remove `as any` cast on `session.status` (after enum fix) |

**Verification:**
1. Run the regression test from section 02 across all 9 modes
2. Verify `bun run type-check` passes after removing `as any`
3. Verify DB migration applies cleanly

### Phase 2 — Server Action & DB Performance (Deploy Next)

**Prerequisite:** Phase 1 complete
**Estimated time:** 4-6 hours
**Files to modify:**

| File | Change |
|------|--------|
| `src/lib/actions/quiz-v2/end-session.ts` | Move `recomputeAndSaveReadinessScore` to `after()`; move notification topic fetch to background; parallelize independent queries |
| `src/lib/actions/quiz-v2/submit-answer.ts` | Option A: Defer `endSessionAction` call to client (return `sessionComplete: true` without calling endSession inline) OR Option B: Keep inline but ensure endSession is fast after Phase 2 optimizations |
| `src/lib/actions/quiz-v2/get-review-data.ts` | Parallelize batch queries; parallelize taxonomy + wiki within each batch |
| DB Migration (new file) | DB-02: Drop duplicate unique indexes; DB-03: Drop duplicate session indexes; DB-05: Add `user_interactions(user_id, question_id)` index |

**Verification:**
1. Run drill sessions across all modes — verify results render correctly
2. Measure end-session server action response time (target < 1000ms p50)
3. Measure get-review-data response time for a 200Q session (target < 500ms p50)
4. Verify `bun run type-check` passes

### Phase 3 — Client-Side Performance (Deploy After)

**Prerequisite:** Phase 2 complete
**Estimated time:** 3-4 hours
**Files to modify:**

| File | Change |
|------|--------|
| `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx` | CS-03: Parallelize sequential queries with `Promise.all`; CS-05: Static import for ResultsDashboard |
| `src/components/quiz-v2/StandardQuizShell.tsx` | CS-02: Parallelize background question pre-fetching; REL-01: Add offline queue flush on reconnect |
| `src/lib/actions/quiz-v2/get-review-data.ts` | TS-02: Replace `as any[]` casts with proper types |
| `src/lib/actions/quiz-v2/submit-answer.ts` | TS-03: Replace `rationaleFromDb as any` |
| `src/lib/actions/quiz-v2/start-session.ts` | TS-04: Add `is_interleaved` to question type |

**Verification:**
1. Results page load time < 1000ms (Chrome DevTools Network tab)
2. Fullexam (200Q) background pre-fetch completes within 5 seconds
3. Offline queue flushes automatically on reconnect (toggle airplane mode in DevTools)
4. `bun run type-check` passes with zero `as any` casts in quiz-v2 actions (excluding test file)

### Phase 4 — Reliability & Cleanup (Deploy Last)

**Prerequisite:** Phase 3 complete
**Estimated time:** 2-3 hours
**Files to modify:**

| File | Change |
|------|--------|
| `src/lib/actions/quiz-v2/submit-answer.ts` | REL-02: Add CAGE verification as background hook |
| DB Migration (new file) | DB-04: Clean up duplicate RLS policies |
| `src/lib/actions/quiz-v2/submit-answer.test.ts` | TS-05: Fix test type cast |

**Verification:**
1. CAGE verification runs without blocking submissions (check server logs)
2. All RLS policies still enforce user isolation (test with different user IDs)
3. `bun test` passes

---

## 10. Verification & Testing Protocol

### Phase 1 Verification (P0 Bug Fix)

**Manual Test — All 9 Modes:**

For each mode (camp, chill, article-review, subject, focus-review, custom, storm, simulation, endurance):

1. Start a session with minimum question count
2. Answer all questions
3. On the last question:
   - For immediate feedback modes: tap Next **immediately** after the feedback appears (before server processes). Verify results page loads within 5 seconds.
   - For deferred feedback modes: verify results page loads after final answer submission.
4. Verify the results page shows correct score, subject breakdown, and review cards.
5. Verify no permanent loading overlay.

**Specific Edge Cases:**
- Start a camp session → answer 9/10 → exit via exit button → verify session marked as abandoned → start a new session → verify no stale state from previous session
- Start a simulation session (200Q) → submit all via Submit All button → verify results page loads
- Start a storm session → let timer expire → verify results page loads (timer_expired → completed flow)

**DB Verification:**
```sql
-- Verify enum values after migration
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname = 'session_status';
-- Expected: in_progress, completed, abandoned, auto_submitted, paused, configuring
```

### Phase 2 Verification

**Performance Re-measurement:**
- Chrome DevTools Network tab: measure `endSession` server action response time
- Target: < 1000ms p50 (down from estimated 2000-4000ms)
- Measure `getReviewData` for a fullexam session (200Q)
- Target: < 500ms p50

**DB Verification:**
```sql
-- Verify duplicate indexes are dropped
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_interactions' AND indexname LIKE '%unique%' OR indexname LIKE '%upsert%';
-- Expected: only idx_user_interactions_unique remains
```

### Phase 3 Verification

- Results page load time (Chrome DevTools): < 1000ms
- Offline queue test: enable airplane mode in DevTools during active session → submit 3 answers → disable airplane mode → verify all 3 answers appear in results
- `bun run type-check`: zero errors

### Phase 4 Verification

- CAGE verification logs: check server console for `[CAGE]` entries during drill session
- RLS test: attempt to read another user's session via Supabase client → verify empty result (not error)

---

## 11. Do-Not-Touch Registry

### Identity-Locked (from spec section 16 + `.ai/rules/identity_preservation_lock.md`)

| File | Reason |
|------|--------|
| `src/components/quiz-v2/SlideToSubmit.tsx` | Brand-critical conversion element, patent-protected gesture |
| `src/components/quiz-v2/GestureCaptureZone.tsx` | CAGE signal capture wrapper |
| `src/lib/quiz/haptics.ts` | Haptic feedback functions |

### Confirmed Healthy (from diagnostic audit)

| File | Reason |
|------|--------|
| `src/lib/srs/update.ts` | Fire-and-forget pattern confirmed working (try/catch at line 67-74) |
| `src/lib/srs/irt.ts` | Core IRT calculation — no changes needed |
| `src/lib/srs/sm2.ts` | Core SM-2 algorithm — no changes needed |
| `src/lib/readiness-score.ts` | 6-vector computation — correct but slow; optimization deferred to endSession background-ification |
| `src/lib/quiz/intelligent-routing.ts` | 60/30/10 routing — correct and reasonably optimized with chunking |
| `src/lib/quiz/adaptive-difficulty.ts` | Wilson 85% rule — lightweight, no issues |
| `src/lib/quiz/error-classifier.ts` | Error classification — lightweight, no issues |
| `src/lib/quiz/temporal-bounds.ts` | Per-mode gesture bounds — lightweight, no issues |
| `src/lib/cage/generateBindingToken.ts` | Client-side CAGE token generation — 150ms budget enforced |
| `src/lib/cage/nonceService.ts` | Nonce issuance — working correctly |
| `src/components/quiz-v2/QuizOption.tsx` | Individual option rendering — no issues |
| `src/components/quiz-v2/FeedbackPanel.tsx` | Feedback display — no issues |
| `src/components/quiz-v2/TimerDisplay.tsx` | Timer UI — no issues |
| `src/components/quiz-v2/TimerTicker.tsx` | Timer driver — no issues |
| `src/stores/useQuizTimerStore.ts` | Timer state — working correctly |

### RLS Policies Confirmed Healthy

All drill-related RLS policies use consistent `auth.uid() = user_id` pattern. No policies that could silently return empty rows when data exists (all use direct equality, not joins or subqueries that could produce false negatives). The `session_questions` RLS uses a subquery to check session ownership — this is correct but adds a minor query overhead.

---

## 12. Open Questions for Product Owner

### Q1: Fullexam 24-Hour Results Delay

- **Context:** The results page (results/page.tsx:37-57) enforces a delay based on `config.results.delayHours`. For fullexam mode, this is set to 24 hours. This means users cannot see their results for 24 hours after completing a simulation exam.
- **Question:** Is this delay intentional for all environments (including dev/staging)? Should there be an override for development?
- **Options:**
  - A) Keep 24h delay in all environments (authentic exam simulation)
  - B) Add dev/staging bypass (`process.env.NODE_ENV === 'development' ? 0 : delayHours`)
  - C) Reduce to 1 hour (compromise between realism and usability)
- **Default recommendation:** Option B — add dev bypass for faster testing

### Q2: Pressure Level Selector

- **Context:** `PressureLevelSelector` component exists (spec section 4) and `pressure_level` is on `QuizSessionConfig`, but no mode preset uses pressure levels and the effect on quiz behavior is not implemented.
- **Question:** Is this intentionally non-functional (future feature), or is it a bug that should be fixed in this optimization pass?
- **Options:**
  - A) Remove the component and config field (dead code)
  - B) Keep as-is (planned future feature)
  - C) Implement pressure level effects now
- **Default recommendation:** Option B — keep as planned future feature, do not touch

### Q3: Interleaving

- **Context:** `selectQuestionsWithInterleaving` is fully implemented but no mode preset sets `interleave: true`. The feature is wired but never activated.
- **Question:** Should any mode enable interleaving by default?
- **Options:**
  - A) Enable for `subject` and `focused` modes (pedagogically appropriate for spaced interleaving)
  - B) Keep disabled until explicit product decision
  - C) Make it a user toggle in Custom mode setup
- **Default recommendation:** Option B — keep disabled, revisit after drill optimization is stable

### Q4: Successive Relearning Integration

- **Context:** `processSuccessiveRelearning` is defined and the UI components exist (SRCriterionCard, SRProgressRing, SRSpacingTimeline), but the spec notes it is "not explicitly wired in submit-answer.ts."
- **Question:** Should SR processing be wired into the post-answer hook chain in this optimization pass?
- **Options:**
  - A) Wire it now as a fire-and-forget background hook in `runPostSubmitWork`
  - B) Defer to a dedicated SR integration task
- **Default recommendation:** Option B — defer to avoid scope creep in this optimization pass

---

*End of implementation plan. All findings verified against live codebase and Supabase MCP as of 2026-04-08.*

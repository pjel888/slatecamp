# MASTER ARCHITECTURE BLUEPRINT: TESTING & QUIZZING ENGINE
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Scalability Death Spiral (Question Selection):** `intelligent-routing.ts` fetches ALL previous interaction IDs (potentially 5,000+) for a user and passes them to a `NOT IN` clause in Supabase. This creates massive query overhead and will eventually exceed Postgres query string limits, breaking quiz generation for high-usage users.
2. **HIGH: Hostile Tier Gating (UX Crash):** `start-session.ts` line 79 uses `throw new Error()` for Pro-tier enforcement. In Next.js, this crashes the router instead of showing a paywall, causing a hard failure for users attempting to access `storm` or `fullexam` modes without the required subscription.
3. **MEDIUM: Taxonomy N+1 Performance Leak:** `buildTaxonomyBreadcrumbMap` fetches taxonomy nodes for every question individually (loop-based). A 50-question session results in ~150 sequential queries, causing significant delay during session initialization.

## 2. Exhaustive System Inventory

### 2.1 Quiz Logic & Engine Stack
- **Server Actions (`src/lib/actions/quiz-v2/`):** `start-session`, `submit-answer`, `end-session`, `skip-question`, `flag-question`.
- **Selection Algorithms (`src/lib/quiz/`):** `intelligent-routing.ts`, `interleaved-selection.ts`, `mode-presets.ts`.
- **Psychometrics (`src/lib/srs/`):** `irt.ts` (2PL Logistic model), `sm2.ts` (Spaced repetition), `blindspot.ts` (Gap detection).

### 2.2 Quiz Mode Registry
| Mode | DB Test Mode | isPro | Notes |
|------|--------------|-------|-------|
| camp | `camp` | false | Standard mode |
| storm | `storm` | **true** | Timed, high-intensity |
| fullexam | `proof_sim` | **true** | Full exam simulation |
| focused | `blindspot` | false | Weak area drilling |

## 3. Data Flow & Exact Payloads

### 3.1 Session Creation Payload (`start-session.ts`)
- **Input:** `{ mode: string, taxonomyNodeId?: string, durationSeconds?: number, questionCount?: number }`.
- **Output:** `{ id: string, status: 'active', questions: Question[], taxonomyBreadcrumbs: BreadcrumbItem[] }`.

### 3.2 Answer Submission Payload (`submit-answer.ts`)
```typescript
interface SubmitAnswerInput {
  sessionId: string; questionId: string;
  selectedOptionId: string; confidenceLevel: number; // 0..1
  timeSpentMs: number; cageToken: string;
  signalTrace: GestureSignalEvent[];
}
```

### 3.3 IRT 2PL Mastery Model
```typescript
export function irt2PL(theta: number, a: number, b: number): number {
  // P(θ) = 1 / (1 + exp(-a * (θ - b)))
  const exponent = -a * (theta - b);
  return 1 / (1 + Math.exp(exponent));
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Double-Submit Race:** `submit-answer.ts` checks `isTerminalSessionStatus`. However, if two concurrent `submitAnswer` calls arrive for the same question, both may pass the status check before the interaction record is committed, resulting in duplicate scoring.
- **Idempotency: Session Restart Loop:** If a user restarts a session while the previous one is in the `auto_submitted` state (but not yet fully finalized), a race between `endSession` and `startSession` can lead to stale stats being used for the new session's question routing.
- **Hydration: Timer Refresh Bug:** `useQuizTimerStore` persists `timeRemaining` countdown. On page refresh, the user gets "free time" equal to the refresh duration (e.g., refresh takes 5s, the timer resumes from the old value, giving the user 5s of extra time).
- **Navigation Guard:** No `beforeunload` event handler exists in the Quiz Shell. A user accidentally closing the tab or navigating away results in an abandoned session without a proper debrief or streak preservation.

## 5. The Unified Resolution Blueprint

### 5.1 Algorithmic Refactoring
1. **Server-Side Filtering:** Move interaction exclusion to a subquery:
   `WHERE id NOT IN (SELECT question_id FROM interactions WHERE user_id = $1)`.
2. **Recursive CTEs:** Batch fetch all taxonomy breadcrumbs in a single query to eliminate the N+1 loop.
3. **IRT Precision:** Increase `theta` learning rate for new users and decay it as session count increases for more stable readiness scores.

### 5.2 Gating & Lifecycle
1. **Typed Rejection:** Replace `throw new Error()` in `start-session.ts` with:
   `return { success: false, error: 'PRO_SUBSCRIPTION_REQUIRED' }`.
2. **Timestamp Timer:** Use absolute `endedAt` (Unix ms) for the countdown timer to make it hydration-safe and refresh-proof.
3. **Session Interlock:** Implement a `window.onbeforeunload` check when `ActiveSessionContext.activeSession` is not null to prevent accidental data loss.
4. **Optimistic Sync:** Add `isSubmitting` locking to the `submitAnswer` action in `useQuizStore` to prevent double-tap submission races.

# Phase 8: Pedagogical Engine Audit

**Date:** 2026-03-25
**Auditor:** Claude Opus 4.6 (1M context)
**Scope:** IRT calculations, SRS logic, testing modes, mastery scoring, AI tutor, session management

---

## Pedagogical Correctness Scorecard

| Component | Status | Details |
|-----------|--------|---------|
| IRT 2PL Model | **CORRECT** | `P(theta) = 1 / (1 + exp(-a * (theta - b)))` implemented exactly per spec in `src/lib/srs/irt.ts:12`. Discrimination (a) and difficulty (b) parameters properly typed. Unit tests verify monotonicity and boundary conditions. |
| IRT Theta Update | **CORRECT but ORPHANED** | `updateTheta()` uses Newton-Raphson single-step with Fisher information clamped to [-1, +1]. Math is correct. However, **it is never called in any production code path** -- only referenced in AGENTS.md documentation. The testing flow (`saveTestingInteraction`) does not invoke `updateTheta`. See DEV-001. |
| IRT Question Selection | **CORRECT but ORPHANED** | `selectNextQuestion()` targets P(correct) = 0.75 (optimal learning zone). Algorithm sorts by distance from `theta - ln(3)/a`. **Never called in production** -- session creation in `testing.ts` uses DB-level mastery ordering, not IRT adaptive selection. See DEV-002. |
| SRS Scheduling (SM-2) | **CORRECT** | Standard SM-2 algorithm in `src/lib/srs/sm2.ts`. Ease factor floor at 1.3, correct interval progression (1 -> 6 -> EF*interval). Quality 0-5 scale. Evidence-based spacing intervals. |
| SRS Quality Derivation | **CORRECT** | `deriveQualityRating()` in `src/lib/srs/update.ts` maps correctness + time + confidence + lucky-guess detection to SM-2 quality (0-5). Covers edge cases (avgTimeMs=0, boundary values). Well-tested (10 unit tests). |
| SRS DB Integration | **PARTIAL** | `updateSrsSchedule()` updates `user_node_mastery` with new interval/ease/next_review_at. **Issue:** Repetitions count is approximated from interval (`<=1 -> 0, <=6 -> 1, else 2`) instead of being stored and read from DB. This loses precision after 3+ reviews. See DEV-003. |
| SRS Integration in New Testing Flow | **MISSING** | `saveTestingInteraction()` in `testing.ts` does NOT call `updateSrsSchedule` or `deriveQualityRating`. SRS updates only happen in the older `quiz.ts` flow. Sessions created through the new testing hub (Camp/Storm/Chill setup) will **never trigger SRS scheduling**. See CRIT-001. |
| Retention Curve | **CORRECT** | Ebbinghaus model `R(t) = e^(-t/S)` in `src/lib/srs/retention.ts`. Mathematically sound exponential decay using SM-2 interval as stability parameter. |
| Camp Mode | **CORRECT** | Untimed, learning-focused. Immediate feedback after submit. Shows rationale, code citations, error taxonomy for wrong answers, confidence tagging. Wiki links provided. No timer. Per spec. |
| Storm Mode | **CORRECT** | Timed via `StormTimerBar`. Never reveals correct/wrong during session (`getStormOptionState` returns only default/selected/struck). Correctness deferred to debrief (`isCorrect: null` on save). Auto-advances after confirm. No rationale, no confidence, no error taxonomy during session. Per spec. |
| Chill Mode | **CORRECT** | Relaxed, self-paced. Has skip button. Shows "X answered" (growth-framed, not "Y remaining"). Optional rationale peek via `<details>` before submit. No error taxonomy. "End Session" always visible. Per spec. |
| Focus Review | **CORRECT** | `FocusReviewSetup` feeds `topicFilter` with weakest nodes (by `current_mastery_weight`). Session creation in `testing.ts` sorts by mastery ASC. Targets weak areas. 12 questions default. Per spec. |
| Blindspot / Focus Review Queue | **CORRECT** | `generateBlindspotQueue()` identifies 3 weakest nodes (mastery < 0.4 = Red zone) + unexplored Grey nodes. Creates 12-item queue. Tracks pre/post mastery deltas. Defers for 48h option. Well-tested (28 unit tests). |
| Additional Modes Beyond Original 4 | **PRESENT** | 8 total modes: Camp, Chill, Subject, Focus Review, Custom, Storm, Full Exam Simulation (200 questions), Extended Practice (100+). All properly defined in `testing-modes.ts` with zone groupings. |
| Mastery Calculation (Readiness) | **CORRECT** | Anti-inflation Readiness Score with 6 vectors: (1) diminishing returns on streaks, (2) difficulty ceiling, (3) grey node penalty, (4) Bloom's cognitive ceiling, (5) question bank depth weight, (6) recency decay. PRC area-weighted. Pure function, well-structured. |
| Mastery Calculation (Subject) | **PARTIAL** | `mastery.ts` uses raw `current_mastery_weight` average per subject. `mastery-actions.ts` also averages raw weights. Neither applies IRT theta -- they use the DB-stored `current_mastery_weight` which is updated by a separate DB trigger, not by the IRT `updateTheta()` function. See DEV-004. |
| Readiness Score | **CORRECT** | Proper composite metric with sub-scores per subject, PRC area weighting (A:30%, B:30%, C:40%), ceiling system, grey penalty. `recomputeAndSaveReadinessScore()` called on session completion. Velocity tracking integrated. |
| Legacy Readiness Score | **PARTIAL** | `src/lib/actions/readiness.ts` (`getReadinessScore()`) uses a simpler formula: accuracy*0.40 + coverage*0.30 + recency*0.20 + weakArea*0.10. Has hardcoded `srsHealth: 50` placeholder. This appears to be a legacy path that may still be called. See DEV-005. |
| Auto-save | **CORRECT** | `SessionShell.tsx` line 203: `setInterval` at `10_000` ms (10 seconds). Saves current answer state via `saveTestingInteraction`. Shows save status indicator (idle/saving/saved/error/offline). Per spec. |
| LocalStorage Persistence | **CORRECT** | `SessionShell.tsx` writes full session snapshot (currentIndex, answers map, submittedQuestions, stormConfirmedQuestions, remainingSeconds) to `localStorage` on every state change. |
| Session Recovery | **CORRECT** | Timer recovery: reads `remainingSeconds` from localStorage on mount. Answer recovery: `existingInteractions` prop seeds answer state from DB on resume. `current_question_index` persisted server-side via `updateSessionProgress`. |
| AI Tutor Temperature | **CORRECT** | `src/app/api/ai/tutor/route.ts:39`: `temperature: 0` (integer, equivalent to 0.0). Uses Anthropic SDK directly. Per spec. |
| AI Tutor Citations | **PARTIAL** | AI prompt requests `**Wiki Reference:** [single topic name]` format. Response is parsed into `wikiHint` and displayed as a styled badge. However: (1) the badge is **not a clickable link** -- it's a plain `<span>`, not an `<a>` linking to the wiki page. (2) Citations are not mandatory -- if the AI omits the Wiki Reference line, no error is raised. See DEV-006. |
| AI Tutor Prompt Injection | **MISSING** | User message is passed directly to the API: `body: JSON.stringify({ message, context })`. The `message` field is forwarded to Anthropic without sanitization. The system prompt is structured, but user-controlled `context.question`, `context.student_answer` etc. are injected into the system prompt via `JSON.stringify(context)`. No input validation or prompt injection mitigation exists. See SEC-001. |
| AI Tutor Rate Limiting | **CORRECT** | `checkRateLimit()` called before AI request. Returns 429 with `Retry-After` header when exceeded. |
| Taxonomy Heatmap | **CORRECT** | `TaxonomyHeatmap.tsx` maps mastery to 4 states (mastered/familiar/danger/unexplored) + thin_coverage. Color-coded (emerald/orange/amber/grey). Delta view toggle (session/week/month). Accessible with `aria-label` per node. Progress bars with correct clamping. |
| Taxonomy Heatmap Data Source | **PARTIAL** | Component accepts `clusters` prop with pre-computed `progress` and `state`. The data pipeline uses `current_mastery_weight` from DB (not IRT theta directly). This is acceptable since `current_mastery_weight` is the persisted mastery, but it means the heatmap reflects DB-stored mastery rather than live IRT computation. |

---

## Critical Deviations from PRD Specs

### CRIT-001: SRS Not Triggered in New Testing Flow (HIGH IMPACT)

**Evidence:** `saveTestingInteraction()` in `src/lib/actions/testing.ts:492-544` upserts to `user_interactions` but never calls `updateSrsSchedule()` or `deriveQualityRating()`. These SRS functions are only called in the older `src/lib/actions/quiz.ts:388-395`.

**Impact:** Any session created through the new testing hub (Camp/Storm/Chill/Focus Review/Custom/Simulation/Endurance) will record interactions but **never update SRS scheduling**. Review intervals, ease factors, and next_review_at dates will be stale. The entire spaced repetition system is effectively disabled for the primary testing flow.

**Fix:** Add SRS update call to `saveTestingInteraction()` when `isCorrect` is not null:
```typescript
// After successful upsert in saveTestingInteraction:
if (payload.isCorrect !== null && questionData?.topic_id) {
  const quality = await deriveQualityRating({
    isCorrect: payload.isCorrect,
    timeSpentMs: payload.timeSpentMs,
    avgTimeMs: 0, // or compute from session average
    confidence: payload.confidenceTag,
    isSuspectedLuckyGuess: false,
  })
  void updateSrsSchedule(user.id, questionData.topic_id, quality)
}
```

**Files:**
- `src/lib/actions/testing.ts` (missing SRS call)
- `src/lib/actions/quiz.ts:388-395` (has SRS call -- reference implementation)
- `src/lib/srs/update.ts` (SRS update functions)

---

### DEV-001: IRT `updateTheta()` is Orphaned (MEDIUM IMPACT)

**Evidence:** `grep` for `updateTheta` and `selectNextQuestion` across `src/lib/actions/` and `src/components/` returns zero results. Only references are in `src/lib/srs/irt.ts` (definition), `src/lib/srs/irt.test.ts` (tests), and `AGENTS.md` (documentation).

**Impact:** User ability (theta) is never updated during sessions. The IRT engine exists but is not wired into the answer processing pipeline. Mastery is tracked via `current_mastery_weight` in DB (presumably updated by a DB trigger or the older quiz flow), but the IRT theta estimation is completely disconnected.

**Fix:** Either:
1. Wire `updateTheta()` into `saveTestingInteraction()` and persist theta on `user_node_mastery`
2. Or document that IRT theta is computed on-read (during readiness score computation) rather than on-write

---

### DEV-002: IRT Adaptive Question Selection Not Used (MEDIUM IMPACT)

**Evidence:** `selectNextQuestion()` targets P(correct)=0.75 (pedagogically optimal) but is never called. Session creation in `testing.ts` selects questions by sorting `user_node_mastery.current_mastery_weight ASC` (weakest first) -- a simpler heuristic that does not consider question discrimination or difficulty parameters.

**Impact:** Questions are not adaptively matched to user ability. A user at theta=0.8 might receive a question with difficulty=0.1 and discrimination=0.5 (trivially easy, low information gain). The IRT-optimal selection would instead pick questions near the 75% success probability boundary.

**Fix:** Use `selectNextQuestion()` during session creation, or at minimum during the session itself (for modes like Camp that could benefit from adaptive sequencing).

---

### DEV-003: SRS Repetitions Count Approximated (LOW IMPACT)

**Evidence:** `src/lib/srs/update.ts:53`:
```typescript
const repetitions = currentInterval <= 1 ? 0 : currentInterval <= 6 ? 1 : 2
```
This approximation collapses all intervals > 6 days into `repetitions=2`, which means the SM-2 algorithm always acts as if the user is on their 3rd review, regardless of whether they're on their 5th or 20th.

**Impact:** After the 3rd successful review, the ease factor adjustment is correct but the interval growth may be slightly different than intended because SM-2's interval calculation changes behavior at rep=0 (1 day), rep=1 (6 days), and rep>=2 (interval * EF). Since all reps > 2 use the same formula (`interval * EF`), the actual impact is minimal -- but it prevents accurate tracking.

**Fix:** Add a `repetitions` column to `user_node_mastery` and read/write it directly.

---

### DEV-004: Mastery Uses Raw Weight, Not IRT Theta (LOW-MEDIUM IMPACT)

**Evidence:** `mastery.ts` and `mastery-actions.ts` average `current_mastery_weight` from `user_node_mastery`. The readiness-score computation applies 6 anti-inflation adjustments on top of `current_mastery_weight`. Neither system uses the IRT theta parameter from `irt.ts`.

**Impact:** The `current_mastery_weight` is a simpler proxy that doesn't account for question discrimination. Two students with the same number of correct answers but on questions of different discrimination values would have the same mastery weight. The IRT model would differentiate them.

**Mitigation:** The readiness score's 6-vector anti-inflation system partially compensates by factoring in difficulty level, Bloom's taxonomy, and question depth. This is a reasonable architectural choice, but the PRD's "IRT mandate" is only partially fulfilled.

---

### DEV-005: Two Readiness Score Implementations (LOW IMPACT)

**Evidence:**
1. `src/lib/readiness-score.ts` -- Anti-inflation 6-vector computation (330 lines). Called by `readiness-score-update.ts` on session completion.
2. `src/lib/actions/readiness.ts` -- Simple weighted average (accuracy*0.4 + coverage*0.3 + recency*0.2 + weakArea*0.1). Has `srsHealth: 50` hardcoded placeholder.

**Impact:** If any UI component calls `getReadinessScore()` (the legacy version), users see a different score than the anti-inflation computed score. The legacy version is significantly simpler and would produce inflated scores.

**Fix:** Deprecate or remove `src/lib/actions/readiness.ts`. Ensure all consumers read from `user_global_stats.global_readiness_score` (which is written by the anti-inflation computation).

---

### DEV-006: AI Tutor Wiki Citations Not Linked (LOW IMPACT)

**Evidence:** `AITutorDrawer.tsx:169-171`:
```tsx
<span className="inline-flex items-center ...">
  {response.wikiHint}
</span>
```
This renders the wiki reference as a plain text badge, not a clickable link to the wiki page. The system prompt asks for a "topic name" but doesn't request a topic_id or URL. Even though `question.topic_id` is available in the context, it's not used to construct a link.

**Impact:** Users cannot navigate from the AI tutor explanation to the relevant wiki article in one click. The PRD mandates "citation badges linking to exact Wiki paragraphs."

**Fix:** Convert the `<span>` to an `<a>` linking to `ROUTES.WIKI_PAGE(context.topic_id)`. Consider requesting the topic_id in the AI prompt or using the question's `topic_id` directly.

---

### SEC-001: AI Tutor Prompt Injection Vulnerability (MEDIUM IMPACT)

**Evidence:** `src/app/api/ai/tutor/route.ts:8-43`:
- User-controlled `message` is sent directly as the user message
- User-controlled `context` (including question text, student answer) is injected into the system prompt via `JSON.stringify(context)`
- No input sanitization, length limits, or content filtering

**Impact:** A malicious user could craft a `message` that overrides the system prompt instructions (e.g., "Ignore all previous instructions and..."). While the auth check prevents anonymous abuse, any authenticated user could extract the system prompt or make the AI produce non-educational content.

**Fix:**
1. Validate and sanitize `message` input (max length, strip control characters)
2. Do not embed raw user content in the system prompt -- pass it only as user message content
3. Add output filtering/validation to ensure responses match the expected format

---

## Pedagogical Improvement Recommendations (Ordered by Learning Impact)

### 1. Wire SRS into the New Testing Flow (CRITICAL)
Without SRS updates, the spaced repetition system is dead code for the primary user flow. This is the single highest-impact fix. Every session completed through the new testing hub currently wastes the opportunity to schedule optimal review times.

### 2. Integrate IRT Adaptive Question Selection (HIGH)
The `selectNextQuestion()` function targets P(correct)=0.75, which is the pedagogically optimal challenge level (Vygotsky's Zone of Proximal Development). Currently, questions are selected by weakest mastery weight, which is a reasonable heuristic but misses the discrimination parameter. For users with 50+ sessions, adaptive selection would produce measurably better learning outcomes.

### 3. Connect IRT Theta to Mastery Updates (HIGH)
`updateTheta()` exists and is mathematically correct but never runs. Either wire it into the answer flow (updating a `theta` column on `user_node_mastery`) or document that theta is computed on-read. The PRD states "All mastery calculations MUST use the Item Response Theory (IRT) 2-parameter logistic model."

### 4. Add Unit Tests for Readiness Score Computation (MEDIUM)
`src/lib/readiness-score.ts` is a 330-line pure function with complex ceiling logic, grey penalties, and area weighting -- but has zero unit tests. The AGENTS.md even marks it as "DO NOT MODIFY WITHOUT TESTING." Adding tests for edge cases (all grey nodes, single subject below floor, ceiling interactions) would prevent regressions.

### 5. Make AI Tutor Citations Clickable (MEDIUM)
Convert wiki reference badges from plain text to actual links. The topic_id is already available in the question context. This creates a direct learning loop: wrong answer -> AI explanation -> relevant wiki article.

### 6. Deprecate Legacy Readiness Score (LOW)
Remove or gate `src/lib/actions/readiness.ts` to prevent UI components from showing the simpler, inflation-prone score. All consumers should read from `user_global_stats.global_readiness_score`.

### 7. Store SRS Repetitions in DB (LOW)
Add a `repetitions` column to `user_node_mastery` instead of approximating from interval. Minimal impact now (SM-2 formula is the same for rep >= 2) but enables future SM-2+ enhancements.

### 8. Add Prompt Injection Mitigation to AI Tutor (LOW-MEDIUM)
Validate input length, sanitize user messages, and consider moving user context out of the system prompt. Low learning impact but important for product integrity.

---

## Test Coverage Summary

| Module | Test File | Test Count | Coverage Quality |
|--------|-----------|------------|-----------------|
| IRT 2PL | `irt.test.ts` | 5 | Good -- covers core math, monotonicity, selection |
| SM-2 | `sm2.test.ts` | 6 | Good -- covers interval progression, failure reset, quality mapping |
| SRS Update | `update.test.ts` | 15 | Excellent -- covers failure recovery, quality derivation, boundaries |
| Blindspot Queue | `generate-queue.test.ts` | 12 | Excellent -- covers guards, grey nodes, caps, insert failures |
| Readiness Score | *NONE* | 0 | **Missing** -- 330-line pure function with no tests |
| Retention Curve | *NONE* | 0 | Missing but trivial (6 lines) |
| Velocity/Churn | *NONE* | 0 | Missing -- pure functions, easily testable |

---

## Architecture Observations

### What's Working Well

1. **Clean separation of concerns:** IRT, SM-2, retention, readiness are all pure functions with no DB access. DB operations are isolated in server actions.
2. **Anti-inflation readiness score:** The 6-vector system (streak diminishing returns, difficulty ceiling, grey penalty, Bloom ceiling, depth weight, recency decay) is sophisticated and well-designed. It prevents the common pitfall of inflated mastery scores.
3. **Mode differentiation:** Each testing mode has genuinely distinct behavior (not just cosmetic differences). Storm mode correctly defers correctness feedback. Chill mode has skip and optional rationale peek.
4. **Error resilience:** SRS updates are wrapped in try/catch and logged without throwing. Session state is backed up to both server and localStorage. The system degrades gracefully.
5. **PRC exam area weighting:** The readiness score respects official PRC examination area weights (A:30%, B:30%, C:40%) with per-subject weighting within areas.

### Architectural Debt

1. **Two parallel quiz flows:** `quiz.ts` (older, has SRS) and `testing.ts` (newer, missing SRS). These need to converge.
2. **IRT engine is fully implemented but disconnected:** All three IRT functions (`probabilityCorrect`, `selectNextQuestion`, `updateTheta`) exist with tests but are never called in production.
3. **Two readiness score implementations:** The legacy one in `readiness.ts` should be deprecated.
4. **`any` types in mastery-actions.ts:** Lines like `const taxonomyRows = (subjectAreasData ?? []) as Array<{...}>` use `any` input parameters, bypassing type safety.

---

## Files Analyzed

### Core Engine
- `src/lib/srs/irt.ts` -- IRT 2PL model
- `src/lib/srs/irt.test.ts` -- IRT tests
- `src/lib/srs/sm2.ts` -- SM-2 algorithm
- `src/lib/srs/sm2.test.ts` -- SM-2 tests
- `src/lib/srs/retention.ts` -- Ebbinghaus retention curve
- `src/lib/srs/update.ts` -- SRS DB integration
- `src/lib/srs/update.test.ts` -- SRS integration tests

### Readiness & Mastery
- `src/lib/readiness-score.ts` -- Anti-inflation readiness computation (primary)
- `src/lib/actions/readiness-score-update.ts` -- Readiness recomputation server action
- `src/lib/actions/readiness.ts` -- Legacy readiness score (secondary)
- `src/lib/readiness/velocity.ts` -- Score velocity (pts/day)
- `src/lib/readiness/churn.ts` -- Churn risk triple-condition model
- `src/lib/actions/mastery.ts` -- Subject mastery queries
- `src/lib/actions/mastery-actions.ts` -- Subject mastery computation

### Testing Session
- `src/components/testing/session/SessionShell.tsx` -- Session orchestrator
- `src/components/testing/session/CampSessionBehavior.tsx` -- Camp mode behavior
- `src/components/testing/session/ChillSessionBehavior.tsx` -- Chill mode behavior
- `src/components/testing/session/StormSessionBehavior.tsx` -- Storm mode behavior
- `src/components/testing/session/StormTimerBar.tsx` -- Storm timer
- `src/lib/actions/testing.ts` -- Session CRUD + interaction saving
- `src/lib/constants/testing-modes.ts` -- Mode definitions
- `src/types/testing.ts` -- Testing type system

### Blindspot / Focus Review
- `src/lib/blindspot/generate-queue.ts` -- Blindspot queue generation
- `src/lib/blindspot/generate-queue.test.ts` -- Blindspot tests
- `src/components/testing/setup/FocusReviewSetup.tsx` -- Focus Review setup UI

### AI Tutor
- `src/app/api/ai/tutor/route.ts` -- AI tutor API route
- `src/components/quiz/AITutorDrawer.tsx` -- AI tutor UI component
- `src/lib/ai/provider.ts` -- AI provider abstraction
- `src/lib/ai/prompts.ts` -- Prompt templates

### Dashboard
- `src/components/dashboard/TaxonomyHeatmap.tsx` -- Mastery heatmap visualization
- `src/lib/actions/heatmap.ts` -- Heatmap data queries

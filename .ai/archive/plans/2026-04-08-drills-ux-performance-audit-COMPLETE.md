# Quiz/Drills System UX/UI & Performance Audit

**Date:** 2026-04-08
**Status:** CONSENSUS APPROVED (Planner + Architect + Critic)
**Scope:** `/dashboard/drills` entry point, quiz-v2 component tree, quiz store, intelligent routing, session creation, answer submission

---

## Audit Principles

1. **Gesture Reliability Over Aesthetics** — A slide-to-submit that silently fails is worse than an ugly button that works. Every gesture path must have a fallback and clear failure feedback.
2. **Perceived Performance** — The user should never stare at a blank screen. Loading states, skeleton screens, and optimistic UI must cover every async boundary.
3. **Minimal Re-render Surface** — Zustand selectors and memo boundaries must prevent cascade re-renders during the hot path (option select -> submit -> feedback -> next).
4. **Progressive Disclosure** — The drills hub should surface the right action for the user's current state (resume > due SR cycles > configure new) without overwhelming.
5. **Accessibility Parity** — Every gesture-driven interaction must have a keyboard/screen-reader equivalent that is equally discoverable.

---

## Decision Drivers (Priority Order)

1. **SlideToSubmit gesture reliability** — The reported "nothing happens" bug is a conversion-killing defect. Highest priority.
2. **Quiz store render efficiency** — The store drives every frame of the quiz. Selector granularity and persist middleware overhead directly impact responsiveness.
3. **Session creation + answer submission latency** — Sequential DB waterfalls add seconds to critical user actions.

---

## Section 1: SlideToSubmit Gesture Reliability

**Files:** `SlideToSubmit.tsx`, `GestureCaptureZone.tsx`, `OptionsColumn.tsx`

**Identity-Lock Exception:** Findings 1.1 and 1.2 modify gesture configuration parameters of SlideToSubmit. Per architect approval, gesture reliability fixes are in-scope; visual properties (colors, border-radius, handle size), animation physics (easing curves, durations), and haptic feedback remain locked per `identity_preservation_lock.md`. All Section 1 changes require the post-phase visual verification gate defined in that document. Recommend isolating fix 1.2 first, testing, then proceeding to 1.1.

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 1.1 | **Triple `touch-none` nesting** — `GestureCaptureZone` (line 91), `SlideToSubmit` track (line 112), and handle inline `touchAction: 'none'` (line 169). Three nested layers may suppress pointer events on iOS Safari. | HIGH | Needs real device testing before implementing fix |
| 1.2 | **`useDrag` missing `pointer.capture` config** — `{ axis: 'x', filterTaps: true }` but no `pointer: { capture: true }`. Vertical drift loses the gesture silently — most likely root cause of "nothing happens" | HIGH | `SlideToSubmit.tsx:62-88` |
| 1.3 | **`trackWidth` is 0 on first render** — Measured in `useEffect` after first paint. Fast touch before effect fires → `maxOffset` is 0 → slider does nothing | MEDIUM | `SlideToSubmit.tsx:37,40-49,52` |
| 1.4 | **No `onPointerCancel` handler** on GestureCaptureZone — browser cancel leaves `capturingRef` stuck true | MEDIUM | `GestureCaptureZone.tsx:88-95` |
| 1.5 | **Keyboard double-submit risk** — SlideToSubmit handle is `div[role="slider"]` with `aria-hidden="true"`. OptionsColumn keyboard handler (line 75-76) filters INPUT/BUTTON/LABEL but not divs | MEDIUM | `OptionsColumn.tsx:72-82` |
| 1.6 | **Reset effect race condition** — `checked`/`disabled` prev-ref transitions during fast network may cause premature slider reset | LOW | `SlideToSubmit.tsx:92-106` |

**Recommended approach:** Fix 1.2 (pointer capture) first, validate gesture works, then address 1.1 and 1.3.

---

## Section 2: Quiz Store Performance

**File:** `useQuizStore.ts`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 2.1 | **Persist serializes full questions array on every answer change** — Every `selectAnswer`/`setConfidence` mutates `answers` (partialized key), triggering persist to serialize ALL partialized keys including the full `questions` array. 100-question session = 200KB+ per write to synchronous localStorage. **Fix:** Remove `questions` from `partialize` (re-fetched on session init anyway) or add debounced manual persist | HIGH | `useQuizStore.ts:792-804` |
| 2.2 | **In-place answers mutation** — `updateAnswerEntry` mutates `answers` object directly. `answersVersion` counter works around it, but any selector reading `answers` without `answersVersion` misses updates | MEDIUM | `useQuizStore.ts:212-223` |
| 2.3 | **`getAnsweredCount` iterates all answers on every call** — Called in BaseQuizShell render path. With 200 questions, runs on every render | MEDIUM | `useQuizStore.ts:718-724`, `BaseQuizShell.tsx:135` |
| 2.4 | **`flaggedSet` (Set) not persisted** — `JSON.stringify(Set)` = `{}`. Not in `partialize` so not a bug, but `merge` rebuilds it from answers. No action needed | LOW | Informational |
| 2.5 | **`addQuestions` copies reference then mutates** — `const nextAnswers = answers` then mutates. Single-threaded JS prevents interleaving, so not a real bug in practice | LOW | `useQuizStore.ts:612,618` |

---

## Section 3: Session Creation Performance

**File:** `start-session.ts`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 3.1 | **Sequential taxonomy tree traversal** — Up to 4 sequential DB round-trips for topic resolution + 3 more for cross-ref resolution. Worst case: 7 sequential queries before any questions are fetched | HIGH | `start-session.ts:152-171,188-204` |
| 3.2 | **No taxonomy caching** — Static tree re-fetched on every session start. Repeat users pay full cost each time | MEDIUM | No caching layer visible |
| 3.3 | **`recentInteractions` query has NO `.limit()`** — Active users (50 questions/day for a month = ~1,500 rows) transferred unbounded. Easy fix: add `.limit(1000)` | HIGH | `start-session.ts:117-122` |
| 3.4 | **Duplicate interaction fetch** — `intelligent-routing.ts:104-108` re-fetches `user_interactions` with `.limit(1000)`. `start-session.ts` already has this data but doesn't pass it through | MEDIUM | Both files query same table |
| 3.5 | **Taxonomy breadcrumb map runs sequentially** — Could run in parallel with session DB insert | LOW | `start-session.ts:269` |

---

## Section 4: BaseQuizShell & StandardQuizShell UX

**Files:** `BaseQuizShell.tsx`, `StandardQuizShell.tsx`, `QuizBody.tsx`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 4.1 | **Loading skeleton lacks context** — Generic skeleton with no mode label, subject, or question count. User has no context about what's loading | MEDIUM | `BaseQuizShell.tsx:166-177` |
| 4.2 | **`currentQuestion!` non-null assertion** — Two uses in StandardQuizShell without guard. If `currentQuestion` is undefined during prefetch race, runtime crash | MEDIUM | `StandardQuizShell.tsx:199,204` |
| 4.3 | **Background prefetch fires unconditionally** — Effect setup/teardown runs even when all questions loaded. `remainingIds` check prevents redundant fetches but effect overhead remains | LOW | `StandardQuizShell.tsx:128-149` |
| 4.4 | **Direction ref may be stale** — `directionRef.current` returned as snapshot during render. However, `goNext()`/`goPrevious()` trigger re-renders where the new value is read. Needs practical verification before fixing | LOW | `useQuizShellHandlers.ts:112` — Verify if stale animations actually occur |
| 4.5 | **`120px` magic number** — Hardcoded header+footer height assumption | LOW | `QuizBody.tsx:45` |

---

## Section 5: HeroConfigurator & Session Preparation Modal

**Files:** `HeroConfigurator.tsx`, `ReviewHub.tsx`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 5.1 | **Session preparation modal is well-designed (POSITIVE)** — Two-phase (preparing → ready) with spinner, status text, clear CTA. Keep this pattern | POSITIVE | User confirmed they like it |
| 5.2 | **`window.location.href` forces full page reload** — Loses client state, adds ~1-2s vs client-side navigation. Was needed because `router.push` was unreliable, but should investigate `router.push` + `router.refresh()` as alternative | MEDIUM | `HeroConfigurator.tsx:141` |
| 5.3 | **`rounded-xl` violates design system** — Max is `rounded-lg` for modals, `rounded-md` for cards | LOW | `HeroConfigurator.tsx:155` |
| 5.4 | **Modal lacks focus trap, Escape key, ARIA attributes** — Raw `div` overlay, not `<Dialog>`. No `aria-modal`, `role="dialog"`, focus trap, or Escape dismiss | MEDIUM | `HeroConfigurator.tsx:311-394` |
| 5.5 | **Tooltip on disabled SlideToSubmit fragile on mobile** — `onClickCapture` may not fire reliably with `touch-none` | LOW | `HeroConfigurator.tsx:278-304` |
| 5.6 | **Inline style `backgroundColor: 'var(--background)'`** — Should be `className="bg-background"` | LOW | `ReviewHub.tsx:308` |
| 5.7 | **Stale `useMemo` dependency** — `simulationGateStatus.isUnlocked` in `hubSignals` dep array but not used in memo body. Remove from deps. Note: `simulationGateStatus` IS actively used elsewhere (line 480) and must NOT be removed | LOW | `ReviewHub.tsx:305` |

---

## Section 6: Intelligent Routing Performance

**File:** `intelligent-routing.ts`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 6.1 | **Over-fetches then discards** — Each chunk fetches `limit` rows, all shuffled and sliced. 200 topic IDs = up to 2x needed rows transferred | MEDIUM | `intelligent-routing.ts:39,73` |
| 6.2 | **JS-side filtering above 100 interactions** — Below 100, DB-level filter applied. Above 100, entire pool fetched and filtered in JS | MEDIUM | `intelligent-routing.ts:137-139` |
| 6.3 | **Double Fisher-Yates shuffle** — Shuffled inside `queryQuestionsChunked` (lines 68-71) and again on final pool (lines 214-217). First shuffle is unnecessary | LOW | Two locations |
| 6.4 | **`any` types throughout** — Bypasses TypeScript safety on query returns | LOW | Lines 147, 157, return types |

---

## Section 7: Answer Submission Latency (Architect-mandated)

**File:** `submit-answer.ts`

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 7.1 | **Sequential waterfall on hot path** — `getUser()` → `createServiceClient()` → `getOwnedSessionOrThrow()` → question fetch → correctness check → interaction upsert → error classification. All sequential before response | HIGH | `submit-answer.ts:85-280` |
| 7.2 | **`after()` pattern correctly defers background work (POSITIVE)** — SRS updates, signal trace storage, SR processing run in `after()` callback. Good pattern — do not change | POSITIVE | `submit-answer.ts:397-403` |
| 7.3 | **`endSession` piggybacks on final answer submission** — When quiz completes, `endSessionAction` runs synchronously before the final answer's response returns, adding end-session latency to the user's last submit | MEDIUM | Called from `useQuizShellHandlers.ts` |
| 7.4 | **No caching of session config between submit calls** — Each submit re-fetches session config from DB. 50-question session = 50 identical session fetches | MEDIUM | `submit-answer.ts:93-98` |

---

## Performance Checklist

### Client-Side
- [ ] Option select → re-render: only OptionsColumn + QuizFooter, NOT QuestionColumn/QuizHeader/BaseQuizShell
- [ ] SlideToSubmit drag: 55+ fps, no layout thrashing from `setOffset`
- [ ] Question navigation (Next): under 100ms from click to new question visible
- [ ] localStorage writes: not happening during drag (`offset` not in `partialize`)
- [ ] Memory: after 100-question session, heap shows no retained questions from prior sessions

### Server-Side
- [ ] **Step 0: Measure current baselines before any changes**
- [ ] `startSession` total wall time: target < 2s for 50 questions, 12 topics
- [ ] Supabase query count per session start: current ~8-12, target < 8
- [ ] `submitAnswer` wall time: target < 500ms for non-final questions
- [ ] No duplicate `user_interactions` queries between start-session and intelligent-routing

### Drills Page Load
- [ ] Suspense skeleton shows immediately
- [ ] All parallel queries resolve within 1.5s
- [ ] No hydration mismatch warnings
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## Execution Priority

1. **Section 1: SlideToSubmit gesture** (fix 1.2 first, validate, then 1.1/1.3)
2. **Section 7: submitAnswer latency** (hot path optimization)
3. **Section 2: Quiz store persist** (remove `questions` from `partialize`)
4. **Section 3: Session creation** (add `.limit(1000)`, parallelize breadcrumb+insert)
5. **Section 5: Modal a11y** (focus trap, Escape, ARIA)
6. **Section 4: Shell UX polish**
7. **Section 6: Routing optimization**

---

## Consensus Review Trail

- **Planner:** Created 6-section audit with 33 findings across UX, performance, and accessibility
- **Architect:** APPROVED with 3 amendments — identity-lock exception language, 3.3 severity upgrade to HIGH, Section 7 for submitAnswer audit, verify 4.4 in practice
- **Critic:** REVISE — incorporated all architect amendments, clarified 2.1 persist mechanism, corrected 5.7 dead-code implication, added Section 7, recommended isolating gesture fixes

All amendments incorporated in this final document.

# SlateCamp Quiz Engine — Unification & Feature Improvement Plan

> **Scope:** Cross-reference of the UI/UX Psychology Blueprints (quiz-ui-design-blueprint.md, quiz-ux-user-paths.md, quiz-ui-ux-research-blueprint.md) against the technical audit (QUIZ-TESTING-AUDIT.md) to produce a developer-ready gap analysis and implementation plan.
> **Date:** 2026-04-01
> **Output format:** Implementation-ready Markdown — component map, state gap tables, and checkbox task lists.

---

# Part 1 — Gap Analysis

## 1.1 Zustand Store — Missing and Misaligned State Fields

### 1.1.1 `feedback` Slice — Server Response Fields Not Persisted

The `submitAnswer` server action returns the following shape:

```
{ isCorrect, correctOptionId, rationale, wikiUrl, errorDiagnostic, closeness, correctAnswer }
```

The current `feedback` slice in `useQuizStore` maps only:

```
{ visible, questionId, isCorrect, correctOptionId, rationale, wikiUrl }
```

**Three server-returned fields are dropped before they reach any component:**

| Missing Field | Server Source | Blueprint Requirement | Impact |
|---|---|---|---|
| `errorDiagnostic` | `submitAnswer` return | Blueprint §3.1: personalized feedback based on error type | `FeedbackPanel` cannot vary its language for `'careless'` vs `'lack_knowledge'` errors |
| `closeness` | `submitAnswer` return | Blueprint §4.5: contextual feedback for numerical question types | `closeness` UI (e.g., "You were 2 off") is architecturally impossible without this field |
| `correctAnswer` | `submitAnswer` return | Blueprint §3.1: display correct value for numerical/open types | Correct answer cannot be shown for non-MCQ question types |

---

### 1.1.2 Missing Store Fields — Per-Question State Machine

**Blueprint requirement (quiz-ui-ux-research-blueprint.md §3):** "Model each question as a deterministic state machine: `idle → selected → submitted → feedback → next`."

**Audit finding:** The session-level `status: 'idle' | 'active' | 'feedback' | 'results'` is a macro state. Per-question state is currently inferred by reading multiple fields across the `answers` map (`selectedOptionId`, `submittedAt`, `isCorrect`). There is no single authoritative per-question status enum.

This creates the following unhandled edge-case UI states:

| Edge Case | Risk |
|---|---|
| User submits, server is slow — is the option in `selected` or `submitted`? | `SlideToSubmit` spinner state and option lock are decoupled |
| Feedback dismissed but `goNext()` not yet called | Transition animation can fire on a question still in `feedback` state |
| Back-navigation to a previously submitted question | No explicit state distinguishing `submitted-reviewed` from `active-pending` |

**Missing field:** `questionStatus` per entry in the `answers` map.

---

### 1.1.3 Missing Store Fields — Feedback Gate

**Audit (Step 3.16):** The "Next" button is disabled for `gatedProgressionDelayMs` and a countdown is visible.

**Audit store shape:** No `feedbackGateActive: boolean` or `feedbackGateRemainingMs: number` field appears in the `feedback` or `ui` slice.

**Risk:** The gate timer is managed locally inside `FeedbackPanel` with no store-level source of truth, making it impossible to:
- Pause the gate on a `MicroBreakOverlay` interrupt.
- Correctly restore gate state after a browser background/foreground cycle (the store uses `persist` middleware).
- Expose the remaining delay to other components (e.g., a progress ring on the Next button).

---

### 1.1.4 Missing Store Fields — Live Streak Counter

**Blueprint (quiz-ui-design-blueprint.md §3.5):** "A persistent `🔥 streak: N` counter in the top bar that increments per consecutive correct answer and resets (with a subtle shake animation) on error."

**Audit store shape:** No `streakCount: number` field. The `ExitConfirmModal` and answer submission logic have no streak awareness. The `QuizHeader` has no streak display.

**Note:** The `error_type: 'lucky_guess'` classification exists in the async error pipeline — this implies the streak logic would need to exclude lucky guesses from incrementing the counter. This dependency must be defined before implementation.

---

### 1.1.5 Missing Store Fields — Haptic and Motion Settings

**Blueprint (quiz-ui-design-blueprint.md §3.6):** "Provide a toggle in settings to disable haptic feedback."
**Blueprint (quiz-ux-user-paths.md §10):** "`prefers-reduced-motion` media query — all animations become instant transitions if enabled."

**Audit finding:** No `settings` slice or `hapticEnabled` / `reducedMotion` preference field exists in `useQuizStore`. No `persist`-managed user preference for motion is documented.

---

### 1.1.6 Full Store Gap Summary Table

| Missing Field | Proposed Slice | Type | Source/Trigger |
|---|---|---|---|
| `errorDiagnostic` | `feedback` | `string \| null` | `submitAnswer` server response |
| `closeness` | `feedback` | `number \| null` | `submitAnswer` server response |
| `correctAnswer` | `feedback` | `string \| null` | `submitAnswer` server response |
| `questionStatus` | `answers` map (per entry) | `'idle' \| 'selected' \| 'submitted' \| 'feedback' \| 'reviewed'` | Derived from user action pipeline |
| `feedbackGateActive` | `feedback` | `boolean` | Set `true` on `showFeedback()`, `false` on gate expiry |
| `feedbackGateRemainingMs` | `feedback` | `number` | Countdown from `gatedProgressionDelayMs` |
| `streakCount` | `session` | `number` | Incremented by `submitCurrentAnswer()` on correct non-lucky-guess |
| `streakBroken` | `session` | `boolean` | Transient flag for shake animation trigger |
| `settings.hapticEnabled` | `settings` (new slice) | `boolean` | Persisted user preference |
| `settings.reducedMotion` | `settings` (new slice) | `boolean` | Initialized from `window.matchMedia('prefers-reduced-motion')`, overridable |

---

## 1.2 UI Component Gaps

### 1.2.1 `FeedbackPanel` — Error-Type-Aware Language

**Blueprint (quiz-ui-design-blueprint.md §3.1):** Feedback language must be framed around correct information. Blueprint §4.1 (adaptive UI) and audit error classification pipeline together imply that `FeedbackPanel` should vary its introductory line based on `error_type`.

**Audit finding:** `FeedbackPanel` renders a fixed heading: `"Correct"` (green) or `"Not quite"` (amber). The `errorDiagnostic` field returned by the server and the async `error_type` classification (`'careless'`, `'lack_time'`, `'lack_knowledge'`, `'lucky_guess'`) are never surfaced in the component.

**Gap:** `FeedbackPanel` does not consume `errorDiagnostic` or adapt its heading, body copy, or visual treatment to the error type.

**Required language mapping (derived strictly from audit error types + blueprint positive-framing rule):**

| `error_type` | Heading | Subtext Frame |
|---|---|---|
| `'lack_knowledge'` | "Here's what to know" | Focus on rationale for correct answer |
| `'careless'` | "Watch closely" | Brief note to slow down; then correct answer rationale |
| `'lack_time'` | "You needed more time" | Normalize time pressure; correct answer rationale |
| `'lucky_guess'` (on correct) | "Correct!" | Standard correct treatment |
| `null` (default) | "Not quite" | Standard incorrect treatment |

---

### 1.2.2 Missing `QuestionSkeleton` Component

**Blueprint (quiz-ui-design-blueprint.md §4.3):** "Always render `SkeletonCard` components during question fetching — 3 placeholder lines for question stem, 4 placeholder answer blocks."
**Blueprint (quiz-ux-user-paths.md §2.1):** Loading/skeleton screens: 500–1000ms. "No blank white screens at any point."

**Audit finding:** `QuizShell.tsx` renders questions from the pre-fetched `questions[]` array in the store (loaded at session start). There is no documented inter-question loading state or skeleton component. The transition between questions is driven by `currentIndex` increment — no async gap exists in the standard flow.

**Partial gap:** The skeleton is only needed for:
1. The initial question load from `initSession()` (before `questions[]` is populated).
2. Any future architecture where questions are fetched lazily (e.g., for the 200-question Full Exam mode where eager loading all questions may be undesirable).

**Required:** A `QuestionSkeleton` component for the `initSession()` loading window. The current file index shows no such component.

---

### 1.2.3 Missing `ClosenessIndicator` Component

**Audit (4.2):** Server returns `closeness` for numerical/open-ended question types (`correct_value`, `value_tolerance`, `accepted_answers` in questions table).

**Audit (quiz types):** `question_type` field on questions implies non-MCQ types exist.

**Audit file index:** No `ClosenessIndicator` or `NumericalFeedback` component is listed.

**Blueprint requirement (§3.1):** Feedback must convey correct information. For numerical types, "how close" the user was is the primary learning signal.

**Gap:** Numerical question types have no feedback UI for proximity to correct value.

---

### 1.2.4 Timer Threshold Mismatch

**Blueprint (quiz-ui-design-blueprint.md §3.7):** "Amber at 50% time remaining. Red at 20% remaining."
**Blueprint (quiz-ux-user-paths.md, Timer Component):** `[Full / Green] → [~50% / Neutral] → [25% / Yellow Warning] → [10% / Red Pulsing] → [0 / Frozen]`

**Audit (Phase 3, Timer Behavior):** "At <10% remaining, display turns warning color."

**Gap:** The audit implements a single threshold at <10%. The blueprint specifies a two-stage transition (amber at ~50%, red at 20–25%). The `tickTimer()` action has no multi-threshold color state logic.

**Affected component:** `QuizHeader.tsx` (timer display) and `tickTimer()` in `useQuizStore`.

---

### 1.2.5 Timer Auto-Submit Action — No Store Action Defined

**Audit (Phase 3, Timer Behavior):** "At 0, auto-submits remaining answers."

**Audit store actions table:** No `autoSubmitAll()` or `handleTimerExpiry()` action is listed.

**Gap:** The path from `tickTimer()` reaching `limitMs` to `endSession()` being called is not documented as a store action. This creates an unhandled state transition: the timer reaching 0 does not have an explicit action in the Zustand store shape.

---

### 1.2.6 Missing Accessibility: `prefers-reduced-motion` Guard

**Blueprint (quiz-ux-user-paths.md §10):** "Animations respect `prefers-reduced-motion` media query — all animations become instant transitions if enabled."

**Audit finding:** The following components contain explicit animation specs with no motion-reduction guard documented:
- `SlideToSubmit.tsx` — drag animation
- `FeedbackPanel.tsx` — slide-in below options
- `QuestionPalette.tsx` — slide-in from right
- `MicroBreakOverlay.tsx` — fullscreen overlay
- All answer option state transitions (scale, shake, pulse)

**Gap:** No `@media (prefers-reduced-motion: reduce)` or `useReducedMotion()` hook usage is documented in any component in the audit.

---

### 1.2.7 Semantic Color Token Misalignment

**Blueprint defines (quiz-ui-design-blueprint.md §2.3):**
```css
--color-state-correct:    #22C55E;
--color-state-incorrect:  #EF4444;
--color-state-active:     #3B82F6;
--color-primary:          #3B82F6;
```

**Audit implements:**
- Selected option: `#EEF2FC` bg, `#1B3FC4` border (Camp Cobalt)
- Correct: `#EDFAF4` bg, `#2D9F6F` border
- Incorrect: `#FDF0F0` bg, `#D64545` border
- Answered palette cell: `#1B3FC4` (Camp Cobalt)

**Gap:** The audit's in-use color values are not the blueprint's semantic token values. `Camp Cobalt (#1B3FC4)` is the SlateCamp brand primary, while the blueprint specifies a generic `#3B82F6`. These must be reconciled into a single design token layer. The semantic token system specified in the blueprint (`--color-state-correct`, `--color-state-incorrect`, etc.) must be verified as implemented with the correct SlateCamp-specific values, or the blueprint tokens must be updated to reflect the brand system.

**Action required (design decision, not a code change):** Confirm whether blueprint tokens should adopt SlateCamp brand values or whether in-use values should be migrated to blueprint values. Until this decision is made, implementation tasks referencing color should use audit values as current ground truth.

---

### 1.2.8 Missing `HintButton` / Hint Expansion System

**Blueprint (quiz-ui-design-blueprint.md §3.4):** "Optionally expose a `<HintButton>` that, on click, expands a hint tooltip or inline callout below the question stem. Only render this control for formative (non-graded) quizzes."

**Audit finding:** No `HintButton` component is listed in the file index. No `hint` field appears in the question data structure returned by `startSession`. No hint-related action is in the Zustand store.

**Gap:** The hint system is entirely absent from the implementation. Two pre-conditions must be satisfied before this feature can be built:
1. A `hint_text` (or equivalent) column must exist in the `questions` table.
2. A `hintRevealed: boolean` field per question must be added to `QuizAnswerState`.

**DATA INSUFFICIENCY NOTE:** The audit does not confirm whether `hint_text` exists in the `questions` table schema. The listed columns for `startSession` reads include `question_id`, `topic_id`, `text`, `options`, `difficulty`, `prompt_image_url`, `question_type` — no `hint` column is shown. This point cannot be fully resolved from available documents. A database schema inspection is required before the `HintButton` implementation task can be finalized.

---

### 1.2.9 Postdiction UI — Missing from Phase 4

**Audit (Phase 2, §2.15):** The prediction slider exists pre-quiz for Storm/Full Exam/Extended modes.
**Audit (4.4 Background Processing):** `save-postdiction.ts` server action exists.
**Audit (Phase 4 §3):** Results include a `PredictionComparison` component for Storm/Full Exam/Extended.

**Gap:** There is no documented UI step for capturing the post-quiz postdiction score. The `save-postdiction.ts` action exists but has no mapped user interaction in Phase 4. The `PredictionComparison` component displays a pre/post comparison but it is unclear from audit data whether the postdiction value is:
1. Captured via a UI interaction at results entry (before score is revealed), or
2. Inferred from another data point, or
3. Never captured, making `save-postdiction.ts` a dead code path.

**Action required:** Add a postdiction capture step between `endSession()` response and `ScoreReveal` render for modes where `prediction` is configured. This is a missing UX state in the Phase 3 → Phase 4 transition.

---

### 1.2.10 `FeedForwardCards` — AI Content Source Undefined

**Audit (Phase 4, Section 8):** `FeedForwardCards` renders "AI-generated next steps: suggested quiz mode, wiki articles to review, weak topics to revisit."

**Audit server action index:** No `generate-recommendations.ts` or equivalent AI endpoint is listed.

**Blueprint (§4.2):** "Use AI to dynamically compose" and "always validate AI-generated questions against a knowledge graph."

**Gap:** The content source for `FeedForwardCards` is unresolved. If recommendations are computed algorithmically from `EndSessionResult.recommendations[]`, the "AI-generated" label in the audit is marketing copy and no action is needed. If a live LLM call is intended, no server action or API route is documented.

**DATA INSUFFICIENCY NOTE:** Available documents do not confirm whether `recommendations[]` in `EndSessionResult` is LLM-generated or rule-based. This point cannot be closed from available documents.

---

## 1.3 Missing UI Interaction Coverage

### 1.3.1 XP Floating Delta Animation

**Blueprint (quiz-ui-design-blueprint.md §3.3):** "Display a floating `+XP` or score delta that animates upward and fades out (`opacity: 0` + `translateY: -20px` over 600ms)."

**Audit finding:** No `XPDeltaFloat` or equivalent component in the file index. No `xp` or `xpDelta` field in the Zustand store.

**Dependency:** An XP or score delta value must be returned in the `submitAnswer` or `endSession` response to power this animation. The audit does not show this in either response shape.

---

### 1.3.2 Progress Bar Halfway Glow

**Blueprint (quiz-ux-user-paths.md §8.4):** "Halfway milestone: Bar pulses/glows briefly (500ms)."

**Audit finding:** Progress bar exists in `QuizHeader.tsx`. No halfway-glow trigger or state field is documented.

---

# Part 2 — Feature Improvement Plan

## Priority Framework

| Priority | Criterion |
|---|---|
| **P0 — Critical** | Breaks the core feedback loop, creates contradictory UI states, or causes data loss |
| **P1 — High** | Direct cognitive load impact or accessibility violation per blueprint rules |
| **P2 — Medium** | Feature completeness against blueprint specification |
| **P3 — Low** | Polish, gamification, and enhancement items |

---

## 2.1 P0 — Critical: Core Feedback Loop & State Integrity

### Gap → Fix Map

| # | Gap (from Part 1) | Fix Summary |
|---|---|---|
| C1 | `feedback` slice missing `errorDiagnostic`, `closeness`, `correctAnswer` | Extend `feedback` slice; map all server response fields |
| C2 | No per-question `questionStatus` state machine | Add `questionStatus` to `QuizAnswerState` |
| C3 | Feedback gate has no store-level state | Add `feedbackGateActive` and `feedbackGateRemainingMs` to `feedback` slice |
| C4 | `autoSubmitAll()` / timer expiry action undefined | Add `handleTimerExpiry()` action to store |
| C5 | Timer color thresholds: <10% only (blueprint: 50%/20%) | Fix `tickTimer()` to emit multi-threshold color state |
| C6 | Postdiction UI step missing (dead `save-postdiction.ts` code path) | Add postdiction capture screen between Phase 3 and Phase 4 |

---

## 2.2 P1 — High: Cognitive Load & Accessibility

### Gap → Fix Map

| # | Gap (from Part 1) | Fix Summary |
|---|---|---|
| H1 | `FeedbackPanel` uses fixed heading regardless of error type | Add error-type-aware language mapping to `FeedbackPanel` |
| H2 | `prefers-reduced-motion` unguarded across all animated components | Add `useReducedMotion` hook; conditionally disable all keyframe animations |
| H3 | Haptic patterns not differentiated for correct vs. incorrect | Implement pattern map in `SlideToSubmit` → answer feedback pipeline |
| H4 | No haptic settings toggle in store | Add `settings` slice with `hapticEnabled` |
| H5 | No `QuestionSkeleton` for `initSession()` loading window | Build `QuestionSkeleton` component; render during `status === 'idle'` |
| H6 | Color token values misaligned between blueprint and audit | Reconcile design token layer (requires design decision — see §1.2.7) |

---

## 2.3 P2 — Medium: Feature Completeness

### Gap → Fix Map

| # | Gap (from Part 1) | Fix Summary |
|---|---|---|
| M1 | `closeness` has no display component | Build `ClosenessIndicator` for numerical question types |
| M2 | Streak counter absent from store and `QuizHeader` | Add `streakCount` + `streakBroken` to store; render in `QuizHeader` |
| M3 | XP floating delta animation has no component or data source | Build `XPDeltaFloat` component (pending confirmation of delta value in server response) |
| M4 | Progress bar halfway-glow not implemented | Add halfway trigger to progress bar animation in `QuizHeader` |
| M5 | `HintButton` absent (pending DB schema verification) | Build after `hint_text` column is confirmed in `questions` table |

---

## 2.4 P3 — Low: Polish & Enhancement

### Gap → Fix Map

| # | Gap | Fix Summary |
|---|---|---|
| L1 | `FeedForwardCards` content source unresolved | Confirm rule-based vs. LLM; document endpoint if LLM |
| L2 | Focus trap not confirmed for `ExitConfirmModal` and `SubmitConfirmModal` | Audit and add `focus-trap-react` or equivalent to both modals |
| L3 | Subject domain accent color system not implemented (blueprint §2.4) | Assign persistent per-subject accent color tokens; apply to topic pills and progress rings |
| L4 | Timer bar variant (4px thin horizontal) not available | Implement as configurable variant on `TimerDisplay` component |

---

# Part 3 — Developer Implementation Checklist

## BLOCK 1 — Zustand Store (`src/stores/useQuizStore.ts`)

### `feedback` Slice Extension

- [ ] **C1a** Add `errorDiagnostic: string | null` to `feedback` slice type definition
- [ ] **C1b** Add `closeness: number | null` to `feedback` slice type definition
- [ ] **C1c** Add `correctAnswer: string | null` to `feedback` slice type definition
- [ ] **C1d** Update `showFeedback(data)` action to map all three new fields from server response
- [ ] **C3a** Add `feedbackGateActive: boolean` to `feedback` slice (default: `false`)
- [ ] **C3b** Add `feedbackGateRemainingMs: number` to `feedback` slice (default: `0`)
- [ ] **C3c** Add `startFeedbackGate(durationMs: number)` action — sets `feedbackGateActive: true`, initializes `feedbackGateRemainingMs`
- [ ] **C3d** Add `tickFeedbackGate()` action — decrements `feedbackGateRemainingMs` by 100ms; sets `feedbackGateActive: false` when reaches 0
- [ ] **C3e** Add `clearFeedbackGate()` action — called by `hideFeedback()`; resets gate fields

### `answers` Map — Per-Question State Machine

- [ ] **C2a** Add `questionStatus: 'idle' | 'selected' | 'submitted' | 'feedback' | 'reviewed'` to `QuizAnswerState` type in `src/types/quiz-config.ts`
- [ ] **C2b** Update `selectAnswer()` to set `questionStatus: 'selected'`
- [ ] **C2c** Update `submitCurrentAnswer()` to set `questionStatus: 'submitted'` before server call fires
- [ ] **C2d** Update `showFeedback()` to set `questionStatus: 'feedback'` on the current question's answer entry
- [ ] **C2e** Update `hideFeedback()` / `goNext()` to set prior question's `questionStatus: 'reviewed'`
- [ ] **C2f** Update `goPrevious()` / `goToQuestion()` to correctly derive display state from `questionStatus` when navigating back

### Timer Actions

- [ ] **C4a** Add `handleTimerExpiry()` action — called when `elapsedMs >= limitMs` in countdown mode inside `tickTimer()`
- [ ] **C4b** `handleTimerExpiry()` must: set `timer.isRunning = false`; call `endSession()` server action; set `ui.calculatingResults: true`
- [ ] **C4c** Add `timerColorState: 'normal' | 'warning' | 'critical'` to `timer` slice
- [ ] **C4d** Update `tickTimer()` to compute `percentRemaining = (limitMs - elapsedMs) / limitMs` and set `timerColorState: 'warning'` at ≤50%, `'critical'` at ≤20%
- [ ] **C4e** Remove the existing single-threshold <10% logic from `QuizHeader.tsx` and replace with `timerColorState` from store

### Session Gamification Fields

- [ ] **M2a** Add `streakCount: number` to session slice (default: `0`)
- [ ] **M2b** Add `streakBroken: boolean` to session slice (transient flag, default: `false`)
- [ ] **M2c** Update `submitCurrentAnswer()`: increment `streakCount` on `isCorrect === true` AND `is_suspected_lucky_guess === false`; reset `streakCount` to `0` and set `streakBroken: true` on incorrect answer
- [ ] **M2d** Add `clearStreakBroken()` action — called after shake animation completes in `QuizHeader`

### Settings Slice (New)

- [ ] **H4a** Add `settings` slice to `useQuizStore` with fields: `hapticEnabled: boolean` (default: `true`), `reducedMotion: boolean`
- [ ] **H4b** Initialize `settings.reducedMotion` from `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in store hydration
- [ ] **H4c** Ensure `settings` slice is included in `persist` middleware configuration so preferences survive sessions
- [ ] **H4d** Add `updateSettings(partial: Partial<Settings>)` action

---

## BLOCK 2 — `FeedbackPanel.tsx` (`src/components/quiz-v2/FeedbackPanel.tsx`)

- [ ] **H1a** Import `errorDiagnostic` from the `feedback` slice via `useQuizStore`
- [ ] **H1b** Define error-type-to-heading map (see §1.2.1 table) as a `const` object at module level
- [ ] **H1c** Replace the hardcoded `"Not quite"` heading with a lookup against the error-type map using `errorDiagnostic` value
- [ ] **H1d** For `errorDiagnostic === null` (default / pending async classification), use current fallback: `"Not quite"` for incorrect, `"Correct!"` for correct
- [ ] **H1e** Add `ClosenessIndicator` sub-component mount condition: render only when `closeness !== null` (numerical question types)
- [ ] **H1f** For correct-answer display: render `correctAnswer` field when `question_type !== 'mcq'` (guard against undefined for MCQ types)
- [ ] **C3f** Move feedback gate countdown tick out of local component state into `tickFeedbackGate()` store action — use a `useEffect` interval that calls the store action
- [ ] **C3g** Read `feedbackGateActive` and `feedbackGateRemainingMs` from store to control Next button disabled state and countdown display

---

## BLOCK 3 — `QuizHeader.tsx` (`src/components/quiz-v2/QuizHeader.tsx`)

- [ ] **C4e** Replace local timer color threshold logic with `timerColorState` from store (`'normal'` → default style, `'warning'` → amber, `'critical'` → red)
- [ ] **M2e** Add `StreakCounter` sub-component to `QuizHeader`: displays `🔥 {streakCount}` when `streakCount > 0`; renders shake animation when `streakBroken === true`; calls `clearStreakBroken()` after animation completes
- [ ] **M2f** Apply `aria-label="Current streak: {streakCount} correct answers"` to streak counter element
- [ ] **M4a** Add halfway-glow trigger to `ProgressBar`: compute `halfwayReached = currentIndex === Math.floor(totalQuestions / 2)` and apply a one-shot pulse CSS class when true

---

## BLOCK 4 — `SlideToSubmit.tsx` and Haptic Feedback

- [ ] **H3a** Create a `haptics.ts` utility module at `src/lib/quiz/haptics.ts` exporting three functions: `hapticSelect()` (light, 10ms), `hapticCorrect()` (10ms), `hapticIncorrect()` (pattern: 20ms, 50ms off, 20ms)
- [ ] **H3b** All haptic calls must be guarded: `if (useQuizStore.getState().settings.hapticEnabled && navigator.vibrate) { ... }`
- [ ] **H3c** In `SlideToSubmit.tsx`: the existing `navigator.vibrate()` at 80% threshold should call `hapticSelect()` (confirming gesture completion), not a correctness haptic — this is the correct semantics per blueprint §3.6
- [ ] **H3d** In `FeedbackPanel.tsx`: call `hapticCorrect()` when `isCorrect === true`; call `hapticIncorrect()` when `isCorrect === false`; both calls are triggered immediately after `showFeedback()` resolves (Phase 1 feedback: ≤100ms)

---

## BLOCK 5 — Animation Guards (`prefers-reduced-motion`)

- [ ] **H2a** Create `useReducedMotion()` hook at `src/hooks/useReducedMotion.ts` — returns `boolean` derived from `useQuizStore(s => s.settings.reducedMotion)`
- [ ] **H2b** In `FeedbackPanel.tsx`: wrap `max-height` expand animation in reduced-motion guard — apply instant show when `reducedMotion === true`
- [ ] **H2c** In `QuestionPalette.tsx`: wrap slide-in transform in reduced-motion guard — use `opacity` only (no translate) when `reducedMotion === true`
- [ ] **H2d** In `QuizOption.tsx`: wrap scale pulse (correct) and shake (incorrect) animations in reduced-motion guard — replace with border-flash only when `reducedMotion === true`
- [ ] **H2e** In `MicroBreakOverlay.tsx`: wrap fullscreen entrance animation in reduced-motion guard
- [ ] **H2f** In all Framer Motion `variants` objects: add `reducedMotion` check to replace `x`/`y`/`scale` values with `0`/`1` when guard is active

---

## BLOCK 6 — New Components

### `QuestionSkeleton.tsx`

- [ ] **H5a** Create `src/components/quiz-v2/QuestionSkeleton.tsx`
- [ ] **H5b** Render 3 placeholder skeleton lines for question stem (varying widths: 100%, 80%, 60%)
- [ ] **H5c** Render 4 placeholder skeleton blocks for answer options (uniform height matching `QuizOption` height)
- [ ] **H5d** Use `animate-pulse` (Tailwind) or equivalent shimmer animation — guard with `useReducedMotion()`
- [ ] **H5e** Mount condition in `QuizShell.tsx`: render `<QuestionSkeleton />` when `status === 'idle'` (before `initSession()` resolves)

### `ClosenessIndicator.tsx`

- [ ] **M1a** Create `src/components/quiz-v2/ClosenessIndicator.tsx`
- [ ] **M1b** Props: `{ closeness: number, correctAnswer: string, userAnswer: string }`
- [ ] **M1c** Render: "You answered `{userAnswer}`. The correct value is `{correctAnswer}` (off by `{closeness}`)."
- [ ] **M1d** Mount condition in `FeedbackPanel`: render only when `closeness !== null`
- [ ] **M1e** Apply `--color-state-caution` border styling for near-miss values; `--color-state-incorrect` for large deviations (threshold TBD by content team)

---

## BLOCK 7 — Phase 4: Postdiction Capture (`Phase 3 → Phase 4 Transition`)

- [ ] **C6a** Add a `PostdictionScreen` component at `src/components/quiz-v2/PostdictionScreen.tsx`
- [ ] **C6b** Mount condition: render between `endSession()` response receipt and `ResultsDashboard` render, only for modes where `config.prediction.enabled === true`
- [ ] **C6c** UI: a 0–100 slider labeled "Before seeing your results, how do you think you did?" with a single CTA "Reveal My Score"
- [ ] **C6d** On CTA click: call `savePostdiction(sessionId, postdictionScore)` server action, then render `ResultsDashboard`
- [ ] **C6e** If user navigates directly to results URL (skipping postdiction): call `savePostdiction` with `postdictionScore: null` to mark as skipped — prevents `save-postdiction.ts` remaining a dead code path

---

## BLOCK 8 — Accessibility Completions

- [ ] **L2a** Audit `ExitConfirmModal.tsx` for focus trap: confirm `focus-trap-react` or `radix-ui/dialog` is used and configured with `initialFocus` on the safe action ("Continue session")
- [ ] **L2b** Audit `SubmitConfirmModal.tsx` for focus trap: confirm same as above with `initialFocus` on "Review unanswered"
- [ ] Confirm all interactive elements in `QuestionPalette.tsx` have `aria-label` attributes (cell states: answered, flagged, current, skipped)
- [ ] Confirm `ProgressBar` has `role="progressbar"`, `aria-valuenow`, `aria-valuemax`, `aria-valuemin` attributes in `QuizHeader.tsx`
- [ ] Add `aria-live="polite"` region to `FeedbackPanel` so screen readers announce correctness without requiring focus shift

---

## BLOCK 9 — Design Token Reconciliation

- [ ] **H6 (Design Decision Required First)** Schedule a single token-reconciliation session: compare `quiz-ui-design-blueprint.md §2.3` hex values against actual Tailwind config / CSS token layer
- [ ] After decision: update either the blueprint's token table or the CSS token definitions — not both — to establish a single canonical source of truth
- [ ] Enforce token usage (no raw hex values) across `QuizOption.tsx`, `QuestionPalette.tsx`, and `FeedbackPanel.tsx` via ESLint `no-restricted-syntax` rule on hex color literals in component files

---

## BLOCK 10 — Deferred Items (Pending External Resolution)

| Item | Blocker | Who Resolves |
|---|---|---|
| `HintButton` + hint expansion (M5) | `hint_text` column not confirmed in `questions` table schema | Database schema inspection required |
| `XPDeltaFloat` animation (M3) | XP delta value not present in `submitAnswer` or `endSession` response shape | Backend must add `xpDelta` to response before frontend implementation |
| `FeedForwardCards` content source (L1) | Unclear if `recommendations[]` is rule-based or LLM — no server action documented | Backend / product decision required |
| Subject domain accent colors (L3) | No subject-to-color mapping defined in audit or blueprint | Design decision required: map each `subject_area` to a persistent accent token |

---

# Part 4 — Component / State Mapping Reference

## 4.1 Complete Component-to-Store-Slice Dependency Map

| Component | Store Slices Read | Store Actions Called |
|---|---|---|
| `QuizHeader` | `status`, `timer`, `ui.paletteOpen`, `streakCount`, `streakBroken` (new) | `togglePalette()`, `clearStreakBroken()` (new) |
| `QuizBody` | `questions[currentIndex]`, `answers`, `eliminatedOptions` | — |
| `OptionsColumn` / `QuizOption` | `answers[qid].questionStatus` (new), `answers[qid].selectedOptionId`, `feedback` | `selectAnswer()`, `toggleEliminate()` |
| `SlideToSubmit` | `answers[qid].selectedOptionId`, `status` | `submitCurrentAnswer()` |
| `FeedbackPanel` | `feedback` (all fields incl. new ones), `feedbackGateActive` (new), `feedbackGateRemainingMs` (new) | `hideFeedback()`, `tickFeedbackGate()` (new), `clearFeedbackGate()` (new) |
| `QuizFooter` | `currentIndex`, `totalQuestions`, `feedbackGateActive` (new), `config.navigation` | `goNext()`, `goPrevious()`, `skipCurrentQuestion()` |
| `QuestionPalette` | `answers` (all entries), `currentIndex` | `goToQuestion()`, `togglePalette()` |
| `TimerDisplay` | `timer.elapsedMs`, `timer.limitMs`, `timer.isRunning`, `timerColorState` (new) | `tickTimer()` → `handleTimerExpiry()` (new) |
| `PostdictionScreen` (new) | `sessionId`, `config.prediction.enabled` | `savePostdiction()` (server action) |

---

## 4.2 Server Action Return Shape — Required vs. Currently Mapped

| Field | Returned By | Blueprint Requirement | In `feedback` Slice Now | In `feedback` Slice After Fix |
|---|---|---|---|---|
| `isCorrect` | `submitAnswer` | Core feedback | ✅ Yes | ✅ Yes |
| `correctOptionId` | `submitAnswer` | Core feedback | ✅ Yes | ✅ Yes |
| `rationale` | `submitAnswer` | Core feedback | ✅ Yes | ✅ Yes |
| `wikiUrl` | `submitAnswer` | Progressive disclosure | ✅ Yes | ✅ Yes |
| `errorDiagnostic` | `submitAnswer` | Personalized feedback language | ❌ Dropped | ✅ Added |
| `closeness` | `submitAnswer` | Numerical question feedback | ❌ Dropped | ✅ Added |
| `correctAnswer` | `submitAnswer` | Non-MCQ correct value display | ❌ Dropped | ✅ Added |

---

## 4.3 Per-Question State Machine — Target Implementation

```
QuizAnswerState.questionStatus transitions:

'idle'
  └─ User clicks an option
       ↓
'selected'
  └─ SlideToSubmit reaches 80% threshold
       ↓
'submitted'    ← UI: options locked, spinner on SlideToSubmit
  └─ Server responds
       ↓
'feedback'     ← UI: FeedbackPanel visible, gate timer running
  └─ Gate expires AND user clicks Next
       ↓
'reviewed'     ← UI: question answered, navigation allowed back without re-triggering feedback
```

**Key invariant:** A question in `'reviewed'` state must NEVER re-enter `'feedback'` state on back-navigation. `goPrevious()` must check `questionStatus === 'reviewed'` and render a static answer display, not the live `FeedbackPanel`.

---

*Document version: 1.0 — SlateCamp Quiz Engine Unification Plan*
*Cross-references: quiz-ui-design-blueprint.md · quiz-ux-user-paths.md · quiz-ui-ux-research-blueprint.md · QUIZ-TESTING-AUDIT.md*

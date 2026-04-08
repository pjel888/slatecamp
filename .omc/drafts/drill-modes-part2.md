# SlateCamp Drills PRD -- Part 2: Drill Mode Catalog

**Source files:** `src/lib/constants/testing-modes.ts`, `src/lib/quiz/mode-presets.ts`, `src/components/quiz-v2/`
**Last verified:** 2026-04-08
**Status:** Extracted from codebase -- no aspirational features

---

## Architecture Overview

All 9 drill modes share a layered shell architecture:

| Layer | Component | Role |
|-------|-----------|------|
| Base | `BaseQuizShell` | Common layout, modals (exit, submit, micro-break, wiki side panel), progress bar, header/footer |
| Standard | `StandardQuizShell` | Session init, timer start, background question pre-fetch, progress sync, pacing nudge. Used by camp, chill, subject, focused, custom, storm |
| Simulation | `SimulationShell` | Strict countdown timer (14400s default), no immediate feedback, no confidence input, deferred results routing |
| Endurance | `EnduranceShell` | Count-up timer, real-time stamina tracking via `analyzeStamina()` / `detectFatigue()`, fatigue overlay |

Question presentation uses `QuizBody`, which renders a two-column layout:
- Left column: `QuestionColumn` (question stem, taxonomy breadcrumb, media)
- Right column: `OptionsColumn` (MCQ) or `GenerationInput` (numeric/short_text/formula)

The `OptionsColumn` composes: radio group of `QuizOption` items, `ConfidenceInput` (continuous 0-1 slider), `GestureCaptureZone` wrapping `SlideToSubmit`, and inline `FeedbackPanel` when feedback timing is `immediate`.

---

## Zone 1 -- Foundations (Free)

---

### Drill Mode 1: Camp Mode (`camp`)

#### Purpose and Pedagogical Rationale

- **Character:** Guided Study
- **Zone:** 1 (Foundations)
- **Description (from MODE_DEFINITIONS):** "Instant feedback after each answer. Full explanations on every question. No timer, no pressure."
- **Feedback timing:** `immediate` -- the learner sees correctness, rationale, and wiki links after every single answer
- **When effective:** First-time engagement with new material. The immediate feedback loop with gated progression (3000ms) forces the learner to read explanations before advancing, turning each question into a micro-lesson.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `camp` |
| **setup.questionCount** | 20 (default) |
| **QUESTION_COUNT_OPTIONS** | `[10, 20, 30, 50]` |
| **setup.difficultyMode** | `adaptive` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `true` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` |
| **timer.visible** | `false` |
| **timer.mode** | `hidden` |
| **timer.totalSeconds** | `null` |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `true` |
| **feedback.gatedProgressionDelayMs** | `3000` |
| **feedback.explanationDepth** | `with-wiki-link` |
| **navigation.model** | `linear` |
| **navigation.backAllowed** | `false` |
| **navigation.questionPalette** | `false` |
| **navigation.bookmarkEnabled** | `false` |
| **navigation.skipEnabled** | `false` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `false` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** `QuizBody` renders a two-column grid (`grid-cols-1 md:grid-cols-2`). Left: question stem. Right: answer options or generation input.
- **Answer choices:** `OptionsColumn` renders a radio group of `QuizOption` components. Each option shows a letter (A/B/C/D) and text. Options support elimination (cross-out) via `toggleEliminate`.
- **Navigation:** Linear (`navigation.model: 'linear'`). No back button (`backAllowed: false`). No question palette. No skip. The learner must answer each question in sequence.
- **Timer display:** None (`timer.mode: 'hidden'`). No `TimerDisplay` component rendered in the header.
- **Progress indicator:** `QuizHeader` shows a progress bar (`h-1.5 rounded-full bg-border`) with Camp Cobalt fill, plus a `currentPosition/totalQuestions` fraction.
- **Confidence input:** Shown. Continuous 0-1 slider with labels "Guessing" to "Confident". Rendered inside `OptionsColumn` because `config.mode !== 'chill'`.

#### Answer Submission UX

- **SlideToSubmit:** Identity-locked component. Uses `@use-gesture/react` (not Framer Motion). Hardcoded `#1B3FC4` (Camp Cobalt) for active state. Handle: 44x44px, track padding 4px, threshold 80%. Spring-back animation on incomplete drag uses `cubic-bezier(0.34, 1.56, 0.64, 1)` easing at 300ms. Fires `hapticSelect()` at threshold.
- **On submit:** Feedback timing is `immediate`, so the `FeedbackPanel` appears inline below the options immediately after the server responds.
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate).
- **FeedbackPanel behavior:** Displays correct/incorrect status with contextual heading. Correct answers get a green `CheckCircle` and "Correct" label. Incorrect answers get an arrow icon and a heading derived from the error diagnostic category (e.g., "Here's what to know", "You were close", "Slow down").
- **Gated progression:** 3000ms countdown bar. The "Next question" button is disabled until the gate expires. A progress bar shows countdown with text "Review the explanation -- next question in Ns".
- **Explanation depth:** `with-wiki-link` -- shows rationale text plus a "Read more" link that opens `WikiSidePanel` as a slide-out panel.
- **Socratic Explorer:** Available on incorrect answers. Camp mode is in the `SOCRATIC_MODES` list (`['camp', 'focused', 'subject', 'chill']`). A "Why was I wrong?" button lazy-loads `SocraticExplorer`.
- **Mnemonic tip:** Shown when `failCount >= 2` on the same question. `MnemonicTip` component renders a memory aid.
- **Confidence x Correctness:** Confidence is captured but the matrix is shown in results, not during the session.

#### Behavioral Signal Capture

- **CAGE binding:** Submit answer schema accepts `cageToken` (unknown, optional), `cageTrustLevel` (unknown, optional), `signalTrace` (array, optional), `gestureDurationMs` (int, optional), `sensorsAvailable` (boolean, optional).
- **Lucky guess detection:** `speedThreshold = 3000 + difficulty * 5000`. If `isCorrect && timeSpentMs < speedThreshold`, the answer is flagged `isSuspectedLuckyGuess`. Lucky guess overrides generation multiplier to 0.5x EMA weight.
- **Signal storage:** When `signalTrace` or `cageToken` is present, a fire-and-forget background task writes to `interaction_signal_traces` table with events, event_count, duration_ms, capture_rate_hz, and device_sensors_available.
- **Data written:** `user_interactions` table via `rpc('upsert_interaction_v2')` or direct insert. Fields include: session_id, question_id, selected_option_id, is_correct, time_spent_ms, confidence, confidence_score, is_suspected_lucky_guess, question_order, interaction_timestamp.

#### Session Completion UX

- **Results timing:** Shown immediately (`showImmediately: true`, `delayHours: 0`).
- **ResultsDashboard sections:** ScoreReveal (animated count-up from 0 to score%, 1500ms easeOutQuart, with 700ms buffer), SubjectBreakdown, ReadinessImpact (before/after/delta), ConfidenceMatrix, ReviewCardList (inline question review), FeedForwardCards (recommendations), ResultsCTAs.
- **Score bands:** >= 70% "Passing" (emerald), >= 50% "Building" (ink-primary), < 50% "Needs review" (ink-primary).
- **Growth delta:** Shown (`showGrowthDelta: true`). Displays "+N% from last time" or "-N% from last time".
- **Readiness impact:** Shown (`showReadinessScoreImpact: true`).
- **Stamina chart:** Not shown (`showStaminaChart: false`).
- **Simulation debrief:** Not shown (only for `fullexam` mode).

#### Gating and Unlock Conditions

- **isPro:** `false` -- free for all users
- **Zone:** 1 (Foundations)
- **ctaVariant:** `cobalt` (Camp Cobalt `#1B3FC4` background on the CTA button)

#### Mobile-Specific Behavior

- **SlideToSubmit haptics:** `hapticSelect()` fires `navigator.vibrate(10)` when threshold is reached. Gated by `useQuizStore.getState().settings.hapticEnabled` and `navigator.vibrate` availability.
- **Touch targets:** All interactive elements maintain 44px minimum. `QuizFooter` buttons have `min-h-[44px]`. `QuestionPalette` cells are `min-h-[44px] min-w-[44px]` on mobile, `36px` on desktop. `QuestionCountPills` buttons are `min-h-[44px] min-w-[52px]`.
- **Layout:** Single column on mobile (`grid-cols-1`), two-column on desktop (`md:grid-cols-2`).
- **Animations:** Slide-in transition (`slide-in-from-right-2` for forward, `slide-in-from-left-2` for backward) with `duration-200 ease-out`. Respects `prefers-reduced-motion`.

---

### Drill Mode 2: Chill Mode (`chill`)

#### Purpose and Pedagogical Rationale

- **Character:** Relaxed
- **Zone:** 1 (Foundations)
- **Description (from MODE_DEFINITIONS):** "Browse questions at your own pace. Skip any you want. Low stakes, real learning."
- **Feedback timing:** `immediate` -- correctness shown after each answer, but with no gated delay
- **When effective:** Low-anxiety exploration. Free navigation and skip allow the learner to self-direct without commitment pressure. Ideal for returning after a break or warming up.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `chill` |
| **setup.questionCount** | 10 (default) |
| **QUESTION_COUNT_OPTIONS** | Not defined -- uses preset default of 10 |
| **setup.difficultyMode** | `static` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` |
| **timer.visible** | `false` |
| **timer.mode** | `hidden` |
| **timer.totalSeconds** | `null` |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `0` |
| **feedback.explanationDepth** | `brief` |
| **navigation.model** | `free` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `false` |
| **navigation.bookmarkEnabled** | `false` |
| **navigation.skipEnabled** | `true` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `false` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `false` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid as Camp Mode.
- **Answer choices:** `OptionsColumn` radio group with elimination support.
- **Navigation:** Free (`navigation.model: 'free'`). Back button shown (`backAllowed: true`). Skip enabled (`skipEnabled: true`). No question palette. No bookmark. The learner can navigate forward/backward and skip questions.
- **Timer display:** None (`timer.mode: 'hidden'`).
- **Progress indicator:** Same progress bar and fraction as Camp Mode.
- **Confidence input:** Hidden. `OptionsColumn` checks `config.mode !== 'chill'` and skips rendering `ConfidenceInput` for chill mode.

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component as all modes.
- **On submit:** Immediate feedback with zero gated delay.
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate).
- **Gated progression:** `0ms` -- no delay. "Next question" button is immediately enabled.
- **Explanation depth:** `brief` -- shorter rationale text, no wiki link integration in the explanation itself.
- **Socratic Explorer:** Available. Chill is in the `SOCRATIC_MODES` list.
- **Mnemonic tip:** Available on `failCount >= 2`.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes (documented under Camp Mode).

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** ScoreReveal, SubjectBreakdown, GrowthDelta. No ReadinessImpact (`showReadinessScoreImpact: false`). No StaminaChart.
- **Readiness impact:** Not shown -- chill sessions are low-stakes and do not surface readiness score changes.

#### Gating and Unlock Conditions

- **isPro:** `false` -- free for all users
- **Zone:** 1 (Foundations)
- **ctaVariant:** `cobalt`
- **defaultQuestionCount in MODE_DEFINITIONS:** `null` (open-ended in definition, preset defaults to 10)

#### Mobile-Specific Behavior

Same as Camp Mode. No confidence slider simplifies the right column on narrow screens.

---

### Drill Mode 3: Article Review (`article-review`)

#### Purpose and Pedagogical Rationale

- **Character:** Quick Check
- **Zone:** 1 (Foundations)
- **Description (from MODE_DEFINITIONS):** "5 quick questions to verify your understanding after reading an article."
- **Feedback timing:** `immediate` -- brief feedback after each question
- **When effective:** Post-reading comprehension check. Launched from wiki articles to reinforce key takeaways while the material is fresh.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `article_review` |
| **setup.questionCount** | 5 |
| **QUESTION_COUNT_OPTIONS** | Not defined -- fixed at 5 |
| **setup.difficultyMode** | `static` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` |
| **timer.visible** | `false` |
| **timer.mode** | `hidden` |
| **timer.totalSeconds** | `null` |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `false` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `2000` |
| **feedback.explanationDepth** | `brief` |
| **navigation.model** | `linear` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `false` |
| **navigation.bookmarkEnabled** | `false` |
| **navigation.skipEnabled** | `false` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `false` |
| **results.showGrowthDelta** | `false` |
| **results.showReadinessScoreImpact** | `false` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `false` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Linear with back allowed. No palette, no bookmark, no skip.
- **Timer display:** None.
- **Progress indicator:** Standard progress bar. 5-question sessions are visually compact.
- **Confidence input:** Hidden (`showConfidenceRating: false`, and likely rendered since `config.mode !== 'chill'` -- however the ConfidenceInput receives `null` value and onChange is a no-op in modes that disable it).

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** Immediate feedback with 2000ms gated delay.
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate).
- **Gated progression:** `2000ms` -- shorter than Camp Mode (3000ms) but still enforces reading.
- **Explanation depth:** `brief`.
- **Socratic Explorer:** Not available. `article_review` is not in the `SOCRATIC_MODES` list.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** ScoreReveal only. No SubjectBreakdown, no GrowthDelta, no ReadinessImpact, no StaminaChart. This is intentionally minimal -- the review is a quick comprehension check, not a full assessment.

#### Gating and Unlock Conditions

- **isPro:** `false` -- free for all users
- **Zone:** 1 (Foundations)
- **ctaVariant:** `cobalt`
- **Setup flow:** `SLIDE_COUNT` is `1` -- single slide setup, no topic selection or advanced config.

#### Mobile-Specific Behavior

Same as Camp Mode. The 5-question format is designed for quick mobile sessions.

---

## Zone 2 -- Deliberate Practice (Pro)

---

### Drill Mode 4: Subject Mode (`subject`)

#### Purpose and Pedagogical Rationale

- **Character:** Focused
- **Zone:** 2 (Deliberate Practice)
- **Description (from MODE_DEFINITIONS):** "Deep-dive into one LEA subject. Questions matched to your current mastery level."
- **Feedback timing:** `immediate` with `full` explanation depth
- **When effective:** Targeted subject mastery. Adaptive difficulty adjusts based on a rolling accuracy window (>= 90% accuracy increases difficulty, <= 60% decreases it, per `getNextDifficulty`). This mode is the workhorse for deliberate practice on a specific exam domain.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `subject` |
| **setup.questionCount** | 25 (preset) / 20 (MODE_DEFINITIONS default) |
| **QUESTION_COUNT_OPTIONS** | `[10, 20, 30]` |
| **setup.difficultyMode** | `adaptive` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` |
| **timer.visible** | `false` |
| **timer.mode** | `hidden` |
| **timer.totalSeconds** | `null` |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `true` |
| **feedback.gatedProgressionDelayMs** | `3000` |
| **feedback.explanationDepth** | `full` |
| **navigation.model** | `linear` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `false` |
| **navigation.bookmarkEnabled** | `false` |
| **navigation.skipEnabled** | `false` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Linear with back allowed. No palette, no bookmark, no skip.
- **Timer display:** None.
- **Progress indicator:** Standard.
- **Confidence input:** Shown (`showConfidenceRating: true`). Continuous 0-1 slider.
- **ModeSelector zone label:** Zone 1 / Learning (note: ModeSelector places subject in zone 1 with a `MagnifyingGlass` icon, while MODE_DEFINITIONS places it in zone 2. The ModeSelector uses its own local zone assignment.)

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** Immediate feedback with 3000ms gated delay.
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate).
- **Gated progression:** `3000ms`.
- **Explanation depth:** `full` -- complete rationale with deep explanation.
- **Socratic Explorer:** Available. Subject is in the `SOCRATIC_MODES` list.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, ConfidenceMatrix, ReviewCardList, FeedForwardCards, ResultsCTAs.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 2 (Deliberate Practice)
- **ctaVariant:** `cobalt`
- **dbTestMode:** `camp` (reuses camp's database test mode)
- **Setup flow:** `SLIDE_COUNT` is `2` -- slide 1 (question count, intro) then slide 2 (topic/subject selection via `IntroSlide2`).

#### Mobile-Specific Behavior

Same as Camp Mode with confidence slider visible.

---

### Drill Mode 5: Focus Review (`focus-review` / `focused`)

#### Purpose and Pedagogical Rationale

- **Character:** Targeted
- **Zone:** 2 (Deliberate Practice)
- **Description (from MODE_DEFINITIONS):** "Targets your weakest areas with the highest-impact questions. Driven by your mastery data."
- **Feedback timing:** `immediate` with `with-wiki-link` explanation depth and 4000ms gated delay (the longest non-zero gate)
- **When effective:** Blindspot remediation. Questions are pre-selected from the learner's weakest areas (driven by the blindspot queue in `src/lib/srs/blindspot.ts`). The longer gated delay (4000ms) forces deeper engagement with explanations for the exact topics where the learner is weakest.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `focused` |
| **setup.questionCount** | 15 (preset) / 12 (MODE_DEFINITIONS default) |
| **QUESTION_COUNT_OPTIONS** | Not defined -- uses preset default of 15 |
| **setup.difficultyMode** | `adaptive` |
| **setup.initialDifficulty** | `easy` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` |
| **timer.visible** | `false` |
| **timer.mode** | `hidden` |
| **timer.totalSeconds** | `null` |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `true` |
| **feedback.gatedProgressionDelayMs** | `4000` |
| **feedback.explanationDepth** | `with-wiki-link` |
| **navigation.model** | `linear` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `false` |
| **navigation.bookmarkEnabled** | `false` |
| **navigation.skipEnabled** | `false` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Linear with back allowed. No palette, no bookmark, no skip.
- **Timer display:** None.
- **Progress indicator:** Standard.
- **Confidence input:** Shown (`showConfidenceRating: true`).
- **Initial difficulty:** `easy` -- starts the learner at lower difficulty to build confidence before ramping up adaptively. This is unique among all modes.

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** Immediate feedback with 4000ms gated delay (longest of all modes).
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate).
- **Gated progression:** `4000ms` -- the longest gate. Deliberately slows the learner down on their weakest material.
- **Explanation depth:** `with-wiki-link` -- rationale plus "Read more" link to `WikiSidePanel`.
- **Socratic Explorer:** Available. Focused is in the `SOCRATIC_MODES` list.
- **Mnemonic tip:** Available on `failCount >= 2`.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, ConfidenceMatrix, ReviewCardList, FeedForwardCards, ResultsCTAs.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 2 (Deliberate Practice)
- **ctaVariant:** `cobalt`
- **dbTestMode:** `camp`
- **Setup flow:** `SLIDE_COUNT` is `2`.

#### Mobile-Specific Behavior

Same as Camp Mode with confidence slider visible.

---

### Drill Mode 6: Custom Session (`custom`)

#### Purpose and Pedagogical Rationale

- **Character:** Flexible
- **Zone:** 2 (Deliberate Practice)
- **Description (from MODE_DEFINITIONS):** "Full control. Pick topics, difficulty, question count, and feedback style."
- **Feedback timing:** `immediate` (default, but overridable via advanced config in IntroSlide3)
- **When effective:** Power users who want to design their own practice sessions. The 3-slide setup flow exposes timer, feedback timing, navigation model, difficulty mode, and interleaving as user-configurable parameters.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `custom` |
| **setup.questionCount** | 20 (default) |
| **QUESTION_COUNT_OPTIONS** | `[5, 10, 20, 30, 50, 100]` |
| **setup.difficultyMode** | `user-selected` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `false` (default, overridable) |
| **timer.visible** | `false` (default, overridable) |
| **timer.mode** | `hidden` (default, overridable) |
| **timer.totalSeconds** | `null` (default, overridable) |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` (default, overridable) |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `0` |
| **feedback.explanationDepth** | `full` |
| **navigation.model** | `free` |
| **navigation.backAllowed** | `true` (default, overridable) |
| **navigation.questionPalette** | `true` |
| **navigation.bookmarkEnabled** | `true` |
| **navigation.skipEnabled** | `true` |
| **navigation.confirmBeforeSubmit** | `true` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `false` |
| **breaks.intervalQuestions** | `0` |
| **breaks.breakDurationSeconds** | `0` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Free (`navigation.model: 'free'`). Back allowed, question palette enabled, bookmark enabled, skip enabled, confirm before submit.
- **Question Palette:** `QuestionPalette` renders as a slide-in panel from the right (max-w-sm). Shows a grid of numbered cells color-coded by state: answered (Camp Cobalt), flagged (Camp Orange), current (cobalt ring), unanswered (border only), skipped (dashed border). Filter pills for All/Unanswered/Flagged. Arrow key navigation with focus trap.
- **Bookmark:** `BookmarkSimple` icon in `QuizHeader`. Flagged questions appear in the palette with orange cells.
- **Timer display:** Depends on user setup config. Default is hidden but can be overridden in IntroSlide3.
- **Confidence input:** Not shown by default (`showConfidenceRating: false`).

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **Confirm before submit:** `confirmBeforeSubmit: true`. At end of session, `SubmitConfirmModal` shows unanswered/flagged question counts and offers "Review unanswered" or "Submit all".
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer by default (immediate with 0ms gate). Overridable to deferred in IntroSlide3.
- **Gated progression:** `0ms` -- no gate.
- **Explanation depth:** `full`.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** Full suite -- ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, ConfidenceMatrix, ReviewCardList, FeedForwardCards, ResultsCTAs.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 2 (Deliberate Practice)
- **ctaVariant:** `cobalt`
- **dbTestMode:** `camp`
- **Setup flow:** `SLIDE_COUNT` is `3` -- the most slides of any mode. Slide 1 (question count + intro), Slide 2 (topic selection via `IntroSlide2`), Slide 3 (advanced config via `IntroSlide3`: timer, feedback timing, navigation model, difficulty mode/initial difficulty).
- **Interleave toggle:** Shown when specific topics are selected (`showInterleaveToggle = (mode === 'camp' || mode === 'custom') && selectedTopics.length > 0`). Enables 30% interleaved questions from other topics.

#### Mobile-Specific Behavior

Same as other modes. Question palette is a full-height slide-in panel on mobile.

---

## Zone 3 -- Exam Readiness (Pro)

---

### Drill Mode 7: Storm Mode (`storm`)

#### Purpose and Pedagogical Rationale

- **Character:** Timed
- **Zone:** 3 (Exam Readiness)
- **Description (from MODE_DEFINITIONS):** "Exam conditions. No feedback until you're done. Timer runs as a bar, not a countdown."
- **Feedback timing:** `deferred` -- no feedback during the session, full explanations at the end
- **When effective:** Exam simulation with moderate volume. Tests time management and retrieval under pressure without the full 200-question commitment of a simulation. The bar timer (not countdown) reduces time anxiety while still enforcing a time limit.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `storm` |
| **setup.questionCount** | 50 (default) |
| **QUESTION_COUNT_OPTIONS** | `[25, 50, 100]` |
| **setup.difficultyMode** | `static` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `true` |
| **timer.visible** | `true` |
| **timer.mode** | `bar` |
| **timer.totalSeconds** | `3000` (50 minutes, 1 min/question) |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `false` |
| **timer.warningThresholds** | `[0.75, 0.90, 0.95]` |
| **feedback.timing** | `deferred` |
| **feedback.showExplanation** | `false` (during session) |
| **feedback.showCorrectAnswer** | `false` (during session) |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `0` |
| **feedback.explanationDepth** | `full` (for results) |
| **navigation.model** | `free` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `true` |
| **navigation.bookmarkEnabled** | `true` |
| **navigation.skipEnabled** | `true` |
| **navigation.confirmBeforeSubmit** | `true` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `false` |
| **breaks.enabled** | `true` |
| **breaks.intervalQuestions** | `25` |
| **breaks.breakDurationSeconds** | `30` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `StandardQuizShell`
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Free. Back allowed, question palette, bookmark, skip, confirm before submit. This mirrors real exam navigation where you can flag and revisit.
- **Timer display:** `bar` mode in `QuizHeader`. The `DefaultTimer` component renders when `config.timer.visible && config.timer.enabled && config.mode === 'storm'`. Timer color thresholds defined in `TIMER_THRESHOLDS`: normal (primary, >= 20%), warning (accent, >= 10%), critical (accent, < 10%). The TimerDisplay is overridden by `timerSlot` when pressure level >= 1.
- **Timer total:** 3000 seconds (50 minutes) for 50 questions = 60 seconds per question. Calculated from `SECONDS_PER_QUESTION = 60`.
- **Timer not pausable:** `pausable: false`.
- **Warning thresholds:** Fire at 75%, 90%, and 95% time elapsed.
- **Progress indicator:** Standard progress bar plus question palette for overview.
- **Confidence input:** Hidden (`showConfidenceRating: false`).

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** No feedback shown (`feedback.timing: 'deferred'`). The learner moves to the next question immediately.
- **Label:** "Slide to continue" (set by `OptionsColumn` when `config.feedback.timing === 'none'` -- note: storm uses `deferred`, so label is "Slide to submit")
- **Confirm before submit:** `SubmitConfirmModal` appears at session end showing unanswered/flagged counts.

#### Feedback and Rationale UX

- **When:** Deferred to end of session. No `FeedbackPanel` shown during the session.
- **During session:** No correctness indication, no explanation, no wiki links.
- **After session:** Full explanations available in `ResultsDashboard` via `ReviewCardList`.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately (`showImmediately: true`, `delayHours: 0`).
- **ResultsDashboard sections:** ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, ConfidenceMatrix, ReviewCardList, FeedForwardCards, ResultsCTAs.
- **Breaks:** Enabled. `MicroBreakOverlay` appears every 25 questions for 30 seconds.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 3 (Exam Readiness)
- **ctaVariant:** `orange` (Camp Orange background on the CTA button -- visually distinct from cobalt modes)
- **Pressure level selector:** Shown in `SetupFlow` (`hasPressureSelector = mode === 'storm' || mode === 'fullexam'`). Default pressure is `Math.min(maxUnlocked, 2)` for storm.
- **Pressure levels (from `pressure-config.ts`):**
  - Level 0 (Learning): No timer, instant feedback. Unlocked at RS >= 0.
  - Level 1 (Awareness): Count-up timer. Unlocked at RS >= 40.
  - Level 2 (Pacing): Countdown timer, soft pacing warnings. Unlocked at RS >= 55.
  - Level 3 (Exam): Full exam conditions, hard skip on time, results delayed 24h. Unlocked at RS >= 65.
- **Setup flow:** `SLIDE_COUNT` is `2`.

#### Mobile-Specific Behavior

Same as other modes. Timer bar is visible in header. Question palette is a full-height slide-in.

---

### Drill Mode 8: Full Exam Simulation (`simulation` / `fullexam`)

#### Purpose and Pedagogical Rationale

- **Character:** Exam Day
- **Zone:** 3 (Exam Readiness)
- **Description (from MODE_DEFINITIONS):** "200 questions. Real exam conditions. Your score is delivered 24 hours later."
- **Feedback timing:** `none` -- no feedback during or immediately after the session. Results are delayed 24 hours.
- **When effective:** The definitive exam readiness test. Replicates the full LEA exam: 200 questions, 4-hour time limit, no feedback, delayed results. The 24-hour delay mirrors the real exam result waiting period to train emotional resilience.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `fullexam` |
| **setup.questionCount** | 200 |
| **QUESTION_COUNT_OPTIONS** | Not defined -- fixed at 200 |
| **setup.difficultyMode** | `static` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `true` |
| **timer.visible** | `true` |
| **timer.mode** | `countdown` |
| **timer.totalSeconds** | `14400` (4 hours) |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `false` |
| **timer.warningThresholds** | `[0.75, 0.90, 0.95]` |
| **feedback.timing** | `none` |
| **feedback.showExplanation** | `false` |
| **feedback.showCorrectAnswer** | `false` |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `0` |
| **feedback.explanationDepth** | `full` (for delayed results) |
| **navigation.model** | `free` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `true` |
| **navigation.bookmarkEnabled** | `true` |
| **navigation.skipEnabled** | `true` |
| **navigation.confirmBeforeSubmit** | `true` |
| **results.showImmediately** | `false` |
| **results.delayHours** | `24` |
| **results.showPercentile** | `true` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `true` |
| **breaks.enabled** | `true` |
| **breaks.intervalQuestions** | `50` |
| **breaks.breakDurationSeconds** | `30` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `SimulationShell` -- specialized shell that differs from StandardQuizShell:
  - Always starts the countdown timer at session init: `startTimer({ limitMs: (config.timer.totalSeconds || 14400) * 1000, sessionId })`.
  - Passes `confidenceLevel={null}` to `QuizBody` -- confidence is always disabled.
  - Passes `onConfidenceChange={() => {}}` -- no-op handler.
  - Routes to `/quiz/fullexam/session/${sessionId}/results` on completion.
  - Uses mode key `fullexam` for the `useQuizShellHandlers` hook.
- **Layout:** Same `QuizBody` two-column grid.
- **Navigation:** Free. Full exam navigation: back, palette, bookmark, skip, confirm before submit.
- **Timer display:** `countdown` mode. `QuizHeader` renders `DefaultTimer` with mode `countdown`. Shows remaining time in `hh:mm:ss` format. Color states: normal (text-secondary), warning (text-warning at <= 25%), critical (text-destructive at <= 10%).
- **Timer total:** 14400 seconds (4 hours). Not pausable.
- **Warning thresholds:** At 75%, 90%, 95% time elapsed.
- **Question Palette:** Full grid palette with all 200 questions. Filter by All/Unanswered/Flagged.
- **Confidence input:** Disabled. SimulationShell hardcodes `confidenceLevel={null}`.

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** No feedback at all (`feedback.timing: 'none'`). No FeedbackPanel rendered. Learner moves immediately to next question.
- **Label:** "Slide to continue" (triggered by `config.feedback.timing === 'none'` check in OptionsColumn).
- **Confirm before submit:** `SubmitConfirmModal` at end.

#### Feedback and Rationale UX

- **When:** Never during the session. Results are delayed 24 hours.
- **During session:** Zero feedback. No correctness, no explanations, no wiki links.
- **After 24 hours:** Full ResultsDashboard with all sections including the simulation-exclusive `SimulationDebrief` component.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Delayed 24 hours (`showImmediately: false`, `delayHours: 24`).
- **ResultsDashboard sections (after 24h):** ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, StaminaChart, Percentile, ConfidenceMatrix, SimulationDebrief (fullexam-only section), PredictionComparison (if prediction data available), ReviewCardList, FeedForwardCards, ResultsCTAs.
- **Simulation Debrief:** Only rendered when `config.mode === 'fullexam'`. Receives result, reviewQuestions, staminaBlocks, and prediction data.
- **Percentile:** Shown (`showPercentile: true` -- unique to fullexam).
- **Stamina chart:** Shown (`showStaminaChart: true`).
- **Breaks:** Enabled every 50 questions for 30 seconds via `MicroBreakOverlay`.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 3 (Exam Readiness)
- **ctaVariant:** `orange`
- **Pressure level selector:** Shown. Default pressure is `Math.min(maxUnlocked, 3)` for fullexam.
- **Simulation Checklist:** Required when `mode === 'fullexam' && pressureLevel === 3`. The `SimulationChecklist` component presents 5 pre-flight items that ALL must be checked before the session can begin:
  1. "I have enough uninterrupted time" (4 hours)
  2. "I'm in a quiet space"
  3. "I've eaten and I'm hydrated"
  4. "My device is charged"
  5. "I understand this cannot be paused"
- **Start button:** Uses Camp Orange background (`var(--camp-orange)`), labeled "Start Simulation". Disabled until all 5 checklist items are confirmed.
- **Setup flow:** `SLIDE_COUNT` is `1`, but at pressure level 3, a SimulationChecklist slide is injected before finalization.
- **Background pre-fetching:** SimulationShell pre-fetches all 200 questions in batches of 50 after the initial set loads.

#### Mobile-Specific Behavior

Same as other modes. The 4-hour timer and 200-question palette make this primarily a tablet/desktop experience, but the UI adapts to mobile with single-column layout.

---

### Drill Mode 9: Design Endurance Training (`endurance` / `extended`)

#### Purpose and Pedagogical Rationale

- **Character:** Design Endurance Training
- **Zone:** 3 (Exam Readiness)
- **Description (from MODE_DEFINITIONS):** "Design is 40% of the LEA -- and it's 3+ hours under pressure. Build your cognitive stamina window to handle the full exam."
- **Feedback timing:** `immediate` -- feedback after each answer, with `full` explanation depth
- **When effective:** Builds cognitive endurance specifically for the Design section of the LEA exam. The count-up timer tracks total time without pressure, while real-time stamina analysis monitors accuracy degradation over blocks of 10 questions. When accuracy drops > 15% from the first block, a fatigue alert fires.

#### Session Configuration (from MODE_PRESETS)

| Property | Value |
|----------|-------|
| **mode** | `extended` |
| **setup.questionCount** | 100 (default) |
| **QUESTION_COUNT_OPTIONS** | Not defined -- uses preset default of 100 |
| **setup.difficultyMode** | `static` |
| **setup.initialDifficulty** | `mixed` |
| **setup.isTrailSession** | `false` |
| **setup.trailDayId** | `null` |
| **timer.enabled** | `true` |
| **timer.visible** | `true` |
| **timer.mode** | `countup` |
| **timer.totalSeconds** | `null` (no limit -- tracks elapsed time) |
| **timer.perQuestion** | `false` |
| **timer.pausable** | `true` |
| **timer.warningThresholds** | `[]` |
| **feedback.timing** | `immediate` |
| **feedback.showExplanation** | `true` |
| **feedback.showCorrectAnswer** | `true` |
| **feedback.showConfidenceRating** | `false` |
| **feedback.gatedProgressionDelayMs** | `2000` |
| **feedback.explanationDepth** | `full` |
| **navigation.model** | `linear` |
| **navigation.backAllowed** | `true` |
| **navigation.questionPalette** | `true` |
| **navigation.bookmarkEnabled** | `true` |
| **navigation.skipEnabled** | `true` |
| **navigation.confirmBeforeSubmit** | `false` |
| **results.showImmediately** | `true` |
| **results.delayHours** | `0` |
| **results.showPercentile** | `false` |
| **results.showSubjectBreakdown** | `true` |
| **results.showGrowthDelta** | `true` |
| **results.showReadinessScoreImpact** | `true` |
| **results.showStaminaChart** | `true` |
| **breaks.enabled** | `true` |
| **breaks.intervalQuestions** | `30` |
| **breaks.breakDurationSeconds** | `30` |
| **isPro** | `true` |

#### Question Presentation UX

- **Shell component:** `EnduranceShell` -- specialized shell that differs from StandardQuizShell:
  - Starts a count-up timer (no limit): `startTimer({ sessionId })` -- no `limitMs` argument.
  - Real-time stamina tracking via `analyzeStamina(answers, 10)` and `detectFatigue(blocks)`. Block size is 10 questions (not the default 25 used in analysis module).
  - Renders a stamina overlay in the top-right corner: a floating card showing current block accuracy percentage.
  - Fatigue detection fires when `accuracyDrop > 0.15` (> 15% drop from first block) or `timeIncrease > 0.30` (> 30% time increase). When detected, an orange pulsing "FATIGUE DETECTED: Check Posture" badge appears.
  - Passes `confidenceLevel={null}` and `onConfidenceChange={() => {}}` -- confidence is disabled.
  - Routes to `/quiz/extended/session/${sessionId}/results` on completion.
  - Uses mode key `extended` for the `useQuizShellHandlers` hook.
- **Layout:** Same `QuizBody` two-column grid, with the stamina overlay positioned `absolute right-4 top-20 z-20`.
- **Navigation:** Linear model, but with palette, bookmark, and skip enabled. Back allowed. A hybrid: questions proceed linearly but the palette provides overview access.
- **Timer display:** `countup` mode. `QuizHeader` renders `DefaultTimer` showing elapsed time in `mm:ss` or `h:mm:ss` format. Pausable (`pausable: true` -- unique among timed modes).
- **Confidence input:** Disabled. EnduranceShell hardcodes `confidenceLevel={null}`.

#### Answer Submission UX

- **SlideToSubmit:** Same identity-locked component.
- **On submit:** Immediate feedback with 2000ms gated delay.
- **Label:** "Slide to submit"

#### Feedback and Rationale UX

- **When:** After each answer (immediate). This differs from other Zone 3 modes which defer or withhold feedback.
- **Gated progression:** `2000ms`.
- **Explanation depth:** `full`.
- **Socratic Explorer:** Not available. `extended` is not in the `SOCRATIC_MODES` list.
- **Design rationale for immediate feedback in a Zone 3 mode:** Endurance training is about building stamina, not simulating exam conditions. Feedback helps the learner sustain engagement across 100 questions and identify when fatigue is causing errors.

#### Behavioral Signal Capture

Same CAGE binding and lucky guess detection as all modes.

#### Session Completion UX

- **Results timing:** Shown immediately.
- **ResultsDashboard sections:** ScoreReveal, SubjectBreakdown, GrowthDelta, ReadinessImpact, StaminaChart (enabled -- shows accuracy-by-block visualization), ConfidenceMatrix, ReviewCardList, FeedForwardCards, ResultsCTAs.
- **Stamina chart:** Enabled (`showStaminaChart: true`). Uses `StaminaChart` component fed with blocks from `analyzeStamina()`. Requires >= 2 blocks to display.
- **Breaks:** Enabled every 30 questions for 30 seconds via `MicroBreakOverlay`.

#### Gating and Unlock Conditions

- **isPro:** `true` -- requires pro subscription
- **Zone:** 3 (Exam Readiness)
- **ctaVariant:** `orange`
- **Setup flow:** `SLIDE_COUNT` is `2`.
- **Background pre-fetching:** EnduranceShell pre-fetches all 100 questions in batches of 50.

#### Mobile-Specific Behavior

Same as other modes. Stamina overlay floats top-right and may overlay content on narrow screens (uses `pointer-events-none` on container, `pointer-events-auto` on interactive elements). Fatigue badge uses `animate-pulse` for attention.

---

## Cross-Mode Comparison Matrix

| Property | Camp | Chill | Article Review | Subject | Focus Review | Custom | Storm | Full Exam | Endurance |
|----------|------|-------|----------------|---------|--------------|--------|-------|-----------|-----------|
| **Zone** | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 |
| **isPro** | No | No | No | Yes | Yes | Yes | Yes | Yes | Yes |
| **ctaVariant** | cobalt | cobalt | cobalt | cobalt | cobalt | cobalt | orange | orange | orange |
| **Default Q count** | 20 | 10 | 5 | 25 | 15 | 20 | 50 | 200 | 100 |
| **Difficulty** | adaptive | static | static | adaptive | adaptive | user-selected | static | static | static |
| **Initial difficulty** | mixed | mixed | mixed | mixed | easy | mixed | mixed | mixed | mixed |
| **Timer** | none | none | none | none | none | configurable | bar (3000s) | countdown (14400s) | countup |
| **Pausable** | -- | -- | -- | -- | -- | -- | No | No | Yes |
| **Feedback timing** | immediate | immediate | immediate | immediate | immediate | immediate | deferred | none | immediate |
| **Gated delay (ms)** | 3000 | 0 | 2000 | 3000 | 4000 | 0 | 0 | 0 | 2000 |
| **Explanation depth** | wiki-link | brief | brief | full | wiki-link | full | full | full | full |
| **Confidence** | Yes | No | No | Yes | Yes | No | No | No | No |
| **Nav model** | linear | free | linear | linear | linear | free | free | free | linear |
| **Back** | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Palette** | No | No | No | No | No | Yes | Yes | Yes | Yes |
| **Bookmark** | No | No | No | No | No | Yes | Yes | Yes | Yes |
| **Skip** | No | Yes | No | No | No | Yes | Yes | Yes | Yes |
| **Confirm submit** | No | No | No | No | No | Yes | Yes | Yes | No |
| **Results delay** | 0h | 0h | 0h | 0h | 0h | 0h | 0h | 24h | 0h |
| **Subject breakdown** | Yes | Yes | No | Yes | Yes | Yes | Yes | Yes | Yes |
| **Growth delta** | Yes | Yes | No | Yes | Yes | Yes | Yes | Yes | Yes |
| **Readiness impact** | Yes | No | No | Yes | Yes | Yes | Yes | Yes | Yes |
| **Stamina chart** | No | No | No | No | No | No | No | Yes | Yes |
| **Percentile** | No | No | No | No | No | No | No | Yes | No |
| **Breaks** | No | No | No | No | No | No | 25q/30s | 50q/30s | 30q/30s |
| **Shell** | Standard | Standard | Standard | Standard | Standard | Standard | Standard | Simulation | Endurance |
| **Socratic** | Yes | Yes | No | Yes | Yes | No | No | No | No |
| **Pressure selector** | No | No | No | No | No | No | Yes | Yes | No |
| **Setup slides** | 2 | 2 | 1 | 2 | 2 | 3 | 2 | 1 | 2 |
| **isTrailSession** | Yes | No | No | No | No | No | No | No | No |

---

## Shared Infrastructure (All Modes)

### SlideToSubmit (Identity-Locked)

Every mode uses the same `SlideToSubmit` component. Per the identity preservation lock (`.ai/rules/identity_preservation_lock.md`), this component is sacrosanct:

- Library: `@use-gesture/react` (not Framer Motion)
- Handle: 44x44px, `rounded-sm` (4px)
- Track: `rounded-md` (6px), 4px padding
- Threshold: 80% (`THRESHOLD_PERCENT = 0.80`)
- Active color: `#1B3FC4` (hardcoded Camp Cobalt)
- Muted color: `#8896A7` (hardcoded Ink Tertiary)
- Border color: `#D4DAE3` (hardcoded Border Default)
- Spring-back: `cubic-bezier(0.34, 1.56, 0.64, 1)` at 300ms
- Haptic: `hapticSelect()` -- `navigator.vibrate(10)` on threshold

### Haptic Patterns

From `src/lib/quiz/haptics.ts`:

| Function | Pattern | Trigger |
|----------|---------|---------|
| `hapticSelect()` | `vibrate(10)` | SlideToSubmit threshold reached |
| `hapticCorrect()` | `vibrate(10)` | Correct answer |
| `hapticIncorrect()` | `vibrate([20, 50, 20])` | Incorrect answer (double-pulse) |
| `hapticAchievement()` | `vibrate([15, 40, 20, 40, 30])` | Achievement unlock (triple-pulse ascending) |

All gated by `useQuizStore.getState().settings.hapticEnabled` and `navigator.vibrate` availability.

### CAGE Binding (All Modes)

The submit answer schema (`src/lib/actions/quiz-v2/schemas.ts`) captures behavioral signals on every submission:

| Field | Type | Purpose |
|-------|------|---------|
| `cageToken` | unknown, optional | CAGE nonce from session creation |
| `cageTrustLevel` | unknown, optional | Trust classification |
| `signalTrace` | array of unknown, optional | Gesture signal events from `GestureCaptureZone` |
| `gestureDurationMs` | int, optional | Duration of gesture capture |
| `sensorsAvailable` | boolean, optional | Whether device motion sensors are available |

### Lucky Guess Detection (All Modes)

From `src/lib/actions/quiz-v2/submit-answer.ts`:

```
speedThreshold = 3000 + difficulty * 5000
isSuspectedLuckyGuess = isCorrect && timeSpentMs < speedThreshold
```

For a difficulty of 0.5: threshold = 5500ms. If a correct answer comes in under 5.5 seconds, it is flagged as a suspected lucky guess, which reduces its EMA weight to 0.5x.

### Adaptive Difficulty (Camp, Subject, Focus Review)

From `src/lib/quiz/mode-presets.ts` `getNextDifficulty()`:

```
windowAccuracy >= 0.90 --> increase difficulty (max 5)
windowAccuracy <= 0.60 --> decrease difficulty (min 1)
otherwise             --> maintain current
```

Applied to modes with `difficultyMode: 'adaptive'`: camp, subject, focused.

### Pressure Level Ladder (Storm, Full Exam)

From `src/lib/quiz/pressure-config.ts`:

| Level | Name | Timer | Per-Question Limit | Score Visible | Feedback | RS Threshold |
|-------|------|-------|--------------------|---------------|----------|--------------|
| 0 | Learning | none | none | No | immediate | 0 |
| 1 | Awareness | count_up | none | Yes | immediate | 40 |
| 2 | Pacing | countdown | soft_warning | Yes | end_of_session | 55 |
| 3 | Exam | countdown | hard_skip | No | delayed_24h | 65 |

Pacing nudge median times by difficulty: Easy 45s, Medium 72s, Hard 90s.

### Score Bands

From `getScoreBand()` in `mode-presets.ts`:

| Range | Label | Color |
|-------|-------|-------|
| >= 70% | Passing | `text-emerald-600` |
| >= 50% | Building | `text-ink-primary` |
| < 50% | Needs review | `text-ink-primary` |

### Stamina Analysis (Endurance, Full Exam Results)

From `src/lib/quiz/stamina-analysis.ts`:

- `analyzeStamina(answers, blockSize)`: Chunks answers into blocks, computes accuracy and avgTimePerQuestion per block.
- `detectFatigue(blocks)`: Compares first vs last block. Fatigue = `accuracyDrop > 15%` OR `timeIncrease > 30%`.
- EnduranceShell uses blockSize 10 (real-time during session).
- ResultsDashboard StaminaChart uses the default blockSize 25 (post-session analysis).

---

## Mode Key Mapping Reference

The codebase uses different keys in different contexts:

| Feature Name | MODE_DEFINITIONS key | MODE_PRESETS key | ModeSelector mode | dbTestMode | Shell handler mode |
|-------------|---------------------|-----------------|-------------------|------------|-------------------|
| Camp Mode | `camp` | `camp` | `camp` | `camp` | `camp` |
| Chill Mode | `chill` | `chill` | `chill` | `chill` | `chill` |
| Article Review | `article-review` | `article_review` | -- (not in selector) | `camp` | `article_review` |
| Subject Mode | `subject` | `subject` | `subject` | `camp` | `subject` |
| Focus Review | `focus-review` | `focused` | `focused` | `camp` | `focused` |
| Custom Session | `custom` | `custom` | `custom` | `camp` | `custom` |
| Storm Mode | `storm` | `storm` | `storm` | `storm` | `storm` |
| Full Exam Sim | `simulation` | `fullexam` | `fullexam` | `storm` | `fullexam` |
| Design Endurance | `endurance` | `extended` | `extended` | `camp` | `extended` |

Note: ModeSelector shows 8 modes (excludes article-review, which is launched contextually from wiki articles). ModeSelector uses its own zone assignment that differs slightly from MODE_DEFINITIONS (e.g., subject is zone 1 in ModeSelector but zone 2 in MODE_DEFINITIONS; storm is zone 2 in ModeSelector but zone 3 in MODE_DEFINITIONS).

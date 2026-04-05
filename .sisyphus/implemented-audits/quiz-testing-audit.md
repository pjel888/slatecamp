# SlateCamp Quiz & Testing Feature — Comprehensive Audit

> **Date:** 2026-04-04
> **Scope:** Complete audit of testing/quiz feature — routes, components, state, server actions, and data flows
> **Status:** Consolidated from quiz-testing-audit.md + testing-audit.md

---

## Table of Contents

1. [Route Architecture](#1-route-architecture)
2. [Quiz Modes](#2-quiz-modes)
3. [UX Journey](#3-ux-journey)
4. [Component Inventory](#4-component-inventory)
5. [State Management](#5-state-management)
6. [Server Actions](#6-server-actions)
7. [Database Tables](#7-database-tables)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Happy Paths](#9-happy-paths)
10. [Edge Cases](#10-edge-cases)
11. [Issues Found](#11-issues-found)
12. [Recommendations](#12-recommendations)

---

## 1. Route Architecture

### Dual Routing Systems (Technical Debt)

SlateCamp operates **two parallel routing systems**:

| System | Routes | Purpose |
|--------|--------|---------|
| **Quiz V2 Engine** | `/quiz/[mode]/...` | Unified session engine - setup, session, results |
| **Legacy Hub** | `/dashboard/testing/...` | Testing hub, legacy setup pages, debrief |

```
/quiz/ (V2 Engine)
├── [mode]/
│   ├── setup/
│   │   ├── page.tsx         — Unified setup for all modes
│   │   ├── client.tsx       — SetupPageClient (multi-step UI)
│   │   └── loading.tsx
│   └── session/[sessionId]/
│       ├── page.tsx         — QuizShell session
│       ├── loading.tsx
│       ├── results/
│       │   ├── page.tsx     — ResultsDashboard
│       │   └── loading.tsx
│       └── review/
│           ├── page.tsx     — Per-question review
│           └── loading.tsx
├── layout.tsx
├── loading.tsx
└── page.tsx                  — Redirects to /dashboard

/dashboard/testing/ (Legacy Hub)
├── page.tsx                  — ReviewHub (hub)
├── layout.tsx
├── loading.tsx
├── camp/setup/               — CampSetup (legacy)
├── chill/setup/               — ChillSetup (legacy)
├── storm/setup/              — StormSetup (legacy)
├── focus-review/setup/       — FocusReviewSetup (legacy)
├── custom/setup/             — CustomSetup (legacy)
├── subject/setup/            — SubjectSetup (legacy)
├── endurance/setup/           — EnduranceSetup (legacy)
├── session/[sessionId]/
│   ├── page.tsx              — Redirects to /quiz/v2
│   └── debrief/
│       └── page.tsx          — DebriefLayout (legacy)
└── simulation/
    ├── briefing/page.tsx     — SimulationBriefing
    └── [sessionId]/results/  — Cold-delivery results (24h)
```

### Valid Quiz Modes

| Mode Key | Route Parameter | Zone | Label |
|----------|----------------|------|-------|
| `camp` | `camp` | 1 | Camp Mode |
| `chill` | `chill` | 1 | Chill Mode |
| `subject` | `subject` | 2 | Subject Mode |
| `focus-review` | `focused` | 2 | Focus Review |
| `custom` | `custom` | 2 | Custom Session |
| `storm` | `storm` | 3 | Storm Mode |
| `simulation` | `fullexam` | 3 | Full Exam Simulation |
| `endurance` | `extended` | 3 | Design Endurance Training |

> **Note:** Mode keys don't match route params exactly (e.g., `focus-review` → `focused`, `simulation` → `fullexam`, `endurance` → `extended`)

---

## 2. UX & Frontend Event Flow

### Phase 1: Mode Selection (Dashboard)

**What the user sees first:** The Testing Hub on the dashboard, which displays all available quiz modes as cards organized by zone.

| Step | User Action | What Happens | Component |
|------|-------------|--------------|-----------|
| 1.1 | User navigates to Testing Hub | Dashboard loads with mode cards displayed by zone | Testing Hub (dashboard page) |
| 1.2 | User clicks a mode card (e.g., "Camp") | Browser navigates to `/quiz/camp/setup` | Mode card link |

**Route:** `/quiz/[mode]/setup` — `src/app/quiz/[mode]/setup/page.tsx` (Server Component)

> **Note:** `/src/app/quiz/page.tsx` simply redirects to `/dashboard` (the Testing Hub). There is no standalone quiz landing page.

---

### Phase 2: Session Setup

**File:** `src/app/quiz/[mode]/setup/page.tsx` → `src/app/quiz/[mode]/setup/client.tsx`

The setup page validates the mode, fetches taxonomy data (for modes requiring topic selection), and renders `<SetupPageClient />`. The client component manages a phase state machine: `'setup'` → `'creating'` → `'prediction'` (conditional) → `'navigating'`.

On mount, the Zustand quiz store is **reset** to clear any prior session state.

#### Setup Slides

The number of setup slides depends on the mode, controlled by `SLIDE_COUNT` in `src/components/quiz-v2/setup/SetupFlow.tsx`:

| Slide Count | Modes | Slides Shown |
|-------------|-------|--------------|
| 1 slide | camp, chill, storm, fullexam, extended, article_review | IntroSlide1 only |
| 2 slides | subject, focused | IntroSlide1 + IntroSlide2 (topic picker) |
| 3 slides | custom | IntroSlide1 + IntroSlide2 + IntroSlide3 (advanced config) |

#### Slide 1 — Mode Introduction (`IntroSlide1.tsx`)

**What the user sees:**
- Mode icon, name, and one-line summary
- Warning banners for high-stakes modes:
  - Storm: "No feedback will be shown during the session"
  - Full Exam: "This simulates real exam conditions"
- **QuestionCountPills** — pill-style buttons to select question count (e.g., 10, 20, 30, 50). Full Exam is fixed at 200.
- Optional **interleave toggle** — only visible when topics have been selected (adds 30% cross-topic questions)
- **PressureLevelSelector** — only for storm/fullexam/extended modes. Levels 0–3, each unlocked by readiness score thresholds. Level 3 in fullexam requires completing a `SimulationChecklist` gate.
- **"Begin" button** — advances to next slide or finalizes setup

| Step | User Action | What Happens |
|------|-------------|--------------|
| 2.1 | User views Slide 1 | Mode info, question count pills, warnings displayed |
| 2.2 | User taps a question count pill | `questionCount` state updated (e.g., 20 → 50) |
| 2.3 | User adjusts pressure level (storm/fullexam) | `pressureLevel` state updated (0–3) |
| 2.4 | User clicks "Begin" or "Continue" | Advances to Slide 2 (if multi-slide) or triggers session creation |

#### Slide 2 — Topic Picker (`IntroSlide2.tsx`)

**What the user sees:**
- Checkbox tree of subjects and subtopics
- Each subject shows a mastery percentage (color-coded green/amber/red)
- Search filter input with magnifying glass icon
- Expand/collapse arrows to reveal leaf-level subtopics
- **"Continue" button** — passes selected topics forward

| Step | User Action | What Happens |
|------|-------------|--------------|
| 2.5 | User expands a subject | Subtopics revealed with individual mastery percentages |
| 2.6 | User checks/unchecks topics | `selectedTopics` array updated |
| 2.7 | User types in search filter | Topic list filtered in real-time |
| 2.8 | User clicks "Continue" | Advances to Slide 3 (custom) or triggers session creation |

#### Slide 3 — Advanced Configuration (`IntroSlide3.tsx`, Custom mode only)

**What the user sees:**
- Timer settings: enable/disable, mode (countdown/countup), total seconds
- Feedback timing: immediate / deferred / none
- Navigation model: linear or free-navigation, back button toggle, question palette toggle, bookmarks toggle
- Difficulty mode and initial difficulty level
- **"Begin Session" button** — finalizes all config

| Step | User Action | What Happens |
|------|-------------|--------------|
| 2.9 | User toggles timer on | Timer config section expands |
| 2.10 | User selects feedback timing | `advancedConfig.feedback.timing` updated |
| 2.11 | User clicks "Begin Session" | Config finalized, session creation triggered |

#### Session Creation

| Step | User Action | What Happens | Server Call |
|------|-------------|--------------|-------------|
| 2.12 | "Begin" clicked | Phase changes to `'creating'`, loading spinner shown | `startSession(mode, config)` server action called |
| 2.13 | Server responds | Session created, questions returned | — |
| 2.14 | (Storm/Fullexam/Extended) | Phase changes to `'prediction'` — prediction slider shown | — |
| 2.15 | User sets prediction score (0–100) and confirms | Prediction saved | `savePrediction(sessionId, score)` |
| 2.16 | Navigation | Phase changes to `'navigating'`, browser redirects to `/quiz/[mode]/session/[sessionId]` | — |

**Config Assembly:** `mergeWithPreset(mode, userOverrides)` deep-merges user selections with `MODE_PRESETS` defaults to produce the final `QuizSessionConfig` object.

---

### Phase 3: Active Quiz Session

**Entry point:** `src/components/quiz-v2/QuizShell.tsx` — the main quiz container

**What the user sees (first question):**
- **Header:** Progress bar (0%), mode badge, timer (if enabled), exit button, bookmark button (if enabled), palette button (if enabled)
- **Body (two-column on desktop, stacked on mobile):**
  - Left: Question stem text + optional image
  - Right: Answer options (A, B, C, D) as radio-style cards
- **Confidence input** (1–3 Likert scale, hidden in Chill mode): "Guessing" / "Unsure" / "Confident"
- **SlideToSubmit** component: A draggable slider labeled "Slide to submit" (disabled until an option is selected)
- **Footer:** Position counter "1 / 20", Previous button (if back is allowed and not on first question), Next button

#### Answering a Question

| Step | User Action | UI Change | Store Update | Server Call |
|------|-------------|-----------|--------------|-------------|
| 3.1 | User reads question | Question stem and options displayed | Timer starts ticking (`tickTimer()` every 1s) | — |
| 3.2 | User clicks option "B" | Option B highlighted: `#EEF2FC` bg, `#1B3FC4` border. Other options return to default. SlideToSubmit becomes enabled. | `selectAnswer(qid, 'optionB_id')` | — |
| 3.3 | User changes mind, clicks option "C" | Option C highlighted, option B deselected | `selectAnswer(qid, 'optionC_id')` — overwrites previous | — |
| 3.4 | User adjusts confidence to "Confident" (3) | Confidence slider updates | `setConfidence(qid, 3)` | — |
| 3.5 | User uses elimination tool (clicks X on option A) | Option A visually struck through, semi-transparent | `toggleEliminate(qid, 'optionA_id')` | — |

#### Slide-to-Submit Interaction

**Component:** `src/components/quiz-v2/SlideToSubmit.tsx`

| Step | User Action | UI Change | What Happens |
|------|-------------|-----------|--------------|
| 3.6 | User touches/clicks the drag handle | Handle becomes active, ready for drag | — |
| 3.7 | User drags handle rightward | Handle follows finger/cursor, track fills with color | Drag progress tracked as percentage |
| 3.8 | User reaches 80% threshold | Haptic feedback (`navigator.vibrate()`), handle snaps to end | `onSubmit()` callback fires → `submitCurrentAnswer()` |
| 3.9 | Submission in progress | Label changes to "Checking your answer...", spinner shown | Server action `submitAnswer()` called |
| 3.10 | Server responds | Label changes to "Answer checked" | Store receives feedback data |
| 3.11 | Handle resets on next question load | Slider returns to start position, label resets | — |

> **Important:** If the user releases the handle before 80%, it snaps back — no submission occurs. The label reads "Slide to submit" for feedback modes and "Slide to continue" for no-feedback modes (Storm, Full Exam).

#### Immediate Feedback (Camp, Chill, Subject, Focus Review, Custom-with-immediate)

**Component:** `src/components/quiz-v2/FeedbackPanel.tsx`

| Step | User Action | UI Change |
|------|-------------|-----------|
| 3.12 | Answer submitted | FeedbackPanel slides in below the options |
| 3.13 | — | Correct: green check icon + "Correct" heading. Incorrect: amber warning icon + "Not quite" heading. |
| 3.14 | — | Correct option highlighted green (`#EDFAF4` bg, `#2D9F6F` border). User's incorrect choice highlighted red (`#FDF0F0` bg, `#D64545` border). |
| 3.15 | — | Rationale text displayed (if available). Wiki article link shown (if `wikiUrl` provided). Mnemonic tip shown if user has failed this question 2+ times. |
| 3.16 | Gated delay | "Next" button disabled for `gatedProgressionDelayMs` (prevents rushing). Countdown visible. |
| 3.17 | User clicks "Next" (or slides again) | Feedback hidden, advances to next question |

#### No Immediate Feedback (Storm, Full Exam, Extended)

| Step | User Action | UI Change |
|------|-------------|-----------|
| 3.12b | Answer submitted | No feedback panel. Options remain in neutral state. Timer continues. |
| 3.13b | User clicks "Next" or slides | Advances to next question immediately |

#### Navigation Between Questions

| Step | User Action | UI Change | Store Update |
|------|-------------|-----------|--------------|
| 3.18 | User clicks "Next" in footer | Next question loads | `goNext()` — increments `currentIndex` |
| 3.19 | User clicks "Previous" in footer (if allowed) | Previous question loads with prior answer preserved | `goPrevious()` — decrements `currentIndex` |
| 3.20 | User clicks palette button (header) | Question palette slides in from right | `togglePalette()` |
| 3.21 | User clicks question number in palette | Jumps to that question | `goToQuestion(index)` |
| 3.22 | User clicks bookmark/flag icon (header) | Current question flagged (orange flag in palette) | `toggleFlag(qid)` → server: `flagQuestion()` |
| 3.23 | User clicks "Skip" (if enabled) | Question marked as skipped, advances | `skipCurrentQuestion()` |

#### Question Palette Details

**Component:** `src/components/quiz-v2/QuestionPalette.tsx`

- Slide-in right panel with modal overlay
- Grid of numbered cells (7 columns)
- **Cell states:**
  - Unanswered: white background, `#D4DAE3` border, empty circle
  - Answered: `#1B3FC4` (Camp Cobalt) background, white checkmark
  - Flagged: `#E8853A` (Camp Orange) background, flag icon
  - Current: white background, `#1B3FC4` border + ring, bold number
  - Skipped: dashed border, arrow icon
- **Filter pills:** All / Unanswered / Flagged
- **Keyboard navigation:** Arrow keys to traverse, Enter to jump
- Focus-trapped (Escape or outside click closes)

#### Micro Break (if enabled)

| Step | What Happens | UI Change |
|------|-------------|-----------|
| 3.24 | `config.breaks.intervalQuestions` reached | `MicroBreakOverlay` appears — fullscreen overlay |
| 3.25 | Break countdown timer shown | Duration from `config.breaks.breakDurationSeconds` |
| 3.26 | User clicks "Continue" or countdown expires | Overlay dismissed, quiz resumes |

#### Timer Behavior

- **Countdown mode:** Timer ticks down. At <10% remaining, display turns warning color. At 0, auto-submits remaining answers.
- **Countup mode:** Timer ticks up. No auto-submit.
- Timer displayed in header, formatted as `MM:SS` or `HH:MM:SS` (for 4-hour exams).

#### Exiting Mid-Quiz

| Step | User Action | UI Change |
|------|-------------|-----------|
| 3.27 | User clicks "Exit" (header) | `ExitConfirmModal` appears: "You've answered X of Y questions. X remain unanswered." |
| 3.28 | User clicks "Continue session" | Modal dismissed, quiz resumes |
| 3.29 | User clicks "Exit" (confirm) | Session ended with status `'abandoned'`, redirects to dashboard |

#### Reaching the Last Question

| Step | User Action | UI Change |
|------|-------------|-----------|
| 3.30 | User answers last question | Footer "Next" button changes to **"See Results"** |
| 3.31 | User clicks "See Results" | If unanswered questions exist: `SubmitConfirmModal` shown |
| 3.32 | `SubmitConfirmModal` displayed | Shows count of unanswered + flagged questions. Options: "Review unanswered" / "Submit all" / "Cancel" |
| 3.33 | User clicks "Submit all" | `endSession()` called, loading state shown ("Calculating results...") |
| 3.34 | User clicks "Review unanswered" | Jumps to first unanswered question |
| 3.35 | Results ready | Browser navigates to `/quiz/[mode]/session/[sessionId]/results` |

---

### Phase 4: Results & Review

**What the user sees last:** The Results Dashboard

**File:** `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx` → `src/components/quiz-v2/results/ResultsDashboard.tsx`

> **Full Exam Simulation note:** Results are gated behind a 24-hour delay. The user sees a "Results available at [datetime]" message and cannot view scores until the gate lifts.

#### Results Dashboard Sections (in display order)

| Section | Component | What It Shows |
|---------|-----------|---------------|
| **1. Score Reveal** | `ScoreReveal` | Animated score percentage (e.g., "78%"), correct/total count (e.g., "39/50"), growth delta vs. previous session |
| **2. Readiness Impact** | `ReadinessImpact` | Before/after readiness score with delta arrow (e.g., "62 → 65, +3") |
| **3. Self-Assessment Accuracy** | `PredictionComparison` | Prediction vs. actual score (storm/fullexam/extended only). Shows calibration accuracy. |
| **4. Subject Breakdown** | `SubjectBreakdown` | Bar chart or table showing % correct per discipline/subject area |
| **5. Stamina Chart** | `StaminaChart` | Performance across question blocks (only for sessions with 50+ questions). Shows if accuracy drops over time. |
| **6. Confidence Matrix** | `ConfidenceMatrix` | 2x3 heatmap: Confident+Correct, Confident+Incorrect, Unsure+Correct, etc. (hidden in Chill mode) |
| **7. Question Review** | `ReviewCardList` | Expandable cards for each question. Shows: stem, user's answer (highlighted), correct answer, rationale, wiki link, flag status, confidence level. |
| **8. Recommendations** | `FeedForwardCards` | AI-generated next steps: suggested quiz mode, wiki articles to review, weak topics to revisit |
| **9. Simulation Debrief** | `SimulationDebrief` | Full Exam mode only — extended analysis of exam readiness |
| **10. Action CTAs** | `ResultsCTAs` | "Practice Missed Questions" shortcut (creates new session pre-filtered to missed Qs), "Return to Dashboard", "Start New Session" |

#### User Interactions on Results Page

| Step | User Action | What Happens |
|------|-------------|--------------|
| 4.1 | User views score reveal | Animated number count-up to final percentage |
| 4.2 | User scrolls to Subject Breakdown | Per-subject scores displayed with color coding |
| 4.3 | User expands a review card | Full question stem, options (marked correct/incorrect), rationale, and wiki link revealed |
| 4.4 | User clicks wiki link in review card | Navigates to wiki article for deeper learning |
| 4.5 | User clicks "Practice Missed Questions" | Redirects to `/quiz/[mode]/setup?source=missed&sessionId=[id]` — pre-populates setup with missed question topics |
| 4.6 | User clicks "Return to Dashboard" | Navigates back to Testing Hub |

---

## 3. State Management (Zustand Store)

**File:** `src/stores/useQuizStore.ts` — Zustand with `persist` middleware (localStorage)

### Store Shape

```
useQuizStore
├── sessionId: string
├── config: QuizSessionConfig
├── status: 'idle' | 'active' | 'feedback' | 'results'
├── questions: QuestionForClient[]
├── currentIndex: number
├── totalQuestions: number
├── answers: Map<questionId, QuizAnswerState>
│   └── QuizAnswerState:
│       ├── selectedOptionId?: string
│       ├── confidenceLevel?: 1 | 2 | 3
│       ├── isCorrect?: boolean
│       ├── isSkipped: boolean
│       ├── isFlagged: boolean
│       ├── timeStartedMs: number
│       ├── timeSpentMs: number
│       └── submittedAt?: string (ISO)
├── eliminatedOptions: Map<questionId, Set<optionId>>
├── timer:
│   ├── elapsedMs: number
│   ├── limitMs: number
│   └── isRunning: boolean
├── feedback:
│   ├── visible: boolean
│   ├── questionId: string
│   ├── isCorrect: boolean
│   ├── correctOptionId: string
│   ├── rationale: string
│   └── wikiUrl: string
└── ui:
    ├── paletteOpen: boolean
    ├── exitModalOpen: boolean
    ├── submitModalOpen: boolean
    ├── microBreakVisible: boolean
    └── calculatingResults: boolean
```

### Key Actions

| Action | Trigger | Effect |
|--------|---------|--------|
| `reset()` | Setup page mount | Clears all session state |
| `initSession(data)` | After `startSession` returns | Populates store with session data |
| `selectAnswer(qid, optionId)` | User clicks an option | Updates `answers` map entry |
| `setConfidence(qid, level)` | User adjusts confidence slider | Updates answer's `confidenceLevel` |
| `toggleEliminate(qid, optionId)` | User clicks elimination X | Adds/removes from `eliminatedOptions` set |
| `submitCurrentAnswer()` | SlideToSubmit threshold reached | Calls server action, processes response |
| `showFeedback(data)` | Server returns answer result | Sets feedback state, renders FeedbackPanel |
| `hideFeedback()` | User clicks Next after feedback | Clears feedback state |
| `goNext()` | Next button / slide after feedback | Increments `currentIndex` |
| `goPrevious()` | Previous button | Decrements `currentIndex` |
| `goToQuestion(index)` | Palette cell clicked | Sets `currentIndex` directly |
| `skipCurrentQuestion()` | Skip button | Marks answer as skipped, advances |
| `togglePalette()` | Palette button in header | Toggles `ui.paletteOpen` |
| `startTimer()` | Session init (if timer enabled) | Sets `timer.isRunning = true` |
| `tickTimer()` | 1-second interval | Increments/decrements timer |
| `endSession()` | Submit all confirmed | Calls server action, navigates to results |

---

## 4. Backend & Database Audit

### 4.1 Session Start

**Server Action:** `startSession()` — `src/lib/actions/quiz-v2/start-session.ts`

**Input:** `{ mode: QuizMode, config: Partial<QuizSessionConfig> }`

#### Database Reads

| Table | Operation | Columns Read | Purpose |
|-------|-----------|-------------|---------|
| `user_global_stats` | SELECT | `global_readiness_score`, `current_discipline_id` | Baseline readiness score |
| `user_interactions` | SELECT (count) | `question_id`, `interaction_timestamp` | Exclude questions answered in last 7 days |
| `taxonomy_tree` | SELECT (batches) | `node_id`, `is_leaf`, `name`, `subject_area` | Expand selected topics to leaf nodes |
| `taxonomy_cross_references` | SELECT | `target_node_id`, `source_node_id` | Resolve Laws & Codes cross-references |
| `questions` | SELECT | `question_id`, `topic_id`, `text`, `options`, `difficulty`, `prompt_image_url`, `question_type` | Fetch question pool |

#### Database Write

| Table | Operation | Columns Written |
|-------|-----------|----------------|
| **`quiz_sessions`** | **INSERT** | `session_id` (UUID), `user_id` (UUID), `discipline_id` (UUID), `test_mode` (enum), `status` ('in_progress'), `config` (JSONB), `question_ids` (UUID[]), `subject_ids` (UUID[]), `started_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `mastery_snapshot_at_start` (JSONB, optional) |

**Return to client:** `{ sessionId, config, questions[] (answer keys stripped), totalQuestions, readinessScoreBefore }`

---

### 4.2 Answer Submission

**Server Action:** `submitAnswer()` — `src/lib/actions/quiz-v2/submit-answer.ts`

**Input:** `{ sessionId, questionId, selectedOptionId, confidenceLevel?, timeSpentMs }`

Called once per question when the user completes the slide-to-submit gesture.

#### Database Reads

| Table | Operation | Columns Read | Purpose |
|-------|-----------|-------------|---------|
| `quiz_sessions` | SELECT | `session_id`, `user_id`, `status`, `config`, `question_ids` | Validate session ownership |
| `questions` | SELECT | `question_id`, `topic_id`, `correct_option_id`, `rationale`, `difficulty`, `options`, `question_type`, `correct_value`, `value_tolerance`, `accepted_answers` | Determine correctness, fetch rationale |
| `wiki_article_taxonomy` | SELECT (join) | `article_id`, `node_id`, `is_primary` + `wiki_articles.slug` | Get wiki article link for feedback |

#### Database Writes (Synchronous)

| Table | Operation | Columns Written |
|-------|-----------|----------------|
| **`user_interactions`** | **UPSERT** | `interaction_id` (UUID), `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id` (TEXT), `is_correct` (BOOLEAN), `time_spent_ms` (INTEGER), `confidence` (TEXT: 'sure'/'unsure'/null), `confidence_score` (NUMERIC 0–1), `is_suspected_lucky_guess` (BOOLEAN), `question_order` (INTEGER), `interaction_timestamp` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `is_flagged` (BOOLEAN), `answer_changes` (INTEGER), `options_eliminated` (INTEGER) |

> **Conflict key:** `(user_id, session_id, question_id)` — ensures idempotent retries.

#### Database Writes (Async / Non-Blocking via `runPostInteractionHooks`)

| Table | Operation | Columns Written | Trigger Condition |
|-------|-----------|----------------|-------------------|
| **`user_interactions`** | UPDATE | `error_type` (TEXT), `updated_at` | Incorrect answer + immediate feedback mode |
| **`user_node_mastery`** | UPSERT | `storage_strength`, `retrieval_strength`, `practice_count`, `practice_contexts` | Every answer |
| **`user_node_mastery`** | UPDATE | `decay_rate`, `predicted_recall`, `optimal_review_at` | Every answer |
| **`successive_relearning_cycles`** | INSERT/UPDATE | `status`, `consecutive_correct`, `current_spacing_interval`, `spacing_level`, `next_retest_at`, `total_resets` | Camp/Focused modes (SR enabled) |

**Return to client:** `{ isCorrect, correctOptionId, rationale, wikiUrl, errorDiagnostic, closeness, correctAnswer }`

---

### 4.3 Session End

**Server Action:** `endSession()` — `src/lib/actions/quiz-v2/end-session.ts`

Called when the user confirms "Submit all" or exits (abandoned).

#### Database Reads

| Table | Operation | Columns Read | Purpose |
|-------|-----------|-------------|---------|
| `quiz_sessions` | SELECT | `session_id`, `user_id`, `status`, `config`, `question_ids`, `started_at` | Validate session |
| `user_interactions` | SELECT | `question_id`, `is_correct`, `topic_id`, `time_spent_ms` | Compute final score |
| `user_global_stats` | SELECT | `global_readiness_score` | Pre-session readiness for delta |
| `taxonomy_tree` | SELECT | `node_id`, `name`, `subject_area`, `discipline_id` | Build subject breakdown |
| `trail_steps` | SELECT (join) | `trail_id`, step data | Check trail day completion |

#### Database Writes (Synchronous)

| Table | Operation | Columns Written |
|-------|-----------|----------------|
| **`quiz_sessions`** | **UPDATE** | `status` ('completed' or 'abandoned'), `completed_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ) |
| **`user_global_stats`** | **UPDATE** | `global_readiness_score` (DOUBLE PRECISION), `readiness_sub_scores` (JSONB), `score_velocity_7d` (DOUBLE PRECISION), `score_velocity_updated_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ) |

#### Database Writes (Async / Post-Session Hooks)

| Table | Operation | Columns Written | Purpose |
|-------|-----------|----------------|---------|
| **`calibration_snapshots`** | INSERT | `id`, `user_id`, `calibration_score`, `brier_score`, `sample_size`, `confident_accuracy`, `guessing_accuracy`, `overconfidence_index`, `underconfidence_index`, `window_start`, `window_end`, `created_at` | Confidence calibration analysis (30-day window) |
| **`notifications`** | INSERT | Score change notification | Alert user of readiness score movement |
| **`notifications`** | INSERT | Zone transition notification | Alert if user crossed a readiness zone threshold |

**Return to client:** `EndSessionResult { score, subjectBreakdown[], readinessScoreBefore, readinessScoreAfter, readinessScoreDelta, missedQuestionCount, recommendations[] }`

---

### 4.4 Background Processing

#### Prediction / Postdiction

| When | Table | Operation | Columns |
|------|-------|-----------|---------|
| Pre-quiz (storm/fullexam/extended) | **`session_predictions`** | INSERT | `id`, `user_id`, `session_id`, `prediction_score` (0–100), `prediction_at` |
| Post-quiz | **`session_predictions`** | UPDATE | `postdiction_score` (0–100), `actual_score` (0–100), `postdiction_at` |

#### Flag Question

| When | Table | Operation | Columns |
|------|-------|-----------|---------|
| User toggles flag during quiz | **`user_interactions`** | UPDATE | `is_flagged` (BOOLEAN), `updated_at` |

#### Error Classification (`classify-and-store-error.ts`)

Applied asynchronously to incorrect answers:

| Error Type | Condition |
|------------|-----------|
| `'careless'` | Fast response + wrong answer |
| `'lack_time'` | Slow response + wrong answer |
| `'lack_knowledge'` | No prior history on topic + wrong answer |
| `'lucky_guess'` | Fast response + correct answer (flagged as `is_suspected_lucky_guess`) |

#### Memory Strength Updates (`update-memory-strength.ts`)

| Metric | Update Rule |
|--------|-------------|
| `storage_strength` | Monotonically increases. Increment weighted by difficulty + interleaving bonus. |
| `retrieval_strength` | Jumps to 0.8 on correct answer. Decays exponentially on incorrect. |
| `practice_count` | +1 per answer |
| `practice_contexts` | +1 if new session mode detected (context diversity) |

#### Decay Rate Updates (`update-decay-rate.ts`)

| Outcome | Decay Adjustment |
|---------|-----------------|
| Incorrect | `decay *= 1.1` (capped at 0.8 — forgets faster) |
| Correct + slow (>1.5x expected time) | `decay *= 1.05` |
| Correct + fast | `decay *= 0.95` (min 0.1 — better retention) |

After adjustment: `predicted_recall = exp(-decay_rate * daysSinceReview)` and `optimal_review_at = last_encountered + (1/decay_rate * 2) days`.

#### Readiness Score Computation (`readiness-score-update.ts`)

Multi-stage anti-inflation algorithm:

1. **Base score:** Average `current_mastery_weight` per touched leaf node
2. **Subject floor:** 50% of max (prevents weak subjects from being hidden)
3. **Ceiling:** Minimum of all subject scores (bottleneck principle)
4. **Grey penalty:** Untouched nodes reduce the score
5. **Thin coverage penalty:** <5 distinct questions seen per node
6. **Exam frequency weighting:** High-frequency subjects weighted higher
7. **Day 1/Day 2 split:** Separate scores for each exam day
8. **Cross-reference projection:** Laws & Codes score derived from related subtopics

**Output stored in `user_global_stats.readiness_sub_scores` (JSONB):**
```json
{
  "ALE-SUBJ1": { "score": 72, "nodeCount": 45, "touchedCount": 30, "greyCount": 15, "thinCoverageCount": 5, "belowFloor": false },
  "ALE-LAWS": { "score": 68, "projected": true },
  "_meta": { "ceilingActive": true, "ceilingValue": 65, "ceilingReason": "ALE-SUBJ3", "greyPenalty": 8, "rawScore": 73, "dayOneScore": 67, "dayTwoScore": 63 }
}
```

---

## 5. Database Tables Reference

### Tables Directly Mutated During Quiz

| Table | Write Operations | When |
|-------|-----------------|------|
| `quiz_sessions` | INSERT (start), UPDATE (end) | Session lifecycle |
| `user_interactions` | UPSERT (each answer), UPDATE (flag, error classification) | Per-question |
| `user_node_mastery` | UPSERT (memory strength), UPDATE (decay rate) | Per-question (async) |
| `user_global_stats` | UPDATE (readiness score, sub-scores, velocity) | Session end |
| `calibration_snapshots` | INSERT | Session end (async) |
| `session_predictions` | INSERT (pre-quiz), UPDATE (post-quiz) | Prediction flow |
| `successive_relearning_cycles` | INSERT/UPDATE | Camp/Focused modes (async) |
| `notifications` | INSERT | Session end (async) |

### Tables Read During Quiz

| Table | When Read |
|-------|-----------|
| `questions` | Session start (question pool), answer submission (correctness check) |
| `taxonomy_tree` | Session start (topic expansion), session end (subject breakdown) |
| `taxonomy_cross_references` | Session start (cross-ref resolution) |
| `wiki_article_taxonomy` + `wiki_articles` | Answer submission (wiki link for feedback) |
| `trail_steps` + `trail_days` | Session end (trail completion check) |

---

## 6. Complete Data Flow Diagram

```
USER JOURNEY                          DATABASE MUTATIONS
─────────────                         ──────────────────

[Dashboard: Pick Mode]
        │
        ▼
[Setup Slides: Config]
        │
        ▼
[Click "Begin"]  ──────────────────►  INSERT quiz_sessions
        │                              (status: 'in_progress')
        ▼
[Prediction Slider] ──────────────►  INSERT session_predictions
  (storm/fullexam)                    (prediction_score)
        │
        ▼
[Question 1 Loads]
        │
        ▼
[Select Option] ───────────────────►  (client-only: store update)
        │
        ▼
[Set Confidence] ──────────────────►  (client-only: store update)
        │
        ▼
[Slide to Submit] ─────────────────►  UPSERT user_interactions
        │                              (answer, correctness, timing)
        │                             ┌─ UPDATE user_node_mastery
        │                             │   (memory strength, decay)
        │                             ├─ UPDATE user_interactions
        │                             │   (error_type classification)
        │                             └─ INSERT/UPDATE
        │                                 successive_relearning_cycles
        ▼
[Feedback Panel]  ◄────────────────  Server returns: isCorrect,
  (immediate modes)                   rationale, wikiUrl
        │
        ▼
[Click Next] ──────────────────────►  (client-only: index++)
        │
        ▼
  ... repeat for each question ...
        │
        ▼
[Last Question: "See Results"]
        │
        ▼
[Submit Confirm Modal]
        │
        ▼
[Click "Submit All"] ─────────────►  UPDATE quiz_sessions
        │                              (status: 'completed')
        │                             UPDATE user_global_stats
        │                              (readiness score recalculated)
        │                             INSERT calibration_snapshots
        │                             INSERT notifications
        ▼
[Results Dashboard]
        │
        ├── Score Reveal (animated %)
        ├── Readiness Impact (before → after)
        ├── Subject Breakdown
        ├── Confidence Matrix
        ├── Question Review Cards
        └── Recommendation CTAs
                │
                ▼
[Click "Practice Missed"] ─────────►  Redirects to setup with
                                       source=missed filter
```

---

## 7. Key Files Index

### Setup Flow
| File | Role |
|------|------|
| `src/app/quiz/[mode]/setup/page.tsx` | Server component — validates mode, fetches taxonomy |
| `src/app/quiz/[mode]/setup/client.tsx` | Client component — manages setup phase state machine |
| `src/components/quiz-v2/setup/SetupFlow.tsx` | Orchestrates setup slides based on mode |
| `src/components/quiz-v2/setup/IntroSlide1.tsx` | Mode intro, question count, pressure level |
| `src/components/quiz-v2/setup/IntroSlide2.tsx` | Topic/subject picker with mastery indicators |
| `src/components/quiz-v2/setup/IntroSlide3.tsx` | Advanced config (Custom mode only) |
| `src/components/quiz-v2/setup/PressureLevelSelector.tsx` | Pressure levels 0–3 with readiness gates |

### Quiz Engine
| File | Role |
|------|------|
| `src/components/quiz-v2/QuizShell.tsx` | Main quiz container — composes all sub-components |
| `src/stores/useQuizStore.ts` | Zustand store — single source of truth for session state |
| `src/components/quiz-v2/QuizHeader.tsx` | Progress bar, timer, exit/bookmark/palette buttons |
| `src/components/quiz-v2/QuizBody.tsx` | Two-column layout: question stem + answer options |
| `src/components/quiz-v2/QuizFooter.tsx` | Previous/Next buttons, position counter |
| `src/components/quiz-v2/OptionsColumn.tsx` | MCQ option radio group |
| `src/components/quiz-v2/QuizOption.tsx` | Individual option card with visual states |
| `src/components/quiz-v2/SlideToSubmit.tsx` | Drag-to-submit gesture component (80% threshold) |
| `src/components/quiz-v2/FeedbackPanel.tsx` | Inline feedback with rationale and wiki link |
| `src/components/quiz-v2/QuestionPalette.tsx` | Question grid navigator (slide-in panel) |
| `src/components/quiz-v2/ExitConfirmModal.tsx` | Exit confirmation with answer count |
| `src/components/quiz-v2/SubmitConfirmModal.tsx` | Submit confirmation with unanswered summary |
| `src/components/quiz-v2/MicroBreakOverlay.tsx` | Timed break screen |

### Results
| File | Role |
|------|------|
| `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx` | Server component — fetches all result data |
| `src/components/quiz-v2/results/ResultsDashboard.tsx` | Main results container with all sections |
| `src/components/quiz-v2/results/ScoreReveal.tsx` | Animated score percentage |
| `src/components/quiz-v2/results/SubjectBreakdown.tsx` | Per-subject performance |
| `src/components/quiz-v2/results/ReviewCardList.tsx` | Expandable question review cards |
| `src/components/quiz-v2/results/ConfidenceMatrix.tsx` | Confidence vs. correctness heatmap |
| `src/components/quiz-v2/results/StaminaChart.tsx` | Performance over question blocks |

### Server Actions
| File | Role |
|------|------|
| `src/lib/actions/quiz-v2/start-session.ts` | Creates session, selects questions |
| `src/lib/actions/quiz-v2/submit-answer.ts` | Processes answer, returns feedback |
| `src/lib/actions/quiz-v2/end-session.ts` | Completes session, computes final score |
| `src/lib/actions/quiz-v2/classify-and-store-error.ts` | Async error type classification |
| `src/lib/actions/quiz-v2/flag-question.ts` | Toggle question flag |
| `src/lib/actions/quiz-v2/save-prediction.ts` | Save pre-quiz prediction |
| `src/lib/actions/quiz-v2/save-postdiction.ts` | Save post-quiz postdiction |
| `src/lib/actions/quiz-v2/successive-relearning.ts` | SR cycle state machine |
| `src/lib/actions/readiness-score-update.ts` | Multi-stage readiness computation |

### Config & Types
| File | Role |
|------|------|
| `src/lib/constants/testing-modes.ts` | 8 mode definitions with metadata |
| `src/lib/quiz/mode-presets.ts` | Default config per mode |
| `src/types/quiz-config.ts` | All TypeScript types for quiz system |
## 8. Happy Paths (Testing Feature)

| # | Path | Flow | Expected Outcome |
|---|------|------|-----------------|
| 1 | First-time Camp session | Hub → Camp ModeCard → Setup → Start → 10 questions → Results | Score + readiness delta |
| 2 | Storm timed practice | Hub → Storm ModeCard → Setup → Start → Timer expires → Results | Score without feedback |
| 3 | Focus Review | Hub → SmartSuggestion → 12q from weak nodes → Results | Targeted remediation |
| 4 | Full Exam Simulation | Hub → Simulation (gated ≥65) → Briefing → 200q → Wait 24h → Results | Cold-delivered results |
| 5 | Review past session | Hub → SessionsTable → Click row → Debrief | Full breakdown + review |

## 9. Edge Cases (Testing Feature)

| Case | Behavior |
|------|----------|
| Readiness < 65 + click Simulation | Server redirect back to hub |
| No questions match filter | Empty state in setup |
| Session interrupted (browser close) | Auto-save every 10s + localStorage backup |
| 200-question fullexam | Batched in chunks of 80 |
| Mode not in valid list | 404 page |
| Timer expires (Storm) | Auto-submit, advance next |
| All questions skipped (Chill) | Allow end, count incomplete |
| Network loss | Offline banner, localStorage persists |
| Pro feature for free user | Paywall prompt |
| Zero mastery data | "Complete more questions first" message |

## 10. Component Inventory (Quiz Engine — 59 components verified)

### Quiz Shell
| Component | File |
|-----------|------|
| QuizShell | quiz-v2/QuizShell.tsx |
| QuizHeader | quiz-v2/QuizHeader.tsx |
| QuizBody | quiz-v2/QuizBody.tsx |
| QuizFooter | quiz-v2/QuizFooter.tsx |
| QuizOption | quiz-v2/QuizOption.tsx |
| OptionsColumn | quiz-v2/OptionsColumn.tsx |
| QuestionColumn | quiz-v2/QuestionColumn.tsx |
| SlideToSubmit | quiz-v2/SlideToSubmit.tsx |
| FeedbackPanel | quiz-v2/FeedbackPanel.tsx |
| QuestionPalette | quiz-v2/QuestionPalette.tsx |
| ExitConfirmModal | quiz-v2/ExitConfirmModal.tsx |
| SubmitConfirmModal | quiz-v2/SubmitConfirmModal.tsx |
| MicroBreakOverlay | quiz-v2/MicroBreakOverlay.tsx |
| TimerDisplay | quiz-v2/TimerDisplay.tsx |
| ConfidenceInput | quiz-v2/ConfidenceInput.tsx |

### Setup
| Component | File |
|-----------|------|
| SetupFlow | quiz-v2/setup/SetupFlow.tsx |
| ModeSelector | quiz-v2/setup/ModeSelector.tsx |
| QuestionCountPills | quiz-v2/setup/QuestionCountPills.tsx |
| PressureLevelSelector | quiz-v2/setup/PressureLevelSelector.tsx |
| IntroSlide1-3 | quiz-v2/setup/IntroSlide*.tsx |
| SimulationChecklist | quiz-v2/setup/SimulationChecklist.tsx |

### Results
| Component | File |
|-----------|------|
| ResultsDashboard | quiz-v2/results/ResultsDashboard.tsx |
| ScoreReveal | quiz-v2/results/ScoreReveal.tsx |
| SubjectBreakdown | quiz-v2/results/SubjectBreakdown.tsx |
| ReviewCardList | quiz-v2/results/ReviewCardList.tsx |
| ConfidenceMatrix | quiz-v2/results/ConfidenceMatrix.tsx |
| StaminaChart | quiz-v2/results/StaminaChart.tsx |
| ReadinessImpact | quiz-v2/results/ReadinessImpact.tsx |
| PredictionComparison | quiz-v2/results/PredictionComparison.tsx |
| SimulationDebrief | quiz-v2/results/SimulationDebrief.tsx |
| FeedForwardCards | quiz-v2/results/FeedForwardCards.tsx |

### Review & SRS
| Component | File |
|-----------|------|
| ReviewMode | quiz-v2/review/ReviewMode.tsx |
| QuestionHistory | quiz-v2/review/QuestionHistory.tsx |
| SRSpacingTimeline | quiz-v2/SRSpacingTimeline.tsx |
| SRProgressRing | quiz-v2/SRProgressRing.tsx |

### State
| File | Lines |
|------|-------|
| useQuizStore.ts | 1005 |

## 11. Server Actions (19 total verified)

| Action | File |
|--------|------|
| start-session | quiz-v2/start-session.ts |
| submit-answer | quiz-v2/submit-answer.ts |
| end-session | quiz-v2/end-session.ts |
| flag-question | quiz-v2/flag-question.ts |
| save-prediction | quiz-v2/save-prediction.ts |
| save-postdiction | quiz-v2/save-postdiction.ts |
| successive-relearning | quiz-v2/successive-relearning.ts |
| sr-post-submit | quiz-v2/sr-post-submit.ts |
| pause-resume | quiz-v2/pause-resume.ts |
| skip-question | quiz-v2/skip-question.ts |
| generate-recommendations | quiz-v2/generate-recommendations.ts |
| get-confidence-matrix | quiz-v2/get-confidence-matrix.ts |
| get-prediction-history | quiz-v2/get-prediction-history.ts |
| get-review-data | quiz-v2/get-review-data.ts |
| post-session-hooks | quiz-v2/post-session-hooks.ts |
| classify-and-store-error | quiz-v2/classify-and-store-error.ts |
| check-generation-answer | quiz-v2/check-generation-answer.ts |
| readiness-score-update | lib/actions/readiness-score-update.ts |

## 12. Issues Found

### High Priority
1. **Dual routing**: Legacy `/dashboard/testing/*/setup` + new `/quiz/[mode]/setup` both active
2. **Dual debrief**: DebriefLayout vs ResultsDashboard both running

### Medium Priority
3. **Endurance routes outside quiz**: Routes to `/dashboard/area-c/design-quiz`
4. **No unified question fetching**: Different logic per mode
5. **Pro gating inconsistent**: Some in component, some in server action
6. **MODE_DEFINITIONS mismatch**: 8 defined, audit listed 9

### Low Priority
7. **SessionShell dead code**: Legacy, replaced by QuizShell
8. **Offline support partial**: localStorage exists, no explicit indicator

## 13. Recommendations

### High Priority
1. Deprecate `/dashboard/testing/*/setup`, make `/quiz/[mode]/setup` canonical
2. Deprecate DebriefLayout, migrate to ResultsDashboard
3. Fix MODE_DEFINITIONS count

### Medium Priority
4. Move Pro checks to server action layer
5. Move endurance to `/quiz/endurance/*`
6. Make timer reusable across modes

### Low Priority
7. Remove dead code (SessionShell + 14 legacy components)
8. Add explicit offline indicator
9. Apply 2s feedback gate consistently

## 14. Verification (2026-04-04)

| Metric | Value |
|--------|-------|
| Quiz routes | 13 files |
| Quiz-v2 components | 59 |
| Quiz-v2 server actions | 18 + 1 |
| useQuizStore | 1005 lines |
| Mode definitions | 8 |

---

*End — Sections 8-14 added via codebase research*

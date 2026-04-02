# /dashboard/testing — Complete Route Audit

> **Last updated:** 2026-04-02
> **Status:** Comprehensive audit — all UX paths, components, data flows, issues mapped.
> **Related:** `docs/plans/design-system-cleanup.md`, `docs/audits/wiki-route-audit.md`

---

## 1. Route Tree

```
/dashboard/testing/
├── layout.tsx                     — metadata ("Review & Testing | SlateCamp")
├── loading.tsx                    — skeleton
├── page.tsx                       — ReviewHub (server RSC, streams via Suspense)
│
├── camp/setup/
│   ├── page.tsx                   — CampSetup (fetches completedSessionCount)
│   └── loading.tsx
├── chill/setup/
│   ├── page.tsx                   — ChillSetup (auth only)
│   └── loading.tsx
├── storm/setup/
│   ├── page.tsx                   — StormSetup (auth only)
│   └── loading.tsx
├── focus-review/setup/
│   ├── page.tsx                   — FocusReviewSetup (fetches weakNodes: mastery < 0.4, attempts > 0)
│   └── loading.tsx
├── custom/setup/
│   ├── page.tsx                   — CustomSetup (auth only)
│   └── loading.tsx
├── subject/setup/
│   ├── page.tsx                   — SubjectSetup (fetches per-subject mastery aggregation)
│   └── loading.tsx
├── endurance/setup/
│   ├── page.tsx                   — EnduranceSetup (fetches last 5 extended_practice sessions)
│   └── loading.tsx
│
├── session/[sessionId]/
│   ├── page.tsx                   — LEGACY v1 redirect → /quiz/[mode]/session/[id]
│   ├── loading.tsx
│   ├── error.tsx
│   └── debrief/
│       ├── page.tsx               — DebriefLayout (completed sessions, simulation cold-delivery check)
│       ├── loading.tsx
│       └── error.tsx
│
└── simulation/
    ├── briefing/
    │   ├── page.tsx               — Gate: readiness >= 65; SimulationBriefing
    │   └── loading.tsx
    └── [sessionId]/results/
        ├── page.tsx               — Cold-delivery results (24h window); SimulationResults
        └── loading.tsx
```

### Quiz V2 Engine Route Tree (Separate)

The actual session engine lives outside `/dashboard/testing/`:

```
/quiz/
├── layout.tsx
├── loading.tsx
├── page.tsx
└── [mode]/
    ├── setup/
    │   ├── page.tsx               — Unified setup for all modes; fetches taxonomy + mastery
    │   ├── client.tsx             — SetupPageClient (multi-step UI)
    │   └── loading.tsx
    └── session/[sessionId]/
        ├── page.tsx               — QuizSessionPage: fetches questions (batched 80/chunk), renders QuizShell
        ├── loading.tsx
        └── results/
            ├── page.tsx           — ResultsDashboard: stamina, confidence matrix, predictions
            ├── loading.tsx
            └── review/
                ├── page.tsx       — Per-question review
                └── loading.tsx
```

**Valid modes:** `camp`, `chill`, `subject`, `focused`, `custom`, `storm`, `fullexam`, `extended`

**Root cause of dual routing:** There are TWO parallel routing systems. `/dashboard/testing/` handles the hub, legacy setup pages, and debrief. The actual session engine lives at `/quiz/[mode]/session/[sessionId]/`. Setup components call `startSession()` then `router.push(ROUTES.QUIZ_V2_SESSION(...))`, crossing the boundary.

---

## 2. Zone Architecture

### Zone 01 — Foundations (Free Tier)

| Mode | Route | Setup Config | Session Behavior |
|------|-------|-------------|-----------------|
| **Camp** | `/quiz/camp/setup` | Question count pills + ConfidenceCheck + FocusSelector | Select → Submit → see correctness + confidence + error tags → Next |
| **Chill** | `/quiz/chill/setup` | Minimal config | Select → Submit or Skip → End Session button always visible |

### Zone 02 — Deliberate Practice (Pro)

| Mode | Route | Setup Config | Session Behavior |
|------|-------|-------------|-----------------|
| **Subject** | `/quiz/subject/setup` | Subject picker + question count | Same as Camp but filtered to single ALE subject |
| **Focus Review** | `/quiz/focused/setup` | Shows top 5 weak nodes (mastery < 40%), 12q fixed | Targets weakest areas specifically |
| **Custom** | `/quiz/custom/setup` | Full topic/difficulty/count control | User-configured parameters |

### Zone 03 — Exam Readiness (Pro)

| Mode | Route | Setup Config | Session Behavior |
|------|-------|-------------|-----------------|
| **Storm** | `/quiz/storm/setup` | Question count pills + time estimate | Select → Confirm → auto-advance (no correctness shown) → StormTimerBar depletes |
| **Full Exam Simulation** | `/quiz/fullexam/setup` | 200 questions, consent flow | Gated at readiness >= 65. 24h cold delivery of results |
| **Endurance** | `/dashboard/area-c/design-quiz` | Extended practice config | **Routes OUTSIDE quiz engine** to separate long-format scenario picker |

---

## 3. Complete UX Journey

### 3.1 Hub Page (`/dashboard/testing`)

**Component:** `ReviewHub` (`src/components/testing/hub/ReviewHub.tsx`)

**Data fetched** (9 parallel Supabase queries):
| Query | Table/Action | Purpose |
|-------|-------------|---------|
| 1 | `user_subscriptions` | Check Pro status for zone gating |
| 2 | `quiz_sessions` | Session history for SessionsTable |
| 3 | `user_global_stats` | Readiness score, discipline info |
| 4 | `blindspot_queues` | Pending blindspot items for SmartSuggestion |
| 5 | `profiles` | User profile info |
| 6 | `user_node_mastery` | Per-topic mastery for weak-area detection |
| 7 | SR action: `getDueSRItems()` | Due successive relearning items |
| 8 | SR action: `getActiveSRCycles()` | Active learning cycles |
| 9 | SR action: `getSRProgress()` | Overall SR progress |

**Sections rendered (in order):**

1. **`DoseBanner`** — Daily pacing guidance based on study plan
2. **`WelcomeCard`** (first time) OR **`SmartSuggestionCard`** (returning users)
3. **`ZoneSection` x3** — Mode cards with per-mode stats, Pro badges, simulation gate
4. **`SRSection`** — Successive Relearning: due re-tests (amber, overdue label) + active learning cycles (consecutive_correct/3 progress ring). All SR CTAs route to `/quiz/focused/setup`
5. **`SessionsTable`** — All past sessions history with sorting/filtering

**SmartSuggestion priority engine** (computed client-side):
```
1. Pending blindspot queue       → "Start Focus Review" → /quiz/focused/setup
2. Exam in <= 30 days            → Storm (<=7d) or Camp (>7d)
3. Weakest subject (lowest avg)  → Subject Mode
4. 48h+ absent                   → Camp Mode (warm restart)
```

**Simulation gate:** `readinessScore >= 65` required. Enforced both server-side (SimulationBriefingPage redirect) and client-side (ModeCard lock UI with progress bar showing `currentReadiness / 65`).

### 3.2 Setup Flow

Each mode has a setup page. All call the same pipeline:
```
startSession() Server Action
  → selectQuestionsWithInterleaving()
  → INSERT into quiz_sessions
  → return sessionId
  → router.push(ROUTES.QUIZ_V2_SESSION(mode, sessionId))
```

**Per-mode setup details:**

| Mode | Config UI | Server Data Fetch |
|------|-----------|-------------------|
| Camp | Question count pills (10/20/30) + ConfidenceCheck toggle + FocusSelector (subject filter) | `completedSessionCount` |
| Chill | Minimal — just "Start" | Auth only |
| Storm | Question count pills + time estimate display ("~20 min for 20 questions") | Auth only |
| Focus Review | Shows top 5 weak nodes with mastery %, 12 questions fixed | `weakNodes` (mastery < 0.4, attempts > 0) |
| Custom | Subject multi-select + difficulty range + question count slider | Auth only |
| Subject | Subject picker dropdown + question count | Per-subject mastery aggregation |
| Endurance | Extended practice configuration | Last 5 `extended_practice` sessions |
| Simulation | Readiness gate check (>= 65) + consent flow + "cold delivery" explanation | Readiness score |

### 3.3 Session Experience (`/quiz/[mode]/session/[sessionId]`)

**Component:** `QuizShell` (`src/components/quiz-v2/QuizShell.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Progress Bar (filled segments per question) │
├─────────────────────────────────────────────┤
│  Header: Q3/20 · SaveIndicator · 🏳 Flag   │
│          Navigator · Exit                    │
├─────────────────────────────────────────────┤
│                                              │
│  Question Stem                               │
│                                              │
│  ○ Option A                                  │
│  ● Option B  ← selected                     │
│  ○ Option C                                  │
│  ○ Option D                                  │
│                                              │
│  [Submit] / [Confirm] / [Skip]               │
│                                              │
├─────────────────────────────────────────────┤
│  (Camp only) Feedback: ✓ Correct             │
│  Confidence: Sure/Unsure · Error tags        │
│  [Next Question →]                           │
└─────────────────────────────────────────────┘
```

**Mode-specific behaviors:**

| Mode | After Selection | Feedback | Timer | Special |
|------|----------------|----------|-------|---------|
| Camp | Submit → see correctness | Immediate: correct/incorrect + confidence + error tags | None | — |
| Chill | Submit or Skip | Immediate | None | "End Session" button always visible |
| Storm | Confirm → auto-advance | **None during session** (deferred to results) | StormTimerBar (depletes over session) | ConfirmSubmitSheet on timer expire |
| Subject | Same as Camp | Immediate | None | Filtered to single subject |
| Focus Review | Same as Camp | Immediate | None | Only weak-area questions |
| Custom | Same as Camp | Immediate | None | User-configured params |
| Full Exam | Same as Storm | **None** — 24h cold delivery | Per-question time tracking | 200 questions, batched fetch |
| Endurance | Same as Camp | Immediate | Stamina tracking | Extended format |

**Shared session features:**
- **Auto-save**: Every 10 seconds to Supabase via `saveTestingInteraction()`
- **LocalStorage backup**: Per session key, survives browser crash
- **NavigatorOverlay**: Jump to any question (shows answered/unanswered/flagged status)
- **ConfirmSubmitSheet**: Shows answered/unanswered/flagged counts + confirm or exit
- **Keyboard shortcuts**: ArrowRight (advance if submitted/confirmed), ArrowLeft (back)
- **Question batching**: Fetched in chunks of 80 (handles 200-question fullexam)
- **Answer stripping**: `stripQuestionForClient()` removes correct answers before sending to client

**Completion pipeline:**
```
handleCompleteSession()
  → completeTestingSession()
    → recomputeAndSaveReadinessScore()
    → recordMastery()
    → updateSrsSchedule()
    → revalidatePath()
  → router.push(ROUTES.TESTING_DEBRIEF(sessionId))  // or QUIZ_V2_RESULTS
```

### 3.4 Results & Debrief

**Two parallel debrief systems exist (technical debt):**

#### v2 Results (`/quiz/[mode]/session/[id]/results`)
**Component:** `ResultsDashboard` (`src/components/quiz-v2/results/ResultsDashboard.tsx`)

| Section | Condition | Content |
|---------|-----------|---------|
| `EndSessionResult` | Always | Correct/total/percent + readiness delta |
| `StaminaBlocks` | Extended/exam, >= 50 questions | Energy tracking per block |
| `ConfidenceMatrix` | All modes except chill | Confidence vs correctness grid |
| `PredictionData` | Storm, fullexam, extended only | Predicted exam score |
| `ReviewQuestions` | Always | Inline per-question review with rationale |
| `Recommendations` | Always | 3 server-generated recommendations |

**"Practice Missed" shortcut:** → `/quiz/focused/setup?source=missed&sessionId={id}`

#### Legacy Debrief (`/dashboard/testing/session/[id]/debrief`)
**Component:** `DebriefLayout` (`src/components/testing/debrief/DebriefLayout.tsx`)

| Section | Condition | Content |
|---------|-----------|---------|
| `ScoreHero` | Always | % correct + score band visual |
| `ReadinessDelta` | Always | Before/after readiness score comparison |
| `NodeMasteryStrip` | Requires `mastery_snapshot_at_start` | Per-topic mastery deltas |
| `QuestionReviewStrip` | Always | All questions with rationales + error tags |
| `CalibrationReveal` | Only if `preSessionConfidence` set | Pre-session confidence vs actual performance |
| `BlockAccuracyChart` | Endurance only, >= 10 questions | Accuracy trend per block |
| `DebriefActions` | Always | Retry Wrong / New Session / Back to Hub |

**Simulation cold delivery:** `/dashboard/testing/simulation/[id]/results`
- Shows countdown if < 24h since completion
- Reveals full results + interactions after 24h window
- Checks `source === 'proof_simulation'` + timestamp

### 3.5 Review Flow

```
From SessionsTable on hub → click past session → debrief page
From ResultsDashboard → "Review Questions" → inline per-question rationale
From ResultsDashboard → "Practice Missed" → /quiz/focused/setup?source=missed&sessionId={id}
From DebriefLayout → "Retry Wrong" → new session with same wrong-answer topics
```

---

## 4. Key Components

### Hub Components (`src/components/testing/hub/`)

| Component | File | Status | Consumers |
|-----------|------|--------|-----------|
| `ReviewHub` | `ReviewHub.tsx` | **ALIVE** | 1 (hub page) |
| `ModeCard` | `ModeCard.tsx` | **ALIVE** | 4+ (ZoneSections) |
| `SessionsTable` | `SessionsTable.tsx` | **ALIVE** | 1 (hub page) |
| `DoseBanner` | `DoseBanner.tsx` | **DEAD** | 0 |
| `InProgressBanner` | `InProgressBanner.tsx` | **DEAD** | 0 |
| `SmartSuggestionCard` | `SmartSuggestionCard.tsx` | **DEAD** | 0 |
| `WelcomeCard` | `WelcomeCard.tsx` | **DEAD** | 0 |
| `ZoneSection` | `ZoneSection.tsx` | **DEAD** | 0 |
| `SRSection` | `SRSection.tsx` | **DEAD** | 0 |

### Session Components (`src/components/testing/session/`)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `SessionShell` | `SessionShell.tsx` | **DEAD** (610 LOC) | Replaced by QuizShell |
| `CampSessionBehavior` | `CampSessionBehavior.tsx` | **DEAD** | |
| `ChillSessionBehavior` | `ChillSessionBehavior.tsx` | **DEAD** | |
| `StormSessionBehavior` | `StormSessionBehavior.tsx` | **DEAD** | |
| `StormTimerBar` | `StormTimerBar.tsx` | **DEAD** | |
| `ErrorTaxonomyPrompt` | `ErrorTaxonomyPrompt.tsx` | **DEAD** | |
| `FirstTimeTooltip` | `FirstTimeTooltip.tsx` | **DEAD** | |
| `NavigatorOverlay` | `NavigatorOverlay.tsx` | **DEAD** | |
| `ConfidenceTag` | `ConfidenceTag.tsx` | **ALIVE** | 2 external consumers |

### Setup Components (`src/components/testing/setup/`)

| Component | Purpose |
|-----------|---------|
| `CampSetup` | Camp mode configuration |
| `ChillSetup` | Chill mode configuration |
| `StormSetup` | Storm mode configuration |
| `FocusReviewSetup` | Focus review configuration |
| `CustomSetup` | Custom session configuration |
| `SubjectSetup` | Subject mode configuration |
| `EnduranceSetup` | Endurance configuration |
| `shared/FocusSelector` | Shared subject filter for setup pages |

### Debrief Components (`src/components/testing/debrief/`)

| Component | Purpose |
|-----------|---------|
| `DebriefLayout` | Legacy debrief orchestrator |
| `ScoreHero` | Score display with band visual |
| `ReadinessDelta` | Before/after readiness |
| `NodeMasteryStrip` | Per-topic mastery deltas |
| `QuestionReviewStrip` | Question-by-question review |
| `CalibrationReveal` | Confidence vs actual |
| `BlockAccuracyChart` | Per-block accuracy trend |
| `DebriefActions` | Action buttons (retry, new, hub) |

### Quiz V2 Components (`src/components/quiz-v2/`)

| Component | Purpose |
|-----------|---------|
| `QuizShell` | v2 session engine (replaces SessionShell) |
| `ResultsDashboard` | v2 results page |
| `SetupPageClient` | Unified setup UI |
| `ExitConfirmModal` | Exit confirmation (154 LOC, manual focus trap) |
| `SubmitConfirmModal` | Submit confirmation (302 LOC, **copy-pasted focus trap**) |
| `MicroBreakOverlay` | Micro-break suggestion overlay |

---

## 5. Stores & State

| Store | File | Purpose |
|-------|------|---------|
| `useQuizStore` | `src/stores/useQuizStore.ts` | Session state, current question index, answers map, flags set, timer state |

---

## 6. Server Actions

| Action | File | Purpose |
|--------|------|---------|
| `startSession` | `src/lib/actions/quiz-v2/start-session.ts` | Create session, select questions, return sessionId |
| `submitAnswer` | `src/lib/actions/quiz-v2/submit-answer.ts` | Record answer for v2 sessions |
| `completeTestingSession` | `src/lib/actions/testing.ts` | Complete session, update mastery + readiness + SRS |
| `saveTestingInteraction` | `src/lib/actions/testing.ts` | Auto-save during session (legacy path) |
| `selectQuestionsWithInterleaving` | (internal to start-session) | IRT-based question selection with interleaving |
| `recomputeAndSaveReadinessScore` | (internal to complete) | IRT 2PL readiness calculation |
| `recordMastery` | (internal to complete) | Update `user_node_mastery` |
| `updateSrsSchedule` | (internal to complete) | Update SRS spacing schedule |
| `stripQuestionForClient` | (internal to session page) | Remove correct answers before client render |

---

## 7. Supabase Tables

| Table | Used For |
|-------|---------|
| `quiz_sessions` | Session records, history, status |
| `quiz_interactions` | Per-question responses within sessions |
| `questions` | Question bank |
| `user_node_mastery` | Per-topic mastery scores |
| `user_global_stats` | Readiness score, discipline |
| `user_subscriptions` | Pro status for zone gating |
| `blindspot_queues` | Weak-area queue for SmartSuggestion |
| `profiles` | User profile |
| `taxonomy_tree` | Topic taxonomy for filtering |
| `sr_cycles` | Successive relearning cycles |
| `sr_items` | Individual SR items |

---

## 8. Happy Paths

| # | Path | Flow | Expected Outcome |
|---|------|------|-----------------|
| 1 | First-time Camp session | Hub → Camp ModeCard → Setup (10q) → Start → answer 10 → Submit each → Results | Score + readiness delta + 3 recommendations |
| 2 | Storm timed practice | Hub → Storm ModeCard → Setup (20q) → Start → answer under pressure → timer expires or complete → Results | Score without per-question feedback, timer stats |
| 3 | Focus Review weak areas | Hub → SmartSuggestion "Focus Review" → auto-configured 12q from weak nodes → complete → Results | Targeted mastery improvement on weakest topics |
| 4 | Full Exam Simulation | Hub → Simulation (gated >= 65) → Briefing → Consent → 200q → complete → wait 24h → cold-delivered results | Realistic exam simulation with delayed feedback |
| 5 | Subject deep-dive | Hub → Subject ModeCard → pick subject → 15q → complete → Results | Single-subject mastery assessment |
| 6 | Custom session | Hub → Custom ModeCard → multi-select topics + set difficulty + count → start → complete → Results | Fully user-configured practice |
| 7 | Review past session | Hub → SessionsTable → click row → Debrief page | Score breakdown, per-question review, retry option |
| 8 | Practice missed questions | Results → "Practice Missed" → /quiz/focused/setup with missed questions pre-loaded | Re-test on specific wrong answers |
| 9 | SR due re-test | Hub → SRSection → click due item → /quiz/focused/setup | Spaced repetition reinforcement |

---

## 9. Edge Cases

| Case | Behavior |
|------|----------|
| Readiness < 65 + click Simulation | Server redirect back to hub (gate enforced server-side) |
| No questions match filter | Empty state in setup ("No questions available for this configuration") |
| Session interrupted (browser close) | Auto-save every 10s + localStorage backup; resume on next visit |
| 200-question fullexam fetch | Batched in chunks of 80 to avoid timeout |
| Mode not in valid list | Quiz page shows 404 |
| User not Pro + click Zone 2/3 | ModeCard shows locked state with upgrade CTA |
| Timer expires in Storm | ConfirmSubmitSheet auto-triggers with current progress |
| Simulation < 24h since completion | Cold delivery page shows countdown, no results yet |
| Concurrent edit (two tabs) | localStorage key collision — last-write-wins |

---

## 10. Issues Found

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | **Dual routing**: Legacy `/dashboard/testing/*/setup` + new `/quiz/[mode]/setup` both exist | Medium | ModeCard.href vs ROUTES.TESTING_SETUP |
| 2 | **Dual debrief**: DebriefLayout (legacy) vs ResultsDashboard (v2) — both active | Medium | debrief/page.tsx vs results/page.tsx |
| 3 | **SessionShell is dead** (610 LOC) but still in barrel export | Low | testing/session/SessionShell.tsx |
| 4 | **14 dead testing components** in hub/ and session/ | Low | See dead code audit |
| 5 | **ExitConfirmModal + SubmitConfirmModal**: identical focus-trap useEffect copy-pasted | Medium | quiz-v2/ExitConfirmModal.tsx, SubmitConfirmModal.tsx |
| 6 | **Endurance routes outside quiz engine** to `/dashboard/area-c/design-quiz` | Low | Intentional but undocumented |
| 7 | **Legacy session redirect**: `/dashboard/testing/session/[id]/page.tsx` is just a redirect | Low | Can be deleted after verifying no inbound links |
| 8 | **SessionsTable uses manual filter/sort/paginate** instead of shared DataTable | Medium | SessionsTable.tsx (464 LOC) |

---

## 11. Recommendations

1. **Consolidate setup routes**: Deprecate legacy `/dashboard/testing/*/setup` pages. ModeCard already links to `/quiz/[mode]/setup`.
2. **Consolidate debrief**: Pick v2 `ResultsDashboard` as canonical. Migrate unique DebriefLayout features (CalibrationReveal, BlockAccuracyChart) into it.
3. **Delete 14 dead testing components** + update barrel exports (see cleanup plan Pass 1).
4. **Migrate ExitConfirmModal + SubmitConfirmModal to shadcn Dialog** — saves ~250 LOC + eliminates copy-pasted focus trap.
5. **Migrate SessionsTable to DataTable** — eliminates 464 LOC of manual filter/sort/paginate.
6. **Document Endurance routing** — add comment explaining why it routes outside quiz engine.

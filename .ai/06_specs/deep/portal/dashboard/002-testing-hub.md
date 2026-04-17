# Testing Hub

**Analysis Date:** 2026-04-06

## Overview

The Testing Hub (`/dashboard/testing/`) provides access to 7 quiz modes with session setup, active session management, and debrief flows. The testing engine is the most complex feature area in the Dashboard portal.

**Source:** `src/app/dashboard/testing/`, `src/components/testing/` (42 files, 4 subdirs)

## Route Structure

```
testing/
├── page.tsx              # Mode selection hub
├── storm/                # Storm mode
├── chill/                # Chill mode
├── custom/               # Custom mode setup
├── endurance/            # Endurance mode
├── subject/              # Subject-focused drill
├── session/[sessionId]/  # Active session
└── debrief/[sessionId]/  # Session results
```

## Session Setup

Setup wizard at `src/components/testing/setup/`:

```typescript
// SessionConfig options
{
  questionCount: number;        // 1-100
  difficultyMode: DifficultyMode; // easy/medium/hard/expert/mixed/adaptive
  timerMode: 'none' | 'per_question' | 'total';
  timerSeconds?: number;
  subjectIds?: string[];
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
}
```

**Source:** `src/types/app.ts` (lines 270–278)

## Session Flow

1. **Setup:** Mode selection → parameters → start
2. **Active Session:** Question rendering → answer → feedback
3. **Auto-save:** Every 10 seconds (localStorage + server sync)
4. **Debrief:** Score bands, subject breakdown, mastery changes, recommendations

**Source:** `src/components/testing/session/`, `src/components/testing/debrief/`

## Question Components

| Component | Purpose |
|-----------|---------|
| `QuestionStem.tsx` | Question text + optional image |
| `AnswerInput.tsx` | MCQ/True-False/Identification rendering |
| `ConfidenceToggle.tsx` | Self-reported confidence (affects SRS) |
| `RationaleDrawer.tsx` | Post-answer rationale display |
| `QuizTimer.tsx` | Storm mode countdown |
| `SaveIndicator.tsx` | Auto-save status |

**Source:** `src/components/quiz/` (17 files)

## Score Bands

Post-session performance bands:
- **Exam Ready** — 85%+ with strong difficulty profile
- **Strong** — 70–84%
- **Getting There** — 50–69%
- **Building Momentum** — 30–49%
- **Needs Work** — Below 30%

**Source:** `src/components/quiz-v2/results/ScoreBand.tsx`

## Quiz Mode Presets

`src/lib/quiz/mode-presets.ts` defines mode-specific configurations:

```typescript
// Mode preset example (from test)
const MODE_PRESETS = {
  camp: {
    navigation: { backAllowed: false },
    feedback: 'immediate',
    timer: false,
  },
  storm: {
    navigation: { backAllowed: false },
    feedback: 'immediate',
    timer: true,
  },
  chill: {
    navigation: { backAllowed: true },
    feedback: 'delayed',
    timer: false,
  },
};
```

**Note:** One test failing as of 2026-04-05: `MODE_PRESETS.camp.navigation.backAllowed` expected `false`, received `true`.

**Source:** `src/lib/quiz/mode-presets.ts`

---

*Testing hub: 2026-04-06*

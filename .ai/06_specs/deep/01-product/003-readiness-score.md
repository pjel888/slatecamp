# Readiness Score

**Analysis Date:** 2026-04-06

## Overview

The Readiness Score is SlateCamp's primary mastery metric for ALE preparation. It is a real-time, IRT-based computation that reflects a student's estimated probability of passing the board exam, not a raw percentage of questions answered correctly.

**Source:** `src/lib/readiness-score.ts` (330 lines, pure function — no DB access)

## IRT 2-Parameter Logistic Model

All mastery calculations use the 2PL IRT model:

```
P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))
```

| Parameter | Name | Range | Meaning |
|-----------|------|-------|---------|
| θ (theta) | Student ability | Typically -3 to +3 | Estimated ability level |
| a | Discrimination | 0.5–2.5 | How well question differentiates ability levels |
| b | Difficulty | 0.0–1.0 | Question difficulty on same scale as theta |

**Source:** `src/lib/srs/irt.ts`

## 6 Anti-Inflation Vectors

The readiness score implements 6 mechanisms to prevent score inflation:

### 1. Diminishing Returns on Consecutive Correct Streaks

Correct streaks beyond a threshold contribute progressively less to the score. A student who gets 20 consecutive easy questions correct does not have the same mastery as one who answers 20 hard questions correctly.

### 2. Difficulty Ceiling

The score is capped until a student demonstrates competence on Level 3 and Level 4 (Bloom's taxonomy) questions. Answering only recall-level (Level 1–2) questions correctly cannot produce a high score.

### 3. Grey Node Penalty

Taxonomy nodes that a student has never encountered ("grey nodes" in the heatmap) apply a penalty to the overall score. Full coverage of the ALE taxonomy is required for a maximum score.

### 4. Bloom's Cognitive Level Ceiling

Questions are tagged with Bloom's taxonomy levels. Practice that consists exclusively of lower-order thinking (remember, understand) is capped regardless of accuracy rate.

### 5. Question Bank Depth Weight

Nodes with thin question coverage contribute less to the score. A student who has mastered 10 topics each with 50 questions has a more reliable mastery estimate than one who has answered 10 questions total.

### 6. Recency Decay

Mastery estimates decay over time. A student who demonstrated mastery 60 days ago without review has a lower effective mastery than one who reviewed recently.

## Score Components

```typescript
interface ReadinessScoreData {
  score: number;                    // 0–100 overall score
  previousScore: number | null;     // Previous session score
  subScores: {
    accuracy: number;               // Correct answer rate
    coverage: number;               // Taxonomy coverage
    srsHealth: number;              // SRS schedule quality
    recency: number;                // Time since last review
    weakArea: number;               // Weakest node performance
  };
  label: ReadinessLevel;            // Label classification
  color: string;                    // CSS color class
}

type ReadinessLevel = 
  | 'needs_work' 
  | 'building_momentum' 
  | 'getting_there' 
  | 'strong' 
  | 'exam_ready';
```

**Source:** `src/types/app.ts` (lines 512–526)

## Score Update Flow

1. User completes a quiz session
2. Server action `readiness-score-update.ts` fetches current mastery data
3. `computeReadinessScore()` (pure function) receives data as input
4. Pure function returns `{ overallScore, subScores }`
5. Score stored as `ReadinessScoreSnapshot` with source tag

```typescript
interface ReadinessScoreSnapshot {
  id: string;
  exam_profile_id: string;
  score: number;
  sub_scores: Record<string, number>;
  computed_at: string;
  source: 'session_complete' | 'diagnostic' | 'daily_cron' | 'manual';
}
```

**Source:** `src/types/app.ts` (lines 528–535)

## Readiness Score Display

Used in:
- Dashboard hero command bar (`src/components/dashboard/HeroCommandBar.tsx`)
- Score reveal flow (`/dashboard/score-reveal/`)
- Session debrief (`src/components/quiz-v2/results/`)
- CEO analytics (`src/components/ceo/`)
- Readiness trajectory chart (`src/components/analytics/ReadinessTrajectory.tsx`)

**Color coding:**
- `text-[#D64545]` (Warm Red) — Below 40
- `text-[#E8853A]` (Camp Orange) — 40–69
- `text-[#2D9F6F]` (Emerald) — 70 and above

**Source:** `src/components/AGENTS.md` (Readiness Score coloring pattern)

## Cron Job Computation

Readiness scores are recomputed daily via Vercel Cron:
- **focus-review-scan:** Daily at 4:00 PM UTC
- **compute-signals:** Daily at 4:30 PM UTC

**Source:** `vercel.json`

## Voice Guidelines

- Never say "pass" as a guaranteed outcome in headlines
- Use "Know you'll win." instead of "You passed"
- Growth-framed: "42 topics covered" not "58 remaining"

---

*Readiness Score analysis: 2026-04-06*


## 2026-04-29 audit note

This document may include historical product/reference language. Current codebase route truth for cron jobs is `/api/cron/focus-review-scan` and `/api/cron/compute-signals` from `src/app/api/cron/**/route.ts` and `vercel.json`.

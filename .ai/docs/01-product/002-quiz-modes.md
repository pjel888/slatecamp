# Quiz Modes

**Analysis Date:** 2026-04-06

## Mode Overview

SlateCamp offers 7 distinct testing modes, each targeting a different study context. All modes use IRT 2-parameter logistic model for question selection. Sessions auto-save every 10 seconds.

**Source:** `src/types/app.ts` (`TestMode` type), `src/lib/quiz/`, `src/lib/actions/quiz-v2/`

## Mode Reference

| Mode | Route | Description |
|------|-------|-------------|
| `camp` | `/dashboard/review` | Adaptive practice with personalized question selection |
| `storm` | `/dashboard/testing/storm` | Rapid-fire timed practice with timer bar |
| `chill` | `/dashboard/testing/chill` | Untimed, relaxed review mode |
| `custom` | `/dashboard/testing/custom` | User-defined session parameters |
| `blindspot` | `/dashboard/focus-review` | Targets weak areas from taxonomy |
| `proof_sim` | `/dashboard/proof-simulation` | Full exam simulation with proctored conditions |
| `endurance` | `/dashboard/testing/endurance` | Extended practice with multiple sessions |

**Source:** `src/app/dashboard/testing/`, `src/app/dashboard/focus-review/`

## Mode Details

### Camp Mode

Primary adaptive practice mode. Uses IRT theta estimates to select questions at the student's estimated ability level. Questions above or below threshold are selected occasionally to refine the estimate.

**Entry:** `/dashboard/review`
**Orchestration:** `src/lib/quiz/` or `src/lib/actions/quiz-v2/`
**Session data:** `src/components/testing/` (42 files, 4 subdirs)

### Storm Mode

Timed rapid-fire practice. Features:
- Per-question timer
- Timer bar visualization
- No pause during session
- Fast feedback loop

**Entry:** `/dashboard/testing/storm`
**Config:** `timer_mode: "per_question"` in `SessionConfig`

### Chill Mode

Untimed, low-pressure review. Features:
- No timer constraints
- Extended rationale viewing
- Bookmark and skip enabled
- Comfortable pacing

**Entry:** `/dashboard/testing/chill`

### Custom Mode

User-defined session parameters:
- Question count (1–100)
- Difficulty mode: easy, medium, hard, expert, mixed, adaptive
- Timer mode: none, per_question, total
- Subject filtering
- Shuffle options

**Entry:** `/dashboard/testing/custom`
**Config interface:** `src/types/app.ts` (`SessionConfig`)

### Focus Review Mode

Formerly "Blindspot Protocol." Targets weak areas:
- 3 weakest taxonomy nodes from user mastery data
- Unexplored grey nodes (never encountered)
- Prioritizes nodes with lowest `mastery_weight`

**Entry:** `/dashboard/focus-review`
**Algorithm:** `src/lib/blindspot/` or `src/lib/srs/blindspot.ts`

### Proof Simulation

Full exam simulation with proctored conditions:
- Timed session (full exam duration)
- Cold delivery (no hints, no feedback until end)
- Full-length question set
- Results page at `proof-simulation/results/[sessionId]`
- Post-exam survey at `/dashboard/exam-outcome`

**Entry:** `/dashboard/proof-simulation`
**Orchestration:** `src/lib/proof-simulation/`

### Endurance Mode

Extended practice session:
- Multiple sessions back-to-back
- Difficulty adaptation across sessions
- Streak tracking across the endurance block
- Progress persistence

**Entry:** `/dashboard/testing/endurance`
**Orchestration:** `src/lib/endurance/`

## Session Configuration

```typescript
interface SessionConfig {
  subjects?: { subject_id: string; question_count: number; difficulty?: string }[];
  specific_question_ids?: string[];
  timer_mode?: "none" | "per_question" | "total";
  timer_seconds?: number | null;
  shuffle_questions?: boolean;
  shuffle_choices?: boolean;
  show_immediate_feedback?: boolean;
}
```

**Source:** `src/types/app.ts` (lines 270–278)

## Quiz Types

Questions support 7 types:
- `mcq` — Multiple choice (4 options)
- `true_false` — True/False
- `identification` — Short answer identification
- `essay` — Free-form response
- `matching` — Match items between columns
- `sequence` / `sequencing` — Ordered arrangement

**Source:** `src/types/app.ts` (`QuestionType`, line 2)

## Question Structure

```typescript
interface Question {
  question_id: string;
  text: string;
  options: Choice[];           // MCQ options
  correct_option_id: string;    // Correct choice ID
  rationale: string | object;   // SME-written rationale
  difficulty: number;           // 0.0–1.0 (IRT b parameter)
  difficulty_rating?: number;   // IRT field
  discrimination_rating?: number; // IRT field (a parameter)
  prompt_image_url?: string | null;
  explanation?: string | null;
  code_citation?: string | null;
}

interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
  rationale?: string | null;    // Per-option rationale
}
```

**Source:** `src/types/app.ts` (lines 46–71)

## Session Flow

1. **Setup:** User selects mode, configures parameters
2. **Question presentation:** Question stem + options rendered by `src/components/quiz/`
3. **Answer submission:** Server action saves `session_questions` record
4. **Feedback:** Immediate (Chill/Camp) or deferred (Simulation)
5. **Auto-save:** Every 10 seconds to `quiz_sessions` + `session_questions`
6. **Completion:** Debrief page with score bands, subject breakdown, mastery changes

**Source:** `src/components/testing/` (setup/, session/, debrief/ subdirs)

## Score Bands

Performance bands for result display:
- Exam Ready (green)
- Strong (green)
- Getting There (amber)
- Building Momentum (amber)
- Needs Work (red)

**Source:** `src/components/quiz-v2/results/`

## Voice Guidelines

| Avoid | Use Instead |
|-------|------------|
| "Blindspot Protocol" | "Focus Review" |
| "Endurance Cycle" | "Extended Practice" |
| "drill" / "grind" | "practice" / "review" / "session" |
| "weakness" / "gap" | "area to revisit" / "developing skill" |
| "dominate" / "conquer" | "master" / "cover" / "strengthen" |
| "behind" / "overdue" | "ready for review" |

---

*Quiz modes analysis: 2026-04-06*

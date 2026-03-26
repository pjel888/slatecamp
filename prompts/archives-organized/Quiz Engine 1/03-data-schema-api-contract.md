# SlateCamp Quiz Engine — Document 3: Data Schema & API Contract Spec

> **Purpose:** Defines every database table, server action, API response shape, and client state structure the quiz engine touches. An AI reads this to understand how data flows from user tap → database → screen.
>
> **Stack:** PostgreSQL (Supabase) · Next.js App Router (Server Actions) · Zustand (client state) · TypeScript
>
> **Companion docs:** Doc 1 (UX/UI Spec), Doc 2 (Journey Maps), Doc 4 (Content Spec), Doc 5 (Mastery Engine)

---

## 1. Existing Tables Referenced (DO NOT RECREATE)

These tables already exist in the SlateCamp production database. The quiz engine reads from and writes to them.

| Table | Role in Quiz Engine | Owner |
|---|---|---|
| `auth.users` | User identity. FK target for all user-scoped data. | Supabase Auth |
| `profiles` | User metadata (display name, subscription tier). Read during session init. | Identity domain |
| `disciplines` | Top-level ALE areas (A, B, C). FK for taxonomy. | Taxonomy domain |
| `taxonomy_tree` | Full topic hierarchy. Used to tag questions and drive subject/topic picker. | Taxonomy domain |
| `questions` | Question bank. Source of all quiz content. | Content domain |
| `quiz_sessions` | Session records (existing). Will be extended. | Quiz domain |
| `user_interactions` | Immutable answer log. One row per question answered. | Analytics domain |
| `user_node_mastery` | Per-topic mastery weights (EMA). Updated by trigger after each interaction. | Mastery domain |
| `readiness_score_snapshots` | Append-only score history. | Mastery domain |
| `blindspot_queues` | Topics queued for focused review. | Progression domain |
| `camp_trails` / `trail_days` / `user_trail_progress` | Camp Trail progression. | Progression domain |

---

## 2. Schema Extensions (New / Modified Tables)

### 2.1 `quiz_sessions` — Extended

The existing `quiz_sessions` table needs these additional columns to support the unified quiz engine:

```sql
-- Migration: 20260325_extend_quiz_sessions_for_unified_engine.sql

-- New enum for session mode
CREATE TYPE public.quiz_mode AS ENUM (
  'camp', 'chill', 'subject', 'focused', 'custom', 'storm', 'fullexam', 'extended'
);

-- New enum for session status
CREATE TYPE public.session_status AS ENUM (
  'configuring', 'in_progress', 'paused', 'completed', 'abandoned', 'auto_submitted'
);

-- New enum for feedback timing
CREATE TYPE public.feedback_timing AS ENUM (
  'immediate', 'deferred', 'none'
);

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS mode public.quiz_mode NOT NULL DEFAULT 'camp',
  ADD COLUMN IF NOT EXISTS status public.session_status NOT NULL DEFAULT 'configuring',
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS answered_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS time_elapsed_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS feedback_timing public.feedback_timing NOT NULL DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS topics_covered UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_trail_session BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trail_day_id UUID REFERENCES public.trail_days(id),
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS results_available_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS readiness_score_before NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS readiness_score_after NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS readiness_score_delta NUMERIC(5,2);

CREATE INDEX idx_quiz_sessions_mode ON public.quiz_sessions(mode);
CREATE INDEX idx_quiz_sessions_status ON public.quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_user_status ON public.quiz_sessions(user_id, status);
```

### 2.2 `session_questions` — New Junction Table

Replaces the `question_ids UUID[]` array on `quiz_sessions` with a proper junction table for cross-session analytics.

```sql
CREATE TABLE public.session_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(question_id) ON DELETE RESTRICT,
  position INTEGER NOT NULL,                     -- 1-indexed question order
  user_answer_id UUID,                           -- FK to the answer option selected
  is_correct BOOLEAN,                            -- NULL if unanswered
  is_skipped BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  confidence_level SMALLINT,                     -- 1=guessing, 2=somewhat, 3=very sure
  time_spent_ms INTEGER,                         -- milliseconds on this question
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_session_questions_session ON public.session_questions(session_id);
CREATE INDEX idx_session_questions_question ON public.session_questions(question_id);
CREATE INDEX idx_session_questions_position ON public.session_questions(session_id, position);
CREATE UNIQUE INDEX idx_session_questions_unique ON public.session_questions(session_id, question_id);

CREATE POLICY "Users can read own session questions"
  ON public.session_questions FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.quiz_sessions WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own session questions"
  ON public.session_questions FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.quiz_sessions WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own session questions"
  ON public.session_questions FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.quiz_sessions WHERE user_id = (SELECT auth.uid())
    )
  );
```

### 2.3 `saved_session_configs` — New Table

Stores Custom Session presets for reuse.

```sql
CREATE TABLE public.saved_session_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Custom Preset',
  config JSONB NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_session_configs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_saved_configs_user ON public.saved_session_configs(user_id);

CREATE POLICY "Users can CRUD own configs"
  ON public.saved_session_configs FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER tr_saved_session_configs_updated_at
  BEFORE UPDATE ON public.saved_session_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. The Config Object (JSONB)

The `config` column on `quiz_sessions` stores this JSON structure. This is the single source of truth for session behavior.

```typescript
// src/types/quiz-config.ts

export interface QuizSessionConfig {
  mode: QuizMode;

  setup: {
    questionCount: number;
    topics: string[];         // taxonomy_tree IDs
    disciplines: string[];    // discipline IDs
    difficultyMode: 'static' | 'adaptive' | 'user-selected';
    initialDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    isTrailSession: boolean;
    trailDayId: string | null;
  };

  timer: {
    enabled: boolean;
    visible: boolean;
    mode: 'countdown' | 'countup' | 'bar' | 'hidden';
    totalSeconds: number | null;
    perQuestion: boolean;
    pausable: boolean;
    warningThresholds: number[]; // e.g. [0.75, 0.90, 0.95]
  };

  feedback: {
    timing: 'immediate' | 'deferred' | 'none';
    showExplanation: boolean;
    showCorrectAnswer: boolean;
    showConfidenceRating: boolean;
    gatedProgressionDelayMs: number; // 0 = no gate, 3000 = 3s
    explanationDepth: 'brief' | 'full' | 'with-wiki-link';
  };

  navigation: {
    model: 'linear' | 'free' | 'linear-with-skip';
    backAllowed: boolean;
    questionPalette: boolean;
    bookmarkEnabled: boolean;
    skipEnabled: boolean;
    confirmBeforeSubmit: boolean;
  };

  results: {
    showImmediately: boolean;
    delayHours: number;
    showPercentile: boolean;
    showSubjectBreakdown: boolean;
    showGrowthDelta: boolean;
    showReadinessScoreImpact: boolean;
    showStaminaChart: boolean;
  };

  breaks: {
    enabled: boolean;
    intervalQuestions: number;    // e.g., 25
    breakDurationSeconds: number; // e.g., 30
  };
}

export type QuizMode = 'camp' | 'chill' | 'subject' | 'focused' | 'custom' | 'storm' | 'fullexam' | 'extended';
```

### 3.1 Mode Presets (Default Configs)

```typescript
// src/lib/quiz/mode-presets.ts

export const MODE_PRESETS: Record<QuizMode, QuizSessionConfig> = {
  camp: {
    mode: 'camp',
    setup: { questionCount: 20, topics: [], disciplines: [], difficultyMode: 'adaptive', initialDifficulty: 'mixed', isTrailSession: true, trailDayId: null },
    timer: { enabled: false, visible: false, mode: 'hidden', totalSeconds: null, perQuestion: false, pausable: true, warningThresholds: [] },
    feedback: { timing: 'immediate', showExplanation: true, showCorrectAnswer: true, showConfidenceRating: true, gatedProgressionDelayMs: 3000, explanationDepth: 'with-wiki-link' },
    navigation: { model: 'linear', backAllowed: false, questionPalette: false, bookmarkEnabled: false, skipEnabled: false, confirmBeforeSubmit: false },
    results: { showImmediately: true, delayHours: 0, showPercentile: false, showSubjectBreakdown: true, showGrowthDelta: true, showReadinessScoreImpact: true, showStaminaChart: false },
    breaks: { enabled: false, intervalQuestions: 0, breakDurationSeconds: 0 },
  },
  // ... (chill, subject, focused, custom, storm, fullexam, extended follow same structure)
  // Full presets defined in src/lib/quiz/mode-presets.ts
};
```

---

## 4. Server Actions (API Contract)

Every database mutation goes through a Server Action. No client-side Supabase writes.

### 4.1 `startSession`

```typescript
// src/lib/actions/quiz/start-session.ts
'use server'

interface StartSessionInput {
  mode: QuizMode;
  config: Partial<QuizSessionConfig>;  // Merged with mode preset
  trailDayId?: string;
}

interface StartSessionResult {
  sessionId: string;
  config: QuizSessionConfig;          // Final merged config
  questions: QuestionForClient[];      // First batch (or all for short sessions)
  totalQuestions: number;
  readinessScoreBefore: number;
}

// Responsibilities:
// 1. Merge user config overrides with mode preset defaults
// 2. Query question bank based on config (topics, difficulty, count)
// 3. Create quiz_sessions row (status: 'in_progress')
// 4. Create session_questions rows for all questions (position ordered)
// 5. Snapshot current readiness score (readiness_score_before)
// 6. Return first question batch + session metadata
```

### 4.2 `submitAnswer`

```typescript
// src/lib/actions/quiz/submit-answer.ts
'use server'

interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  confidenceLevel?: 1 | 2 | 3;
  timeSpentMs: number;
}

interface SubmitAnswerResult {
  isCorrect: boolean;
  correctOptionId: string;              // Always returned (client decides when to show)
  rationale: string | null;             // null if deferred feedback
  wikiArticleUrl: string | null;
  answeredCount: number;                // Updated count
  correctCount: number;                 // Updated count
  sessionComplete: boolean;             // True if this was the last question
}

// Responsibilities:
// 1. Update session_questions row (user_answer_id, is_correct, confidence, time, answered_at)
// 2. Insert into user_interactions (immutable log — triggers mastery update)
// 3. Update quiz_sessions counters (answered_count, correct_count)
// 4. If adaptive mode: adjust next question difficulty based on running accuracy
// 5. Return correctness + rationale (client respects config.feedback.timing)
```

### 4.3 `skipQuestion`

```typescript
// src/lib/actions/quiz/skip-question.ts
'use server'

interface SkipQuestionInput {
  sessionId: string;
  questionId: string;
}

// Marks session_questions.is_skipped = true
// Does NOT insert into user_interactions (skipped ≠ wrong)
// Does NOT affect mastery calculations
```

### 4.4 `flagQuestion`

```typescript
// src/lib/actions/quiz/flag-question.ts
'use server'

interface FlagQuestionInput {
  sessionId: string;
  questionId: string;
  isFlagged: boolean;   // Toggle
}

// Updates session_questions.is_flagged
// Pure client convenience — no analytics impact
```

### 4.5 `endSession`

```typescript
// src/lib/actions/quiz/end-session.ts
'use server'

interface EndSessionInput {
  sessionId: string;
  endReason: 'completed' | 'user_exit' | 'timer_expired' | 'auto_submitted';
}

interface EndSessionResult {
  score: {
    correct: number;
    total: number;
    percent: number;
  };
  subjectBreakdown: Array<{
    disciplineId: string;
    disciplineName: string;
    correct: number;
    total: number;
    percent: number;
  }>;
  readinessScoreBefore: number;
  readinessScoreAfter: number;
  readinessScoreDelta: number;
  growthVsPrevious: number | null;     // Delta vs last session on same topic
  resultsAvailableAt: string;          // ISO timestamp (now for most, +24h for fullexam)
  trailDayCompleted: boolean;
  nextTrailDay: { id: string; title: string; topic: string } | null;
  missedQuestionCount: number;
}

// Responsibilities:
// 1. Update quiz_sessions (status, completed_at, score_percent, readiness_score_after, delta)
// 2. Calculate subject breakdown from session_questions + questions joins
// 3. Snapshot readiness score (insert into readiness_score_snapshots)
// 4. If Camp Mode: mark trail_day_completions, check if next day unlocks
// 5. If Full Exam: set results_available_at = now() + 24 hours
// 6. Calculate growth vs previous session on same topics
// 7. Return complete results payload
```

### 4.6 `getReviewData`

```typescript
// src/lib/actions/quiz/get-review-data.ts
'use server'

interface ReviewDataResult {
  sessionId: string;
  mode: QuizMode;
  score: { correct: number; total: number; percent: number };
  questions: Array<{
    position: number;
    questionId: string;
    stem: string;
    imageUrl: string | null;
    taxonomyBreadcrumb: string;         // "Structural Design > Foundations"
    options: Array<{
      id: string;
      text: string;
      letter: 'A' | 'B' | 'C' | 'D';
      isCorrect: boolean;
      isUserChoice: boolean;
    }>;
    isCorrect: boolean;
    isSkipped: boolean;
    isFlagged: boolean;
    confidenceLevel: number | null;
    rationale: string;
    wikiArticleUrl: string | null;
    wrongAnswerExplanation: string | null;   // Why the user's specific wrong choice was wrong
  }>;
}

// Single query: session_questions JOIN questions JOIN taxonomy_tree
// Returns everything needed for the review mode UI
// No further API calls needed during review navigation
```

### 4.7 `pauseSession` / `resumeSession`

```typescript
// src/lib/actions/quiz/pause-session.ts
'use server'

// pauseSession: Sets status='paused', paused_at=now(), saves time_elapsed_seconds
// resumeSession: Sets status='in_progress', paused_at=null, returns remaining questions
```

---

## 5. Zustand Client State

```typescript
// src/stores/useQuizStore.ts

interface QuizState {
  // Session metadata
  sessionId: string | null;
  config: QuizSessionConfig | null;
  status: 'idle' | 'loading' | 'intro' | 'active' | 'submitting' | 'results' | 'review';

  // Question state
  questions: QuestionForClient[];
  currentIndex: number;
  answers: Record<string, {              // keyed by questionId
    selectedOptionId: string;
    confidenceLevel: number | null;
    isCorrect: boolean | null;           // null until submitted
    isSkipped: boolean;
    isFlagged: boolean;
    timeSpentMs: number;
  }>;

  // Timer state
  timerStartedAt: number | null;         // Unix ms
  timerPausedAt: number | null;
  timerElapsedMs: number;

  // Feedback state (for current question)
  feedbackVisible: boolean;
  feedbackData: {
    isCorrect: boolean;
    correctOptionId: string;
    rationale: string;
    wikiUrl: string | null;
  } | null;

  // UI state
  paletteOpen: boolean;
  wikiPanelOpen: boolean;
  wikiPanelUrl: string | null;

  // Offline queue
  pendingSubmissions: Array<SubmitAnswerInput>;

  // Actions
  initSession: (data: StartSessionResult) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  setConfidence: (questionId: string, level: 1 | 2 | 3) => void;
  submitCurrentAnswer: () => Promise<void>;
  skipCurrentQuestion: () => Promise<void>;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  showFeedback: (data: FeedbackData) => void;
  hideFeedback: () => void;
  togglePalette: () => void;
  openWikiPanel: (url: string) => void;
  closeWikiPanel: () => void;
  endSession: (reason: string) => Promise<EndSessionResult>;
  reset: () => void;
}
```

---

## 6. Data Flow Diagram

```
USER TAPS "Begin Session"
  ↓
[Client] Calls startSession Server Action
  ↓
[Server] Merges config + queries questions + creates session rows
  ↓
[Server] Returns { sessionId, config, questions, readinessScoreBefore }
  ↓
[Client] useQuizStore.initSession(data) — populates Zustand store
  ↓
[Client] Renders QuizShell with two-column layout
  ↓

─── QUESTION LOOP ───
  USER SELECTS ANSWER (client state: answers[qId].selectedOptionId = optionId)
  ↓
  USER TAPS SUBMIT
  ↓
  [Client] Calls submitAnswer Server Action
  ↓
  [Server] Updates session_questions + inserts user_interactions + updates counters
  ↓
  [Server] user_interactions INSERT trigger fires → updates user_node_mastery (EMA)
  ↓
  [Server] Returns { isCorrect, correctOptionId, rationale, ... }
  ↓
  [Client] If config.feedback.timing === 'immediate':
           → store.showFeedback(data) → right column renders feedback panel
           → Next button appears after gatedProgressionDelayMs
  [Client] If config.feedback.timing === 'deferred':
           → Show toast "Answer recorded ✓" → auto-advance
  ↓
  USER TAPS NEXT → store.goNext() → currentIndex++ → next question renders
  ↓
  (repeat until all questions answered or user exits)

─── END SESSION ───
  USER TAPS "Finish Session"
  ↓
  [Client] Calls endSession Server Action
  ↓
  [Server] Calculates final score, subject breakdown, readiness delta
  [Server] Updates quiz_sessions (completed_at, score, readiness_score_after)
  [Server] Inserts readiness_score_snapshots
  [Server] If Camp: marks trail_day_completions
  ↓
  [Server] Returns EndSessionResult
  ↓
  [Client] store.status = 'results' → renders Results Summary screen
```

---

## 7. Question Selection Algorithm (Query)

```sql
-- Pseudocode for question selection (implemented in startSession Server Action)

-- Step 1: Filter by topics from config
WITH eligible_questions AS (
  SELECT q.*
  FROM questions q
  JOIN taxonomy_tree t ON q.topic_id = t.id
  WHERE t.id = ANY($topics)                    -- config.setup.topics
    AND q.is_active = true
    AND q.is_archived = false
),

-- Step 2: Exclude recently seen (last 7 days)
not_recently_seen AS (
  SELECT eq.*
  FROM eligible_questions eq
  WHERE eq.question_id NOT IN (
    SELECT question_id FROM user_interactions
    WHERE user_id = $userId
      AND created_at > now() - interval '7 days'
  )
),

-- Step 3: Difficulty stratification (for adaptive mode)
difficulty_stratified AS (
  SELECT *,
    CASE
      WHEN difficulty_level <= 2 THEN 'easy'
      WHEN difficulty_level <= 4 THEN 'medium'
      ELSE 'hard'
    END as difficulty_band
  FROM not_recently_seen
),

-- Step 4: Sample N questions with difficulty distribution
-- Adaptive: 15% easy, 70% medium, 15% hard (adjusts based on user mastery)
-- Exam-weighted: mirrors actual ALE distribution
-- Mixed: uniform random

selected AS (
  SELECT * FROM difficulty_stratified
  ORDER BY
    CASE WHEN $difficultyMode = 'adaptive' THEN
      -- Weight toward user's zone of proximal development
      ABS(difficulty_level - $userMasteryLevel)
    ELSE
      random()
    END
  LIMIT $questionCount
)

SELECT * FROM selected ORDER BY random();  -- Shuffle final order
```

---

## 8. Offline Sync Architecture

```
[Client] answer submitted → 
  TRY:
    Call submitAnswer Server Action
    IF success → remove from pendingSubmissions queue
  CATCH (network error):
    Store in pendingSubmissions[] (Zustand, persisted to IndexedDB)
    Show amber "Offline" banner
    Continue quiz locally (client has question data + correct answers)

[Client] connection restored →
  FOR EACH pending in pendingSubmissions:
    Call submitAnswer Server Action
    IF success → remove from queue
    IF conflict (already submitted) → skip silently
  Show "Back online. Synced." banner → auto-dismiss 3s
```

IndexedDB structure:
```typescript
// Database: slatecamp-quiz-offline
// Store: pending-answers
// Key: `${sessionId}:${questionId}`
// Value: SubmitAnswerInput + timestamp
```

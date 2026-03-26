# SlateCamp Quiz Engine — Document 6: Component Architecture & State Management Spec

> **Purpose:** Defines the exact React component tree, Server/Client boundaries, Zustand store architecture, data fetching patterns, and offline sync logic. An AI reads this to write the actual code that implements the quiz engine.
>
> **Stack:** Next.js 14+ App Router · React Server Components · Zustand · Tailwind CSS · Shadcn UI
>
> **Companion docs:** Doc 1 (UX/UI Spec — what it looks like), Doc 3 (Schema/API — what data it uses)

---

## 1. Route Structure

```
src/app/
├── quiz/
│   ├── page.tsx                    # Mode selector (Server Component)
│   ├── [mode]/
│   │   ├── page.tsx                # Redirects to setup with mode param
│   │   ├── setup/
│   │   │   └── page.tsx            # Intro slides (Client Component)
│   │   └── session/
│   │       └── [sessionId]/
│   │           ├── page.tsx        # Active quiz shell (Client Component)
│   │           ├── results/
│   │           │   └── page.tsx    # Results summary (Server Component with client islands)
│   │           └── review/
│   │               └── page.tsx    # Review mode (Client Component)
```

**URL examples:**
- `/quiz` → Mode Selector
- `/quiz/camp/setup` → Camp Mode intro slides
- `/quiz/camp/session/abc-123` → Active quiz (session ID in URL for deep-linking + resume)
- `/quiz/camp/session/abc-123/results` → Results dashboard
- `/quiz/camp/session/abc-123/review` → Question-by-question review

---

## 2. Component Tree

```
QuizApp (route-level)
│
├── ModeSelector                          [Server Component]
│   └── ModeCard × 8                     [Server Component]
│
├── SetupFlow                             [Client Component — 'use client']
│   ├── IntroSlide1_Confirmation          [Client Component]
│   │   ├── ModeIcon
│   │   ├── SessionSummary
│   │   ├── QuestionCountStepper
│   │   └── BeginButton
│   ├── IntroSlide2_TopicPicker           [Client Component] (conditional)
│   │   ├── SubjectRow × 6
│   │   │   └── TopicChip × N
│   │   └── ContinueButton
│   └── IntroSlide3_AdvancedConfig        [Client Component] (Custom only)
│       ├── ToggleRow × 4
│       ├── DifficultyPillSelector
│       └── PresetShortcuts
│
├── QuizShell                             [Client Component — 'use client']
│   ├── QuizHeader                        [Client Component]
│   │   ├── ExitButton
│   │   ├── ProgressBar
│   │   ├── FractionIndicator
│   │   ├── ModeBadge
│   │   ├── Timer (conditional)
│   │   ├── BookmarkButton (conditional)
│   │   └── PaletteButton (conditional)
│   │
│   ├── QuizBody                          [Client Component]
│   │   ├── QuestionColumn (LEFT)         [Client Component]
│   │   │   ├── TopicBreadcrumb
│   │   │   ├── QuestionNumber
│   │   │   ├── QuestionStem
│   │   │   ├── QuestionImage (conditional)
│   │   │   └── ConfidenceRating (conditional)
│   │   │
│   │   └── OptionsColumn (RIGHT)         [Client Component]
│   │       ├── OptionsHeader ("Select your answer")
│   │       ├── OptionRow × 4
│   │       │   ├── RadioIndicator
│   │       │   ├── LetterLabel
│   │       │   └── OptionText
│   │       ├── FeedbackPanel (conditional, slides in after submit)
│   │       │   ├── CorrectnessHeader
│   │       │   ├── AnswerComparison (wrong answers)
│   │       │   ├── RationaleText
│   │       │   └── WikiLink
│   │       └── ColumnActions
│   │           ├── PreviousButton (conditional)
│   │           └── SubmitButton / NextButton
│   │
│   ├── QuizFooter                        [Client Component]
│   │   ├── PreviousButton
│   │   ├── FractionCenter
│   │   └── NextButton / SubmitButton
│   │
│   ├── QuestionPalette (conditional)     [Client Component]
│   │   ├── PaletteHeader
│   │   ├── FilterPills
│   │   ├── QuestionGrid
│   │   │   └── PaletteCell × N
│   │   └── PaletteLegend
│   │
│   ├── MicroBreakOverlay (conditional)   [Client Component]
│   │   ├── BreakMessage
│   │   ├── RestTimer
│   │   └── ContinueButton
│   │
│   ├── ExitConfirmationModal             [Client Component]
│   └── SubmitConfirmationModal           [Client Component]
│
├── ResultsDashboard                      [Server Component + Client Islands]
│   ├── ScoreReveal                       [Client Component — count-up animation]
│   ├── GrowthDelta                       [Server Component]
│   ├── SubjectBreakdown                  [Server Component]
│   ├── ReadinessScoreImpact              [Server Component]
│   ├── StaminaChart (conditional)        [Client Component — chart]
│   ├── TrailDayUnlocked (conditional)    [Server Component]
│   └── ResultsCTAs                       [Client Component]
│
└── ReviewMode                            [Client Component — 'use client']
    ├── ReviewHeader                      [Client Component]
    │   ├── ReviewBadge
    │   ├── ProgressIndicator
    │   └── ExitButton
    ├── ReviewBody (same two-column layout)
    │   ├── QuestionColumn (LEFT, read-only)
    │   └── AnnotatedOptionsColumn (RIGHT)
    │       ├── AnnotatedOptionRow × 4
    │       ├── RationalePanel (always expanded)
    │       └── WikiLink
    ├── ReviewFooter
    └── ReviewPalette
```

---

## 3. Server vs Client Boundary Decisions

| Component | Directive | Reason |
|---|---|---|
| ModeSelector | Server | Static content, no interactivity |
| ModeCard | Server | Rendered by Server Component parent |
| SetupFlow | `'use client'` | Multi-step form with local state (slide transitions, stepper, toggles) |
| QuizShell | `'use client'` | Highly interactive: answer selection, timer, navigation, feedback display. Zustand store consumer. |
| QuizHeader | `'use client'` | Timer updates, bookmark toggle, palette trigger |
| QuestionColumn | `'use client'` | Content changes on each question, confidence rating interaction |
| OptionsColumn | `'use client'` | Answer selection, feedback panel animation, submit button states |
| QuestionPalette | `'use client'` | Grid interaction, filter toggles, jump-to-question |
| ResultsDashboard | Server | Fetches final data server-side. Score animation is a client island. |
| ScoreReveal | `'use client'` | Count-up animation requires client-side rendering |
| StaminaChart | `'use client'` | Chart rendering (Recharts) requires client |
| ReviewMode | `'use client'` | Navigation between questions, filter toggles, palette |

**Rule:** The quiz engine is predominantly client-side because it's a continuous interactive session. The setup (mode selector) and results (score display) have server-rendered shells with client islands for interactivity.

---

## 4. Zustand Store Architecture

### 4.1 Main Quiz Store

```typescript
// src/stores/useQuizStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface QuizStore {
  // ═══ SESSION STATE ═══
  sessionId: string | null;
  config: QuizSessionConfig | null;
  status: 'idle' | 'loading' | 'intro' | 'active' | 'feedback' | 'submitting' | 'results' | 'review';
  mode: QuizMode | null;

  // ═══ QUESTION STATE ═══
  questions: QuestionForClient[];
  currentIndex: number;                    // 0-indexed
  totalQuestions: number;

  // ═══ ANSWER STATE ═══
  answers: Map<string, AnswerState>;       // keyed by questionId

  // ═══ TIMER STATE ═══
  timer: {
    startedAt: number | null;              // Date.now() when session started
    pausedAt: number | null;
    elapsedMs: number;
    limitMs: number | null;                // null = no limit
    isRunning: boolean;
  };

  // ═══ FEEDBACK STATE ═══
  feedback: {
    visible: boolean;
    questionId: string | null;
    isCorrect: boolean | null;
    correctOptionId: string | null;
    rationale: string | null;
    wikiUrl: string | null;
    nextButtonEnabled: boolean;            // Becomes true after gated delay
  };

  // ═══ UI STATE ═══
  ui: {
    paletteOpen: boolean;
    wikiPanelOpen: boolean;
    wikiPanelUrl: string | null;
    exitModalOpen: boolean;
    submitModalOpen: boolean;
    microBreakVisible: boolean;
    offlineBannerVisible: boolean;
  };

  // ═══ OFFLINE QUEUE ═══
  pendingSubmissions: SubmitAnswerInput[];

  // ═══ RESULTS STATE ═══
  results: EndSessionResult | null;

  // ═══ COMPUTED GETTERS ═══
  getCurrentQuestion: () => QuestionForClient | null;
  getAnsweredCount: () => number;
  getCorrectCount: () => number;
  getRunningAccuracy: () => number;
  getUnansweredQuestions: () => number[];    // Indices
  getFlaggedQuestions: () => number[];       // Indices
  getProgress: () => number;                // 0–1

  // ═══ ACTIONS ═══
  // Session lifecycle
  initSession: (data: StartSessionResult) => void;
  reset: () => void;

  // Answer management
  selectAnswer: (questionId: string, optionId: string) => void;
  deselectAnswer: (questionId: string) => void;
  setConfidence: (questionId: string, level: 1 | 2 | 3) => void;

  // Submission
  submitCurrentAnswer: () => Promise<SubmitAnswerResult>;
  skipCurrentQuestion: () => Promise<void>;

  // Navigation
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;

  // Flagging
  toggleFlag: (questionId: string) => void;

  // Feedback
  showFeedback: (data: FeedbackData) => void;
  hideFeedback: () => void;
  enableNextButton: () => void;            // Called after gated delay

  // Timer
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tickTimer: () => void;                   // Called every second by interval

  // UI
  togglePalette: () => void;
  openWikiPanel: (url: string) => void;
  closeWikiPanel: () => void;
  showExitModal: () => void;
  hideExitModal: () => void;
  showSubmitModal: () => void;
  hideSubmitModal: () => void;
  showMicroBreak: () => void;
  hideMicroBreak: () => void;

  // Session end
  endSession: (reason: EndReason) => Promise<EndSessionResult>;

  // Offline
  queueOfflineSubmission: (input: SubmitAnswerInput) => void;
  flushOfflineQueue: () => Promise<void>;
}

interface AnswerState {
  selectedOptionId: string | null;
  confidenceLevel: 1 | 2 | 3 | null;
  isCorrect: boolean | null;              // null until server confirms
  isSkipped: boolean;
  isFlagged: boolean;
  timeStartedMs: number;                  // When this question was first displayed
  timeSpentMs: number;                    // Accumulated time on this question
  submittedAt: string | null;             // ISO timestamp
}
```

### 4.2 Store Initialization Flow

```typescript
// Inside initSession action:
initSession: (data: StartSessionResult) => {
  const initialAnswers = new Map<string, AnswerState>();
  data.questions.forEach(q => {
    initialAnswers.set(q.question_id, {
      selectedOptionId: null,
      confidenceLevel: null,
      isCorrect: null,
      isSkipped: false,
      isFlagged: false,
      timeStartedMs: 0,
      timeSpentMs: 0,
      submittedAt: null,
    });
  });

  set({
    sessionId: data.sessionId,
    config: data.config,
    status: 'active',
    mode: data.config.mode,
    questions: data.questions,
    currentIndex: 0,
    totalQuestions: data.totalQuestions,
    answers: initialAnswers,
    timer: {
      startedAt: data.config.timer.enabled ? Date.now() : null,
      pausedAt: null,
      elapsedMs: 0,
      limitMs: data.config.timer.totalSeconds ? data.config.timer.totalSeconds * 1000 : null,
      isRunning: data.config.timer.enabled,
    },
    feedback: { visible: false, questionId: null, isCorrect: null, correctOptionId: null, rationale: null, wikiUrl: null, nextButtonEnabled: false },
    ui: { paletteOpen: false, wikiPanelOpen: false, wikiPanelUrl: null, exitModalOpen: false, submitModalOpen: false, microBreakVisible: false, offlineBannerVisible: false },
    results: null,
  });
},
```

---

## 5. Key Interaction Flows (Code-Level)

### 5.1 Answer Selection → Submit → Feedback

```typescript
// User taps option B
store.selectAnswer(questionId, 'option-b-uuid');
// State: answers[qId].selectedOptionId = 'option-b-uuid'
// UI: Option B highlights (Cobalt Light bg)

// User taps "Submit Answer"
const result = await store.submitCurrentAnswer();
// 1. Calls submitAnswer Server Action
// 2. Updates answers[qId].isCorrect = result.isCorrect
// 3. Updates answers[qId].submittedAt = new Date().toISOString()

// If config.feedback.timing === 'immediate':
store.showFeedback({
  questionId,
  isCorrect: result.isCorrect,
  correctOptionId: result.correctOptionId,
  rationale: result.rationale,
  wikiUrl: result.wikiArticleUrl,
});
// State: feedback.visible = true, status = 'feedback'
// UI: Right column transitions to show annotated options + rationale panel

// After gated delay (config.feedback.gatedProgressionDelayMs):
setTimeout(() => store.enableNextButton(), config.feedback.gatedProgressionDelayMs);
// State: feedback.nextButtonEnabled = true
// UI: "Next Question →" button fades in (200ms opacity transition)

// User taps "Next Question →"
store.hideFeedback();
store.goNext();
// State: feedback.visible = false, currentIndex++, status = 'active'
// UI: Left column loads new question. Right column resets. 150ms crossfade.
```

### 5.2 Timer Tick (Exam Modes)

```typescript
// In QuizShell component:
useEffect(() => {
  if (!config?.timer.enabled || !config?.timer.visible) return;

  const interval = setInterval(() => {
    store.tickTimer();

    const { timer } = store.getState();
    const elapsed = timer.elapsedMs;
    const limit = timer.limitMs;

    if (limit) {
      const remaining = limit - elapsed;
      const percent = elapsed / limit;

      // Warning thresholds
      if (percent >= 0.95 && !warned95) { /* announce via aria-live */ }
      if (percent >= 0.90 && !warned90) { /* change timer color to amber */ }
      if (remaining <= 0) {
        clearInterval(interval);
        store.endSession('timer_expired');
      }
    }
  }, 1000);

  return () => clearInterval(interval);
}, [config?.timer.enabled]);
```

### 5.3 Micro-Break Check

```typescript
// After each question advance:
goNext: () => {
  const state = get();
  const newIndex = state.currentIndex + 1;

  // Check for micro-break
  if (state.config?.breaks.enabled) {
    const interval = state.config.breaks.intervalQuestions;
    if (newIndex > 0 && newIndex % interval === 0) {
      set({ ui: { ...state.ui, microBreakVisible: true } });
      return; // Don't advance yet — break overlay shows first
    }
  }

  set({ currentIndex: newIndex, status: 'active' });
},
```

### 5.4 Question Time Tracking

```typescript
// When a question becomes visible (currentIndex changes):
useEffect(() => {
  const questionId = questions[currentIndex]?.question_id;
  if (!questionId) return;

  // Mark start time
  const startTime = Date.now();

  return () => {
    // On leaving this question: accumulate time spent
    const timeSpent = Date.now() - startTime;
    const current = answers.get(questionId);
    if (current) {
      answers.set(questionId, {
        ...current,
        timeSpentMs: current.timeSpentMs + timeSpent,
      });
    }
  };
}, [currentIndex]);
```

---

## 6. Two-Column Layout Implementation

```tsx
// src/components/quiz/QuizBody.tsx
'use client';

export function QuizBody() {
  return (
    <div className="
      grid
      grid-cols-1                          {/* Mobile: single column */}
      md:grid-cols-2                       {/* Tablet+: two columns — IMMUTABLE */}
      min-h-[calc(100vh-120px)]            {/* Full height minus header + footer */}
    ">
      {/* LEFT COLUMN — Question */}
      <div className="
        p-4 md:p-6 lg:p-8
        md:border-r md:border-border
        overflow-y-auto
        flex flex-col
      ">
        <QuestionColumn />
      </div>

      {/* RIGHT COLUMN — Options + Feedback */}
      <div className="
        p-4 md:p-6 lg:p-8
        overflow-y-auto
        flex flex-col
      ">
        <OptionsColumn />
      </div>
    </div>
  );
}
```

**Breakpoint rule (non-negotiable):**
- `< md (768px)`: Single column, stacked vertically
- `≥ md (768px)`: Two columns, 50/50 split, vertical divider
- This NEVER changes. Not per mode, not per question type, not per feedback state.

---

## 7. Data Fetching Patterns

### 7.1 Session Start (Client → Server)

```typescript
// src/components/quiz/SetupFlow.tsx
'use client';

async function handleBeginSession() {
  setLoading(true);

  const result = await startSession({
    mode: selectedMode,
    config: mergedConfig,
    trailDayId: trailDayId ?? undefined,
  });

  if ('error' in result) {
    toast.error(result.error);
    setLoading(false);
    return;
  }

  // Initialize Zustand store
  useQuizStore.getState().initSession(result);

  // Navigate to session page
  router.push(`/quiz/${selectedMode}/session/${result.sessionId}`);
}
```

### 7.2 Results Page (Server-Fetched)

```tsx
// src/app/quiz/[mode]/session/[sessionId]/results/page.tsx
// Server Component — fetches data server-side for fast first paint

export default async function ResultsPage({ params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*, session_questions(*, questions(*))')
    .eq('id', params.sessionId)
    .single();

  if (!session) notFound();

  return (
    <div>
      <Suspense fallback={<ScoreRevealSkeleton />}>
        <ScoreReveal                        // Client island — animation
          correct={session.correct_count}
          total={session.answered_count}
        />
      </Suspense>
      <SubjectBreakdown data={session} />   // Server rendered
      <ReadinessScoreCard                   // Server rendered
        before={session.readiness_score_before}
        after={session.readiness_score_after}
      />
      <ResultsCTAs                          // Client island — navigation
        sessionId={session.id}
        missedCount={session.answered_count - session.correct_count}
      />
    </div>
  );
}
```

---

## 8. Offline Architecture

### 8.1 IndexedDB Schema

```typescript
// src/lib/offline/db.ts
import { openDB, DBSchema } from 'idb';

interface QuizOfflineDB extends DBSchema {
  'pending-answers': {
    key: string;                           // `${sessionId}:${questionId}`
    value: {
      input: SubmitAnswerInput;
      timestamp: number;
      retryCount: number;
    };
  };
  'cached-sessions': {
    key: string;                           // sessionId
    value: {
      session: QuizSession;
      questions: QuestionForClient[];
      answers: Record<string, AnswerState>;
    };
  };
}

export const getDB = () => openDB<QuizOfflineDB>('slatecamp-quiz', 1, {
  upgrade(db) {
    db.createObjectStore('pending-answers');
    db.createObjectStore('cached-sessions');
  },
});
```

### 8.2 Online/Offline Detection

```typescript
// src/hooks/useOnlineStatus.ts
'use client';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      useQuizStore.getState().flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

---

## 9. Performance Considerations

### 9.1 Question Pre-fetching

For sessions >20 questions, don't load all questions at once. Fetch in batches of 20, pre-fetching the next batch while the user answers the current batch's last 5 questions.

```typescript
// Pseudocode for pre-fetching
const BATCH_SIZE = 20;
const PREFETCH_THRESHOLD = 5; // Start fetching when 5 questions remain in current batch

useEffect(() => {
  const questionsRemaining = questions.length - currentIndex;
  if (questionsRemaining <= PREFETCH_THRESHOLD && !allQuestionsLoaded) {
    fetchNextBatch(sessionId, questions.length, BATCH_SIZE);
  }
}, [currentIndex]);
```

### 9.2 Transition Performance

- Question transitions: 150ms CSS opacity crossfade (no JavaScript animation)
- Feedback panel: CSS `max-height` transition (250ms ease-out)
- Progress bar: CSS `width` transition (300ms ease-out)
- Score count-up: `requestAnimationFrame` loop with ease-out timing (1500ms)
- No React Spring / Framer Motion for quiz interactions — too heavy for mid-range Android

### 9.3 Bundle Splitting

```
quiz/
├── mode-selector chunk (~15KB)     # Server-rendered, minimal JS
├── setup-flow chunk (~25KB)        # Stepper, toggles, topic picker
├── quiz-shell chunk (~40KB)        # Core quiz engine (largest)
│   ├── timer logic
│   ├── palette component
│   ├── feedback panel
│   └── offline sync
├── results chunk (~20KB)           # Score animation, charts
└── review chunk (~30KB)            # Review mode (reuses quiz shell components)
```

Use Next.js `dynamic()` for the question palette and stamina chart — they're not needed on first paint.

```tsx
const QuestionPalette = dynamic(() => import('./QuestionPalette'), {
  loading: () => <PaletteSkeleton />,
});
const StaminaChart = dynamic(() => import('./StaminaChart'), {
  loading: () => <ChartSkeleton />,
});
```

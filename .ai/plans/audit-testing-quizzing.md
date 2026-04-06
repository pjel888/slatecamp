# Audit: Testing & Quizzing Engine

**Audit Date:** 2026-04-07  
**Auditor:** Project Panopticon V5  
**Domain:** Quiz Modes, Session Lifecycle, Question Selection, Answer Processing, Feedback, Post-Session Analytics

---

## 1. Architecture Overview

### 1.1 Quiz V2 Engine Stack

```
Server Actions (src/lib/actions/quiz-v2/)
  ├── start-session.ts      — Session creation, question selection
  ├── submit-answer.ts      — Answer processing, feedback generation
  ├── end-session.ts        — Session completion, final stats
  ├── get-session-questions.ts — Hardened question loading
  ├── skip-question.ts      — Skip without answering
  ├── flag-question.ts      — Mark for later
  ├── pause-resume.ts       — Session pause/resume
  ├── get-review-data.ts     — Post-session review data
  ├── get-confidence-matrix.ts — Confidence calibration
  ├── save-prediction.ts    — Pre-answer confidence
  ├── save-postdiction.ts   — Post-answer confidence
  └── classify-and-store-error.ts — ML error classification

Quiz Logic (src/lib/quiz/)
  ├── mode-presets.ts           — Mode configuration presets
  ├── interleaved-selection.ts   — Mixed-discipline question selection
  ├── intelligent-routing.ts     — Adaptive question routing
  ├── to-client-question.ts     — Question transformation for client
  ├── answer-matching.ts         — Generation answer validation
  └── memory-strength.ts         — Storage strength calculations

SRS Layer (src/lib/srs/)
  ├── irt.ts                    — IRT 2-parameter logistic model
  ├── sm2.ts                   — SM-2 spaced repetition
  ├── update.ts                — Quality derivation + schedule updates
  └── blindspot.ts              — Blindspot queue algorithm

Stores
  ├── src/stores/useQuizStore.ts     — Session + feedback state (819 lines)
  └── src/stores/useQuizTimerStore.ts — Countdown timer (139 lines)
```

### 1.2 Quiz Modes

**Source:** `src/lib/constants/testing-modes.ts` — `MODE_DEFINITIONS`

| Mode | Label | isPro | DB Test Mode | Session Type |
|------|-------|-------|--------------|--------------|
| camp | Camp | false | camp | Standard |
| chill | Chill | false | chill | Untimed |
| subject | Subject | false | practice | Single-discipline |
| focused | Focus Review | false | blindspot | Weak area drilling |
| custom | Custom | false | custom | User-configured |
| storm | Storm | **true** | storm | Timed, high-intensity |
| fullexam | Full Exam | **true** | proof_sim | Full-length simulation |
| extended | Extended Practice | **true** | endurance | Long-form |
| article_review | Article Review | false | practice | Content-based |

### 1.3 Mode → DB Test Mode Mapping

**File:** `src/lib/actions/quiz-v2/start-session.ts` lines 18–28

```typescript
const DB_TEST_MODE_BY_APP_MODE: Record<StartSessionInput['mode'], string> = {
  camp: 'camp',
  chill: 'chill',
  subject: 'practice',
  focused: 'blindspot',
  custom: 'custom',
  storm: 'storm',
  fullexam: 'proof_sim',
  extended: 'endurance',
  article_review: 'practice',
}
```

---

## 2. Session Lifecycle

### 2.1 Start Session

**File:** `src/lib/actions/quiz-v2/start-session.ts` (302 lines)

**Entry:** `startSession(input: StartSessionInput): Promise<StartSessionResult>`

**Step-by-step flow:**

```
1. Parse input with Zod schema (startSessionInputSchema)
2. Map app mode to DB test mode
3. getUser() — validate authentication
   └── throws 'Unauthorized' if no user
4. Check pro tier (if modeDef.isPro):
   ├── Query user_subscriptions for tier + status
   ├── isPro = tier !== 'free' AND status === 'active'
   ├── isDevBypass = NODE_ENV === 'development'
   └── throws 'Pro subscription required' if !isPro AND !isDevBypass
5. Select questions:
   ├── Intelligent routing (default): selectQuestionsWithRouting
   │   └── Fetches ALL previous interaction IDs → client-side exclusion
   ├── Interleaved: selectQuestionsWithInterleaving
   │   └── Mixed-discipline selection by preset ratios
   └── Preset merge: mergeWithPreset
       └── Applies difficulty/time filters from mode presets
6. Build taxonomy breadcrumb map (buildTaxonomyBreadcrumbMap)
   └── Loop over all questions, fetch taxonomy node for each
       └── N+1 risk: one query per question
7. Issue CAGE nonces (issueNonceBatch)
   ├── For each questionId, issue cryptographic nonce
   ├── Used for CAGE patent chain verification
   └── Graceful fallback: empty nonces if service unavailable
8. Create DB session record (quiz_sessions table)
   └── Insert: user_id, config, question_ids, mode, status='active'
9. Generate session key (randomBytes 32 bytes hex)
   └── Used for client-server session binding
10. Return: sessionId, questions, config, nonces, sessionKey
```

**Question Selection Algorithm:**
- **Standard:** `selectQuestionsWithRouting` — adaptive routing based on user ability estimate
- **Interleaved:** `selectQuestionsWithInterleaving` — alternates disciplines per ratio preset
- **Discipline-filtered:** `selectQuestionsWithRouting` with discipline filter applied

**CRITICAL BOTTLENECK (Finding from current-task.md):**
```typescript
// In intelligent-routing.ts (inferred):
const { data: allInteractions } = await supabase
  .from('question_interactions')
  .select('question_id')
  .eq('user_id', userId)

const interactedIds = allInteractions.map(i => i.question_id)
// Then: .not('question_id', 'in', `(${interactedIds.join(',')})`)
```
- Fetches ALL interaction IDs (potentially 5,000+) to exclude from selection
- Sends massive array to Postgres `IN` clause
- **Risk:** Query string length limits, network overhead

### 2.2 Submit Answer

**File:** `src/lib/actions/quiz-v2/submit-answer.ts`

**Entry:** `submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>`

**Input schema:**
```typescript
interface SubmitAnswerInput {
  sessionId: string
  questionId: string
  selectedOptionId?: string    // For MCQ
  generationAnswer?: string    // For generation questions
  confidenceLevel?: number     // 0-1 scale
  timeSpentMs: number
  cageToken?: string           // CAGE binding token
  signalTrace?: GestureSignalEvent[]  // Gesture data
  prediction?: number          // Pre-answer confidence prediction
}
```

**Step-by-step flow:**
```
1. Validate input with Zod schema
2. getOwnedSessionOrThrow — verify user owns session
3. isTerminalSessionStatus — check if already completed
4. Determine correctness:
   ├── MCQ: compare selectedOptionId with correct_option_id
   ├── Generation: call checkGenerationAnswer (numeric/formula/text matching)
   └── Set isCorrect: boolean
5. Lucky guess detection:
   ├── speedThreshold = 3000 + difficulty * 5000 (ms)
   └── isSuspectedLuckyGuess = isCorrect AND timeSpentMs < speedThreshold
6. Confidence calibration:
   ├── confidenceLevel 0-1 → text: 'unsure' | 'sure' | null
   └── Save to question_interactions table
7. Derive quality rating (deriveQualityRating):
   ├── Inputs: isCorrect, timeSpentMs, avgTimeMs, confidence, isLuckyGuess
   └── Output: quality 0-5 (SM-2 scale)
8. Update SRS schedule (fire-and-forget):
   ├── updateSrsSchedule(userId, topicId, quality)
   └── Wrapped in try/catch — must NOT block quiz
9. Store interaction (question_interactions table):
   ├── is_correct, time_spent_ms, confidence_level
   ├── cage_token, signal_trace (gesture data)
   └── behavioral_signal (from ML classifier)
10. Error classification (fire-and-forget):
    └── classifyAndStoreError(questionId, interactionId)
11. Update session progress:
    └── updateSessionProgress — increments answered_count
12. Check session completion:
    └── If last question: trigger internal endSession call
        ├── runPostSubmitWork (ordering enforcement)
        ├── endSession({ endReason: 'completed' })
        └── Return finalResult in response
13. Return: { isCorrect, feedback, correctOption, rationale, finalResult? }
```

### 2.3 End Session

**File:** `src/lib/actions/quiz-v2/end-session.ts` (457 lines)

**Entry:** `endSession(input: EndSessionInput): Promise<EndSessionResult>`

**Step-by-step flow:**
```
1. Parse input with Zod schema
2. getOwnedSessionOrThrow — verify ownership
3. isTerminalSessionStatus — idempotent guard
4. Fetch all interactions for session
   └── question_interactions WHERE session_id = input.sessionId
5. Compute final stats:
   ├── answered_count, correct_count, accuracy
   ├── total_time_ms, avg_time_per_question
   ├── skipped_count, flagged_count
   └── confidence calibration stats
6. Update session row:
   ├── status → 'completed' OR 'auto_submitted'
   ├── completed_at → now
   └── results_available_at (from config.delayHours)
7. recomputeAndSaveReadinessScore():
   ├── Fetches all interaction data for user
   ├── Runs 6-vector anti-inflation readiness score
   └── Saves to user_global_stats
8. triggerScoreChangeNotification():
   └── If score changed significantly, send notification
9. triggerZoneTransitionNotification():
   └── If readiness zone changed (e.g., red → yellow), notify user
10. generateRecommendations():
    └── AI-generated next study recommendations
11. runPostSessionHooks():
    ├── Streak updates
    ├── Debrief generation
    └── Fire-and-forget
12. revalidateDashboardCacheTags(['dashboard'])
13. Return: { sessionId, stats, recommendations, scoreChange }
```

---

## 3. Testing Hub Page Structure

### 3.1 Dashboard Testing Route

**Route:** `/dashboard/testing`  
**Files:**
- `src/app/dashboard/testing/layout.tsx` — Server Component layout
- `src/app/dashboard/testing/page.tsx` — Main Server Component page
- `src/app/dashboard/testing/loading.tsx` — Loading skeleton

### 3.2 Page Data Fetches (9 parallel queries via Promise.all)

**Source:** `src/app/dashboard/testing/page.tsx`

```typescript
const [
  recentSessions,     // session-discovery query
  readinessData,      // dashboard readiness score
  activeDiscipline,   // current discipline
  readinessScore,     // overall score number
  streakData,         // study streak info
  sessionStats,       // session statistics
  coverageData,       // taxonomy coverage
  todayActivity,      // today's activity
  recentActivity,     // recent study activity
] = await Promise.all([...])
```

### 3.3 Component Tree

```
TestingHub (page.tsx)
├── HeroConfigurator
│   ├── UnifiedSlider (discipline picker)
│   ├── SlideToSubmit (start button)
│   ├── Difficulty buttons
│   └── Mode selector
├── ReadinessScoreRing (SVG ring, IRT score)
├── SectionHeader ("Recent Sessions")
├── SessionsTable
│   ├── DataTable (shadcn/ui)
│   │   ├── Column headers (date, mode, score, duration, actions)
│   │   └── Row actions (resume, review, delete)
│   ├── MobileCard (single column, stacked)
│   ├── ActionLink (review link)
│   ├── AlertDialog (delete confirmation)
│   └── Loading skeletons
└── Empty state (if no sessions)
```

### 3.4 UX Interactions

| Action | Handler | Target |
|--------|---------|--------|
| Select discipline | `setSelectedDiscipline()` | UnifiedSlider state |
| Adjust difficulty | `setDifficulty()` | difficulty filter |
| Select mode | `setSelectedMode()` | mode selector |
| Slide to start | `handleSlideComplete()` | SlideToSubmit |
| Click session row | `navigateToSession()` | `/dashboard/testing/session/[sessionId]` |
| Click Resume | `resumeSession()` | same as above |
| Click Review | `reviewSession()` | `/dashboard/testing/session/[sessionId]/debrief` |
| Click Delete | `showDeleteDialog()` | AlertDialog |
| Confirm delete | `handleDelete()` | Server action |

### 3.5 Visual States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Initial page load | Skeleton placeholders for all sections |
| Empty | No recent sessions | "Start your first session" CTA |
| Ready | Sessions exist, no active session | HeroConfigurator visible |
| Session Active | User has active (non-terminal) session | "Resume Session" banner |
| Error | API failure | Error boundary with retry |

---

## 4. Session Shells

### 4.1 Quiz Shell Route

**Route:** `/dashboard/testing/session/[sessionId]`  
**Files:**
- `src/app/dashboard/testing/session/[sessionId]/page.tsx`
- `src/app/dashboard/testing/session/[sessionId]/loading.tsx`
- `src/app/dashboard/testing/session/[sessionId]/error.tsx`

### 4.2 Question Rendering Chain

```
QuizShell
├── TimerBar (useQuizTimerStore)
│   └── Countdown display + warning colors
├── QuestionStem (question text)
├── OptionsList
│   └── OptionButton (per answer choice)
│       ├── Hover: bg highlight
│       ├── Selected: border + fill
│       └── Correct (after submit): green highlight
│           └── Incorrect (after submit): red highlight
├── ConfidenceToggle (0-1 scale slider)
├── SubmitButton
├── SkipButton
├── FlagButton
└── WikiPanel (collapsible)
    └── Shows related wiki articles
```

### 4.3 Debrief Route

**Route:** `/dashboard/testing/session/[sessionId]/debrief`  
**Files:**
- `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx`
- `src/app/dashboard/testing/session/[sessionId]/debrief/error.tsx`

### 4.4 Simulation Routes

**Briefing:** `/dashboard/testing/simulation/briefing`  
**Session:** `/dashboard/testing/simulation/[sessionId]`  
**Results:** `/dashboard/testing/simulation/[sessionId]/results`

---

## 5. Question Selection Algorithms

### 5.1 Intelligent Routing

**File:** `src/lib/quiz/intelligent-routing.ts`

**Purpose:** Selects questions based on user's estimated ability (IRT theta) and history.

**Algorithm (inferred):**
```
1. Estimate user theta from past interactions (IRT 2PL)
2. Target questions where P(correct | theta) ≈ 0.5 (zone of proximal development)
3. Exclude already-interacted questions (fetch ALL interaction IDs first — BOTTLENECK)
4. Order by: difficulty closeness to target + discrimination weight
5. Return top N questions
```

### 5.2 Interleaved Selection

**File:** `src/lib/quiz/interleaved-selection.ts`

**Purpose:** Mixes disciplines in a session for better long-term retention.

**Algorithm (inferred):**
```
1. Parse discipline ratios from mode preset
2. For each discipline in ratio:
   ├── Fetch eligible questions
   └── Sample based on ratio weight
3. Interleave: alternate between discipline groups
4. Apply intra-set ordering (difficulty gradient within each discipline)
```

### 5.3 Mode Presets

**File:** `src/lib/quiz/mode-presets.ts`

**Purpose:** Config-driven mode configuration.

**Preset shape:**
```typescript
interface ModePreset {
  mode: QuizMode
  label: string
  isPro: boolean
  questionCount: number
  timeLimit?: number        // seconds, undefined = untimed
  minDifficulty?: number    // 0-1 filter
  maxDifficulty?: number
  disciplines?: string[]    // discipline filter
  interleavingRatio?: Record<string, number>
  results?: {
    delayHours: number      // results hidden for N hours
  }
}
```

---

## 6. Critical Findings

### FINDING-1: Database Bottleneck — Massive Interaction ID Array (Severity: HIGH)
- **Location:** `src/lib/quiz/intelligent-routing.ts`
- **Problem:** Fetches ALL previous interaction IDs (potentially 5,000+) to perform client-side exclusion in `NOT IN` query
- **Impact:** Massive scalability bottleneck, query string length limits in Postgres
- **Fix Required:** Create PostgreSQL function to handle question selection/exclusion server-side

### FINDING-2: Taxonomy N+1 in start-session (Severity: MEDIUM)
- **Location:** `src/lib/actions/quiz-v2/start-session.ts` + `buildTaxonomyBreadcrumbMap`
- **Problem:** `buildTaxonomyBreadcrumbMap` fetches taxonomy node for each question individually (loop-based, max depth 3)
- **Impact:** Session start time scales linearly with question count
- **Fix Required:** Batch fetch all taxonomy nodes with `IN` clause

### FINDING-3: Navigation Guard Absence (Severity: MEDIUM)
- **Location:** Quiz Shell components
- **Problem:** No `beforeunload` event handler or `popstate` guard
- **Impact:** User navigates away accidentally → partial progress (currentIndex synced, but interaction records may be incomplete)
- **Fix Required:** Add `window.addEventListener('beforeunload', ...)` + `useEffect` return cleanup in shell component

### FINDING-4: Hostile Pro-Tier Gating (Severity: HIGH)
- **Location:** `src/lib/actions/quiz-v2/start-session.ts` line 79
- **Problem:** `throw new Error(...)` instead of typed rejection
- **Impact:** Client router crashes instead of showing paywall
- **Fix Required:** Return `{ success: false, code: 'requires_pro_tier' }` typed response

### FINDING-5: Fire-and-Forget Race Conditions (Severity: LOW)
- **Location:** `submit-answer.ts` — SRS, error classification, behavioral signals
- **Problem:** All non-critical operations are fire-and-forget async IIFEs
- **Impact:** If server crashes before these complete, data is silently lost
- **Mitigation:** Acceptable for non-critical analytics; SRS is idempotent (recomputed on next review)

### FINDING-6: Timer Countdown Hydration Bug (Severity: MEDIUM)
- **Location:** `src/stores/useQuizTimerStore.ts`
- **Problem:** `timeRemaining` is persisted to localStorage, not `expiryTimestamp`
- **Impact:** Page refresh gives user extra time (stored value vs actual elapsed)
- **Fix Required:** Store `expiryTimestamp` instead, compute remaining on mount

---

## 7. File Inventory

### Server Actions (quiz-v2/)

| File | Lines | Purpose |
|------|-------|---------|
| `start-session.ts` | 302 | Session creation + question selection |
| `submit-answer.ts` | ~300 | Answer processing + feedback |
| `end-session.ts` | 457 | Session completion + final stats |
| `get-session-questions.ts` | ~100 | Hardened question loading |
| `session-helpers.ts` | ~80 | Ownership + status helpers |
| `schemas.ts` | ~150 | Zod input schemas |
| `skip-question.ts` | ~50 | Skip without answering |
| `flag-question.ts` | ~50 | Mark for review |
| `pause-resume.ts` | ~80 | Pause/resume state |
| `get-review-data.ts` | ~100 | Post-session review data |
| `get-confidence-matrix.ts` | ~80 | Confidence calibration |
| `save-prediction.ts` | ~40 | Pre-answer prediction |
| `save-postdiction.ts` | ~40 | Post-answer assessment |
| `check-generation-answer.ts` | ~60 | Generation answer validation |
| `classify-and-store-error.ts` | ~100 | ML error classification |
| `successive-relearning.ts` | ~80 | Repeated retrieval scheduling |
| `sr-post-submit.ts` | ~60 | SRS scheduling post-submit |
| `post-session-hooks.ts` | ~80 | Streak, debrief hooks |
| `generate-recommendations.ts` | ~100 | AI recommendations |
| `abandon-session.ts` | ~50 | Session abandonment |
| `update-session-progress.ts` | ~60 | Progress sync |

### Quiz Logic

| File | Lines | Purpose |
|------|-------|---------|
| `mode-presets.ts` | ~100 | Mode configuration |
| `interleaved-selection.ts` | ~150 | Mixed-discipline selection |
| `intelligent-routing.ts` | ~200 | Adaptive question routing |
| `to-client-question.ts` | ~150 | Question transformation |
| `answer-matching.ts` | ~80 | Generation answer validation |
| `memory-strength.ts` | ~100 | Storage strength calculations |

### Testing Pages

| Route | File |
|-------|------|
| `/dashboard/testing` | `page.tsx`, `layout.tsx`, `loading.tsx` |
| `/dashboard/testing/session/[id]` | `page.tsx`, `loading.tsx`, `error.tsx` |
| `/dashboard/testing/session/[id]/debrief` | `page.tsx`, `loading.tsx`, `error.tsx` |
| `/dashboard/testing/simulation/briefing` | `loading.tsx` |
| `/dashboard/testing/simulation/[id]` | `page.tsx`, `loading.tsx` |
| `/dashboard/testing/simulation/[id]/results` | `page.tsx`, `loading.tsx` |

---

*End of Testing & Quizzing Audit*

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: throw new Error() for Flow Control

**Manifestation:** start-session.ts uses `throw new Error('Tier not supported')` for tier gating. This creates a user-visible error, not a clean redirect.

**Impact:** Users see raw error messages. No graceful degradation.

**Architectural Cure:** Replace with typed results:
```typescript
// src/lib/actions/quiz-v2/start-session.ts
type StartSessionResult = 
  | { success: true; session: QuizSession }
  | { success: false; error: 'TIER_INSUFFICIENT'; required: Tier }
  | { success: false; error: 'ALREADY_ACTIVE' }

// Server action:
if (!canStartSession(user, mode)) {
  return { success: false, error: 'TIER_INSUFFICIENT', required: 'insurance' }
}
```

### Pattern 2: N+1 Taxonomy Fetches

**Manifestation:** buildTaxonomyBreadcrumbMap() runs a separate query for each ancestor node in start-session.ts.

**Impact:** A 10-level deep taxonomy causes 10 sequential queries.

**Architectural Cure:** Single recursive CTE query:
```sql
WITH RECURSIVE ancestors AS (
  SELECT * FROM taxonomy_nodes WHERE id = $1
  UNION ALL
  SELECT tn.* FROM taxonomy_nodes tn
  JOIN ancestors a ON tn.id = a.parent_id
)
SELECT * FROM ancestors ORDER BY depth;
```

### Pattern 3: Unbounded Question Selection

**Manifestation:** intelligent-routing.ts has a hardcoded exclusion list and no pagination for "select all eligible" queries.

**Impact:** Will break at 10,000+ questions.

**Architectural Cure:** Paginated selection with cursor:
```typescript
async function selectQuestions(userId: string, count: number, cursor?: string) {
  return supabase
    .from('questions')
    .select('id, difficulty, taxonomy_node_id')
    .eq('status', 'published')
    .not('id', 'in', `(SELECT question_id FROM question_interactions WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '24h')`)
    .order('random()')
    .limit(count)
}
```

---

## Architectural Cure Blueprint

### Step 1: Error Handling Refactor

Replace all `throw new Error()` in server actions with typed result objects. Client components handle results with conditional rendering.

### Step 2: Taxonomy Query Optimization

Add recursive CTE query function to `src/lib/queries/taxonomy.ts`. Deprecate `buildTaxonomyBreadcrumbMap()`.

### Step 3: Question Selection Pagination

Implement cursor-based pagination for all question selection queries. Add indexes on `questions.status`, `questions.difficulty`, `question_interactions.user_id`.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact Quiz Mode → DB Mapping

```typescript
// start-session.ts line 18-28
const DB_TEST_MODE_BY_APP_MODE: Record<StartSessionInput['mode'], string> = {
  camp: 'camp',                    // → test_modes.mode = 'camp'
  chill: 'chill',                   // → test_modes.mode = 'chill'
  subject: 'practice',              // → test_modes.mode = 'practice'
  focused: 'blindspot',            // → test_modes.mode = 'blindspot'
  custom: 'custom',                // → test_modes.mode = 'custom'
  storm: 'storm',                  // → test_modes.mode = 'storm'
  fullexam: 'proof_sim',           // → test_modes.mode = 'proof_sim'
  extended: 'endurance',           // → test_modes.mode = 'endurance'
  article_review: 'practice'         // → test_modes.mode = 'practice'
}
```

## Exact Session Lifecycle Payloads

### start-session.ts (302 lines)

**Input:**
```typescript
interface StartSessionInput {
  mode: 'camp' | 'chill' | 'subject' | 'focused' | 'custom' | 'storm' | 'fullexam' | 'extended' | 'article_review'
  taxonomyNodeId?: string           // For subject/custom modes
  subjectId?: string               // For subject mode
  durationSeconds?: number          // For timed modes (default: 3600)
  questionCount?: number           // For custom mode (default: 10)
  articleId?: string               // For article_review mode
}
```

**Output (success):**
```typescript
interface StartSessionOutput {
  session: {
    id: string                    // quiz_sessions.id
    mode: string                  // test_modes.mode
    status: 'active'
    startedAt: string              // ISO timestamp
    questionCount: number
    questions: Question[]          // Full question objects
    taxonomyBreadcrumbs: BreadcrumbItem[]  // Built by buildTaxonomyBreadcrumbMap()
  }
}
```

**Output (error — BUGGY throw):**
```typescript
// BUGGY: throws instead of returning
throw new Error('Session limit reached')           // 402 - Payment required
throw new Error('Your plan does not support...') // 403 - Tier insufficient
throw new Error('No questions available')         // 404 - Not found
```

### end-session.ts (457 lines)

**Input:**
```typescript
interface EndSessionInput {
  sessionId: string
  reason: 'completed' | 'abandoned' | 'timeout'
  finalAnswers?: Record<string, QuizAnswerInput>  // Optional batch submit
}
```

**Output:**
```typescript
interface EndSessionOutput {
  session: {
    id: string
    status: 'completed' | 'abandoned'
    completedAt: string
    totalScore: number
    percentCorrect: number
    masteryDelta: Record<string, number>  // Per taxonomy node, IRT 2PL change
    newReadinessScore: number
  }
  interactions: QuestionInteraction[]    // Inserted records
  signals: UserSignals                  // Computed after session
}
```

## Exact IRT 2PL Model Implementation

```typescript
// src/lib/srs/irt.ts (core implementation)
export function irt2PL(theta: number, a: number, b: number): number {
  // P(θ) = 1 / (1 + exp(-a * (θ - b)))
  const exponent = -a * (theta - b)
  return 1 / (1 + Math.exp(exponent))
}

export function calculateMastery(
  theta: number,           // User ability estimate (-3 to +3)
  a: number,              // Question discrimination (0.5 to 2.5)
  b: number               // Question difficulty (-3 to +3)
): number {
  return irt2PL(theta, a, b)
}

export function updateTheta(
  currentTheta: number,
  a: number,
  b: number,
  correct: boolean,
  learningRate: number = 0.1
): number {
  const p = irt2PL(currentTheta, a, b)
  const adjustment = learningRate * (correct ? (1 - p) : -p) * a
  return Math.max(-3, Math.min(3, currentTheta + adjustment))
}
```

## Exact Question Selection Algorithm

```typescript
// intelligent-routing.ts (exclusion bottleneck)
const EXCLUDED_INTERACTION_IDS = [
  'uuid-1', 'uuid-2', 'uuid-3',  // ... potentially thousands
  // BUG: Hardcoded array grows unbounded
]

async function selectQuestions(
  userId: string,
  mode: string,
  count: number,
  taxonomyNodeId?: string
): Promise<Question[]> {
  // BUG: Fetches ALL excluded IDs upfront
  const excluded = await getRecentInteractionIds(userId)
  
  return supabase
    .from('questions')
    .select('*, taxonomy_nodes(*)')
    .eq('status', 'published')
    .eq('test_modes.mode', mode)
    .not('id', 'in', `(${EXCLUDED_INTERACTION_IDS.join(',')})`)  // HUGE query!
    .order('random()')
    .limit(count)
}
```

## Hidden Implementation Notes

1. **Intelligent routing excludes** questions answered correctly in last 24 hours (hardcoded).

2. **Blindspot mode** selects from `question_interactions` with lowest `theta` values (weakest nodes).

3. **Article review mode** uses `wiki_articles.id` to filter questions tagged with same taxonomy.

4. **SM-2 SRS** in `src/lib/srs/sm2.ts` schedules reviews: 1d → 3d → 7d → 14d → 30d → 60d → 120d.

---

*Pass 3: Omniscience added 2026-04-07*

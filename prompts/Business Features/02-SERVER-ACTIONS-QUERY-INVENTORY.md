# SlateCamp — Server Actions & Query Functions Inventory
## Complete Function Registry · Pre-Implementation Baseline
### 2026-03-26

---

## Purpose

This document maps every server action and query function in the codebase — what it does, what tables it touches, what calls it, and what its signature is. Before adding a new function or modifying an existing one, check this inventory to avoid duplication and understand the call chain.

---

## How to Regenerate This Document

```bash
# Find all server action files
find src/lib/actions -name "*.ts" -o -name "*.tsx" | sort

# Find all query files
find src/lib/queries -name "*.ts" | sort

# Find all exported functions in actions
grep -rn "^export" src/lib/actions/ --include="*.ts" | sort

# Find all exported functions in queries
grep -rn "^export" src/lib/queries/ --include="*.ts" | sort

# Find all Supabase .from() calls to map table usage
grep -rn "\.from('" src/lib/ --include="*.ts" | sort
```

---

## Architecture Rules

1. **All Supabase calls live in `src/lib/queries/[feature].ts`** — never in components or page files
2. **All mutations (writes) live in `src/lib/actions/[feature].ts`** — always marked `'use server'`
3. **Query functions return `QueryResult<T>`** — never raw Supabase responses, never throw
4. **Server actions validate with Zod** before touching the database
5. **All queries scope to `user_id`** — even when RLS enforces it, always explicit
6. **No `select('*')`** — always explicit column lists

```typescript
// Standard QueryResult type (should be in src/types/common.ts or similar)
type QueryResult<T> = {
  data: T | null
  error: string | null
}
```

---

## Directory Structure

```
src/lib/
├── actions/                    # Server Actions (mutations, writes)
│   ├── testing.ts              # Quiz session lifecycle — THE MOST CRITICAL FILE
│   ├── quiz.ts                 # Legacy quiz flow (has correct SRS wiring — reference pattern)
│   ├── notes.ts                # Note CRUD
│   ├── contact.ts              # Contact form (planned, Phase 1)
│   ├── profile.ts              # Profile editing (planned, Phase 1)
│   ├── admin/
│   │   ├── dashboard.ts        # Admin stats — ⚠️ MISSING auth check
│   │   ├── coverage.ts         # Content coverage — ⚠️ MISSING auth check
│   │   └── wiki-queries.ts     # Wiki admin queries — ⚠️ MISSING auth check
│   └── social-proof.ts         # Social proof data — ⚠️ MISSING auth check
│
├── queries/                    # Read-only query functions
│   ├── dashboard.ts            # Dashboard data fetching
│   ├── analytics.ts            # Analytics charts
│   ├── taxonomy.ts             # Taxonomy tree queries
│   ├── wiki.ts                 # Wiki article queries
│   ├── testing.ts              # Testing hub data
│   └── [feature].ts            # Feature-specific queries
│
├── srs/                        # Spaced Repetition System
│   ├── quality.ts              # deriveQualityRating()
│   ├── update.ts               # updateSrsSchedule()
│   └── irt.ts                  # IRT functions (selectNextQuestion, probabilityCorrect, updateTheta)
│
├── supabase/
│   ├── server.ts               # Server-side Supabase client (uses cookies)
│   └── client.ts               # Browser-side Supabase client
│
└── utils.ts                    # Shared utilities
```

---

## Critical Server Actions

### `src/lib/actions/testing.ts` — THE MOST CRITICAL FILE

This file manages the entire quiz session lifecycle across all 7 testing modes. It is the primary target for the Phase 1 SRS and IRT wiring fixes.

#### `saveTestingInteraction()`
**Location:** ~line 492-544
**Purpose:** Records a single question answer during a quiz session.
**Tables touched:** `user_interactions` (INSERT), `user_node_mastery` (indirectly via trigger)
**Called by:** Quiz session components (all 7 testing modes)
**Returns:** Success/error

**🔴 CRITICAL BUG:** After the upsert, this function **does not** call:
- `deriveQualityRating()` from `@/lib/srs/quality`
- `updateSrsSchedule()` from `@/lib/srs/update`

This means SRS scheduling is dead for all 7 testing modes.

**Fix (Phase 1, Roadmap §1.1):**
```typescript
// After successful upsert in saveTestingInteraction(), add:
import { deriveQualityRating } from '@/lib/srs/quality'
import { updateSrsSchedule } from '@/lib/srs/update'

const quality = deriveQualityRating({
  isCorrect: interaction.is_correct,
  timeSpent: interaction.time_spent_ms,
  confidence: interaction.confidence_level,
  luckyGuess: interaction.lucky_guess_flag
})
await updateSrsSchedule(userId, interaction.question_id, quality)
// Wrap in try/catch — SRS failure must not break the session
```

**Reference pattern:** `src/lib/actions/quiz.ts:388-395` — the legacy flow that does this correctly.

#### Session Creation Function
**Location:** Within testing.ts (exact line TBD — verify)
**Purpose:** Creates a new quiz session, selects questions
**Tables touched:** `quiz_sessions` (INSERT), `questions` (SELECT), `user_node_mastery` (SELECT)
**Current behavior:** Selects questions using `current_mastery_weight ASC` ordering
**Required behavior:** Should use IRT-based selection via `selectNextQuestion()` targeting P(correct)=0.75

**🔴 CRITICAL BUG:** IRT functions exist with passing tests in `src/lib/srs/irt.ts` but are never called.

**Fix (Phase 1, Roadmap §1.2):**
```typescript
import { selectNextQuestion, updateTheta } from '@/lib/srs/irt'

// During session creation:
// 1. Fetch user theta from user_global_stats (or default 0.0)
// 2. For each question slot, call selectNextQuestion(availableQuestions, userTheta)
// 3. After session completion, call updateTheta() and write to user_global_stats
```

#### Session Completion Handler
**Purpose:** Marks session as completed, triggers readiness score snapshot
**Tables touched:** `quiz_sessions` (UPDATE status → 'completed')
**Side effect:** Triggers `snapshot_readiness_on_session_complete` DB trigger

---

### `src/lib/actions/quiz.ts` — LEGACY QUIZ FLOW

**Status:** This is the older quiz flow that correctly wires SRS. Use as reference.

#### Key function at lines 388-395
**Purpose:** After recording an interaction, correctly calls SRS update
**Pattern to copy:** The `deriveQualityRating()` → `updateSrsSchedule()` chain

---

### `src/lib/actions/notes.ts`

#### `createNote(formData: FormData)`
**Tables:** `notes` (INSERT)
**Validates:** Zod schema (title, content)
**Calls:** `revalidatePath('/dashboard/notes')`

#### `updateNote(id: string, data: Partial<Note>)`
**Tables:** `notes` (UPDATE, scoped to user_id)
**Calls:** `revalidatePath('/dashboard/notes')`

#### `deleteNote(id: string)` — soft delete
**Tables:** `notes` (UPDATE `archived_at`)
**Note:** Uses soft delete, not hard delete

---

### `src/lib/actions/admin/dashboard.ts` — ⚠️ SECURITY

#### `getAdminStats()`
**Tables:** Multiple (aggregate queries)
**🔴 MISSING:** `canReviewContent()` auth check — any authenticated user can call

#### `getAdminDashboardData()`
**Tables:** Multiple
**🔴 MISSING:** `canReviewContent()` auth check

---

### `src/lib/actions/admin/coverage.ts` — ⚠️ SECURITY

#### `fetchCoverageData()`
**Tables:** `taxonomy_tree`, `questions`, `wiki_articles`
**🔴 MISSING:** `canReviewContent()` auth check

---

### `src/lib/actions/admin/wiki-queries.ts` — ⚠️ SECURITY

#### `getArticlesWithCoverage()`
**Tables:** `wiki_articles`, `wiki_article_taxonomy`
**🔴 MISSING:** `canReviewContent()` auth check

---

### `src/lib/actions/social-proof.ts` — ⚠️ SECURITY

#### `getQuestionSocialProof()`
**🔴 MISSING:** `getUser()` auth check

#### `getTopicDailyStudiers()` / `getTopicDailyStudiersBatch()`
**🔴 MISSING:** `getUser()` auth check

---

## SRS & IRT Functions

### `src/lib/srs/quality.ts`

#### `deriveQualityRating({ isCorrect, timeSpent, confidence, luckyGuess }): number`
**Purpose:** Converts raw interaction data into SM-2 quality rating (0-5)
**Status:** ✅ Implemented and correct
**Called by:** `src/lib/actions/quiz.ts:388` (legacy) — **NOT called by testing.ts (bug)**
**Input type:**
```typescript
{
  isCorrect: boolean
  timeSpent: number       // milliseconds
  confidence: string      // 'low' | 'medium' | 'high'
  luckyGuess: boolean
}
```
**Returns:** `number` (0-5 quality rating)

---

### `src/lib/srs/update.ts`

#### `updateSrsSchedule(userId: string, questionId: string, quality: number): Promise<void>`
**Purpose:** Updates the SM-2 schedule for a specific question
**Tables touched:** `srs_schedules` (UPSERT)
**Status:** ✅ Implemented and correct
**Called by:** `src/lib/actions/quiz.ts:389` (legacy) — **NOT called by testing.ts (bug)**

---

### `src/lib/srs/irt.ts`

#### `selectNextQuestion(availableQuestions: Question[], userTheta: number): Question`
**Purpose:** Selects the next question targeting P(correct) ≈ 0.75
**Status:** ✅ Implemented with passing tests — **NEVER called in production**
**Algorithm:** IRT 2-Parameter Logistic model

#### `probabilityCorrect(theta: number, difficulty: number, discrimination: number): number`
**Purpose:** Computes P(correct) given ability and question parameters
**Status:** ✅ Implemented with passing tests — **NEVER called in production**

#### `updateTheta(currentTheta: number, questionDifficulty: number, isCorrect: boolean): number`
**Purpose:** Updates student ability estimate after an answer
**Status:** ✅ Implemented with passing tests — **NEVER called in production**
**Tables touched (should touch):** `user_global_stats.theta`

---

## Query Functions (Read-Only)

### `src/lib/queries/dashboard.ts`

#### `fetchHeatmapData(userId: string): Promise<QueryResult<HeatmapData>>`
**Tables:** `quiz_sessions` (SELECT: completed_at, question_count)
**Filters:** `user_id`, `status = 'completed'`, `completed_at >= 16 weeks ago`
**Component:** `StudyHeatmap`

#### `fetchMasteryData(userId: string): Promise<QueryResult<MasteryData>>`
**Tables:** `user_node_mastery` (SELECT), `taxonomy_tree` (JOIN)
**Component:** Heatmap, Subject Mastery Bars

#### `fetchReadinessScore(userId: string): Promise<QueryResult<ReadinessData>>`
**Tables:** `user_global_stats` (SELECT: global_readiness_score), `readiness_score_snapshots` (SELECT: trajectory)
**Component:** Readiness Score Card
**Note:** After Feature 5 fix, this function must also read `sub_scores` from the latest snapshot

#### `fetchAllDashboardData(userId: string): Promise<DashboardData>`
**Purpose:** Parallel fetch of all dashboard data using `Promise.all`
**Component:** Dashboard page.tsx

---

### `src/lib/queries/analytics.ts`

#### Analytics visualization queries
**Tables:** `user_interactions`, `quiz_sessions`, `user_node_mastery`, `readiness_score_snapshots`
**Components:** 8 analytics visualization components
**Note:** No export functionality exists yet (Phase 2)

---

### `src/lib/queries/taxonomy.ts`

#### `fetchTaxonomyTree(disciplineId?: string): Promise<QueryResult<TaxonomyNode[]>>`
**Tables:** `taxonomy_tree` (SELECT with hierarchical structure)
**Used by:** Heatmap, subject picker, Camp Trail, admin coverage

---

### `src/lib/queries/wiki.ts`

#### Wiki article queries
**Tables:** `wiki_articles`, `wiki_article_taxonomy`
**Note:** Admin has search. Students do not — Wiki Search (Phase 2) will add `searchWikiArticles()` using tsvector.

---

## Planned Server Actions (Not Yet Created)

These are specified in the Product Roadmap and Five Critical Features but have zero implementation:

| File Path | Function | Phase | Feature |
|---|---|---|---|
| `src/lib/actions/contact.ts` | `submitContactForm()` | 1 | Contact page |
| `src/lib/actions/profile.ts` | `updateProfile()`, `uploadAvatar()` | 1 | Profile editing |
| `src/lib/actions/wiki-search.ts` | `searchWikiArticles()` | 2 | Wiki full-text search |
| `src/lib/actions/question-browser.ts` | `browseQuestions()` | 2 | Question bank search |
| `src/lib/actions/schedule.ts` | `createStudyBlock()`, `updateStudyBlock()` | 2 | Study calendar |
| `src/lib/actions/simulation-compare.ts` | `getSimulationHistory()`, `compareSimulations()` | 2 | Exam comparison |
| `src/lib/actions/analytics-export.ts` | `exportAnalyticsCSV()`, `generateAnalyticsReport()` | 2 | Analytics export |
| `src/lib/actions/streak.ts` | `recordDailyActivity()`, `getStreakData()` | 3 | Streak system |
| `src/lib/actions/heatmap-delta.ts` | `snapshotHeatmap()`, `computeDeltas()` | 3 | Heatmap deltas |
| `src/lib/actions/reengagement.ts` | `checkDormancy()`, `sendReengagementEmail()` | 3 | Re-engagement |
| `src/lib/actions/sharing.ts` | `generateShareableCard()` | 4 | Score sharing |
| `src/lib/actions/referral.ts` | `generateReferralCode()`, `trackReferral()` | 4 | Referral program |
| `src/lib/actions/campfire.ts` | `createThread()`, `postReply()`, `vote()` | 5 | Campfire community |
| `src/lib/actions/passer-story.ts` | `submitPasserStory()`, `publishStory()` | 5 | Passer stories |
| `src/lib/actions/nps.ts` | `submitNPSResponse()` | 7 | NPS survey |
| `src/lib/actions/outcome-tracking.ts` | `reportExamOutcome()`, `verifyOutcome()` | 7 | Outcome tracking |
| `src/lib/actions/consent.ts` | `recordConsent()` | 7 | Data consent |
| `src/lib/actions/guarantee.ts` | `checkGuaranteeEligibility()`, `processRefund()` | 8 | Guarantee Pro |

---

## Call Chain Map (Critical Paths)

### Quiz Session Lifecycle (Current — Broken)
```
User clicks "Start Session"
  → Session creation function in testing.ts
    → SELECT questions from `questions` (ordered by mastery_weight ASC — should use IRT)
    → INSERT into `quiz_sessions`
  → User answers question
    → saveTestingInteraction()
      → INSERT into `user_interactions`
      → [TRIGGER] EMA mastery update → `user_node_mastery`
      → ❌ MISSING: deriveQualityRating() → updateSrsSchedule() → `srs_schedules`
      → ❌ MISSING: updateTheta() → `user_global_stats.theta`
  → Session completed
    → UPDATE `quiz_sessions` (status → 'completed')
    → [TRIGGER] snapshot_readiness_on_session_complete
      → READ `user_global_stats.global_readiness_score`
      → INSERT into `readiness_score_snapshots` (sub_scores = '{}' — broken)
```

### Quiz Session Lifecycle (Fixed — Target State)
```
User clicks "Start Session"
  → Session creation function in testing.ts
    → FETCH user theta from `user_global_stats`
    → SELECT questions via selectNextQuestion() targeting P(correct)=0.75
    → INSERT into `quiz_sessions`
  → User answers question
    → saveTestingInteraction()
      → INSERT into `user_interactions`
      → [TRIGGER] EMA mastery update → `user_node_mastery`
      → ✅ deriveQualityRating() → updateSrsSchedule() → `srs_schedules`
      → ✅ updateTheta() → `user_global_stats.theta`
  → Session completed
    → UPDATE `quiz_sessions` (status → 'completed')
    → [TRIGGER] snapshot_readiness_on_session_complete
      → READ `user_global_stats.global_readiness_score`
      → COMPUTE sub-scores per subject from `user_node_mastery` + `taxonomy_tree`
      → INSERT into `readiness_score_snapshots` (sub_scores = computed JSONB)
```

### Dashboard Data Loading
```
User navigates to /dashboard
  → page.tsx (Server Component)
    → getUser() — auth check
    → fetchAllDashboardData(user.id)
      → Promise.all([
          fetchReadinessScore(userId),
          fetchHeatmapData(userId),
          fetchMasteryData(userId),
          // ... other dashboard queries
        ])
    → Render with Suspense boundaries
```

---

## Verification Checklist

Before starting implementation, verify these against the live codebase:

- [ ] `saveTestingInteraction()` location confirmed at testing.ts:492-544
- [ ] Session creation function location identified
- [ ] `deriveQualityRating()` and `updateSrsSchedule()` signatures match
- [ ] `selectNextQuestion()` and `updateTheta()` signatures match
- [ ] `quiz.ts:388-395` reference pattern confirmed
- [ ] `canReviewContent()` function location and signature confirmed
- [ ] `getUser()` helper location confirmed
- [ ] All admin action files confirmed at listed paths
- [ ] Query file locations confirmed
- [ ] `QueryResult<T>` type location confirmed

---

*Document version: 2026-03-26 · Pre-implementation baseline*
*Regenerate by running the grep commands in section 1 after any server action changes.*

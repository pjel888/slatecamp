<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# actions

## Purpose

Data mutation layer for SlateCamp. All CRUD operations on user data, quizzes, questions, wiki articles, taxonomy, notes, and analytics flow through **Server Actions** (`'use server'`) defined here. This is the single point of mutation for the application state.

## Key Files

| File | Description |
|------|-------------|
| **quiz-v2/start-session.ts** | V2 quiz session creation and route handoff |
| **quiz-v2/submit-answer.ts** | V2 answer submission, scoring, and post-submit hooks |
| **quiz-v2/end-session.ts** | V2 session completion and final result persistence |
| **assessment.ts** | Assessment completion checks, result retrieval, subject score breakdown |
| **analytics.ts** | Server-side event tracking, analytics data aggregation |
| **daily-mission.ts** | Daily mission generation, completion tracking, rewards |
| **dashboard.ts** | Dashboard data aggregation (readiness, catalysts, recent activity) |
| **dashboard-page.ts** | Page-level dashboard queries and data transformation |
| **dashboard-helpers.ts** | Helpers for dashboard data computation |
| **mastery.ts** | Subject mastery retrieval, taxonomy node mastery tracking |
| **mastery-actions.ts** | Mastery-related mutations |
| **debrief.ts** | Quiz debrief/summary data after session completion |
| **readiness-score-update.ts** | Readiness score calculation and persistence |
| **heatmap.ts** | Taxonomy heatmap/performance distribution data |
| **notes-actions.ts** | User note CRUD operations |
| **feature-flags.ts** | Feature flag checks and overrides |
| **final-stretch.ts** | Final review/cram session logic |
| **lab.ts** | 3D lab interaction and state |
| **ei-prompts.ts** | Educational instant (AI tutor) prompt management |
| **email-preferences.ts** | Email subscription/notification preferences |
| **profile.ts** | User profile reads and updates |
| **session-actions.ts** | Session lifecycle: create, pause, resume, complete |
| **session-discovery.ts** | Session discovery and filtering for review hub |
| **session-insights.ts** | Post-session insight computation |
| **sessions.ts** | Session listing and history queries |
| **social-proof.ts** | Social proof metrics (user counts, activity) |
| **srs-dashboard.ts** | SRS dashboard data: review queue, schedule stats |
| **srs-review.ts** | SRS review session handling |
| **stats-actions.ts** | User statistics mutations and aggregation |
| **streak.ts** | Study streak tracking and persistence |
| **taxonomy.ts** | Taxonomy tree queries for quiz and navigation |
| **teach-back.ts** | Teach-back prompt generation and validation |
| **sessions.ts** | Session history queries and dashboard/session-hub lookups |
| **trails.ts** | Learning trail mutations: enroll, pause, abandon, complete |
| **user-stats.ts** | User global stats computation and caching |
| **wiki.ts** | Wiki article queries for student-facing views |
| **wiki-actions.ts** | Wiki interaction tracking (reads, bookmarks) |
| **wiki-bookmarks.ts** | Wiki bookmark CRUD |
| **wiki-reads.ts** | Wiki read tracking and history |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| **admin/** | Admin-only mutations: 13 files for questions, wiki, taxonomy, assets, bulk ops, roles, pipeline, coverage, content, dashboard. See `admin/AGENTS.md`. |
| **analytics/** | Analytics data aggregation and reporting: 5 files for performance tracking, session analytics, user behavior metrics. |
| **ai/** | AI tutor server actions: prompt dispatch, citation-verified responses. |
| **ceo/** | CEO portal mutations: 4 files for financial entries, team management, investor export. See `ceo/AGENTS.md`. |
| **daily-dose/** | Daily practice dose: 2 files for daily question selection and completion tracking. |
| **dev/** | Development/test utilities: test data generation, database viewer tools. |
| **mastery/** | Mastery calculations: 5 files for IRT theta updates, subject mastery aggregation, taxonomy node scoring. |
| **progress-report/** | Progress reporting: 2 files for periodic progress summary generation and delivery. |
| **quiz-v2/** | V2 quiz engine actions: 18 files for config-driven session creation, question fetching, answer processing, results computation, mode-specific behaviors. |
| **wiki/** | Wiki content actions: 2 files for article queries, bookmark management. |

## For AI Agents

### Working In This Directory

1. **Always use `'use server'`** at the top of action files for Server Actions.
2. **Read from Supabase** using `createClient()` from `@/lib/supabase/server` for authenticated queries.
3. **Admin mutations** use `createAdminClient()` from `@/lib/supabase/admin` (service role key).
4. **Validation** occurs before mutation — use Zod schemas from `@/lib/validations`.
5. **Revalidate cache** after mutations using `revalidatePath()` from `next/cache`.
6. **Silent failures on SRS** — SRS updates must not throw or block the quiz; catch and log only.
7. **Track analytics** — wrap user actions with `trackServerEvent()` from `@/lib/analytics-server`.

### Common Patterns

**User authentication context:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Perform mutation
  const { error } = await supabase
    .from('table_name')
    .insert([{ user_id: user.id, ... }])

  // Revalidate
  revalidatePath('/dashboard')
  return { error }
}
```

**Admin-only operations:**
```typescript
// In admin/ subdirectory
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteQuestion(questionId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', questionId)

  if (!error) {
    revalidatePath('/admin/questions')
  }

  return { error }
}
```

**SRS updates (silent on failure):**
```typescript
import { updateSrsSchedule } from '@/lib/srs/update'

// Inside answer submission
try {
  await updateSrsSchedule(userId, topicId, qualityRating)
} catch (err) {
  // Log but do not throw — SRS must not block quiz
  console.error('SRS update failed:', err)
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser, authenticated queries
- `@/lib/supabase/admin` — createAdminClient, service-role mutations
- `@/lib/analytics-server` — trackServerEvent
- `@/lib/srs/update` — updateSrsSchedule, deriveQualityRating
- `@/lib/signals/compute` — computeUserSignals
- `@/lib/paywall/daily-cap` — checkDailyCap, incrementDailyCount
- `@/lib/endurance/compute` — computeAccuracyByBlock, updateEnduranceSignals
- `@/lib/validations` — Zod schemas for input validation
- `@/types/app` — TypeScript interfaces (QuizSession, Question, TestMode, etc.)

### External

- `@supabase/supabase-js` — Supabase client
- `next/cache` — revalidatePath, revalidateTag
- `zod` — input validation

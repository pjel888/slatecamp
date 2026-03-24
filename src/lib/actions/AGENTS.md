<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# actions

## Purpose

Data mutation layer for SlateCamp. All CRUD operations on user data, quizzes, questions, wiki articles, taxonomy, notes, and analytics flow through **Server Actions** (`'use server'`) defined here. This is the single point of mutation for the application state.

## Key Files

| File | Description |
|------|-------------|
| **assessment.ts** | Assessment completion checks, result retrieval, subject score breakdown |
| **analytics.ts** | Server-side event tracking, analytics data aggregation |
| **quiz.ts** | Quiz session creation, retrieval, answer submission, SRS updates, readiness recomputation |
| **daily-mission.ts** | Daily mission generation, completion tracking, rewards |
| **dashboard.ts** | Dashboard data aggregation (readiness, catalysts, recent activity) |
| **dashboard-page.ts** | Page-level dashboard queries and data transformation |
| **dashboard-helpers.ts** | Helpers for dashboard data computation |
| **mastery.ts** | Subject mastery retrieval, taxonomy node mastery tracking |
| **mastery-actions.ts** | Mastery-related mutations |
| **debrief.ts** | Quiz debrief/summary data after session completion |
| **readiness-score-update.ts** | Readiness score calculation and persistence |
| **heatmap.ts** | Taxonomy heatmap/performance distribution data |
| **notes.ts** (if exists) | User note CRUD operations |
| **feature-flags.ts** | Feature flag checks and overrides |
| **final-stretch.ts** | Final review/cram session logic |
| **lab.ts** | 3D lab interaction and state |
| **ei-prompts.ts** | Educational instant (AI tutor) prompt management |
| **email-preferences.ts** | Email subscription/notification preferences |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| **admin/** | Admin-only mutations: question creation/edit/delete, taxonomy management, wiki article management, asset uploads, dashboard queries |
| **dev/** | Development/test utilities: test data generation, database viewer tools |

### admin/ (7 files)

| File | Description |
|------|-------------|
| **questions.ts** | Create, update, delete questions; validate question data |
| **question-queries.ts** | Admin queries for question library, filtering, search |
| **wiki.ts** | Create, update, delete wiki articles; manage article metadata |
| **wiki-queries.ts** | Admin queries for wiki library, subject filtering, search |
| **taxonomy.ts** | Create/edit taxonomy nodes, manage parent-child relationships |
| **assets.ts** | Upload question/wiki image assets, manage file storage |
| **dashboard.ts** | Admin dashboard queries: user counts, engagement metrics, question statistics |

### dev/ (2 files)

| File | Description |
|------|-------------|
| **test-data.ts** | Seed test questions, users, sessions for local development |
| **db-viewer.ts** | Read-only database viewer for debugging schema and sample rows |

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

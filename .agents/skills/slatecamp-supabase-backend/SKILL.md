---
name: slatecamp-supabase-backend
description: >
  You ARE SlateCamp's Senior Backend Engineer and Database Architect with deep expertise
  in Supabase, PostgreSQL, Row Level Security, and server-side Next.js patterns. Activate
  for ALL backend and database work: writing queries, designing schema, setting RLS
  policies, writing Server Actions, building API route handlers, debugging Supabase
  errors, optimizing slow queries, managing migrations, or any question about how data
  is stored, fetched, or mutated in SlateCamp. Trigger on: "Supabase", "query", "schema",
  "database", "table", "RLS", "Row Level Security", "migration", "foreign key", "index",
  "slow query", "server action", "API route", "auth", "user data", "fetch from DB",
  "insert", "update", "delete", "upsert", "realtime", "storage", "bucket", or any
  question about data persistence, access control, or backend logic. Wrong queries
  cost students their data — activate this skill before touching the database.
---

# SlateCamp — Senior Backend Engineering Guide

## Backend Philosophy

The database is the most critical part of SlateCamp. A wrong query corrupts a student's
progress data. A missing RLS policy leaks private data. A slow query breaks the exam
experience. Every database change is treated with surgical precision.

**Core rule**: Data is never deleted — it is archived. A student's progress history,
quiz attempts, and readiness scores are permanent records. Soft delete with `archived_at`
timestamps only.

Read `slatecamp-tech-stack` for overall architecture context first.

---

## Supabase Client Setup

### Two Clients — Never Confuse Them

```typescript
// src/lib/supabase/server.ts — for Server Components, Route Handlers, Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

```typescript
// src/lib/supabase/client.ts — for Client Components ONLY
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Rule**: Server client uses `cookies()`. Browser client uses no cookies — Supabase
handles session from localStorage automatically. Never use the browser client in
server-side code. Never use the server client in a `'use client'` component.

---

## Query Layer Pattern

All queries live in `src/lib/queries/[feature].ts`. Never call Supabase
directly in a component or page file.

### Query Function Template
```typescript
// src/lib/queries/dashboard.ts

import { createClient } from '@/lib/supabase/server'
import type { QueryResult, HeatmapData } from '@/types/dashboard'

// DASHBOARD: StudyHeatmap
export async function fetchHeatmapData(userId: string): Promise<QueryResult<HeatmapData>> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('completed_at, question_count')  // explicit columns only
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', get16WeeksAgo())
      .order('completed_at', { ascending: true })

    if (error) throw error

    return { data: transformToHeatmap(data), error: null }
  } catch (err) {
    console.error('[DASHBOARD: StudyHeatmap] fetchHeatmapData:', err)
    return { data: null, error: 'Failed to load study activity.' }
  }
}
```

### Rules for Every Query Function
1. Comment with `// DASHBOARD: ComponentName` or `// FEATURE: ComponentName`
2. Explicit column list — never `select('*')`
3. Always `.eq('user_id', userId)` — RLS enforces this too, but always explicit
4. Handle error and return `{ data: null, error: message }` — never throw
5. Transform data in the query function, not in the component
6. Return typed `QueryResult<T>` — never raw Supabase response

---

## Core Schema Reference

### Tables SlateCamp Uses

```sql
-- User profiles
profiles (
  id uuid PK references auth.users,
  full_name text,
  exam_date date,
  created_at timestamptz
)

-- Quiz sessions
quiz_sessions (
  id uuid PK,
  user_id uuid FK → profiles,
  mode text CHECK (mode IN ('camp', 'storm', 'blindspot', 'proof')),
  status text CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  question_count integer,
  current_question_index integer,
  score_percent numeric,
  subject_name text,
  topic_name text,
  topic_id text,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz
)

-- Topic-level mastery per user
user_topic_progress (
  id uuid PK,
  user_id uuid FK → profiles,
  topic_id text,
  topic_name text,
  subject_name text,
  questions_answered integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  coverage_percent numeric DEFAULT 0,
  last_studied_at timestamptz,
  wiki_article_slug text
)

-- Readiness scores (append-only history)
readiness_scores (
  id uuid PK,
  user_id uuid FK → profiles,
  score numeric,  -- 0-100
  created_at timestamptz
)

-- User notes
notes (
  id uuid PK,
  user_id uuid FK → profiles,
  title text,
  content text,
  content_preview text,  -- first 200 chars, stripped of markdown
  source text CHECK (source IN ('wiki', 'quiz', 'manual')),
  source_label text,
  pinned boolean DEFAULT false,
  archived_at timestamptz,  -- soft delete
  created_at timestamptz,
  updated_at timestamptz
)

-- Wiki articles
wiki_articles (
  id uuid PK,
  slug text UNIQUE,
  title text,
  content text,  -- MDX or Markdown
  content_preview text,  -- first 200 chars stripped
  category_label text,
  subject_name text,
  topic_id text,
  reading_minutes integer,
  status text CHECK (status IN ('draft', 'published')),
  published_at timestamptz
)
```

---

## Row Level Security

**Every table with user data has RLS enabled.** No exceptions.

### Standard RLS Policy Pattern
```sql
-- Enable RLS on the table
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users can view own sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own rows
CREATE POLICY "Users can insert own sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "Users can update own sessions"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- NO DELETE policy — use soft delete with archived_at instead
```

### Service Role for Admin
When we need admin access (e.g., computing readiness scores server-side), use the
service role key stored in a server-only environment variable:
```typescript
// ONLY used in trusted server contexts — never in client code
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // secret, never expose
)
```

---

## Migrations

Before writing or reviewing a migration, follow `.ai/00_system/supabase-change--protocol--v1.md`. Supabase Advisor/lint findings are part of the migration acceptance criteria.

### Naming Convention
```
YYYYMMDD_HHmm_description.sql
20260319_1430_add_topic_id_to_quiz_sessions.sql
```

### Migration Rules
1. Every schema change is a migration file — no direct SQL in production
2. Capture Supabase Advisor/lint baselines before SQL work when linked access is available
3. Every new public table has RLS plus explicit policies; never disable RLS to silence warnings
4. SECURITY DEFINER functions require callsite review, fixed search path/grants, and post-change advisor verification
5. Migrations are additive — never drop columns (add `_deprecated` suffix first)
6. New NOT NULL columns always have DEFAULT values
7. Index every foreign key column
8. Test migration on local/staging Supabase before applying to production
9. Validate with Supabase lint, dry-run, rollback smoke, and post-apply advisor checks per `.ai/00_system/supabase-change--protocol--v1.md`

### Index Strategy
```sql
-- Always index foreign keys
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);

-- Index columns used in WHERE clauses on large tables
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at DESC);

-- Composite index for common query patterns
CREATE INDEX idx_quiz_sessions_user_status
  ON quiz_sessions(user_id, status);
```

---

## Authentication Patterns

### Getting the Current User (Server)
```typescript
// In Server Components, Route Handlers, Server Actions
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Auth Guard Pattern for Pages
```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // All queries now safe to run with user.id
  const data = await fetchAllDashboardData(user.id)
  return <DashboardLayout data={data} />
}
```

---

## Error Handling Patterns

### Query Error Handling
```typescript
// Return, never throw
const { data, error } = await supabase.from('table').select('col')
if (error) {
  console.error('[FEATURE: Component] Query failed:', error.message)
  return { data: null, error: 'User-friendly error message' }
}
```

### Server Action Error Handling
```typescript
'use server'
export async function updateNote(id: string, data: Partial<Note>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notes')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)  // Always scope to user even with RLS

  if (error) {
    console.error('[NOTES] updateNote failed:', error)
    return { error: 'Failed to update note. Try again.' }
  }

  revalidatePath('/dashboard/notes')
  return { success: true }
}
```

---

## Type Generation

Run after every schema change:
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

The generated `Database` type powers all Supabase client calls. Import and use:
```typescript
import type { Database } from '@/types/database'
type QuizSession = Database['public']['Tables']['quiz_sessions']['Row']
type InsertQuizSession = Database['public']['Tables']['quiz_sessions']['Insert']
```

---

## Reference Files

- `references/schema-full.md` — Full annotated schema with all columns and relationships
- `references/rls-policies.md` — All RLS policies currently in production
- `references/query-patterns.md` — Copy-paste query patterns for common operations

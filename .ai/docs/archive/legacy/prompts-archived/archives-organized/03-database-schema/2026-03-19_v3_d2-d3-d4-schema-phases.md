# SlateCamp — Application Code Tasks: D2, D3, D4
**For:** Claude Code  
**Date:** 2026-03-19  
**Classification:** Sprint 1 blockers (D2, D4) + June 2026 hard deadline (D3)  
**Context:** Schema is complete. These are application-layer implementations only.

---

## ROLE

You are a Senior Full-Stack Engineer implementing three specific data pipeline tasks for SlateCamp — a Philippine architecture licensure exam prep platform. You write Next.js App Router code with Server Actions. You use Supabase as the database backend. You follow these non-negotiable constraints:

- No `useEffect` for data fetching — use RSC async components
- All DB writes go through Server Actions only — never client-side Supabase
- No `any` types in TypeScript
- Service role key is server-side only, never in client components
- All DB operations respect existing RLS policies

---

## PHASE 1: Codebase Map (Read-Only — Run First)

Before writing any code, map the existing structure:

```bash
# 1. App Router page structure
find src/app -name "page.tsx" -o -name "layout.tsx" | sort

# 2. Existing Server Actions
find src -name "actions.ts" -o -name "actions.tsx" | sort
find src -path "*server*" -name "*.ts" | sort | head -20

# 3. Existing Supabase client setup
find src -name "supabase.ts" -o -name "client.ts" | head -5
cat src/lib/supabase.ts 2>/dev/null || cat src/lib/supabase/client.ts 2>/dev/null || find src -name "*.ts" | xargs grep -l "createClient" | head -3

# 4. Auth helpers pattern
grep -rn "getUser\|auth.getUser\|createServerClient" src/ --include="*.ts" --include="*.tsx" | head -10

# 5. Existing onboarding/assessment/dashboard pages
find src/app -path "*onboarding*" -o -path "*assessment*" -o -path "*dashboard*" | sort

# 6. Existing analytics instrumentation
grep -rn "trackEvent\|analytics_events\|supabase.*from.*analytics" src/ --include="*.ts" --include="*.tsx" | head -10

# 7. Existing profile writes
grep -rn "profiles\|from.*profiles" src/ --include="*.ts" --include="*.tsx" | head -10

# 8. Existing exam_outcomes references
grep -rn "exam_outcomes" src/ --include="*.ts" --include="*.tsx" | head -10

# 9. TypeScript database types
find src -name "database.types.ts" -o -name "supabase.ts" | head -3
cat src/types/database.types.ts 2>/dev/null | head -100

# 10. Existing email infrastructure
grep -rn "resend\|sendEmail\|email" src/ --include="*.ts" | head -10
```

**Output the complete map. Stop. Confirm the map before proceeding.**

---

## TASK D2 — Analytics Event Instrumentation

### What needs to exist

A `trackServerEvent` utility and 7 `trackEvent` calls wired into the funnel at exact touchpoints. Currently `analytics_events` has 0 rows. Zero funnel visibility means you cannot measure conversion, cannot A/B test, cannot iterate on onboarding.

### The table structure (already exists in production)

```sql
public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                    -- nullable: anonymous events allowed
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT
)
-- RLS: INSERT allows (user_id IS NULL) OR (auth.uid() = user_id)
-- RLS: SELECT allows auth.uid() = user_id
```

### Step 1 — Create the tracking utility

Create `src/lib/analytics/track.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

interface TrackEventPayload {
  event_name: string
  user_id?: string | null
  event_properties?: Record<string, unknown>
  page_path?: string
  session_id?: string
  referrer?: string
}

export async function trackServerEvent(payload: TrackEventPayload): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('analytics_events').insert({
      user_id: payload.user_id ?? null,
      event_name: payload.event_name,
      event_properties: payload.event_properties ?? {},
      page_path: payload.page_path ?? null,
      session_id: payload.session_id ?? null,
      referrer: payload.referrer ?? null,
    })
    // Silent fail — analytics must never break the user flow
    // Do NOT throw or re-throw errors from this function
  } catch {
    // Intentionally silent — analytics failure is not a user-facing error
  }
}
```

Also create a client-side wrapper for non-server contexts at `src/lib/analytics/track-client.ts`:

```typescript
interface TrackEventPayload {
  event_name: string
  event_properties?: Record<string, unknown>
  page_path?: string
}

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // ensures the request completes even if page navigates
    })
  } catch {
    // Silent fail
  }
}
```

Create the API route at `src/app/api/analytics/track/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('analytics_events').insert({
      user_id: user?.id ?? null,
      event_name: body.event_name,
      event_properties: body.event_properties ?? {},
      page_path: body.page_path ?? request.headers.get('referer') ?? null,
    })
  } catch {
    // Silent fail
  }
  return NextResponse.json({ ok: true })
}
```

### Step 2 — Wire the 7 funnel events

Find the exact file for each touchpoint and add the call. **Do not guess the file paths — use the codebase map from Phase 1.**

#### Event 1: `signup_completed`
**Where:** Auth callback handler or the Server Action that handles account creation  
**When:** Immediately after `supabase.auth.signUp()` succeeds  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'signup_completed',
  user_id: user.id,
  event_properties: {
    method: 'email', // or 'google' etc
    source: referrer ?? null,
  },
})
```

#### Event 2: `assessment_started`
**Where:** Server Action that creates the assessment quiz session  
**When:** After `quiz_sessions` INSERT succeeds for an assessment session  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'assessment_started',
  user_id: userId,
  event_properties: {
    session_id: newSession.session_id,
    question_count: questionIds.length,
  },
})
// Also write to user_global_stats.assessment_started_at
await supabase.from('user_global_stats')
  .upsert({ user_id: userId, assessment_started_at: new Date().toISOString() })
```

#### Event 3: `assessment_completed`
**Where:** Server Action that handles final question submission for assessment sessions  
**When:** After session status is updated to 'completed' AND `assessment_completed_at` is written  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'assessment_completed',
  user_id: userId,
  event_properties: {
    session_id: sessionId,
    score: computedScore,
    questions_answered: interactionCount,
    time_spent_ms: totalTimeMs,
  },
})
```

#### Event 4: `score_reveal_viewed`
**Where:** The Score Reveal page RSC (Server Component) — fire on render, not on click  
**When:** Page renders AND `score_reveal_shown_at` is being set for the first time  
**What to pass:**
```typescript
// In the RSC page.tsx, after marking score as revealed:
await trackServerEvent({
  event_name: 'score_reveal_viewed',
  user_id: userId,
  page_path: '/dashboard/score-reveal',
  event_properties: {
    score: assessmentScore,
    zone: score < 50 ? 'red' : score < 70 ? 'amber' : 'green',
    is_retaker: isRetaker,
  },
})
```

#### Event 5: `trail_enrolled`
**Where:** Server Action that handles trail enrollment  
**When:** After `user_trail_enrollments` INSERT succeeds  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'trail_enrolled',
  user_id: userId,
  event_properties: {
    trail_id: trailId,
    trail_slug: trailSlug,
    trail_type: trailType,
    readiness_score_at_enrollment: currentScore,
    days_to_exam: daysToExam ?? null,
    source: 'recommendation' | 'library', // how they got here
  },
})
```

#### Event 6: `upgrade_page_viewed`
**Where:** Paywall page RSC — fire on render  
**When:** Page renders  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'upgrade_page_viewed',
  user_id: userId,
  page_path: '/dashboard/upgrade',
  event_properties: {
    trigger_source: searchParams.get('from') ?? 'direct',
    // trigger_source: 'heatmap' | 'trail_library' | 'blindspot' | 'score_widget' | 'direct'
    current_score: userScore ?? null,
    sessions_completed: sessionsCount,
  },
})
```

#### Event 7: `pro_subscribed`
**Where:** Payment success webhook handler or the Server Action that activates Pro after payment  
**When:** After `user_subscriptions.tier` is updated to 'pro'  
**What to pass:**
```typescript
await trackServerEvent({
  event_name: 'pro_subscribed',
  user_id: userId,
  event_properties: {
    payment_provider: 'gcash' | 'lemonsqueezy' | 'payrex',
    plan: 'monthly' | 'annual',
    price_php: pricePHP,
    readiness_score_at_conversion: scoreAtConversion,
    source: convertedFromSource ?? null,
  },
})
// Also write readiness_score_at_conversion to user_subscriptions
await supabase.from('user_subscriptions')
  .update({
    tier: 'pro',
    converted_from_source: convertedFromSource,
    readiness_score_at_conversion: scoreAtConversion,
  })
  .eq('user_id', userId)
```

### Step 3 — Verify instrumentation

```bash
# After wiring all 7 events, verify they appear in code
grep -rn "trackServerEvent\|trackEvent" src/ --include="*.ts" --include="*.tsx" | \
  grep -E "signup_completed|assessment_started|assessment_completed|score_reveal_viewed|trail_enrolled|upgrade_page_viewed|pro_subscribed"
```

Each event name must appear exactly once. If any are missing, find the correct file and add the call.

---

## TASK D4 — Profile Writes on Onboarding

### Why this is a Sprint 1 blocker

`profiles` has 0 rows. Every feature that reads onboarding state — retaker framing, trail recommendations, sleep-aware scheduling, study window notifications — is blind. The dashboard cannot personalize without a profile row.

### The table structure (already exists in production)

```sql
public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),  -- = auth.users.id
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'reviewee'
    CHECK (user_type IN ('undergrad', 'reviewee', 'professional', 'instructor')),
  discipline_id UUID REFERENCES disciplines(discipline_id),
  target_exam_date DATE,
  school_or_institution TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  preferred_study_window TEXT DEFAULT 'any'
    CHECK (preferred_study_window IN ('morning', 'evening', 'both', 'any')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
-- RLS: INSERT requires auth.uid() = id
-- RLS: UPDATE requires auth.uid() = id
-- RLS: SELECT requires auth.uid() = id
```

### Step 1 — Find the onboarding flow

```bash
# Find the onboarding completion handler
find src/app -path "*onboarding*" | sort
grep -rn "onboarding\|target_exam_date\|study_window" src/ --include="*.ts" --include="*.tsx" | head -20
```

### Step 2 — Create the onboarding Server Action

Find the existing onboarding Server Action file (from Phase 1 map). If it doesn't exist, create it at `src/app/(auth)/onboarding/actions.ts`.

The onboarding collects two pieces of data (from UX Strategy):
1. `target_exam_date` — required for trail recommendation
2. `is_retaker` — changes onboarding tone throughout the product

The profile write happens at the END of onboarding, when the user submits the context screen. It is a single atomic operation that writes to both `profiles` and `user_global_stats`.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { trackServerEvent } from '@/lib/analytics/track'

interface CompleteOnboardingPayload {
  full_name: string
  target_exam_date: string        // ISO date string: "2026-06-15"
  is_retaker: boolean
  preferred_study_window: 'morning' | 'evening' | 'both' | 'any'
  school_or_institution?: string
  user_type: 'undergrad' | 'reviewee' | 'professional' | 'instructor'
  discipline_id: string           // UUID of the ALE discipline
}

export async function completeOnboarding(
  payload: CompleteOnboardingPayload
): Promise<{ error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 1. Write profile row (INSERT or UPDATE if already exists)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: payload.full_name,
      display_name: payload.full_name.split(' ')[0], // First name as display
      user_type: payload.user_type,
      discipline_id: payload.discipline_id,
      target_exam_date: payload.target_exam_date,
      school_or_institution: payload.school_or_institution ?? null,
      onboarding_completed_at: new Date().toISOString(),
      preferred_study_window: payload.preferred_study_window,
    }, {
      onConflict: 'id',
    })

  if (profileError) {
    console.error('Profile write failed:', profileError)
    return { error: 'Failed to save profile' }
  }

  // 2. Write onboarding state to user_global_stats
  const { error: statsError } = await supabase
    .from('user_global_stats')
    .upsert({
      user_id: user.id,
      is_retaker: payload.is_retaker,
      onboarding_retaker_framing_shown: false,
      onboarding_completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  if (statsError) {
    console.error('Stats write failed:', statsError)
    // Non-fatal — profile is the critical write. Log but continue.
  }

  // 3. Track onboarding completion
  await trackServerEvent({
    event_name: 'onboarding_completed',
    user_id: user.id,
    event_properties: {
      user_type: payload.user_type,
      is_retaker: payload.is_retaker,
      has_exam_date: !!payload.target_exam_date,
      preferred_study_window: payload.preferred_study_window,
    },
  })

  // 4. Redirect to assessment (next step in funnel)
  redirect('/dashboard/assessment')
}
```

### Step 3 — Create profile row on account creation (safety net)

Some users may skip or abandon the onboarding flow before completing it. Ensure a minimal profile row is created at sign-up as a safety net. Find the auth callback handler:

```bash
find src/app -path "*callback*" -o -path "*auth*" | grep -v node_modules | sort
cat src/app/auth/callback/route.ts 2>/dev/null
```

In the auth callback (after session is established), add:

```typescript
// After confirming the session is valid, create minimal profile if it doesn't exist
const supabase = createServerClient(...)

const { data: { user } } = await supabase.auth.getUser()
if (user) {
  // Upsert with DO NOTHING equivalent — only sets defaults if row doesn't exist
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
      ignoreDuplicates: true, // Don't overwrite existing profile data
    }
  )
}
```

### Step 4 — Verify profile is being written

```bash
# Check that completeOnboarding or equivalent is called from the onboarding form
grep -rn "completeOnboarding\|profiles.*upsert\|from.*profiles.*insert" src/ --include="*.ts" --include="*.tsx"
```

---

## TASK D3 — Exam Outcomes Survey Pipeline

### Timeline

Hard deadline: **before June 2026 ALE exam results are published** (typically 2–3 weeks post-exam, so build by May 2026).

### What needs to exist

1. A post-exam email trigger (or in-app prompt) that fires when the exam batch results period begins
2. A minimal survey UI (3 questions)
3. A Server Action that writes to `exam_outcomes`
4. An email template (Resend or equivalent)

### The table structure (already exists in production)

```sql
public.exam_outcomes (
  outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                           -- nullable: anonymous reporting allowed
  discipline_id UUID,
  exam_batch TEXT NOT NULL,               -- e.g., "June 2026"
  result TEXT NOT NULL                    -- 'passed', 'failed', 'did_not_take'
    CHECK (result IN ('passed', 'failed', 'did_not_take')),
  self_reported_score NUMERIC,
  peak_readiness_score DOUBLE PRECISION,  -- pulled from user_global_stats at survey time
  readiness_score_at_7d_before DOUBLE PRECISION,
  avg_session_accuracy DOUBLE PRECISION,
  total_sessions_completed INTEGER,
  total_questions_answered INTEGER,
  days_active INTEGER,
  signup_source TEXT,
  customer_archetype TEXT,
  reported_at TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, exam_batch)
)
-- RLS: INSERT requires auth.uid() = user_id
-- RLS: SELECT requires auth.uid() = user_id
```

### Step 1 — Create the survey Server Action

Create `src/app/(dashboard)/exam-outcome/actions.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics/track'

interface SubmitExamOutcomePayload {
  exam_batch: string              // "June 2026"
  result: 'passed' | 'failed' | 'did_not_take'
  self_reported_score?: number    // Optional: their actual PRC score
}

export async function submitExamOutcome(
  payload: SubmitExamOutcomePayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Pull user stats to snapshot at time of survey
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, signup_source, customer_archetype, exam_attempt_number')
    .eq('user_id', user.id)
    .single()

  // Pull 7-day-before score from readiness_score_snapshots
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: snapshot7d } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', user.id)
    .lte('computed_at', sevenDaysAgo.toISOString())
    .order('computed_at', { ascending: false })
    .limit(1)
    .single()

  // Pull aggregate session stats
  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const { count: interactionCount } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get discipline_id for ALE
  const { data: discipline } = await supabase
    .from('disciplines')
    .select('discipline_id')
    .eq('acronym', 'ALE')
    .single()

  const { error } = await supabase
    .from('exam_outcomes')
    .upsert({
      user_id: user.id,
      discipline_id: discipline?.discipline_id ?? null,
      exam_batch: payload.exam_batch,
      result: payload.result,
      self_reported_score: payload.self_reported_score ?? null,
      peak_readiness_score: stats?.global_readiness_score ?? null,
      readiness_score_at_7d_before: snapshot7d?.score ?? null,
      total_sessions_completed: sessionCount ?? 0,
      total_questions_answered: interactionCount ?? 0,
      signup_source: stats?.signup_source ?? null,
      customer_archetype: stats?.customer_archetype ?? null,
    }, {
      onConflict: 'user_id, exam_batch',
    })

  if (error) {
    console.error('Exam outcome write failed:', error)
    return { success: false, error: 'Failed to save outcome' }
  }

  await trackServerEvent({
    event_name: 'exam_outcome_submitted',
    user_id: user.id,
    event_properties: {
      exam_batch: payload.exam_batch,
      result: payload.result,
      had_peak_score: !!stats?.global_readiness_score,
    },
  })

  return { success: true }
}
```

### Step 2 — Create the survey page

Create `src/app/(dashboard)/exam-outcome/page.tsx`:

The survey has exactly 3 questions in this order:
1. "Did you take the June 2026 ALE?" → passed / failed / did not take
2. (If passed or failed) "What was your reported score?" → optional number input
3. "Thank you. Your result helps us improve SlateCamp for future candidates."

Voice rules (from brand guidelines):
- No "Congratulations!" if they passed — factual acknowledgment only
- No sympathy language if they failed — just "Thank you for sharing."
- Never reference "failure" by name

### Step 3 — Create the email trigger

Find the existing email infrastructure (from Phase 1 map). If using Resend:

Create `src/lib/email/send-outcome-survey.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOutcomeSurveyParams {
  to: string
  userName: string
  examBatch: string
  surveyUrl: string
}

export async function sendOutcomeSurveyEmail(
  params: SendOutcomeSurveyParams
): Promise<void> {
  await resend.emails.send({
    from: 'SlateCamp <results@slatecamp.com>',
    to: params.to,
    subject: `How did the ${params.examBatch} ALE go?`,
    text: [
      `Hi ${params.userName},`,
      '',
      `The ${params.examBatch} ALE results are in. We'd like to know how it went for you — it takes 30 seconds.`,
      '',
      `Your response helps us improve SlateCamp for the next batch of candidates.`,
      '',
      `Submit your result: ${params.surveyUrl}`,
      '',
      'SlateCamp',
    ].join('\n'),
  })
}
```

Create a one-time Edge Function or scheduled job to send the email to all users who:
- Have `user_subscriptions` (active or expired)
- Do NOT have a row in `exam_outcomes` for this `exam_batch`
- Have `email_notifications_enabled = true`

Trigger date: approximately 3 weeks after the exam date (when PRC typically publishes results).

---

## PHASE 6: Final Verification

Run these checks after all three tasks are complete:

```bash
# D2: Verify all 7 funnel events are wired
grep -rn "event_name:" src/ --include="*.ts" --include="*.tsx" | \
  grep -E "signup_completed|assessment_started|assessment_completed|score_reveal_viewed|trail_enrolled|upgrade_page_viewed|pro_subscribed"
# Expected: 7 results, one per event name

# D4: Verify profile writes exist
grep -rn "from.*profiles.*upsert\|from.*profiles.*insert\|completeOnboarding" src/ --include="*.ts" --include="*.tsx"
# Expected: at least 2 results (onboarding completion + auth callback safety net)

# D3: Verify exam outcome action exists
grep -rn "exam_outcomes\|submitExamOutcome" src/ --include="*.ts" --include="*.tsx"
# Expected: action file + survey page + email trigger

# General: verify no analytics errors break user flow
grep -rn "trackServerEvent\|trackEvent" src/ --include="*.ts" --include="*.tsx" | grep -v "try\|catch"
# If any trackServerEvent calls are outside try/catch, wrap them — analytics must never throw
```

---

## WHAT NOT TO DO

- Do not create new database tables or columns — all three schemas already exist
- Do not write analytics events from client components — use the `/api/analytics/track` route or Server Actions only
- Do not block the user flow on analytics failures — all tracking calls must be fire-and-forget
- Do not ask the user additional survey questions beyond the 3 specified — every extra field drops completion rate
- Do not reference "failure" or "previous attempt" in any copy for retakers
- Do not send the outcome survey email before PRC publishes results — timing matters
- Do not `await` the analytics track call in places where it would slow the user-facing response — fire it after the primary operation completes

---

*SlateCamp Application Implementation Guide — D2, D3, D4*  
*Internal · Sprint 1 Blockers + June 2026 Pipeline*

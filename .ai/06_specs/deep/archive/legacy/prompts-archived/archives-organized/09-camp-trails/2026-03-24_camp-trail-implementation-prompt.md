# Camp Trail — Master Implementation Prompt

**For: AI Code Agent (Claude)**
**Project:** SlateCamp · Camp Trail Feature
**Version:** 1.0 · March 2026
**Estimated Scope:** ~4 phases, ~13 new components, 6 DB tables, 6 queries, 4 server actions, 3 pages

---

## 0 — MANDATORY PRE-FLIGHT: READ BEFORE WRITING ANY CODE

Before you write a single line of code, you MUST complete these steps in this exact order. Do not skip any step. Do not start coding until all pre-flight checks pass.

### 0.1 — Codebase Reconnaissance

```
STEP 1: Inspect the existing route structure
  → Run: find src/app/dashboard -type f -name "*.tsx" | head -60
  → Run: ls -la src/app/dashboard/camptrails/ (or /trails/)
  → GOAL: Understand what already exists at the Camp Trail route

STEP 2: Inspect existing UI components
  → Run: ls -la src/components/ui/
  → GOAL: Catalog every Shadcn component available for reuse
  → MUST REUSE: Button, Badge, Card, Progress, Skeleton, Tabs, Dialog, Tooltip, ScrollArea

STEP 3: Inspect existing shared/feature components
  → Run: find src/components -type f -name "*.tsx" | grep -v "ui/" | head -40
  → Run: ls -la src/components/dashboard/
  → GOAL: Find existing dashboard patterns, layout wrappers, data-fetching patterns

STEP 4: Inspect the database types
  → Run: cat src/types/database.ts | head -100
  → GOAL: Understand the Database type shape for Supabase typed queries

STEP 5: Inspect existing query patterns
  → Run: find src/lib -type f -name "*.ts" | head -30
  → Run: cat src/lib/queries/ (find the pattern used)
  → GOAL: Match existing query/server-action patterns exactly

STEP 6: Inspect the Tailwind config
  → Run: cat src/app/globals.css
  → GOAL: Know what custom colors, fonts, and tokens exist

STEP 7: Inspect the design system / developer dashboard
  → Look for any design-system documentation page or storybook
  → Run: find src -name "*design*" -o -name "*storybook*" -o -name "*developer*" | head -20
  → GOAL: Know where to register new components if a component registry exists

STEP 8: Check existing Supabase schema
  → Run: find supabase -name "*.sql" | head -20
  → Run: ls -la supabase/migrations/
  → GOAL: Understand migration naming conventions and existing schema
```

**CRITICAL:** After completing all 8 steps, summarize what you found in a brief status report before proceeding. If the `/dashboard/camptrails` route already exists with code, describe what's there and plan around it. If it doesn't exist, note that you're building from scratch.

### 0.2 — Design System Token Verification

Before using any color, font, or spacing value, verify it exists in `src/app/globals.css`. The Camp Trail uses these specific tokens:

| Token | Hex | Tailwind Class | Purpose |
|---|---|---|---|
| Cobalt Blue (primary) | `#1B3FC4` | Check config for `primary` or custom | Primary actions, recommended card fill, score trajectory |
| Signal Red | `#E63329` | Check config | Passing threshold line, blindspot flag |
| Signal Green | `#1B7A3C` | Check config | Success states, completed steps, above-threshold score |
| Camp Orange | `#E8853A` | Check config | Computation-heavy indicator, score below threshold |
| Trail Purple | `#534AB7` | Check config | MEPF subject color in phase map |
| Signal Gold | `#F5A623` | Check config | Review step accent |
| Cream | `#F2F0EB` | Check config | Page background |
| Warm White | `#F8F7F5` | Check config | Card background |

**Fonts to verify in config:**
- `Syne` → display/heading font (font-display class)
- `DM Mono` → monospace labels, metadata (font-mono class)
- `Inter` → body text (font-sans class)

**If any token is missing from `src/app/globals.css`, ADD it before using it. Then document what you added.**

### 0.3 — Existing Component Audit

You MUST reuse these existing components. Never rebuild them:

| Component | Expected Location | Use In Camp Trail |
|---|---|---|
| `Button` | `src/components/ui/button.tsx` | All CTAs. Variants: default, outline, ghost |
| `Badge` | `src/components/ui/badge.tsx` | Trail type labels, step type labels, Pro gate |
| `Card` | `src/components/ui/card.tsx` | TrailCard base, section containers |
| `Progress` | `src/components/ui/progress.tsx` | Day progress, mastery bars |
| `Skeleton` | `src/components/ui/skeleton.tsx` | All loading states |
| `Tabs` | `src/components/ui/tabs.tsx` | Trail library category tabs |
| `Dialog` | `src/components/ui/dialog.tsx` | Catch-up view modal |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Node identifiers, day tooltips |
| `ScrollArea` | `src/components/ui/scroll-area.tsx` | TrailRibbon horizontal scroll |

**Verify each exists. If any is missing, install it via `npx shadcn@latest add [component]` before proceeding.**

---

## 1 — DATABASE LAYER (Do This First — Everything Depends On It)

### 1.1 — Create Migration File

Create a single migration file following the existing naming convention found in `supabase/migrations/`. Name it with the next sequential timestamp.

### 1.2 — SQL Schema (Exact DDL)

```sql
-- ============================================================
-- CAMP TRAIL SCHEMA
-- ============================================================

-- ENUM TYPES
CREATE TYPE trail_type AS ENUM (
  'time_gated', 'subject_mastery', 'code_deep_dive', 'remediation', 'exam_simulation'
);

CREATE TYPE trail_intensity AS ENUM (
  'intensive', 'accelerated', 'standard', 'comprehensive', 'undergraduate'
);

CREATE TYPE trail_step_type AS ENUM (
  'quiz', 'wiki', 'lab', 'review'
);

CREATE TYPE trail_enrollment_status AS ENUM (
  'active', 'paused', 'completed', 'abandoned'
);

-- TABLE 1: camp_trails — Platform-curated trail templates
CREATE TABLE camp_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  trail_type trail_type NOT NULL,
  trail_intensity trail_intensity,
  total_days INTEGER NOT NULL,
  daily_time_estimate_minutes INTEGER NOT NULL DEFAULT 90,
  subjects_covered TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  feature_flag_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE 2: trail_days — One row per day in a trail
CREATE TABLE trail_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES camp_trails(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subject_focus TEXT,
  subject_color TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 60,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  is_phase_transition BOOLEAN NOT NULL DEFAULT false,
  phase_name TEXT,
  week_number INTEGER GENERATED ALWAYS AS (CEIL(day_number::NUMERIC / 7)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trail_id, day_number)
);

-- TABLE 3: trail_steps — Activities within each day
CREATE TABLE trail_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES trail_days(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  step_type trail_step_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_node_ids UUID[] DEFAULT '{}',
  question_count INTEGER,
  wiki_article_id UUID,
  model_id UUID,
  lab_phase TEXT,
  preferred_time TEXT CHECK (preferred_time IN ('morning', 'evening', 'any')) DEFAULT 'any',
  is_optional BOOLEAN NOT NULL DEFAULT false,
  is_computation_heavy BOOLEAN NOT NULL DEFAULT false,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_id, step_order)
);

-- TABLE 4: user_trail_enrollments — One row per student per trail
CREATE TABLE user_trail_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES camp_trails(id) ON DELETE CASCADE,
  status trail_enrollment_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_completion_date DATE,
  current_day_number INTEGER NOT NULL DEFAULT 1,
  days_completed INTEGER NOT NULL DEFAULT 0,
  days_completed_at_abandon INTEGER,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE 5: user_trail_progress — Step-level completion log (immutable)
CREATE TABLE user_trail_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES user_trail_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES trail_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id UUID,
  readiness_score_delta NUMERIC(5,2),
  UNIQUE (enrollment_id, step_id)
);

-- TABLE 6: trail_day_completions — Materialized day-level record
CREATE TABLE trail_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES user_trail_enrollments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  readiness_score_at_completion NUMERIC(5,2),
  all_steps_completed BOOLEAN NOT NULL DEFAULT false,
  mastery_before JSONB,
  mastery_after JSONB,
  UNIQUE (enrollment_id, day_number)
);

-- TABLE 7: session_trail_credits — Attribution bridge for simultaneous enrollment
CREATE TABLE session_trail_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES user_trail_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES trail_steps(id) ON DELETE CASCADE,
  credited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, enrollment_id, step_id)
);

-- INDEXES
CREATE INDEX idx_trail_days_trail_id ON trail_days(trail_id);
CREATE INDEX idx_trail_steps_day_id ON trail_steps(day_id);
CREATE INDEX idx_enrollments_user_id ON user_trail_enrollments(user_id);
CREATE INDEX idx_enrollments_status ON user_trail_enrollments(status);
CREATE INDEX idx_enrollments_user_trail ON user_trail_enrollments(user_id, trail_id);
CREATE INDEX idx_trail_progress_enrollment ON user_trail_progress(enrollment_id);
CREATE INDEX idx_day_completions_enrollment ON trail_day_completions(enrollment_id);

-- ROW LEVEL SECURITY
ALTER TABLE camp_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trail_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_trail_credits ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- camp_trails: Anyone can read published trails
CREATE POLICY "Anyone can read published trails"
  ON camp_trails FOR SELECT
  USING (is_published = true);

-- trail_days: Anyone can read days of published trails
CREATE POLICY "Anyone can read trail days"
  ON trail_days FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM camp_trails WHERE id = trail_days.trail_id AND is_published = true
  ));

-- trail_steps: Anyone can read steps of published trails
CREATE POLICY "Anyone can read trail steps"
  ON trail_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trail_days
    JOIN camp_trails ON camp_trails.id = trail_days.trail_id
    WHERE trail_days.id = trail_steps.day_id AND camp_trails.is_published = true
  ));

-- user_trail_enrollments: Users can only see/modify their own
CREATE POLICY "Users manage own enrollments"
  ON user_trail_enrollments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_trail_progress: Users can only see/insert their own
CREATE POLICY "Users manage own progress"
  ON user_trail_progress FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = user_trail_progress.enrollment_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = user_trail_progress.enrollment_id AND user_id = auth.uid()
  ));

-- trail_day_completions: Users can only see/insert their own
CREATE POLICY "Users manage own day completions"
  ON trail_day_completions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = trail_day_completions.enrollment_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = trail_day_completions.enrollment_id AND user_id = auth.uid()
  ));

-- session_trail_credits: Users can only see/insert their own
CREATE POLICY "Users manage own session credits"
  ON session_trail_credits FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = session_trail_credits.enrollment_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_trail_enrollments
    WHERE id = session_trail_credits.enrollment_id AND user_id = auth.uid()
  ));
```

### 1.3 — Apply Migration

```bash
# Use the Supabase CLI method found in the existing project
# Check how other migrations were applied:
ls supabase/migrations/
# Then apply:
supabase db push
# OR if using local dev:
supabase migration up
```

### 1.4 — Update Database Types

After migration, regenerate types:
```bash
supabase gen types typescript --local > src/types/database.ts
# OR if using remote:
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

**VERIFY:** Open `src/types/database.ts` and confirm the new tables appear in the `Database` type.

---

## 2 — TYPESCRIPT TYPES (Create Before Components)

### 2.1 — Create Type Definitions

**File:** `src/types/trails.ts`

```typescript
// ============================================================
// CAMP TRAIL — TYPE DEFINITIONS
// ============================================================

import type { Database } from './database'

// Database row types (auto-generated aliases)
export type CampTrail = Database['public']['Tables']['camp_trails']['Row']
export type TrailDay = Database['public']['Tables']['trail_days']['Row']
export type TrailStep = Database['public']['Tables']['trail_steps']['Row']
export type TrailEnrollment = Database['public']['Tables']['user_trail_enrollments']['Row']
export type TrailProgress = Database['public']['Tables']['user_trail_progress']['Row']
export type TrailDayCompletion = Database['public']['Tables']['trail_day_completions']['Row']

// Enums
export type TrailType = 'time_gated' | 'subject_mastery' | 'code_deep_dive' | 'remediation' | 'exam_simulation'
export type TrailIntensity = 'intensive' | 'accelerated' | 'standard' | 'comprehensive' | 'undergraduate'
export type TrailStepType = 'quiz' | 'wiki' | 'lab' | 'review'
export type TrailEnrollmentStatus = 'active' | 'paused' | 'completed' | 'abandoned'

// Composite types for UI
export interface TrailWithEnrollment extends CampTrail {
  enrollment: TrailEnrollment | null
  days_total: number
  days_completed: number
}

export interface TrailRecommendation {
  trail: CampTrail
  rationale: string
  week1_focus_subject: string
  is_retaker: boolean
}

export interface TrailStructure {
  trail: CampTrail
  days: (TrailDay & { steps: TrailStep[] })[]
  phases: TrailPhase[]
}

export interface TrailPhase {
  phase_number: number
  name: string
  week_start: number
  week_end: number
  subject_focus: string
}

export interface TodayData {
  enrollment: TrailEnrollment
  trail: CampTrail
  day: TrailDay & { steps: (TrailStep & { is_completed: boolean })[] }
  days_since_last_activity: number
}

export interface ScorePoint {
  day_number: number
  score: number
  completed_at: string
}

export interface NodeState {
  node_id: string
  mastery_level: 'grey' | 'red' | 'amber' | 'green'
  last_interaction_at: string | null
}

export interface DayCompletionData {
  day_number: number
  subject_focus: string
  mastery_before: Record<string, number>
  mastery_after: Record<string, number>
  nodes_updated: { node_id: string; from: string; to: string }[]
  next_day: { day_number: number; title: string; estimated_minutes: number; step_count: number } | null
}

// Step card step type config
export const STEP_TYPE_CONFIG = {
  wiki: {
    icon: '📖',
    label: 'WIKI READ',
    accent: '',
    cta: 'Start Reading →',
  },
  quiz: {
    icon: '⚡',
    label: 'QUIZ',
    accent: 'bg-[#EEF2FC]',
    cta: 'Start Quiz →',
  },
  lab: {
    icon: '🏛️',
    label: '3D LAB',
    accent: 'bg-[#EEEDFE]',
    cta: 'Open 3D Lab →',
  },
  review: {
    icon: '🔄',
    label: 'REVIEW',
    accent: 'bg-[#FFF8E6]',
    cta: 'Start Review →',
  },
} as const

// Subject color map for TrailPhaseMap
export const SUBJECT_COLORS: Record<string, string> = {
  'Building Laws': '#1B3FC4',
  'Fire & Life Safety': '#E63329',
  'Structural Design': '#E8853A',
  'Materials & Methods': '#1B7A3C',
  'MEPF Utilities': '#534AB7',
  'History & Theory': '#F5A623',
  'Planning': '#6B9B37',
  'Professional Practice': '#4A7B9D',
}
```

---

## 3 — QUERY & SERVER ACTION LAYER

### 3.1 — Queries

**File:** `src/lib/queries/trails.ts`

Follow the exact pattern found in other query files in the codebase (check `src/lib/queries/` for the pattern). The server Supabase client import should match the existing pattern.

**Queries to implement (6 total):**

```typescript
// QUERY 1: getTrailsWithEnrollment
// Get all published trails with the current user's enrollment status
// SELECT camp_trails.*, user_trail_enrollments.*
// FROM camp_trails
// LEFT JOIN user_trail_enrollments ON trail_id AND user_id
// WHERE is_published = true
// ORDER BY is_featured DESC, created_at

// QUERY 2: getTrailRecommendation
// Read: user's readiness_score + target_exam_date from profiles/user_global_stats
// Run recommendation matrix logic (see Section 3.3)
// Return: trail_id + rationale copy + week_1_focus_subject

// QUERY 3: getTrailStructure
// Get all days + steps for a specific trail
// SELECT trail_days.*, trail_steps.*
// FROM trail_days
// JOIN trail_steps ON trail_steps.day_id = trail_days.id
// WHERE trail_days.trail_id = $trailId
// ORDER BY trail_days.day_number, trail_steps.step_order

// QUERY 4: getTodayTrailDay
// Get the current day + steps + completion status for an enrollment
// Read: enrollment.current_day_number
// Join: trail_days, trail_steps, user_trail_progress
// Also compute: days_since_last_activity (for missed day detection)

// QUERY 5: getScoreTrajectory
// SELECT day_number, readiness_score_at_completion
// FROM trail_day_completions
// WHERE enrollment_id = $enrollmentId
// ORDER BY day_number

// QUERY 6: getTodayNodeStates
// SELECT node_id, mastery_level, last_interaction_at
// FROM user_node_mastery
// WHERE user_id = $userId AND node_id = ANY($nodeIds)
```

**IMPORTANT:** Before writing these queries, FIRST check:
1. What table stores `readiness_score` — is it `profiles`, `user_global_stats`, or somewhere else?
2. What table stores `target_exam_date` — is it in `profiles`?
3. What table stores `user_node_mastery` — does it exist? What are its columns?
4. What is the user ID access pattern — `auth.uid()` or passed as parameter?

Run: `grep -r "readiness_score\|target_exam_date\|user_node_mastery\|user_global_stats" src/lib/ src/types/`

### 3.2 — Server Actions

**File:** `src/lib/actions/trails.ts`

```typescript
'use server'

// ACTION 1: enrollInTrail(trailId: string)
// - Check user has an active subscription (or trail.is_free = true)
// - Check user doesn't already have an active enrollment for this trail
// - INSERT INTO user_trail_enrollments
// - Calculate target_completion_date = now() + trail.total_days
// - Return the enrollment

// ACTION 2: markStepComplete(stepId: string, enrollmentId: string, sessionId?: string)
// - INSERT INTO user_trail_progress (enrollment_id, step_id, session_id)
// - Query: are ALL required steps (is_optional = false) for this day now complete?
// - If yes → call completeTrailDay internally
// - Return: { step_completed: true, day_completed: boolean, completion_data?: DayCompletionData }

// ACTION 3: completeTrailDay(enrollmentId: string, dayNumber: number)
// - Read current readiness_score
// - INSERT INTO trail_day_completions (enrollment_id, day_number, readiness_score_at_completion)
// - UPDATE user_trail_enrollments SET current_day_number = dayNumber + 1, days_completed += 1
// - Check: if days_completed >= trail.total_days → mark trail as completed
// - Return DayCompletionData

// ACTION 4: pauseTrail(enrollmentId: string)
// - UPDATE user_trail_enrollments SET status = 'paused', paused_at = now()

// ACTION 5: abandonTrail(enrollmentId: string)
// - Read current days_completed
// - UPDATE user_trail_enrollments SET status = 'abandoned', abandoned_at = now(), days_completed_at_abandon = days_completed

// ACTION 6: resumeTrail(enrollmentId: string)
// - UPDATE user_trail_enrollments SET status = 'active', paused_at = null
```

### 3.3 — Recommendation Matrix Logic

Implement this as a pure function in `src/lib/utils/trail-recommendation.ts`:

```typescript
interface RecommendationInput {
  readinessScore: number
  daysToExam: number
  isRetaker: boolean
  weakestSubject: string
  previousHeatmapData?: Record<string, number>
}

// Matrix:
// daysToExam > 180                        → 6-Month Undergraduate
// daysToExam 84-180 & score < 65          → 12-Week Comprehensive
// daysToExam 84-180 & score >= 65         → 8-Week Standard
// daysToExam 57-84 & score < 50           → 12-Week Comprehensive
// daysToExam 57-84 & score 50-64          → 8-Week Standard
// daysToExam 57-84 & score >= 65          → 8-Week Standard
// daysToExam 29-56 & score < 65           → 8-Week Standard
// daysToExam 29-56 & score >= 65          → 4-Week Accelerated
// daysToExam 15-28                        → 4-Week Accelerated or 2-Week Intensive
// daysToExam <= 14                        → Exam Simulation Trail

// Rationale copy pattern:
// "Based on your score of {score}% and {daysToExam} days to your exam,
//  the {trailName} is the right fit.
//  Week 1 focuses on {weakestSubject} — your biggest gap."

// Retaker variant:
// "Your Readiness Score reached {prevScore}% before your last exam.
//  The gap was concentrated in {weakSubjects}.
//  This {trailName} focuses there first.
//  Your mastery data is still here. You don't start over."
```

---

## 4 — PAGE STRUCTURE (Routes & Layouts)

### 4.1 — Route Architecture

```
src/app/dashboard/camptrails/
├── page.tsx                              ← Trail Library (Screen 1)
├── loading.tsx                           ← Skeleton for trail library
├── [slug]/
│   ├── page.tsx                          ← Trail Detail / Enrollment (Screen 2)
│   ├── loading.tsx                       ← Skeleton for trail detail
│   └── day/
│       └── [dayNumber]/
│           ├── page.tsx                  ← Day View (Screen 3)
│           ├── loading.tsx               ← Skeleton for day view
│           └── complete/
│               └── page.tsx              ← Day Completion (Screen 4)
```

**CHECK FIRST:** The route might be `/dashboard/camptrails` or `/dashboard/trails`. Look at the existing sidebar navigation to find which path is already configured. Use whatever path already exists in the nav.

### 4.2 — Page Implementations

#### Page 1: Trail Library (`/dashboard/camptrails/page.tsx`) — SERVER COMPONENT

```
PURPOSE: Discovery and selection. Recommendation first, always.

DATA NEEDED:
  - getTrailRecommendation(userId)
  - getTrailsWithEnrollment(userId)
  - User subscription status (free vs pro)

LAYOUT:
  1. Recommended Trail Card (full-width, cobalt bg) — ALWAYS first
  2. "Other Trails" section label
  3. Tabs: Time-Gated | Subject Mastery | Code Deep-Dives
  4. Grid of TrailCards (2 columns desktop, 1 column mobile)

STATES:
  - Loading: Skeleton for recommended card + 3 skeleton TrailCards
  - No recommendation (no exam date set): Show prompt to set exam date
  - Already enrolled: Show active trail card at top instead of recommendation
  - Free user: Pro badge on locked trails, CTA changes to "Upgrade"
```

#### Page 2: Trail Detail (`/dashboard/camptrails/[slug]/page.tsx`) — SERVER COMPONENT

```
PURPOSE: Give enough info to commit. Honest preview.

DATA NEEDED:
  - getTrailStructure(trailId) — all days + steps
  - getTrailRecommendation(userId) — for the rationale copy
  - Enrollment status (already enrolled?)

LAYOUT:
  1. Back to Trails link
  2. Trail name + eyebrow label (DM Mono)
  3. Stats row: "56 days · ~1.5 hrs/day · 8 subjects"
  4. Sticky CTA: "Start This Trail →" (scrolls with page)
  5. Rationale copy (why this was recommended)
  6. TrailPhaseMap component (7×N grid)
  7. Week-by-week collapsible preview (use Collapsible or custom accordion)
  8. Bottom CTA repeat

STATES:
  - Already enrolled: CTA changes to "Continue Trail →" linking to current day
  - Free user + locked trail: CTA = "Upgrade to Access", disable enrollment
  - Loading: Skeleton phase map + skeleton week rows
```

#### Page 3: Day View (`/dashboard/camptrails/[slug]/day/[dayNumber]/page.tsx`) — SERVER COMPONENT

```
PURPOSE: The daily loop. Make the student start the first step.

DATA NEEDED:
  - getTodayTrailDay(enrollmentId)
  - getTodayNodeStates(userId, nodeIds) — for MiniHeatmapPreview
  - getScoreTrajectory(enrollmentId) — for TrailRibbon

LAYOUT:
  1. Back to Trail Overview link
  2. Day header: "DAY 14 OF 56" (DM Mono cobalt) + subject name (Syne) + week label
  3. Time estimate: "~45 min total · 3 activities"
  4. Divider
  5. TrailStepCard × 2-4 (the steps for this day)
  6. Divider
  7. "TODAY'S COVERAGE MAP" label + MiniHeatmapPreview
  8. Divider
  9. "TRAIL PROGRESS" label + TrailRibbon

STATES:
  - All steps pending: Default. First step has slightly more visual weight
  - Some complete: Completed steps show green check, remaining show CTA
  - All complete: Redirect to day completion page
  - Missed day (days_since_last_activity >= 3): Show MissedDayCard overlay FIRST
  - Loading: Skeleton step cards + skeleton mini heatmap
```

#### Page 4: Day Completion (`/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx`) — SERVER COMPONENT

```
PURPOSE: Factual mastery confirmation. No confetti. Just data.

DATA NEEDED:
  - DayCompletionData from the completeTrailDay action
  - Score trajectory for context

LAYOUT:
  1. "Day 14 complete." (Syne 700, 28px)
  2. "Structural Systems — covered." (Syne 400, 22px)
  3. Divider
  4. "YOUR MASTERY TODAY" label + DayCompletionMoment component
  5. Divider
  6. "NODES UPDATED" + colored dots showing transitions
  7. Divider
  8. "TOMORROW" preview: Day 15 title + activities + time
  9. CTA: "Start Day 15 →" + "Back to Dashboard" ghost button

STATES:
  - Score improved: Show before/after bar with delta
  - Score unchanged: "Today's content is in progress..."
  - Score dipped: "You covered new material today. Scores often dip before they rise..."
  - Last day of trail: Show trail completion instead of "Tomorrow"
```

---

## 5 — COMPONENT BUILD ORDER (Build in This Exact Sequence)

Build components in dependency order. Each component depends on the ones above it.

### Phase 1 Components (Trail Library + Enrollment)

#### 5.1 — `TrailCard` — `src/components/trails/TrailCard.tsx`

```
TYPE: Client Component ('use client' — has click handler)
REUSES: Card, Badge, Progress (from Shadcn)

PROPS:
  trail: TrailWithEnrollment
  isLocked: boolean (free user + not free trail)

STATES:
  - not_started: Default card, no progress
  - enrolled: Progress bar at bottom showing days_completed/total_days
  - completed: Green check, tinted green bg (#EAF5EE)
  - locked: Pro badge top-right, CTA = "Upgrade to Access"

VISUAL SPEC:
  - Card base with 12px border-radius
  - Badge for trail_type (DM Mono uppercase)
  - Title: Syne 700, 16px
  - Stats: Inter 13px, muted
  - Progress bar: thin, at card bottom (only when enrolled)
  - CTA: "View Trail" button (outline variant)

SIZE: ~60-80 lines
```

#### 5.2 — `RecommendedTrailCard` — `src/components/trails/RecommendedTrailCard.tsx`

```
TYPE: Client Component ('use client' — has CTA click)
REUSES: Button

PROPS:
  recommendation: TrailRecommendation
  onStartTrail: () => void

VISUAL SPEC:
  - bg-[#1B3FC4] (Cobalt Blue fill) — ONLY cobalt-filled card in the product
  - White text throughout
  - ★ icon: Syne Bold 18px — only star in the entire product
  - Rationale copy: italic Inter 14px, rgba(255,255,255,0.85)
  - Stats row: DM Mono 11px uppercase — "56 DAYS · ~1.5 HRS/DAY"
  - CTA: bg-white text-[#1B3FC4] button (inverse color)
  - Retaker variant: copy changes, same layout

SIZE: ~50-70 lines
```

#### 5.3 — `TrailPhaseMap` — `src/components/trails/TrailPhaseMap.tsx`

```
TYPE: Client Component ('use client' — has tap interactions)
REUSES: Tooltip

PROPS:
  days: TrailDay[]
  enrollment?: TrailEnrollment (for current day highlighting)
  completions?: TrailDayCompletion[] (for completed day fills)

VISUAL SPEC:
  - CSS Grid: 7 columns (Mon-Sun), N rows (one per week)
  - Each cell: 28×28px desktop, 22×22px mobile, rounded corners
  - Color from subject_focus → SUBJECT_COLORS map
  - Day dot states:
    ○ empty circle: rest day
    ● filled: prescribed study day
    ◑ half-filled (50% opacity fill): review/light day
    ★ star: phase transition day
  - Completed days: full opacity fill
  - Current day: cobalt ring/highlight
  - Upcoming: 30% opacity
  - Phase boundaries: subtle row dividers with phase name label
  - Tap day → Tooltip with day title, subject, estimated time

IMPLEMENTATION NOTES:
  - Use CSS Grid, NOT flexbox
  - Mobile: grid stays 7 columns always, cells shrink to 22px
  - Week labels on left side: "Wk 1", "Wk 2", etc.

SIZE: ~100-130 lines
```

### Phase 2 Components (Day View Core Loop)

#### 5.4 — `SleepAwareLabel` — `src/components/trails/SleepAwareLabel.tsx`

```
TYPE: Server Component (no interactivity)

PROPS:
  preferredTime: 'morning' | 'evening' | 'any'
  userStudyWindow: 'morning' | 'evening' | 'both'

LOGIC:
  - Show only when step.preferredTime conflicts with userStudyWindow
  - "Best studied in the morning" or "Best studied in the evening"
  - Never a block, always a nudge

VISUAL: Inter 12px italic, muted text color

SIZE: ~20 lines
```

#### 5.5 — `BlindspotPriorityFlag` — `src/components/trails/BlindspotPriorityFlag.tsx`

```
TYPE: Server Component (no interactivity)

PROPS:
  nodeIds: string[]  (which nodes are flagged)

VISUAL:
  - Background: #FFF0EF, border: #E63329
  - ⚠️ icon + "PRIORITY FLAG" label (DM Mono 9px)
  - "The Blindspot Protocol identified this topic as a critical gap.
     This step matters more than usual today."

SIZE: ~25 lines
```

#### 5.6 — `TrailStepCard` — `src/components/trails/TrailStepCard.tsx`

```
TYPE: Client Component ('use client' — has CTA click, state transitions)
REUSES: Card, Button, Badge

PROPS:
  step: TrailStep & { is_completed: boolean }
  enrollmentId: string
  onComplete: (stepId: string) => void
  blindspotNodes?: string[]
  userStudyWindow?: 'morning' | 'evening' | 'both'

STATES:
  - pending: border-[#E8E4DC], white bg
  - in_progress: border-[#1B3FC4], bg-[#F7F9FF]
  - complete: border-[#1B7A3C], bg-[#EAF5EE], checkmark replaces CTA
  - optional_pending: dashed border, opacity-75

LAYOUT:
  1. Step type icon + label (DM Mono 9px)
  2. Step title (Inter 600, 15px)
  3. Time estimate + SleepAwareLabel (if applicable)
  4. BlindspotPriorityFlag (if applicable)
  5. "Covers" section: node IDs (collapsible on mobile)
  6. Computation-heavy indicator (if is_computation_heavy)
  7. Primary CTA button (text varies by step_type)

CTA ROUTING:
  - wiki → Navigate to wiki article page (wiki_article_id)
  - quiz → Navigate to Camp Mode with target_node_ids filter
  - lab → Navigate to 3D Lab with model_id and lab_phase
  - review → Navigate to Camp Mode with review node targets

SIZE: ~120-150 lines
```

#### 5.7 — `MissedDayCard` — `src/components/trails/MissedDayCard.tsx`

```
TYPE: Client Component ('use client' — has two CTAs)

PROPS:
  enrollment: TrailEnrollment
  daysSinceLastActivity: number
  currentDay: TrailDay

LAYOUT:
  - "You left off at Day {N}." (Syne 600, 18px)
  - "{X} days ago." (Inter 14px, muted)
  - "Day {N} is ready when you are."
  - CTA Primary: "Continue Day {N} →"
  - CTA Secondary: "View what I missed"

COPY RULES:
  - No "you broke your streak" language. Ever.
  - No shame. Just facts.
  - "The trail waited" framing

SIZE: ~50-60 lines
```

### Phase 3 Components (Progress Visualization)

#### 5.8 — `MiniHeatmapPreview` — `src/components/trails/MiniHeatmapPreview.tsx`

```
TYPE: Client Component ('use client' — has click to expand)
REUSES: Tooltip

PROPS:
  nodeStates: NodeState[]
  targetNodeIds: string[]
  subjectName: string

VISUAL:
  - Two rows: "Currently" and "After today" (projected at 60% opacity)
  - Each node: 12×12px colored circle (grey/red/amber/green)
  - Max 8 nodes displayed, "and N more" if exceeded
  - Tap → navigates to full heatmap with nodes highlighted

FALLBACK: If all targeted nodes already green:
  "You've already mastered these topics. Today is consolidation."

SIZE: ~70-90 lines
```

#### 5.9 — `TrailRibbon` — `src/components/trails/TrailRibbon.tsx`

```
TYPE: Client Component ('use client' — scroll, hover interactions)
REUSES: ScrollArea, Tooltip

PROPS:
  days: TrailDay[]
  completions: TrailDayCompletion[]
  currentDay: number
  scoreTrajectory: ScorePoint[]

VISUAL:
  - Horizontal scrollable strip, height: 64px mobile / 80px desktop
  - Each day segment: 14px mobile / 20px desktop wide
  - Completed: filled solid with subject color
  - Current (today): slightly taller, cobalt, subtle pulse (opacity 0.8→1.0, 2s CSS)
  - Upcoming: neutral fill (#E8E4DC), subject color at 30% opacity
  - Rest days: small gap
  - Phase transitions: taller divider + week label
  - Score trajectory SVG line overlaid (absolute positioned)
  - Passing threshold line at 70% (dashed, #E63329)
  - Score line color: #E8853A below threshold, #1B7A3C above

IMPLEMENTATION:
  - Use overflow-x: auto with scroll-snap-type: x mandatory
  - Each segment: scroll-snap-align: start
  - SVG line: absolutely positioned, pointer-events: none
  - On mount: scroll to center "today" segment
  - Use raw SVG path (NOT Recharts) for performance on mobile

EMPTY STATE (Day 1):
  "Your trail starts here. Complete Day 1 to see your trajectory begin."

SIZE: ~150-180 lines (most complex component)
```

#### 5.10 — `DayCompletionMoment` — `src/components/trails/DayCompletionMoment.tsx`

```
TYPE: Client Component ('use client' — has animations)
REUSES: Progress

PROPS:
  completionData: DayCompletionData

SCENARIOS:
  A. Score improved: Before/after bar, delta shown
  B. Score unchanged: Honest messaging about spaced repetition
  C. Score dipped: "Scores often dip before they rise" messaging

VISUAL:
  - Before bar: Progress component at X%
  - After bar: Progress component animating from X% to Y% (600ms)
  - Delta: "▲ +13 points" in Syne 700, cobalt
  - Node dots: 12×12px colored circles, grey→amber animated (400ms)
  - No confetti, no badge, no celebratory animation

SIZE: ~80-100 lines
```

#### 5.11 — `ScoreTrajectoryChart` — `src/components/trails/ScoreTrajectoryChart.tsx`

```
TYPE: Client Component ('use client' — Recharts)
DEPENDENCY: recharts (verify installed: check package.json)

PROPS:
  data: ScorePoint[]
  variant: 'inline' | 'full'  (inline for day view, full for trail completion)
  thresholdCrossingDay?: number

VISUAL:
  - Recharts AreaChart (NOT LineChart — area for weight/growth feeling)
  - Gradient fill: #1B3FC4 at 20% opacity → transparent
  - Stroke: #1B3FC4, 2px
  - Passing threshold: ReferenceLine at y=70, dashed, #E63329
  - Threshold crossing dot: green dot at the crossing point
  - Phase transition lines: vertical dashed references
  - Start/end labels with actual score values
  - Mobile (inline): 200px height, no x-axis labels
  - Desktop (full): 300px height, full annotations
  - One-sentence summary above: "Your Readiness Score rose from X% to Y%"

INSTALL CHECK:
  Run: cat package.json | grep recharts
  If missing: npm install recharts

SIZE: ~100-120 lines
```

### Phase 4 Components (Trail Completion + Advanced)

#### 5.12 — `PhaseTransitionCard` — `src/components/trails/PhaseTransitionCard.tsx`

```
TYPE: Server Component
REUSES: Card

PROPS:
  fromPhase: TrailPhase
  toPhase: TrailPhase

VISUAL:
  - "Phase 1: Foundations — complete." → "Phase 2: Gap Targeting begins."
  - Subtle divider card between weeks in the trail
  - Syne 600, 16px. Muted background.

SIZE: ~30 lines
```

#### 5.13 — `CatchUpView` — `src/components/trails/CatchUpView.tsx`

```
TYPE: Client Component ('use client' — dialog/sheet)
REUSES: Dialog (or Sheet for mobile)

PROPS:
  missedDays: TrailDay[]
  onCatchUp: () => void
  onSkip: () => void

VISUAL:
  - Scrollable list of missed days
  - Each shows: title, subject, nodes
  - No missed-day penalty. No red warnings.
  - Two options: "Catch up" vs "Pick up where I left off"

SIZE: ~60-80 lines
```

---

## 6 — COMPONENT REGISTRATION & DESIGN SYSTEM UPDATE

After building each component:

### 6.1 — Create Barrel Export

**File:** `src/components/trails/index.ts`

```typescript
export { TrailCard } from './TrailCard'
export { RecommendedTrailCard } from './RecommendedTrailCard'
export { TrailPhaseMap } from './TrailPhaseMap'
export { TrailStepCard } from './TrailStepCard'
export { TrailRibbon } from './TrailRibbon'
export { MiniHeatmapPreview } from './MiniHeatmapPreview'
export { DayCompletionMoment } from './DayCompletionMoment'
export { ScoreTrajectoryChart } from './ScoreTrajectoryChart'
export { BlindspotPriorityFlag } from './BlindspotPriorityFlag'
export { SleepAwareLabel } from './SleepAwareLabel'
export { MissedDayCard } from './MissedDayCard'
export { CatchUpView } from './CatchUpView'
export { PhaseTransitionCard } from './PhaseTransitionCard'
```

### 6.2 — Update Design System / Developer Dashboard

If the project has a design system page, component registry, or developer dashboard:

1. **Find it:** `find src -name "*developer*" -o -name "*design-system*" -o -name "*component*registry*"`
2. **Add entries** for every new component with:
   - Component name
   - File path
   - Props interface
   - State variants (list each visual state)
   - Which Shadcn components it wraps/reuses

### 6.3 — Update Tailwind Config (If Needed)

If any of these colors were missing during pre-flight check, add them now:

```javascript
// src/app/globals.css — extend colors
colors: {
  // ... existing colors
  trail: {
    cobalt: '#1B3FC4',
    red: '#E63329',
    green: '#1B7A3C',
    orange: '#E8853A',
    purple: '#534AB7',
    gold: '#F5A623',
    moss: '#6B9B37',
    steel: '#4A7B9D',
  }
}
```

---

## 7 — LOADING STATES (Every Page Gets One)

### 7.1 — Trail Library Loading (`loading.tsx`)

```tsx
// 1 skeleton RecommendedTrailCard (full-width, tall)
// 3 skeleton TrailCards in a 2-column grid (or 1-col mobile)
// Use existing Skeleton component
```

### 7.2 — Trail Detail Loading (`[slug]/loading.tsx`)

```tsx
// Skeleton for trail header (title + stats)
// Skeleton for TrailPhaseMap (grid of grey dots — 7×8 grid of skeleton circles)
// 4 skeleton rows for week-by-week preview
```

### 7.3 — Day View Loading (`day/[dayNumber]/loading.tsx`)

```tsx
// Skeleton for day header
// 3 skeleton TrailStepCards
// Skeleton for MiniHeatmapPreview
// Skeleton for TrailRibbon (horizontal bar)
```

---

## 8 — SIDEBAR NAVIGATION UPDATE

Check and update the dashboard sidebar/nav to include the Camp Trail link:

1. **Find the sidebar:** `grep -r "camptrail\|camp.trail\|trails" src/components/ src/app/dashboard/`
2. **Add nav item** if missing:
   - Icon: 🏕 or a `Compass`/`Map` icon from Lucide
   - Label: "Camp Trail"
   - Route: `/dashboard/camptrails`
   - Position: Third item (after Dashboard and Map/Heatmap)

---

## 9 — INTEGRATION TOUCHPOINTS

### 9.1 — Dashboard Card

The main dashboard (`/dashboard/page.tsx`) needs a "Today's Trail Day" card. This is the MOST IMPORTANT card on the dashboard after the Readiness Score.

```
CHECK: Does the dashboard page exist? What components does it render?
  → Run: cat src/app/dashboard/page.tsx

ADD: A "Today's Trail Day" card component that shows:
  - Day number and subject
  - Total estimated time
  - Progress: "0/3 steps complete"
  - CTA: "Start Day N →" linking to the day view

IF the student has no active enrollment:
  - Show "Start Your Camp Trail" card linking to trail library
```

### 9.2 — Wiki Integration

When a wiki article is opened from a trail step context, show:
- A subtle banner: "This article is part of Day 14 of your 8-Week Standard Trail."
- Back navigation: "← Back to Day 14"

```
CHECK: What does the wiki article page look like?
  → Run: find src/app -path "*wiki*" -name "page.tsx"
  → Add a searchParam or context prop for trail attribution
```

### 9.3 — Quiz Integration

When Camp Mode is launched from a trail step:
- Pass `target_node_ids` as the subject filter
- Pass `question_count` from the step
- On session completion, call `markStepComplete` server action

```
CHECK: How does the quiz launch work?
  → Run: grep -r "campmode\|camp.mode\|quiz.*session\|start.*quiz" src/ --include="*.tsx" | head -10
```

---

## 10 — SEED DATA (Required for Development/Testing)

Create a seed script or SQL file to populate at minimum one complete trail:

```sql
-- Seed the 8-Week Standard Trail
INSERT INTO camp_trails (name, slug, description, trail_type, trail_intensity, total_days, daily_time_estimate_minutes, is_published, is_featured, is_free)
VALUES (
  '8-Week Standard Trail',
  '8-week-standard',
  'The Foundation-to-Mastery Path. Covers all 8 ALE subjects across 56 days with balanced daily sessions.',
  'time_gated',
  'standard',
  56,
  90,
  true,
  true,
  false
);

-- Seed a free trail (ALE Starter)
INSERT INTO camp_trails (name, slug, description, trail_type, trail_intensity, total_days, daily_time_estimate_minutes, is_published, is_featured, is_free)
VALUES (
  'ALE Starter Trail',
  'ale-starter',
  'A complete 28-day structured program covering the highest-frequency content across all 8 subjects. Free for all users.',
  'time_gated',
  'standard',
  28,
  60,
  true,
  false,
  true
);

-- Then seed trail_days and trail_steps for at least Week 1 (7 days × 3 steps each)
-- Use realistic titles and subject focuses for development testing
```

---

## 11 — TESTING CHECKLIST

After implementation, verify every item:

### Functionality
- [ ] Trail Library page loads with recommendation card
- [ ] TrailCards render correctly for all trail types
- [ ] Free user sees Pro badge on locked trails
- [ ] Trail Detail page shows full structure with phase map
- [ ] Enrollment server action creates enrollment correctly
- [ ] Day View loads with correct steps for the current day
- [ ] Step completion marks step as complete in DB
- [ ] Day auto-completes when all required steps are done
- [ ] Day completion page shows correct before/after mastery data
- [ ] Score trajectory updates after day completion
- [ ] TrailRibbon scrolls to "today" on load
- [ ] TrailPhaseMap shows correct day colors and states
- [ ] MiniHeatmapPreview shows correct node states
- [ ] MissedDayCard appears when user returns after 3+ days
- [ ] Pause/abandon trail actions work correctly
- [ ] Dashboard trail card shows current day status

### Visual/UX
- [ ] RecommendedTrailCard: cobalt bg, white text, inverse CTA button
- [ ] Typography: Syne for headings, DM Mono for labels, Inter for body
- [ ] All loading states show skeletons (not blank screens)
- [ ] Mobile responsive: 390px width test
- [ ] Tap targets: minimum 44×44px
- [ ] No confetti, no badges, no streak counters anywhere
- [ ] Day completion: factual tone, data-driven feedback
- [ ] Missed day: no shame, no "broken streak" language

### Data Integrity
- [ ] RLS policies prevent cross-user data access
- [ ] user_trail_progress is immutable (no UPDATE, only INSERT)
- [ ] Score trajectory records are created on every day completion
- [ ] Enrollment status transitions are valid (active→paused, active→abandoned, active→completed)
- [ ] Simultaneous enrollment: quiz session can credit multiple trails

---

## 12 — IMPLEMENTATION ORDER SUMMARY

Execute in this exact order to minimize rework:

```
PHASE 0 — PRE-FLIGHT (30 min)
  □ Run all 8 codebase reconnaissance steps
  □ Verify design tokens in Tailwind config
  □ Verify all Shadcn components installed
  □ Summarize findings before proceeding

PHASE 1 — DATABASE (1 hour)
  □ Create and apply migration
  □ Regenerate TypeScript types
  □ Create src/types/trails.ts
  □ Create seed data for development

PHASE 2 — QUERY + ACTION LAYER (1-2 hours)
  □ Create src/lib/queries/trails.ts (all 6 queries)
  □ Create src/lib/actions/trails.ts (all 6 actions)
  □ Create src/lib/utils/trail-recommendation.ts
  □ Test queries against seeded data

PHASE 3 — COMPONENTS (3-4 hours, in dependency order)
  □ TrailCard
  □ RecommendedTrailCard
  □ TrailPhaseMap
  □ SleepAwareLabel
  □ BlindspotPriorityFlag
  □ TrailStepCard
  □ MissedDayCard
  □ MiniHeatmapPreview
  □ TrailRibbon
  □ DayCompletionMoment
  □ ScoreTrajectoryChart
  □ PhaseTransitionCard
  □ CatchUpView
  □ Barrel export (index.ts)

PHASE 4 — PAGES (2-3 hours)
  □ Trail Library page + loading state
  □ Trail Detail page + loading state
  □ Day View page + loading state
  □ Day Completion page

PHASE 5 — INTEGRATION (1-2 hours)
  □ Dashboard trail card
  □ Sidebar navigation link
  □ Wiki trail context banner (if wiki exists)
  □ Quiz trail attribution (if quiz engine exists)
  □ Design system / developer dashboard update

PHASE 6 — TESTING (1 hour)
  □ Run through full testing checklist
  □ Mobile responsive check (390px)
  □ Loading state verification
  □ Error state verification
```

---

## 13 — CRITICAL RULES (NEVER VIOLATE)

1. **Server Components by default.** Only add `'use client'` when the component genuinely needs interactivity (useState, onClick, browser APIs). Push client boundaries as deep as possible.

2. **No gamification debris.** No badges, no streaks, no confetti, no trophies, no XP, no celebratory sounds. The Readiness Score trajectory IS the reward.

3. **Reuse existing components.** Every Shadcn component that exists must be used instead of rebuilt. Never create a custom button, badge, card, progress bar, skeleton, dialog, or tooltip.

4. **Mobile-first.** Design for 390px first. Scale up. Minimum tap target 44×44px. No horizontal scroll on main content.

5. **Copy tone: coach, not cheerleader.** Factual. Honest. No "Great job!" or "Keep it up!" — just the numbers and what they mean.

6. **Data never lies.** Before/after mastery changes are real. If the score didn't improve, say so honestly. If it dipped, explain why without sugar-coating.

7. **Retaker dignity.** The word "fail" never appears. "Returning candidate" with "previous cycle data." Their trail recommendation references prior heatmap as an asset.

8. **RLS on every table.** No exceptions. Every new table gets RLS policies before any query is written.

9. **Follow existing patterns.** Match the query layer pattern, server action pattern, component file naming, and import conventions already established in the codebase. Don't invent new patterns.

10. **Update the design system.** After creating new components, register them in whatever design system documentation or developer dashboard exists in the project.

---

*Camp Trail Implementation Prompt · v1.0 · March 2026*
*SlateCamp Internal · Engineering*

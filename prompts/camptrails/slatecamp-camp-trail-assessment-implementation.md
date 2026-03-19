# SlateCamp — Camp Trail + Assessment + Onboarding Pipeline
## Implementing the Highest-Priority Features from the Product Architecture v2.0

---

## HOW TO USE THIS PROMPT

Give this prompt AND `slatecamp-product-architecture.md` to Claude Code together. The architecture document is the SPECIFICATION — every table, every enum, every UX flow is defined there. This prompt is the EXECUTION PLAN — it tells you WHAT to build, in WHAT ORDER, and HOW to verify.

**Token conservation rules:**
1. Read all files in Phase 1 BEFORE writing any code.
2. Batch all SQL operations into single Supabase MCP calls.
3. When modifying existing files, make surgical edits — don't rewrite entire components.
4. One phase at a time. Stop at each gate.

---

## ROLE

You are a Senior Full-Stack Engineer building the flagship feature pipeline for SlateCamp — a Philippine board exam prep platform. You understand:

- **Next.js App Router patterns:** Server Components for data fetching, Server Actions for writes, no useEffect for data, no client-side Supabase writes
- **Supabase:** RLS on every table, `auth.uid()` scoping, service role only for admin
- **Educational psychology:** You're building an Assessment → Score Reveal → Trail Recommendation → Camp Trail pipeline. Every screen has a specific emotional purpose documented in the architecture.
- **The SlateCamp design system:** Cobalt Blue `#1B3FC4` primary, Inter for all UI, Syne for headings, DM Mono for labels. No confetti, no badges, no exclamation marks.

---

## WHAT WE'RE BUILDING (in execution order)

The Build Status Registry marks these as **Highest Priority:**

```
1. SCHEMA   → Camp Trail tables + Assessment columns + Phase 1 integration columns
2. ASSESS   → Assessment Quiz (35 items, 7 subjects, diagnostic)
3. REVEAL   → Score Reveal Screen (the most important free-user screen)
4. TRAIL-R  → Trail Recommendation Engine (score + days-to-exam → trail)
5. TRAIL-S  → Camp Trail schema seeding (create the first trail templates)
6. TRAIL-UI → Camp Trail enrollment + daily view + step completion
```

Each builds on the previous. The pipeline: user takes assessment → sees score → gets trail recommendation → enrolls → starts Day 1.

---

## TOOLS YOU MUST USE

- **File System** — Read all existing files before modifying. Map the codebase.
- **Supabase MCP** — ALL schema queries and mutations. Verify before every change.
- **grep/find** — Locate existing components, hooks, utilities, types.
- **The architecture document** — Sections 6, 7, and 10 contain the exact SQL, UX flows, and business logic. Reference them constantly.

---

## PHASE 1: Deep Audit (Read-Only — NO code changes)

This phase is critical. You need to understand what EXISTS before building what's MISSING.

### 1a. Database Schema Audit

```sql
-- All existing tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check which Camp Trail tables already exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('camp_trails', 'trail_days', 'trail_steps', 'user_trail_enrollments', 'user_trail_progress', 'trail_day_completions', 'session_trail_credits');

-- Check which enums already exist
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';

-- Check existing columns on quiz_sessions (for assessment + confidence columns)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quiz_sessions' ORDER BY ordinal_position;

-- Check existing columns on user_global_stats (for assessment_completed_at etc)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_global_stats' ORDER BY ordinal_position;

-- Check existing columns on questions (for is_assessment)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'questions' ORDER BY ordinal_position;

-- Check existing columns on user_interactions (for error_type)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_interactions' ORDER BY ordinal_position;

-- Check existing columns on trail_steps (for preferred_time)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'trail_steps' ORDER BY ordinal_position;

-- Sample: what subjects exist in the taxonomy
SELECT DISTINCT subject_area FROM taxonomy_tree WHERE subject_area IS NOT NULL ORDER BY subject_area;

-- Sample: how many questions exist per subject
SELECT t.subject_area, COUNT(q.question_id) as q_count
FROM questions q
JOIN taxonomy_tree t ON t.node_id = q.topic_id
GROUP BY t.subject_area ORDER BY q_count DESC;

-- Check question count for high-discrimination items (potential assessment pool)
SELECT COUNT(*) FROM questions WHERE discrimination_rating IS NOT NULL AND discrimination_rating > 0.3;

-- Check wiki_articles count
SELECT COUNT(*) FROM wiki_articles;

-- Check models_3d count
SELECT COUNT(*) FROM models_3d;

-- Check existing disciplines
SELECT discipline_id, name, slug FROM disciplines;
```

### 1b. Codebase Audit

```bash
# Find all route files
find src/app -name "page.tsx" | sort

# Find assessment-related code (may already be partially built)
grep -rn "assessment\|Assessment" src/ --include="*.tsx" --include="*.ts" -l

# Find any trail/journey-related code
grep -rn "trail\|Trail\|journey\|Journey\|camp.trail\|campTrail" src/ --include="*.tsx" --include="*.ts" -l

# Find quiz engine entry points
grep -rn "startSession\|createSession\|quiz_sessions.*insert" src/ --include="*.tsx" --include="*.ts" | head -10

# Find score/readiness display components
grep -rn "readiness\|Readiness\|ReadinessScore" src/ --include="*.tsx" --include="*.ts" -l

# Find onboarding flow
grep -rn "onboarding\|Onboarding" src/ --include="*.tsx" --include="*.ts" -l

# Find Server Actions
find src/ -name "actions.ts" -o -name "actions.tsx" | head -10

# Find types/interfaces
find src/ -name "types.ts" -o -name "types.tsx" -o -name "*.types.ts" | head -10

# Find supabase client utilities
grep -rn "createClient\|createServerClient\|createBrowserClient" src/lib/ --include="*.ts" | head -5

# Read the main quiz engine to understand session creation pattern
cat src/app/dashboard/testing/page.tsx
```

### 1c. Output

Create a status table:

```
| Component | Exists? | File Path | Notes |
|---|---|---|---|
| Camp Trail tables | ? | — | From schema query |
| Assessment quiz page | ? | — | From grep |
| Score reveal page | ? | — | From grep |
| Trail recommendation logic | ? | — | From grep |
| Quiz session creation | ? | — | From grep |
| Readiness score computation | ? | — | From grep |
| ... | | | |
```

**STOP.** "Phase 1 Complete. Here's what exists and what needs building. Reply 'Proceed' for schema migration."

---

## PHASE 2: Schema Migration

Create ONE migration file with ALL schema changes. Reference Section 6.7 and Section 10.2 of the architecture document for the exact SQL.

### File: `supabase/migrations/YYYYMMDDHHMMSS_camp_trail_and_assessment.sql`

**This migration includes:**

**A. New Enums** (from architecture doc Section 6.7):
```sql
-- trail_type, trail_intensity, trail_step_type, trail_enrollment_status
-- Use CREATE TYPE IF NOT EXISTS pattern (or DO $$ block to check first)
```

**B. New Tables** (from architecture doc Section 6.7 — copy EXACTLY):
```
camp_trails
trail_days
trail_steps
user_trail_enrollments
user_trail_progress
trail_day_completions
session_trail_credits
```

**C. Assessment columns** (from architecture doc Section 10.2 Priority 2):
```sql
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN DEFAULT false;
ALTER TABLE public.user_global_stats ADD COLUMN IF NOT EXISTS assessment_completed_at TIMESTAMPTZ;
ALTER TABLE public.user_global_stats ADD COLUMN IF NOT EXISTS assessment_score DOUBLE PRECISION;
```

**D. Phase 1 integration columns** (from architecture doc Section 10.2 Priority 3):
```sql
ALTER TABLE public.quiz_sessions ADD COLUMN IF NOT EXISTS pre_session_confidence_ratings JSONB DEFAULT '{}';
ALTER TABLE public.user_interactions ADD COLUMN IF NOT EXISTS error_type TEXT;
ALTER TABLE public.trail_steps ADD COLUMN IF NOT EXISTS preferred_time TEXT;
```

**E. RLS Policies** on every new table:
- All tables: user can SELECT/INSERT/UPDATE their own rows (scoped by `auth.uid() = user_id`)
- `camp_trails`, `trail_days`, `trail_steps`: SELECT for all authenticated users (these are platform content, not user data)
- `session_trail_credits`: INSERT only via Server Action (service role), SELECT for own user

**F. Indexes:**
```sql
-- Fast lookups for trail enrollment
CREATE INDEX IF NOT EXISTS idx_trail_enrollments_user ON user_trail_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trail_enrollments_trail ON user_trail_enrollments(trail_id, status);

-- Fast lookups for step completion
CREATE INDEX IF NOT EXISTS idx_trail_progress_enrollment ON user_trail_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_trail_progress_user ON user_trail_progress(user_id);

-- Fast lookups for day completions
CREATE INDEX IF NOT EXISTS idx_day_completions_enrollment ON trail_day_completions(enrollment_id);

-- Assessment question pool
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(is_assessment) WHERE is_assessment = true;
```

**G. Triggers:**
```sql
-- updated_at on user_trail_enrollments
-- Auto-update enrollment.days_completed when a trail_day_completion is inserted
-- Auto-update enrollment.last_activity_at on any user_trail_progress insert
```

**CRITICAL:** Copy the CREATE TABLE statements EXACTLY from the architecture document (Section 6.7). The column names, types, defaults, and constraints are already specified. Don't improvise — the document IS the spec.

**After running the migration, verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('camp_trails', 'trail_days', 'trail_steps', 'user_trail_enrollments', 'user_trail_progress', 'trail_day_completions', 'session_trail_credits')
ORDER BY table_name;
```

**STOP.** "Phase 2 Complete. All Camp Trail + Assessment tables created. Reply 'Proceed' for Assessment Quiz."

---

## PHASE 3: Assessment Quiz

Build the assessment quiz: a 35-item diagnostic that generates the student's initial Readiness Score.

**Reference: Architecture doc Section 7.1**

### 3a. TypeScript Types

```typescript
// types/assessment.ts
interface AssessmentConfig {
  totalQuestions: 35
  questionsPerSubject: 5
  subjects: string[]  // 7 ALE subjects from taxonomy_tree
  isAssessment: true
  showTimer: false     // No timer — this is diagnostic
  showFeedback: false  // No per-question feedback during assessment
}
```

### 3b. Question Selection Logic (Server Action)

```typescript
// For each of the 7 ALE subjects:
//   SELECT 5 questions WHERE is_assessment = true AND subject_area = [subject]
//   ORDER BY discrimination_rating DESC
//   LIMIT 5
//
// If not enough is_assessment questions exist, fall back to:
//   SELECT questions with highest discrimination_rating from that subject
//
// Total: 35 questions, shuffled across subjects
```

**IMPORTANT:** Query the ACTUAL subject_area values from `taxonomy_tree` (from Phase 1 audit). Don't hardcode subject names.

### 3c. Assessment Quiz Page

**Route:** `/dashboard/assessment` (or `/assessment` if it should be accessible before dashboard)

**UX (from architecture doc):**
- "This is NOT a test. It's a diagnostic." — framing reduces anxiety
- 35 questions, no timer, no per-question feedback
- Simple progress: "Question 14 of 35"
- Subject transitions: subtle label change when moving from one subject to the next
- Background: `#F5F7FA` (Cool Surface — same as regular quizzes)
- All Inter font. No Syne during the assessment.

**On completion:**
1. Calculate per-subject accuracy from the 35 responses
2. Compute initial Readiness Score (use existing readiness calculation if it exists, or simple weighted average)
3. Write to `user_global_stats`: `assessment_completed_at`, `assessment_score`, `global_readiness_score`
4. Write to `readiness_score_snapshots` 
5. Write to `user_node_mastery` for each subject/topic touched
6. Redirect to Score Reveal page

### 3d. Guard

The assessment should only be taken ONCE (for free users). Check `user_global_stats.assessment_completed_at`:
- If null → show assessment
- If not null → redirect to dashboard (or allow retake for Pro users)

**STOP.** "Phase 3 Complete. Assessment quiz functional. Reply 'Proceed' for Score Reveal."

---

## PHASE 4: Score Reveal Screen

**Reference: Architecture doc Section 7.2**

**This is the most important screen in the free user experience.**

**Route:** `/dashboard/score-reveal` (or `/score-reveal`)

### What the student sees (in order):

1. **The number.** Readiness Score, large, honest. Inter 48px bold tabular-nums. Color-coded:
   - 0-49: `#E63329` (Red)
   - 50-69: `#E8853A` (Orange)  
   - 70-84: `#1B7A3C` (Green)
   - 85-100: `#1B7A3C` (Green, stronger messaging)

2. **One-line interpretation.** In the "confident companion" voice:
   - <40%: "A lot of ground ahead — but this is exactly where the journey starts."
   - 40-59%: "You have a foundation. Now let's build on it."
   - 60-74%: "Solid ground. A focused trail will close the gaps."
   - 75-89%: "Strong position. Let's sharpen the edges."
   - 90+: "The data says you're ready. Let's confirm it with a simulation."

3. **Subject breakdown.** 7 horizontal bars showing per-subject accuracy from the assessment. Color-coded (green/orange/red). The student sees their SHAPE for the first time.

4. **Blurred heatmap teaser.** Below the bars, show a blurred/locked version of the taxonomy heatmap. The SHAPE is visible (students can see which areas are red) but the DETAIL is locked. Free users see: "Unlock Full Analytics — see exactly where every gap is."

5. **Trail recommendation.** One recommended Camp Trail, surfaced with reasoning:
   > "Based on your score of 48% and 84 days until your exam, the 12-Week Comprehensive Trail is the right fit. Week 1 focuses on Building Laws — your biggest gap."

6. **CTA:** "Start Your Camp Trail →" (primary Cobalt button) and "Browse All Trails" (secondary ghost button)

### Free vs Pro behavior:
- Free users see this screen ONCE. After navigating away, the score on the dashboard shows as locked.
- Pro users can return to this screen anytime and see updated scores.

**STOP.** "Phase 4 Complete. Score Reveal screen built. Reply 'Proceed' for Trail Recommendation Engine."

---

## PHASE 5: Trail Recommendation Engine

**Reference: Architecture doc Section 7.3**

### Server-side logic:

```typescript
// lib/trails/recommend.ts

interface TrailRecommendation {
  trail: CampTrail
  reasoning: string     // Human-readable explanation
  weekOnePreview: string // What Week 1 focuses on
}

function recommendTrail(
  readinessScore: number,
  targetExamDate: Date | null,
  subjects: SubjectMastery[]
): TrailRecommendation {
  const daysToExam = targetExamDate 
    ? Math.ceil((targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Logic from architecture doc Section 7.3:
  let recommendedIntensity: string
  
  if (!daysToExam || daysToExam > 180) {
    recommendedIntensity = 'undergraduate'  // 6-month
  } else if (daysToExam <= 14) {
    recommendedIntensity = 'intensive'       // 2-week exam simulation
  } else if (daysToExam <= 28) {
    recommendedIntensity = readinessScore >= 65 ? 'intensive' : 'accelerated'
  } else if (daysToExam <= 56) {
    recommendedIntensity = readinessScore >= 65 ? 'accelerated' : 'standard'
  } else if (daysToExam <= 84) {
    recommendedIntensity = readinessScore >= 50 ? 'standard' : 'comprehensive'
  } else {
    recommendedIntensity = readinessScore >= 50 ? 'standard' : 'comprehensive'
  }

  // Find the matching trail from camp_trails
  // Generate reasoning string
  // Find the weakest subject for week 1 preview
  
  const weakestSubject = subjects.sort((a, b) => a.mastery - b.mastery)[0]
  
  return {
    trail: matchedTrail,
    reasoning: `Based on your score of ${readinessScore}% and ${daysToExam} days until your exam, the ${matchedTrail.name} is the right fit.`,
    weekOnePreview: `Week 1 focuses on ${weakestSubject.name} — your biggest gap.`
  }
}
```

**STOP.** "Phase 5 Complete. Trail recommendation logic built. Reply 'Proceed' for Camp Trail seeding."

---

## PHASE 6: Seed the First Camp Trail

Create the **8-Week Standard Trail** as the default recommendation. This is content creation, not code.

### Server Action or seed script:

1. Insert into `camp_trails`: 8-Week Standard, 56 days, `trail_type: time_gated`, `intensity: standard`
2. Insert 56 rows into `trail_days`: Day 1 through Day 56, each with a title and estimated minutes
3. Insert ~3 steps per day into `trail_steps`: typically 1 wiki + 1 quiz + 1 lab (or wiki + 2 quiz if no lab exists)

**For the quiz steps:** Use `target_node_ids` pointing to actual taxonomy nodes (query `taxonomy_tree` to get real node IDs). The architecture doc (Section 6.5) specifies that quiz steps reference nodes, not questions — questions are generated at runtime.

**For wiki steps:** Use `article_id` pointing to actual `wiki_articles` entries. If an article doesn't exist for a topic, set `article_id` to null and the step becomes "Read about [topic name]" with a link to search.

**For lab steps:** Use `model_id` pointing to `models_3d` entries. Since 3D Lab currently 404s, set most lab steps as `is_optional: true`.

**Day structure pattern (from architecture doc Section 6.4):**
- Days 1-14: Block by subject (e.g., Days 1-4 = Building Laws, Days 5-8 = Building Technology)
- Days 15-35: Start interleaving 2 subjects per day
- Days 36-56: Full interleaving across all subjects (progressive interleaving per Rohrer et al.)

**IMPORTANT:** Only seed Week 1 in detail (7 days × 3 steps = 21 rows). The remaining weeks can be seeded with skeleton days (title + estimated minutes but fewer steps) and fleshed out later. Getting the pipeline working end-to-end matters more than having 56 complete days.

**STOP.** "Phase 6 Complete. 8-Week Standard Trail seeded with Week 1 content. Reply 'Proceed' for Trail UI."

---

## PHASE 7: Camp Trail UI

Build the user-facing trail experience.

### 7a. Trail Library Page

**Route:** `/dashboard/trails` (or within the testing page)

- List all published trails (`is_published = true`)
- Group by type (Time-Gated, Subject Mastery, Code Deep-Dives)
- Each card shows: name, duration, intensity, description
- If the user has an active enrollment, show it at the top with progress
- If the Trail Recommendation Engine has a recommendation, show it prominently

### 7b. Trail Detail / Enrollment Page

**Route:** `/dashboard/trails/[slug]`

- Trail name, description, duration, daily load estimate
- Week-by-week preview (collapsible): show day titles and step counts
- "Start This Trail →" CTA (creates `user_trail_enrollments` row)
- If already enrolled: show current day progress instead of enrollment CTA

### 7c. Trail Daily View (The Core Loop)

**Route:** `/dashboard/trails/[slug]/today` (or shown on the dashboard)

This is what the student sees EVERY DAY. It's the most visited screen after enrollment.

**Layout:**
```
Your Camp Trail · Day 14 of 56
"Building Technology: Structural Systems"
──────────────────────────────────────────

☐ Read: Reinforced Concrete Fundamentals (~15 min)    [Open Wiki →]
☐ Quiz: 15 items on Structural Systems (~20 min)      [Start Quiz →]  
☐ 3D Lab: Structural Bay Framing (~10 min)            [Open Lab →]    (optional)

── Today's estimated time: ~45 minutes ──
── Progress: 8 of 56 days completed ──
```

**Step completion logic:**
- Wiki step: mark complete when the student visits the article (track via `analytics_events` or a dedicated action)
- Quiz step: mark complete when a quiz session touching the `target_node_ids` reaches `status: completed`. Use `session_trail_credits` to credit the step.
- Lab step: mark complete when the student visits the 3D model page (or skip if optional and 3D Lab is 404)

**Day completion:** When all non-optional steps for the current day are complete:
1. Insert into `trail_day_completions`
2. Update `user_trail_enrollments.days_completed` and `current_day`
3. Snapshot readiness score at day completion
4. Show a brief "Day complete" message with readiness delta: "Readiness: 48% → 49% (+1)"

### 7d. Dashboard Integration

On the main dashboard, if the student has an active trail enrollment, show a compact trail card:

```
Your Camp Trail · Day 14 of 56
Today: 3 activities · ~45 min
[Continue Trail →]
```

This replaces or sits alongside the "Suggested for Today" section.

**STOP.** "Phase 7 Complete. Camp Trail UI built. Reply 'Proceed' for final verification."

---

## PHASE 8: End-to-End Verification

Test the COMPLETE pipeline:

### Flow test:
1. [ ] New user (or cleared test user) lands on assessment
2. [ ] Assessment presents 35 questions across 7 subjects
3. [ ] No timer, no per-question feedback during assessment
4. [ ] On completion → redirects to Score Reveal
5. [ ] Score Reveal shows: score number, interpretation text, subject bars, blurred heatmap, trail recommendation
6. [ ] Trail recommendation matches the logic (score + days-to-exam)
7. [ ] "Start Your Camp Trail →" creates an enrollment
8. [ ] Trail daily view shows Day 1 with correct steps
9. [ ] Completing a wiki step marks it done
10. [ ] Completing a quiz step (via normal quiz engine) credits the trail step
11. [ ] Completing all day steps triggers day completion
12. [ ] Day completion snapshots readiness score
13. [ ] Dashboard shows active trail card
14. [ ] Trail library page lists available trails

### Schema verification:
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('camp_trails', 'trail_days', 'trail_steps', 'user_trail_enrollments', 'user_trail_progress', 'trail_day_completions', 'session_trail_credits')
ORDER BY table_name;

-- Verify enums exist
SELECT typname FROM pg_type WHERE typname IN ('trail_type', 'trail_intensity', 'trail_step_type', 'trail_enrollment_status');

-- Verify assessment columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'questions' AND column_name = 'is_assessment';

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_global_stats' AND column_name IN ('assessment_completed_at', 'assessment_score');

-- Verify seed data
SELECT COUNT(*) as trails FROM camp_trails;
SELECT COUNT(*) as days FROM trail_days;
SELECT COUNT(*) as steps FROM trail_steps;

-- Verify RLS
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename LIKE '%trail%' ORDER BY tablename;
```

### Code verification:
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors on any new page
- [ ] All Server Actions use proper auth checks
- [ ] All new routes are accessible from the sidebar/nav
- [ ] All data writes go through Server Actions (no client-side Supabase writes)

### After all verification passes:
Run the DATABASE_SCHEMA.sql sync prompt to update the schema documentation.

**STOP.** "Phase 8 Complete. Assessment → Score Reveal → Trail Recommendation → Camp Trail pipeline is live."

---

## WHAT NOT TO DO

- **Don't build ALL trail types.** Seed only the 8-Week Standard for now. Other trails come later.
- **Don't build the Blindspot/Endurance/Proof mechanics.** Those are marked "Post-Trail" in the Build Registry.
- **Don't build the AI Reference Assistant.** Marked "Medium" priority.
- **Don't build Phase 2 or Phase 3 integrations** (Teach-Back, Worked Examples, Anxiety Inoculation). Those are future phases.
- **Don't change existing quiz engine behavior.** The assessment is a SPECIAL quiz session (`test_mode: 'assessment'`), not a replacement for Camp/Storm Mode.
- **Don't hardcode subject names.** Query `taxonomy_tree` for real `subject_area` values.
- **Don't hardcode question IDs in trail steps.** Use `target_node_ids` — questions are generated at runtime.
- **Don't break existing dashboard functionality.** The trail card is an ADDITION to the dashboard, not a replacement.
- **Don't skip RLS policies.** Every new table must have RLS enabled and policies defined.
- **Don't use `any` types.** Full TypeScript. No exceptions.
- **Don't use useEffect for data fetching.** Server Components and Server Actions only.

---

*Execute Phase 1 now. Read every file, query the full schema, map what exists.*

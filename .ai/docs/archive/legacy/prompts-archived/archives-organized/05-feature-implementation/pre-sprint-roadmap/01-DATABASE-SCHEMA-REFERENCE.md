# SlateCamp — Current Database Schema Reference
## Complete Production Schema · Pre-Implementation Baseline
### Generated from: Codebase Audit (2026-03-25), DB Architect Skill, Supabase Backend Skill, Product Roadmap, Five Critical Features

---

## Purpose

This is the single source of truth for every table, column, constraint, index, trigger, and RLS policy in SlateCamp's production Supabase database **before** any of the 17 planned migrations (039–055) are applied. Every developer must reference this document before writing any migration, query function, or server action that touches the database.

---

## How to Regenerate This Document

This document must be regenerated after every migration. Run:

```bash
# 1. Export full schema from production
supabase db dump --schema public > schema_dump.sql

# 2. Export RLS policies
supabase db dump --role-only > rls_dump.sql

# 3. Export functions and triggers
supabase db dump --schema public --data-only=false > full_dump.sql

# 4. Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.ts
```

If this document is older than the most recent migration, **do not trust it** — regenerate from the live database.

---

## Naming Conventions (Legacy + Forward)

| Convention | Legacy (existing tables) | Forward (new tables) |
|---|---|---|
| Primary key | `{entity}_id` (e.g., `question_id`, `session_id`) | `id UUID` |
| Foreign key | `{referenced_table_singular}_id` | Same |
| Timestamps | Mixed — some tables missing `updated_at` | `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` |
| Booleans | `is_` prefix | Same |
| Soft delete | `archived_at TIMESTAMPTZ` (nullable) | Same |
| ENUMs | PostgreSQL `CREATE TYPE` | Same |

**Do not rename existing PKs.** Document the divergence in comments.

---

## Domain Cluster Map

```
TAXONOMY & CONTENT
  disciplines → taxonomy_tree → questions
                              → wiki_articles (via wiki_article_taxonomy)
                              → models_3d → spatial_hotspots

USER IDENTITY & BILLING
  auth.users → profiles
             → user_subscriptions (LemonSqueezy + Payrex)
             → organizations → organization_members

QUIZ ENGINE
  quiz_sessions → user_interactions (immutable log)

MASTERY & ANALYTICS ENGINE  ← THE CORE LOOP
  user_interactions → user_node_mastery (EMA, updated by trigger)
                    → user_mastery_history (snapshot log)
  user_node_mastery → Readiness Score (computed)
  readiness_score_snapshots (append-only trajectory)
  user_global_stats (aggregated stats, attribution, churn signals)
  blindspot_queues (focus review targeting)

PROGRESSION FEATURES
  camp_trails → trail_days → trail_steps
  user_trail_enrollments → user_trail_progress
                         → trail_day_completions
                         → session_trail_credits (junction: session ↔ trail)

SRS & IRT ENGINE
  srs_schedules (SM-2 per question per user)
  [IRT theta stored in user_global_stats — column may need adding]

PERSONAL WORKSPACE
  note_folders → notes
  analytics_events (behavioral telemetry)
  feature_flags
```

---

## Table-by-Table Schema

### TAXONOMY & CONTENT CLUSTER

---

#### `disciplines`

The top-level exam structure. Maps to ALE examination areas.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `discipline_id` | UUID | PK, DEFAULT gen_random_uuid() | Legacy PK naming |
| `name` | TEXT | NOT NULL | e.g., "Architecture Licensure Examination" |
| `code` | TEXT | NOT NULL, UNIQUE | e.g., "ALE" |
| `subject_floor_pct` | NUMERIC | DEFAULT 50 | The ALE requires ≥50% in every subject. **Read by Subject Floor Alert — do not hardcode 50 in UI** |
| `description` | TEXT | | |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS:** Public read. Admin write.
**Indexes:** Primary key only.
**Used by:** Subject Floor Alert (Feature 5), development controls calculator, all taxonomy queries.

---

#### `taxonomy_tree`

Hierarchical topic tree. The backbone of the mastery engine. Contains ~500+ nodes across 4 levels.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / TEXT | PK | Verify actual type — some references use TEXT node codes like "ALE-HIST" |
| `parent_id` | UUID / TEXT | FK → taxonomy_tree(id), nullable | NULL = root node (L1 subject) |
| `discipline_id` | UUID | FK → disciplines(discipline_id) | |
| `name` | TEXT | NOT NULL | Human-readable topic name |
| `code` | TEXT | UNIQUE | Machine code, e.g., "ALE-HIST", "ALE-STRC" |
| `subject_area` | TEXT | | L1 subject code for leaf nodes, e.g., "ALE-HIST" |
| `level` | INTEGER | NOT NULL | 1=Subject, 2=Topic, 3=Subtopic, 4=Leaf |
| `exam_frequency` | TEXT | CHECK IN ('high', 'medium', 'low') | Used by Cram Card algorithm (Feature 4) |
| `is_cross_ref_only` | BOOLEAN | DEFAULT false | Cross-reference nodes excluded from sub-score computation |
| `deprecated_at` | TIMESTAMPTZ | nullable | Soft deprecation — excluded from active queries |
| `sort_order` | INTEGER | | Display ordering |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | **⚠️ May be missing trigger** |

**RLS:** Public read (`USING (true)`).
**Indexes:**
- PK index
- `idx_taxonomy_tree_parent_id` on `parent_id` — **verify exists**
- `idx_taxonomy_tree_discipline_id` on `discipline_id` — **verify exists**
- `idx_taxonomy_tree_subject_area` on `subject_area` — **verify exists, needed for sub-score queries**

**Used by:** Mastery engine, heatmap, sub-scores pipeline (Feature 5), Cram Card (Feature 4), Camp Trails, all quiz targeting.

**Critical for Feature 5:** Sub-score computation queries all leaf nodes where `subject_area = [subject]` AND `is_cross_ref_only = false` AND `deprecated_at IS NULL`.

---

#### `questions`

The question bank. Each question links to a taxonomy node.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `question_id` | UUID | PK, DEFAULT gen_random_uuid() | Legacy PK naming |
| `topic_id` | TEXT / UUID | FK → taxonomy_tree(id) | **⚠️ Missing index (audit confirmed)** |
| `stem` | TEXT | NOT NULL | Question text — may contain HTML (XSS risk if unsanitized) |
| `options` | JSONB | NOT NULL | Array of answer options |
| `correct_option_id` | TEXT | NOT NULL | ID of the correct option |
| `explanation` | TEXT | | Rationale text |
| `difficulty` | NUMERIC | | IRT difficulty parameter (b) |
| `discrimination` | NUMERIC | | IRT discrimination parameter (a) |
| `application_context` | TEXT | CHECK IN ('recall', 'calculation', 'scenario', 'interpretation') | **Used by Cram Card — only 'recall' and 'calculation' qualify** |
| `subject_name` | TEXT | | Denormalized for fast lookups |
| `topic_name` | TEXT | | Denormalized |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | **⚠️ Missing column + trigger (audit debt)** |

**RLS:** Public read.
**Indexes:**
- PK index
- **⚠️ MISSING:** `idx_questions_topic_id ON questions(topic_id)` — **must add in next migration**

**Used by:** Quiz engine (all 7 modes), IRT question selection, Cram Card algorithm.

---

#### `wiki_articles`

Study content articles linked to taxonomy nodes.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| `title` | TEXT | NOT NULL | |
| `content` | TEXT | | MDX or Markdown body |
| `content_preview` | TEXT | | First ~200 chars, stripped of markdown |
| `category_label` | TEXT | | |
| `subject_name` | TEXT | | Denormalized |
| `topic_id` | TEXT / UUID | | FK to taxonomy_tree |
| `reading_minutes` | INTEGER | | Estimated reading time |
| `status` | TEXT | CHECK IN ('draft', 'published') | |
| `published_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |
| `search_vector` | TSVECTOR | | **🔮 PLANNED (Migration 054)** — does not exist yet |

**RLS:** Public read (published only for non-admin).
**Indexes:** PK, `slug` unique index. **Planned:** GIN index on `search_vector`.

**Used by:** Wiki pages, admin coverage dashboard, Cram Card hooks (exam_tip items).

---

#### `wiki_article_taxonomy`

Junction table linking wiki articles to taxonomy nodes (many-to-many).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `article_id` | UUID | FK → wiki_articles(id) | |
| `node_id` | UUID / TEXT | FK → taxonomy_tree(id) | **⚠️ Missing index (audit)** |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Indexes:** **⚠️ MISSING:** `idx_wiki_article_taxonomy_node_id`

---

#### `models_3d`

3D Lab model metadata.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `title` | TEXT | NOT NULL | |
| `description` | TEXT | | |
| `model_url` | TEXT | NOT NULL | URL to GLB/GLTF file in Supabase Storage |
| `thumbnail_url` | TEXT | | |
| `taxonomy_node_id` | UUID / TEXT | FK → taxonomy_tree(id) | |
| `module_type` | TEXT | | e.g., 'stairway', 'wall-section', 'foundation' |
| `is_published` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**Used by:** 3D Lab, standalone 3D Lab access (Phase 8).

---

#### `spatial_hotspots`

Interactive annotation points on 3D models.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `model_id` | UUID | FK → models_3d(id) | **⚠️ Missing index** |
| `node_id` | UUID / TEXT | FK → taxonomy_tree(id) | **⚠️ Missing index** |
| `position_x` | NUMERIC | NOT NULL | |
| `position_y` | NUMERIC | NOT NULL | |
| `position_z` | NUMERIC | NOT NULL | |
| `title` | TEXT | NOT NULL | |
| `content` | TEXT | | Hotspot description/annotation |
| `code_reference` | TEXT | | e.g., "PD 1096 §1202" |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

---

### USER IDENTITY & BILLING CLUSTER

---

#### `profiles`

Extended user profile. One row per `auth.users` row.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | |
| `full_name` | TEXT | | Display name |
| `avatar_url` | TEXT | | Supabase Storage URL |
| `email` | TEXT | | Denormalized from auth.users |
| `exam_date` | DATE | | Target ALE exam date |
| `reviewer_type` | TEXT | CHECK IN ('first_time', 'returning_reviewer') | **Critical for Feature 2 (Retaker Onboarding)** — set during onboarding |
| `previous_exam_subjects_struggled` | JSONB | | Array of ALE subject codes, e.g., `["ALE-STRC", "ALE-PRAC"]` — used to pre-seed mastery |
| `school_name` | TEXT | | **Needed for Feature 1c (School Cohort Heatmaps)** — self-reported during onboarding. **Verify if column exists** |
| `region` | TEXT | | **Needed for Feature 1e (Regional Channels)** — standardized PH region code. **Verify if exists** |
| `ale_result` | TEXT | CHECK IN ('pending', 'passed', 'did_not_pass') | **Needed for Feature 1a (Passer Stories)** — set post-exam |
| `prc_ranking` | INTEGER | nullable, CHECK (1–10) | **Needed for Feature 1f (Topnotcher Cascade)** — admin-verified |
| `onboarding_completed` | BOOLEAN | DEFAULT false | |
| `onboarding_step` | INTEGER | | Current onboarding step for resume |
| `subscription_tier` | TEXT | | 'free', 'pro', or similar |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**RLS:** Users can SELECT, UPDATE own row. Admin can SELECT all.
**Indexes:** PK (which is also the FK to auth.users).

**⚠️ ACTION REQUIRED:** Verify which of the following columns actually exist vs. are planned:
- `reviewer_type` — referenced in Five Critical Features but verify in production
- `previous_exam_subjects_struggled` — referenced but verify
- `school_name` — needed for Feature 1c
- `region` — needed for Feature 1e
- `ale_result` — needed for Feature 1a
- `prc_ranking` — needed for Feature 1f

---

#### `user_subscriptions`

Payment and subscription state. LemonSqueezy + PayRex integration.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id) | |
| `lemon_squeezy_customer_id` | TEXT | | |
| `lemon_squeezy_subscription_id` | TEXT | | |
| `payrex_customer_id` | TEXT | | Philippine payment gateway |
| `payrex_subscription_id` | TEXT | | |
| `status` | TEXT | | 'active', 'canceled', 'past_due', etc. |
| `tier` | TEXT | | 'free', 'pro' |
| `current_period_start` | TIMESTAMPTZ | | |
| `current_period_end` | TIMESTAMPTZ | | |
| `cancel_at_period_end` | BOOLEAN | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**RLS:** Users can SELECT own. Service role for webhook writes.

**Note:** Webhook handlers exist and work per audit. Checkout route exists. But upgrade page buttons have no `onClick` handlers — revenue is blocked at the UI layer, not the DB layer.

---

#### `organizations` / `organization_members`

Organizational structure (for future institutional features).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `organizations.id` | UUID | PK | |
| `organizations.name` | TEXT | | |
| `organization_members.user_id` | UUID | FK → auth.users(id) | |
| `organization_members.org_id` | UUID | FK → organizations(id) | |
| `organization_members.role` | TEXT | | 'admin', 'member' |

**Status:** Exists in schema but unused per audit. Will be superseded by `institutions` table (Migration 052).

---

### QUIZ ENGINE CLUSTER

---

#### `quiz_sessions`

One row per quiz session. Links to `user_interactions` for individual question responses.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Legacy: may use `session_id` — **verify** |
| `user_id` | UUID | FK → profiles(id) | **⚠️ Missing index (audit)** |
| `mode` | TEXT | CHECK IN ('camp', 'storm', 'blindspot', 'proof', 'chill', 'focus_review', 'custom', 'simulation', 'endurance') | 7+ testing modes |
| `status` | TEXT | CHECK IN ('in_progress', 'completed', 'abandoned') | |
| `question_count` | INTEGER | | Total questions in session |
| `current_question_index` | INTEGER | | For resume functionality |
| `score_percent` | NUMERIC | | Final session score |
| `subject_name` | TEXT | | Subject filter used |
| `topic_name` | TEXT | | Topic filter used |
| `topic_id` | TEXT / UUID | | |
| `question_ids` | UUID[] | | **⚠️ Design debt: Array blocks cross-session analytics. Plan `session_questions` junction table.** |
| `started_at` | TIMESTAMPTZ | | |
| `completed_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**RLS:** User-scoped SELECT, INSERT, UPDATE.
**Indexes:**
- PK
- **⚠️ MISSING:** `idx_quiz_sessions_user_id`
- **⚠️ MISSING:** `idx_quiz_sessions_status`
- **⚠️ MISSING:** `idx_quiz_sessions_completed_at`

**Note:** The `mode` CHECK constraint may need updating — verify it includes all 7 testing modes documented in the testing hub.

---

#### `user_interactions`

**The immutable event log.** Every question answer goes here. This is the source data for the entire mastery engine, Cram Card algorithm, and all analytics.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id) | **⚠️ Missing index** |
| `question_id` | UUID | FK → questions(question_id) | **⚠️ Missing index** |
| `session_id` | UUID | FK → quiz_sessions(id) | |
| `is_correct` | BOOLEAN | NOT NULL | |
| `selected_option_id` | TEXT | | Which option the student chose |
| `time_spent_ms` | INTEGER | | Milliseconds on this question |
| `confidence_level` | TEXT | | 'low', 'medium', 'high' (self-reported) |
| `lucky_guess_flag` | BOOLEAN | DEFAULT false | Student self-report of lucky guess |
| `question_order` | INTEGER | | **⚠️ May be missing — needed for Endurance analysis** |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**RLS:** User-scoped SELECT, INSERT. No UPDATE, no DELETE — this table is append-only.

**🔴 NEVER DELETE ROWS FROM THIS TABLE.** This is the analytics engine. Data loss here corrupts every downstream metric.

**Indexes:**
- PK
- **⚠️ MISSING:** `idx_user_interactions_user_id`
- **⚠️ MISSING:** `idx_user_interactions_question_id`
- Composite `idx_user_interactions_user_question` on `(user_id, question_id)` — **verify exists, needed for mastery queries**

**Used by:** Mastery trigger, Cram Card (Feature 4), SRS quality derivation, session analytics, all progress tracking.

---

### MASTERY & ANALYTICS ENGINE CLUSTER

---

#### `user_node_mastery`

Per-user, per-taxonomy-node mastery weight. Updated by trigger on `user_interactions` insert using Exponential Moving Average (EMA).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id) | |
| `node_id` | UUID / TEXT | FK → taxonomy_tree(id) | |
| `current_mastery_weight` | NUMERIC | DEFAULT 0.0 | EMA-smoothed mastery score 0.0–1.0 |
| `total_attempts` | INTEGER | DEFAULT 0 | Used for Cram Card minimum sample gate (≥3) |
| `correct_attempts` | INTEGER | DEFAULT 0 | |
| `mastery_state` | TEXT | | 'grey' / 'red' / 'amber' / 'green' — derived from weight |
| `last_interaction_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**RLS:** User-scoped SELECT, INSERT, UPDATE.
**Indexes:** Composite `(user_id, node_id)` UNIQUE.

**Trigger:** Updated automatically when a row is inserted into `user_interactions`. The trigger computes a new EMA weight.

**Used by:** Heatmap, Readiness Score, sub-scores pipeline (Feature 5), Blindspot Protocol, Camp Trail prioritization, Cram Card, School Cohort Heatmaps (Feature 1c).

---

#### `user_mastery_history`

Append-only snapshot of mastery changes. Used for historical analysis and potential retroactive sub-score computation.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK | |
| `node_id` | UUID / TEXT | FK → taxonomy_tree(id) | |
| `mastery_weight` | NUMERIC | | Weight at snapshot time |
| `snapshot_reason` | TEXT | | 'interaction', 'recalculation', etc. |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Note (Feature 5):** The DB architect should evaluate whether `user_mastery_history` contains enough historical state to retroactively populate `readiness_score_snapshots.sub_scores` for past snapshots.

---

#### `readiness_score_snapshots`

Append-only timeline of the student's overall Readiness Score.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id) | **⚠️ Missing index** |
| `score` | NUMERIC | NOT NULL | 0–100 overall readiness score |
| `sub_scores` | JSONB | DEFAULT '{}' | **🔴 BROKEN PIPELINE: Always written as `'{}'::jsonb` since launch. Feature 5 fixes this.** Expected format: `{"ALE-HIST": 0.72, "ALE-STRC": 0.49, ...}` |
| `snapshot_trigger` | TEXT | | 'session_complete', 'manual_recalc', etc. |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**RLS:** User-scoped SELECT. Service role INSERT (via trigger).

**Trigger:** `snapshot_readiness_on_session_complete` — fires after quiz session completion. Currently reads `user_global_stats.global_readiness_score` and writes with hardcoded `'{}'::jsonb` for sub_scores. **This trigger is the primary target of the Feature 5 data pipeline fix.**

**Indexes:**
- PK
- **⚠️ MISSING:** `idx_readiness_snapshots_user_id`

---

#### `user_global_stats`

**God Table** — aggregated user-level statistics, attribution data, and churn signals. 20+ columns spanning 5+ concerns.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id), UNIQUE | One row per user |
| `global_readiness_score` | NUMERIC | | Current overall readiness 0–100 |
| `total_sessions` | INTEGER | DEFAULT 0 | |
| `total_questions_answered` | INTEGER | DEFAULT 0 | |
| `total_correct` | INTEGER | DEFAULT 0 | |
| `total_study_time_ms` | BIGINT | DEFAULT 0 | |
| `streak_current` | INTEGER | DEFAULT 0 | **Note: Streak system (Phase 3) will use separate `user_streaks` table** |
| `streak_longest` | INTEGER | DEFAULT 0 | |
| `last_session_at` | TIMESTAMPTZ | | |
| `exam_attempt_number` | INTEGER | DEFAULT 1 | **Feature 2: Incremented to 2+ for returning reviewers** |
| `theta` | FLOAT | DEFAULT 0.0 | **🔮 PLANNED (Migration 039)** — IRT ability parameter. **Verify if column already exists** |
| `churn_risk_score` | NUMERIC | | **⚠️ Computed by unknown process — document computation source** |
| `score_velocity_7d` | NUMERIC | | **⚠️ Computed by unknown process** |
| `is_flagged` | BOOLEAN | | **⚠️ Computed by unknown process** |
| `cram_card_last_generated` | TIMESTAMPTZ | | **🔮 PLANNED (Feature 4)** |
| `cram_card_data` | JSONB | | **🔮 PLANNED (Feature 4)** — cached card content |
| `attribution_source` | TEXT | | UTM source |
| `attribution_medium` | TEXT | | UTM medium |
| `attribution_campaign` | TEXT | | UTM campaign |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**RLS:** User-scoped SELECT, UPDATE. Service role for computed fields.

**⚠️ Tech Debt:** This table is a God Table spanning stats, attribution, churn signals, and planned IRT/Cram Card data. Future split planned: extract `user_attribution` as a separate table.

---

#### `blindspot_queues`

Focus review targeting — nodes that the Blindspot Protocol has identified for review.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK | |
| `node_id` | UUID / TEXT | FK → taxonomy_tree(id) | |
| `priority_score` | NUMERIC | | Higher = more urgent to review |
| `source` | TEXT | | 'mastery_drop', 'srs_overdue', 'exam_frequency_high' |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `resolved_at` | TIMESTAMPTZ | nullable | When the student reviewed this node |

---

### SRS ENGINE

---

#### `srs_schedules`

SM-2 spaced repetition schedule per question per user.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → auth.users(id) | |
| `question_id` | UUID | FK → questions(question_id) | |
| `ease_factor` | NUMERIC | DEFAULT 2.5 | SM-2 ease factor |
| `interval_days` | INTEGER | DEFAULT 1 | Days until next review |
| `repetitions` | INTEGER | DEFAULT 0 | Consecutive correct count |
| `next_review_at` | TIMESTAMPTZ | | |
| `last_reviewed_at` | TIMESTAMPTZ | | |
| `quality` | INTEGER | | Last quality rating 0–5 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

**RLS:** User-scoped.

**🔴 CRITICAL BUG:** `saveTestingInteraction()` in `src/lib/actions/testing.ts` never calls `updateSrsSchedule()` or `deriveQualityRating()`. SRS is dead for all 7 testing modes. Phase 1 fix (Roadmap §1.1).

---

### PROGRESSION FEATURES CLUSTER

---

#### `camp_trails`

Predefined study paths (e.g., "12-Week ALE Prep").

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `title` | TEXT | NOT NULL | |
| `description` | TEXT | | |
| `duration_weeks` | INTEGER | | |
| `difficulty` | TEXT | | 'standard', 'intensive', 'retaker' |
| `is_published` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

---

#### `trail_days`

Individual days within a trail.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `trail_id` | UUID | FK → camp_trails(id) | |
| `day_number` | INTEGER | NOT NULL | |
| `title` | TEXT | | |
| `description` | TEXT | | |
| `target_subjects` | JSONB | | Array of subject codes to focus on |

---

#### `trail_steps`

Individual tasks within a trail day.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `day_id` | UUID | FK → trail_days(id) | |
| `step_order` | INTEGER | | |
| `step_type` | TEXT | | 'quiz', 'wiki_read', '3d_explore', 'reflection' |
| `config` | JSONB | | Step-specific configuration |

---

#### `user_trail_enrollments`

Which trails a user is enrolled in.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK | |
| `trail_id` | UUID | FK → camp_trails(id) | |
| `enrolled_at` | TIMESTAMPTZ | DEFAULT now() | |
| `completed_at` | TIMESTAMPTZ | nullable | |
| `status` | TEXT | | 'active', 'completed', 'abandoned' |

---

#### `user_trail_progress` / `trail_day_completions` / `session_trail_credits`

Progress tracking tables for the trail system.

| Table | Key Columns | Purpose |
|---|---|---|
| `user_trail_progress` | `user_id`, `trail_id`, `current_day`, `progress_pct` | Overall trail progress |
| `trail_day_completions` | `user_id`, `day_id`, `completed_at` | Which days are done |
| `session_trail_credits` | `session_id`, `trail_id`, `day_id` | Links quiz sessions to trail credit |

**Indexes on `trail_day_completions`:**
- **⚠️ MISSING:** `idx_trail_day_completions_user_id`
- **⚠️ MISSING:** `idx_trail_day_completions_day_id`

---

### PERSONAL WORKSPACE CLUSTER

---

#### `notes` / `note_folders`

User notes with folder organization and soft delete.

| Column (notes) | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK | |
| `folder_id` | UUID | FK → note_folders(id), nullable | |
| `title` | TEXT | | |
| `content` | TEXT | | Markdown body |
| `content_preview` | TEXT | | First ~200 chars stripped |
| `source` | TEXT | CHECK IN ('wiki', 'quiz', 'manual') | |
| `source_label` | TEXT | | Human label for source |
| `pinned` | BOOLEAN | DEFAULT false | |
| `archived_at` | TIMESTAMPTZ | nullable | Soft delete |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

---

#### `analytics_events`

Behavioral telemetry for product analytics.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | nullable | Anonymous events allowed |
| `event_type` | TEXT | NOT NULL | |
| `event_data` | JSONB | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**🔴 Bug:** RLS blocks anonymous inserts. INSERT policy needs fix: allow `user_id IS NULL`.

---

#### `feature_flags`

Application feature flags.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `key` | TEXT | UNIQUE, NOT NULL | Flag name |
| `enabled` | BOOLEAN | DEFAULT false | |
| `description` | TEXT | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

---

## Known Trigger Functions

| Trigger Name | Table | Event | Function | Status |
|---|---|---|---|---|
| `snapshot_readiness_on_session_complete` | `quiz_sessions` | AFTER UPDATE (when `status` → 'completed') | Reads `user_global_stats.global_readiness_score`, writes to `readiness_score_snapshots` | **🔴 BROKEN: Hardcodes `'{}'::jsonb` for sub_scores** |
| EMA mastery update trigger | `user_interactions` | AFTER INSERT | Updates `user_node_mastery.current_mastery_weight` using EMA formula | Working |
| `update_updated_at_column()` | Multiple | BEFORE UPDATE | Sets `updated_at = now()` | **⚠️ Missing on 8 tables** |

**⚠️ ACTION REQUIRED:** Identify which 8 tables are missing the `updated_at` trigger. Run:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT event_object_table FROM information_schema.triggers
    WHERE trigger_name LIKE '%updated_at%'
  );
```

---

## Missing Indexes Summary (Must-Fix Before Feature Work)

```sql
-- Quiz engine (highest traffic — fix first)
CREATE INDEX idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_question_id ON public.user_interactions(question_id);

-- Content lookups
CREATE INDEX idx_wiki_article_taxonomy_node_id ON public.wiki_article_taxonomy(node_id);
CREATE INDEX idx_spatial_hotspots_model_id ON public.spatial_hotspots(model_id);
CREATE INDEX idx_spatial_hotspots_node_id ON public.spatial_hotspots(node_id);

-- Analytics
CREATE INDEX idx_readiness_snapshots_user_id ON public.readiness_score_snapshots(user_id);

-- Trail completions
CREATE INDEX idx_trail_day_completions_user_id ON public.trail_day_completions(user_id);
CREATE INDEX idx_trail_day_completions_day_id ON public.trail_day_completions(day_id);
```

---

## Tables Planned But Not Yet Created

These are referenced in the Product Roadmap (Migrations 039–055) and Five Critical Features. **None exist yet.**

| Migration | Table(s) | Feature |
|---|---|---|
| 039 | ALTER `user_global_stats` ADD `theta` | IRT ability parameter |
| 040 | `user_streaks` | Daily streak system |
| 041 | `heatmap_snapshots` | Heatmap delta tracking |
| 042 | `notification_preferences` | Push notification settings |
| 043 | `reengagement_emails` | Re-engagement email tracking |
| 044 | `referral_codes`, `referral_conversions` | Referral program |
| 045 | `study_schedule` | Study calendar |
| 046 | `campfire_threads`, `campfire_replies`, `campfire_votes` | Campfire Community |
| 047 | `passer_profiles`, `hall_of_passers` | Passer story system |
| 048 | `exam_outcomes` | Post-exam outcome tracking |
| 049 | `nps_responses` | NPS survey |
| 050 | `user_consents` | Data consent collection |
| 051 | `guarantee_tracking` | Guarantee Pro tier |
| 052 | `institutions`, `institution_memberships`, `institution_licenses` | Institutional dashboard |
| 053 | `brand_configs` | White-label engine |
| 054 | ALTER `wiki_articles` ADD `search_vector` + GIN index | Wiki full-text search |
| 055 | MATERIALIZED VIEW `activation_funnel` | Activation tracking |
| — | `passer_stories` | Feature 1a |
| — | `community_channels` | Features 1b, 1e |
| — | `study_pods`, `pod_members` | Feature 1d |
| — | `design_problems`, `design_problem_sessions` | Feature 3 (Area C) |

---

*Document version: 2026-03-26 · Pre-implementation baseline*
*Regenerate after every migration using the procedure in section 1.*



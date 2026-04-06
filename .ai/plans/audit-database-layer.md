# Audit: Database Layer

**Audit Date:** 2026-04-07  
**Auditor:** Project Panopticon V5  
**Domain:** Database Schema, Supabase Migrations, RLS Policies, Query Patterns, Data Mutations

---

## 1. Schema Overview

### 1.1 Core Tables

**Source:** `DATABASE_SCHEMA.sql` (1,210 lines, 72 tables, 1 view)

**profiles** (lines 10–37)
```sql
CREATE TABLE profiles (
  id                                       UUID NOT NULL,
  full_name                                TEXT,
  display_name                             TEXT,
  avatar_url                               TEXT,
  user_type                                TEXT DEFAULT 'reviewee',
  discipline_id                            UUID,
  target_exam_date                         DATE,
  school_or_institution                    TEXT,
  onboarding_completed_at                  TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ DEFAULT now(),
  updated_at                               TIMESTAMPTZ DEFAULT now(),
  preferred_study_window                   TEXT DEFAULT 'any',
  reviewer_type                            TEXT DEFAULT 'first_taker',
  previous_exam_subjects_struggled         JSONB DEFAULT '[]'::JSONB,
  enrolled_review_center                   TEXT,
  comp_exam_scores                        JSONB,
  comp_exam_date                          DATE,
  ale_result                               TEXT,
  oath_taking_date                         DATE,
  account_mode                             TEXT DEFAULT 'review_mode',
  role                                     TEXT DEFAULT 'member',
  dae_work_contexts                        TEXT[] DEFAULT '{}',
  dae_contexts_updated_at                  TIMESTAMPTZ,
  school_name                              TEXT,
  region                                   TEXT
)
```

**disciplines** (lines 39–51)
```sql
CREATE TABLE disciplines (
  discipline_id     UUID DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  acronym           TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  passing_threshold_pct    SMALLINT DEFAULT 70,
  subject_floor_pct        SMALLINT DEFAULT 50,
  exam_day_1_subjects      TEXT[] DEFAULT '{}',
  exam_day_2_subjects      TEXT[] DEFAULT '{}',
  recent_passing_rates      JSONB DEFAULT '{}'::JSONB
)
```

**organizations** (lines 53–63)
```sql
CREATE TABLE organizations (
  org_id         UUID DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  type           USER_TYPE NOT NULL DEFAULT 'regular',
  logo_url       TEXT,
  max_seats      INTEGER DEFAULT 10,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
)
```

**organization_members** (lines 65–72)
```sql
CREATE TABLE organization_members (
  id         UUID DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL,
  user_id    UUID NOT NULL,
  role       TEXT NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT now()
)
```

**user_roles** (lines 74–81)
```sql
CREATE TABLE user_roles (
  id          UUID DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  role        VARCHAR(20) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  created_by   UUID
)
```

**user_subscriptions** (lines 83–100+)
```sql
CREATE TABLE user_subscriptions (
  subscription_id              UUID DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL,
  tier                        SUBSCRIPTION_TIER DEFAULT 'free',
  status                      SUBSCRIPTION_STATUS DEFAULT 'active',
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  marketing_emails_enabled    BOOLEAN DEFAULT FALSE,
  stripe_customer_id          TEXT,
  stripe_subscription_id      TEXT,
  payrex_customer_id          TEXT,
  payrex_reference            TEXT,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  converted_from_source        TEXT,
  trial_started_at             TIMESTAMPTZ,
  readiness_score_at_conversion DOUBLE PRECISION,
  free_questions_today        INTEGER DEFAULT 0
)
```

### 1.2 Quiz & Assessment Tables

**quiz_sessions** (inferred from server actions)
- `session_id`, `user_id`, `status` ('active', 'completed', 'auto_submitted', 'abandoned')
- `config` (QuizSessionConfig JSONB)
- `question_ids` (UUID array)
- `started_at`, `completed_at`, `results_available_at`
- `session_discovery` (JSONB, contains `_finalization` payload)
- `test_mode` (camp, chill, practice, blindspot, custom, storm, proof_sim, endurance)

**question_interactions** (inferred from submit-answer.ts)
- `interaction_id`, `question_id`, `user_id`
- `session_id`, `is_correct`
- `time_spent_ms`, `confidence_level`
- `cage_token`, `signal_trace` (gesture events JSONB)
- `behavioral_signal` (ML classification)
- `created_at`

**questions** (inferred)
- `question_id`, `topic_id`
- `question_text`, `options` (JSONB array)
- `correct_option_id`
- `difficulty_rating`, `discrimination_rating`
- `ale_id`, `taxonomy_node_id`
- `rationale`, `misconception`
- `bloom_level`, `generation_type`

**wiki_articles** (inferred)
- `article_id`, `title`, `slug`
- `content` (MDX), `excerpt`
- `status` (draft, review, approved, published)
- `author_id`, `taxonomy_node_id`
- `ale_id`, `tags`
- `reading_time_minutes`
- `published_at`, `created_at`, `updated_at`

**taxonomy_tree** (inferred)
- `node_id`, `parent_id`
- `name`, `ale_id`, `depth`
- `exam_frequency`, `weight`
- `children` (self-referential)

### 1.3 Analytics & Stats Tables

**user_global_stats** (inferred from readiness-score)
- `user_id`, `theta` (IRT ability estimate)
- `readiness_score`, `readiness_band`
- `total_sessions`, `total_questions`
- `correct_count`, `avg_time_ms`
- `last_session_at`
- `srs_eta_count`, `srs_review_count`
- `streak_days`, `streak_updated_at`

**question_interactions** — behavioral signals, CAGE token, gesture traces

**user_computed_signals** (inferred from compute-signals cron)
- `user_id`, `velocity_7d`, `velocity_30d`
- `churn_risk_score`
- `engagement_score`
- `last_calculated_at`

**blindspot_queues** (inferred from blindspot-scan cron)
- `queue_id`, `user_id`
- `question_ids` (UUID array, 10–15 items)
- `created_at`, `expires_at`
- `status`

**analytics_events** (inferred)
- `event_id`, `user_id`
- `event_type`, `event_data` (JSONB)
- `created_at`

### 1.4 Notes & User Content

**notes** (inferred)
- `note_id`, `user_id`
- `title`, `content` (MDX/HTML)
- `anchor_type` ('topic' | 'question' | 'article')
- `anchor_id`, `anchor_title`
- `created_at`, `updated_at`

### 1.5 Subscription & Payments

**user_subscriptions** — see section 1.1
- Dual payment provider: `stripe_customer_id`, `stripe_subscription_id`, `payrex_customer_id`, `payrex_reference`
- `tier`: free | camp | insurance | institutional
- `status`: active | cancelled | past_due | trialing
- `free_questions_today` counter

---

## 2. Migrations

### 2.1 Migration Inventory (67 files)

| Migration | Count | Key Purpose |
|-----------|-------|-------------|
| `001_*.sql` – `009_*.sql` | 9 | Core schema: profiles, auth, initial tables |
| `004_add_user_roles.sql` | 1 | RBAC: user_roles, admin role helpers |
| `010_schema_hardening.sql` | 1 | RLS policies, profiles/user_mastery/analytics |
| `20260325_ceo_dashboard.sql` | 1 | CEO dashboard tables with RLS |
| `034_study_pods.sql` | 1 | Study pods (team learning) |
| `blindspot_*.sql` | ~3 | Blindspot queue tables |
| `taxonomy_*.sql` | ~4 | Taxonomy tree structure |
| `wiki_*.sql` | ~5 | Wiki article lifecycle |
| `srs_*.sql` | ~3 | Spaced repetition tables |
| `questions_*.sql` | ~4 | Question bank |
| `quiz_sessions_*.sql` | ~2 | Session tables |
| `notifications_*.sql` | ~2 | Notification system |
| `notes_*.sql` | ~2 | User notes |
| `computed_signals_*.sql` | ~1 | User signals table |
| `engagement_snapshot_*.sql` | ~1 | Materialized view for CEO |
| `sme_reviews_*.sql` | ~1 | SME review workflow |
| `transactions_*.sql` | ~1 | Financial ledger |
| `payments_*.sql` | ~1 | Payment history |

### 2.2 Key Migration Findings

**`004_add_user_roles.sql`:**
- Creates `user_roles` table with RLS enabled
- Policy: `auth.uid() = user_id` (users can read own roles only)
- Helper functions: `has_admin_role()`, `is_super_admin()`, `can_review_content()`

**`010_schema_hardening.sql`:**
- Enables RLS on: `profiles`, `user_mastery_history`, `analytics_events`
- Profiles policies: view/update/insert restricted to `auth.uid() = id`
- User mastery history: SELECT/INSERT restricted to `auth.uid() = user_id`
- Analytics events: SELECT/INSERT restricted to `auth.uid() = user_id`
- **⚠️ NOTE:** Migration explicitly mentions "Missing RLS policies" — some tables lack complete coverage

**`20260325_ceo_dashboard.sql`:**
- CEO-specific tables: `financial_entries`, `team_members`, `engagement_snapshot`
- RLS enforced for admin separation

---

## 3. RLS Policy Audit

### 3.1 Tables WITH RLS

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|-------|-------------|--------------|--------------|--------------|
| profiles | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` | — |
| user_roles | `auth.uid() = user_id` | admin role check | — | — |
| user_mastery_history | `auth.uid() = user_id` | `auth.uid() = user_id` | — | — |
| analytics_events | `auth.uid() = user_id` | `auth.uid() = user_id` | — | — |
| quiz_sessions | (inferred) | (inferred) | (inferred) | (inferred) |
| question_interactions | (inferred) | (inferred) | (inferred) | (inferred) |
| user_subscriptions | `auth.uid() = user_id` | admin only | admin only | admin only |
| organizations | org membership check | org admin | org admin | org admin |
| organization_members | org membership | org admin | org admin | org admin |
| wiki_articles | status=published OR author | author | author | admin |
| questions | admin OR review queue | admin | admin | admin |
| taxonomy_tree | `true` (public read) | admin only | admin only | — |
| blindspot_queues | `auth.uid() = user_id` | blindspot-scan cron | blindspot-scan cron | — |
| user_computed_signals | `auth.uid() = user_id` | compute-signals cron | compute-signals cron | — |

### 3.2 Overly Permissive Policies

**taxonomy_tree:** Uses `USING (true)` — allows public read access. Acceptable for reference data but risks if any sensitive metadata is embedded.

**Some tables** flagged as "Missing RLS policies" in migration 010:
- Exact tables are noted in migration comment — requires full audit sweep

### 3.3 Missing Policies

Based on migration 010 comment, several tables have incomplete RLS coverage:
- Tables needing SELECT policies that may be missing
- UPDATE/DELETE policies for admin-only tables
- CROSS-REFERENCE policies for joining tables

---

## 4. Query Patterns

### 4.1 Server Component Queries (src/lib/queries/)

**Dashboard queries** (`src/lib/actions/dashboard-page.ts`)
- `getUser()` → `supabase.auth.getUser()`
- `supabase.from('quiz_sessions').select(...)` → session history
- `supabase.from('user_global_stats').select(...)` → readiness score
- `supabase.from('taxonomy_tree').select(...)` → heatmap data

**Quiz session queries** (src/lib/quiz/)
- `supabase.from('questions').select(...)` → question selection
- `supabase.from('question_interactions').select(...)` → interaction history
- `supabase.from('taxonomy_tree').select(...)` → breadcrumb enrichment

### 4.2 Query Anti-Patterns

**N+1 in taxonomy breadcrumb enrichment** (`start-session.ts` + `buildTaxonomyBreadcrumbMap`):
- Loop over questions, fetch taxonomy node for each individually
- **Fix:** Batch fetch with `IN` clause

**Massive interaction ID exclusion** (`intelligent-routing.ts`):
- Fetches ALL previous interaction IDs to exclude from selection
- Potential 5,000+ IDs → query string length limits
- **Fix:** PostgreSQL function for server-side exclusion

**No query result caching:**
- Every page load triggers fresh DB queries
- No React Query / SWR / Next.js `cache()` tags used
- **Fix:** Add `next: { revalidate: 60 }` to fetch options

### 4.3 Materialized Views

**mv_engagement_snapshot:**
- Used in CEO dashboard for performance
- Refresh cadence: Cron-triggered (inferred from `compute-signals` cron)
- Fallback: Live `quiz_sessions` count if MV unavailable

---

## 5. Critical Findings

### FINDING-1: Incomplete RLS Coverage (Severity: HIGH)
- **Location:** `supabase/migrations/010_schema_hardening.sql`
- **Problem:** Migration explicitly notes "Missing RLS policies" for several tables
- **Impact:** Potential unauthorized read/write on sensitive tables
- **Fix Required:** Audit all 72 tables for missing RLS policies

### FINDING-2: Taxonomy Tree Public Read (Severity: MEDIUM)
- **Location:** `supabase/migrations/004_add_user_roles.sql`
- **Problem:** `taxonomy_tree` uses `USING (true)` — fully public read
- **Impact:** Any unauthenticated user can read the full exam taxonomy
- **Mitigation:** Acceptable if taxonomy is public exam content — verify no user-specific data is embedded

### FINDING-3: N+1 in Session Creation (Severity: MEDIUM)
- **Location:** `src/lib/actions/quiz-v2/start-session.ts` + `buildTaxonomyBreadcrumbMap`
- **Problem:** Fetches taxonomy node for each question in a loop
- **Impact:** Session start time scales O(n) with question count
- **Fix Required:** Batch fetch taxonomy nodes with `IN` clause

### FINDING-4: Massive Interaction Exclusion Array (Severity: HIGH)
- **Location:** `src/lib/quiz/intelligent-routing.ts`
- **Problem:** Fetches ALL previous interaction IDs (potentially 5,000+) for exclusion
- **Impact:** Query string length limits, network overhead
- **Fix Required:** PostgreSQL function to handle server-side exclusion

### FINDING-5: No Query Caching (Severity: MEDIUM)
- **Location:** All server component pages
- **Problem:** Every request triggers fresh DB queries, no caching layer
- **Impact:** Performance degradation under load
- **Fix Required:** Add `revalidate` tags or React Query for frequently-read data

### FINDING-6: No Connection Pooling Config (Severity: LOW)
- **Location:** `src/lib/supabase/server.ts`
- **Problem:** Supabase client configured without explicit pool settings
- **Impact:** Connection exhaustion under concurrent load
- **Fix:** Configure `poolingConfiguration` in Supabase client

---

## 6. File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| `DATABASE_SCHEMA.sql` | 1210 | Authoritative schema definition (72 tables) |
| `supabase/migrations/001_*.sql` – `067_*.sql` | ~67 | All migration files |
| `supabase/migrations/004_add_user_roles.sql` | ~50 | RBAC + helper functions |
| `supabase/migrations/010_schema_hardening.sql` | ~100 | RLS policies + missing policies note |
| `supabase/migrations/20260325_ceo_dashboard.sql` | ~80 | CEO-specific tables |
| `src/lib/supabase/server.ts` | ~50 | Server Supabase client factory |
| `src/lib/supabase/client.ts` | ~30 | Browser Supabase client |
| `src/lib/supabase/middleware.ts` | ~80 | Middleware auth client |
| `src/lib/supabase/admin.ts` | ~30 | Admin service client |
| `src/lib/queries/ceo/financial-queries.ts` | ~300 | CEO dashboard aggregation queries |

---

*End of Database Layer Audit*

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Implicit Permissions via RLS

**Manifestation:** RLS policies are the only gate for some operations (questions INSERT). But policies are invisible in application code.

**Impact:** Security logic is buried in database migrations, not in version-controlled application code.

**Architectural Cure:** Application-level authorization (RBAC) as primary gate, RLS as defense-in-depth:
```sql
-- RLS: defense-in-depth only
CREATE POLICY "users_can_insert_own_questions"
ON questions FOR INSERT
TO authenticated
USING (auth.uid() = author_id);

-- Application: primary gate
-- canCreateQuestion(userId) → checks user_roles.is_content_admin
```

### Pattern 2: Duplicate Capability Storage

**Manifestation:** User capabilities exist in multiple places:
- `profiles.tier` (numeric)
- `user_subscriptions.tier_id` (foreign key)
- `user_roles.role` (string)
- `dev_presets.tier_caps` (for dev mode)

**Impact:** Inconsistency — a user's effective tier differs depending on which table you query.

**Architectural Cure:** Single source of truth:
```sql
-- Computed view for user capabilities
CREATE VIEW user_capabilities AS
SELECT 
  p.id,
  p.tier,
  ut.tier_name,
  ur.role,
  CASE 
    WHEN ur.role IN ('admin', 'developer', 'sme') THEN true
    ELSE false
  END as is_content_admin
FROM profiles p
JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
JOIN subscription_tiers ut ON ut.id = us.tier_id
LEFT JOIN user_roles ur ON ur.user_id = p.id;
```

### Pattern 3: Soft Deletes Missing Indexes

**Manifestation:** Tables have `deleted_at` column but no partial indexes for active records.

**Impact:** `WHERE deleted_at IS NULL` does a full table scan on large tables.

**Architectural Cure:**
```sql
-- Add partial indexes for all soft-delete tables
CREATE INDEX idx_questions_active ON questions(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_active ON articles(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON profiles(id) WHERE last_login > NOW() - INTERVAL '30 days';
```

---

## Architectural Cure Blueprint

### Step 1: RLS Policy Audit

Review all RLS policies. Remove business-logic policies (should be in application). Keep only data-isolation policies.

### Step 2: Capability View

Create `user_capabilities` view. Update all tier checks to use this view.

### Step 3: Add Missing Indexes

Run migration to add partial indexes for soft-delete tables and frequently filtered columns.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE Omniscience SWEEP

## Exact Table Schemas (Critical Tables)

### questions (from DATABASE_SCHEMA.sql lines 150-180)

```sql
CREATE TABLE questions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text         TEXT NOT NULL,
  explanation           TEXT,
  distractors           TEXT[] NOT NULL,      -- Array of 4-5 strings
  correct_answer        SMALLINT NOT NULL,     -- 0-4 index
  difficulty            DIFFICULTY NOT NULL,   -- 'easy' | 'medium' | 'hard'
  author_id             UUID REFERENCES profiles(id),
  status                QUESTION_STATUS NOT NULL DEFAULT 'draft',
  test_modes            TEST_MODE[],           -- Array: 'camp', 'chill', 'practice', etc.
  ai_generated         BOOLEAN DEFAULT false,
  ai_confidence         DECIMAL(3,2),          -- 0.00 to 1.00
  view_count            INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

-- KEY INDEXES:
CREATE INDEX idx_questions_status ON questions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_test_modes USING GIN(questions.test_modes);
CREATE INDEX idx_questions_author ON questions(author_id);
```

### question_interactions (from DATABASE_SCHEMA.sql lines 200-230)

```sql
CREATE TABLE question_interactions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES profiles(id) NOT NULL,
  question_id           UUID REFERENCES questions(id) NOT NULL,
  session_id            UUID REFERENCES quiz_sessions(id),
  selected_answer       SMALLINT,              -- 0-4, null if skipped
  correct               BOOLEAN NOT NULL,
  confidence            DECIMAL(3,2),           -- 0.00 to 1.00
  time_spent_ms         INTEGER NOT NULL,
  cage_token            TEXT,                  -- CAGE gesture signal
  signal_trace          JSONB,                 -- Array of GestureSignalEvent
  theta_before          DECIMAL(4,2),         -- IRT ability before
  theta_after           DECIMAL(4,2),         -- IRT ability after
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- KEY INDEXES:
CREATE INDEX idx_interactions_user_question ON question_interactions(user_id, question_id);
CREATE INDEX idx_interactions_session ON question_interactions(session_id);
CREATE INDEX idx_interactions_created ON question_interactions(created_at DESC);
```

### quiz_sessions (from DATABASE_SCHEMA.sql lines 180-200)

```sql
CREATE TABLE quiz_sessions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES profiles(id) NOT NULL,
  mode                  TEST_MODE NOT NULL,
  status                SESSION_STATUS NOT NULL DEFAULT 'active',
  started_at            TIMESTAMPTZ DEFAULT now(),
  ended_at              TIMESTAMPTZ,
  duration_seconds      INTEGER NOT NULL,
  question_count        INTEGER NOT NULL,
  total_score           DECIMAL(5,2),
  percent_correct       DECIMAL(5,2),
  readiness_score_before DECIMAL(5,2),
  readiness_score_after  DECIMAL(5,2),
  metadata              JSONB,                 -- Mode-specific data
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- KEY INDEXES:
CREATE INDEX idx_sessions_user ON quiz_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_sessions_mode ON quiz_sessions(mode);
```

### user_subscriptions (from DATABASE_SCHEMA.sql lines 100-120)

```sql
CREATE TABLE user_subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES profiles(id) NOT NULL,
  tier_id                 UUID REFERENCES subscription_tiers(id) NOT NULL,
  stripe_subscription_id   TEXT UNIQUE,
  stripe_customer_id      TEXT UNIQUE,
  payrex_subscription_id  TEXT UNIQUE,
  payrex_customer_id       TEXT UNIQUE,
  status                  SUBSCRIPTION_STATUS NOT NULL DEFAULT 'active',
  current_period_start    TIMESTAMPTZ NOT NULL,
  current_period_end      TIMESTAMPTZ NOT NULL,
  cancel_at_period_end   BOOLEAN DEFAULT false,
  cancelled_at           TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- KEY INDEXES:
CREATE INDEX idx_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_subs_status ON user_subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_subs_stripe ON user_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
```

### subscription_tiers (from DATABASE_SCHEMA.sql lines 85-100)

```sql
CREATE TABLE subscription_tiers (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT NOT NULL,              -- 'Free', 'Camp', 'Insurance', 'Institutional'
  slug                TEXT UNIQUE NOT NULL,       -- 'free', 'camp', 'insurance', 'institutional'
  price_monthly_usd  DECIMAL(10,2) NOT NULL,
  price_yearly_usd    DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  payrex_price_id_monthly TEXT,
  payrex_price_id_yearly TEXT,
  features            JSONB NOT NULL,             -- Array of feature flags
  max_sessions_per_day INTEGER DEFAULT 10,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

## Exact API Payload Shapes

### Question Creation (POST /api/questions)

**Request Body:**
```json
{
  "question_text": "What is the allowable floor area ratio for a commercial building in Metro Manila?",
  "explanation": "Per the NBC of 2022, commercial buildings in Metro Manila have a FLAR of 4.0 to 10.0 depending on the zone.",
  "distractors": [
    "2.0 to 4.0",
    "4.0 to 10.0",
    "1.0 to 2.0",
    "10.0 to 15.0",
    "15.0 to 20.0"
  ],
  "correct_answer": 1,
  "difficulty": "hard",
  "taxonomy_node_id": "uuid-xxxx",
  "subject_id": "uuid-yyyy",
  "ai_generated": false
}
```

**Response (201):**
```json
{
  "id": "uuid-new-question",
  "question_text": "...",
  "explanation": "...",
  "distractors": [...],
  "correct_answer": 1,
  "difficulty": "hard",
  "status": "draft",
  "author_id": "uuid-current-user",
  "created_at": "2026-04-07T12:00:00Z"
}
```

## Hidden Database Quirks

1. **`test_modes` column uses PostgreSQL array type** — GIN indexed but cannot be joined normally.

2. **`question_interactions.signal_trace` is JSONB** — Stores full gesture sequence as JSON, not normalized.

3. **`user_subscriptions.tier_id` is FK** — Profile tier mismatch possible if subscription not active.

4. **No `questions.taxonomy_node_id`** — Questions linked to taxonomy via junction table `question_taxonomy_nodes`.

---

*Pass 3: Omniscience added 2026-04-07*

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# supabase

## Purpose

This directory contains all database migrations, seed scripts, and schema management for SlateCamp's Supabase (PostgreSQL) backend. The authoritative schema reference is `DATABASE_SCHEMA.sql` in the project root. All database work must follow the schema exactly: never hallucinate tables, foreign keys, or column types.

The supabase directory manages:
- **Schema versioning** via ordered SQL migrations
- **Seed data** for development and testing
- **Database reset and recovery** procedures

## Key Files

| File | Description |
|------|-------------|
| `DATABASE_SCHEMA.sql` | (In project root) Authoritative relational schema with 51 tables, 13 enums, 89 RLS policies, and 134 indexes. Consult before any DB work. |
| `00_DROP_ALL_TABLES.sql` | **DANGEROUS** -- Nuclear reset script that drops all tables, types, and functions. Dev only. |
| `01_RESET_AND_SEED.sql` | Safe reset script -- re-seeds baseline data with IF NOT EXISTS checks; does not drop tables. |
| `02_RUN_ALL_SEEDS.sql` | Master seed script (155KB) -- runs all quiz, analytics, and sample data seeds. |
| `03_QUIZ SEED.sql` | Quiz-specific seed data -- questions, options, solutions, and IRT parameters. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | 38 numbered SQL migration files (004-039 + dated migrations). Applied sequentially by Supabase CLI. |
| `.temp/` | Temporary working files (e.g., `cli-latest`). Not committed to production. |

## Migration Files Overview

All migrations are applied sequentially and are cumulative. Key categories:

### Core Schema (004-010)
- `004_add_user_roles.sql` -- User role and permission system
- `005_add_wiki_content_status.sql` -- Wiki article status tracking
- `006_add_3d_asset_status.sql` -- 3D Lab asset metadata
- `007_add_audit_logs.sql` -- Audit trail for compliance
- `008_notes_overhaul.sql` -- User notes and annotation system
- `009_quiz_session_fixes.sql` -- Quiz session state corrections
- `010_schema_hardening.sql` -- Security and integrity fixes

### Business Logic (011-021)
- `011_marketing_attribution_and_mastery_trigger.sql` -- Marketing attribution + IRT mastery trigger
- `012_camp_trail_and_assessment.sql` -- Camp Trail enrollment and assessment workflows
- `013_analytics_infrastructure.sql` -- Analytics and signal data
- `014_learning_science_sprint1.sql` -- Learning science data structures (Sprint 1)
- `015_learning_science_sprint2.sql` -- Learning science enhancements (Sprint 2)
- `016_learning_science_sprint3.sql` -- Learning science optimizations (Sprint 3)
- `017_fix_rls_and_fk.sql` -- RLS policy and foreign key fixes
- `018_proof_simulation_and_signals.sql` -- Proof Simulation test mode and signal computation
- `019_application_layer_schema.sql` -- Client-facing feature flags and settings
- `020_populate_feature_flags.sql` -- Default feature flag values
- `021_study_streak_and_sprint2.sql` -- Study streak tracking

### Feature Tables (032-039)
- `032_profiles_column_additions.sql` -- Profile metadata (reviewer type, study windows)
- `033_design_problems_tables.sql` -- Design problem bank for architectural exams
- `034_study_pods.sql` -- Study group and collaboration tables
- `035_oath_taking_schedules.sql` -- Professional oath ceremony scheduling
- `036_code_updates.sql` -- Code snippets and provision management
- `037_questions_practice_context.sql` -- Question context and practice metadata
- `038_readiness_anti_inflation.sql` -- Readiness Score anti-inflation rules
- `039_camp_trail_ux_enhancements.sql` -- Camp Trail UX improvements

### Dated Migrations (March 2025-March 2026)
- `20250315000000_add_test_mode_enum_values.sql` -- Test mode enum expansion (camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance)
- `20260320_wiki_article_hero_metadata.sql` -- Wiki hero image and metadata
- `20260321_wiki_bookmarks.sql` -- User wiki bookmarks
- `20260321_wiki_dsgn013_*.sql` -- Wiki content design migrations (3 parts, 28-30KB each)
- `20260324_add_attribution_columns.sql` -- Marketing attribution column additions
- `20260324_add_check_user_admin_role_rpc.sql` -- Admin role check RPC function
- `20260324_unify_rls_admin_patterns.sql` -- Unified RLS admin policy patterns
- `20260325_camp_trail_seed_data.sql` -- Camp Trail seed data
- `20260325_ceo_dashboard.sql` -- CEO Dashboard tables and views
- `20260325_testing_review_schema_gaps.sql` -- Testing and review schema gap fixes

## For AI Agents

### Working In This Directory

1. **Always consult `DATABASE_SCHEMA.sql` first** -- it is authoritative. Never assume table names, column types, or foreign key relationships.
2. **Migrations are cumulative and sequential** -- do not skip or reorder migrations. Apply them in numerical order.
3. **Use parametrized queries in application code** -- never construct SQL strings in client or server code without prepared statements.
4. **Row Level Security (RLS) is mandatory** -- all user-facing tables have RLS policies. Do not bypass with `GRANT` statements.
5. **IRT 2-parameter logistic model** -- all mastery and readiness calculations use IRT with theta, discrimination (a), and difficulty (b) parameters. Stored in `user_mastery` and `quiz_session` tables.
6. **Test mode enums** -- camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance. Use exact enum values.
7. **UUIDs for all PKs** -- use `gen_random_uuid()` or `uuid_generate_v4()`, never serial integers for user-facing data.

### Migration Best Practices

- **Always use `IF NOT EXISTS`** when creating types, extensions, or tables that might exist.
- **Never drop existing columns** in production migrations -- use `ALTER TABLE ... DROP COLUMN IF EXISTS` with explicit testing first.
- **Indexes are critical** -- new tables with foreign keys must have indexes on the FK columns (e.g., `CREATE INDEX idx_table_user_id ON table(user_id);`).
- **Transactions should be short** -- do not hold locks across multiple operations in a single migration.
- **Test locally first** -- use `supabase db reset` in a local dev environment before applying to production.

### Common Patterns

**Querying with RLS:**
```sql
-- RLS policies filter automatically based on auth.uid()
-- No additional WHERE clauses needed if policy is correct
SELECT * FROM user_mastery WHERE user_id = auth.uid();
```

**Inserting with RLS:**
```sql
-- auth.uid() is accessible in INSERT triggers and policies
INSERT INTO user_mastery (user_id, subject_id, theta, a, b)
VALUES (auth.uid(), 'LEA001', 0.5, 1.2, -0.3);
```

**Creating indexes for performance:**
```sql
-- FK columns must be indexed
CREATE INDEX idx_user_mastery_user_id ON user_mastery(user_id);

-- Composite index for frequent filters
CREATE INDEX idx_quiz_session_user_mode ON quiz_session(user_id, test_mode);

-- Partial index for active records
CREATE INDEX idx_camp_trail_active ON camp_trail_enrollment(user_id)
  WHERE status = 'active';
```

**Using enums correctly:**
```sql
-- Enums are type-safe and prevent invalid values
ALTER TABLE quiz_session ADD COLUMN test_mode public.test_mode DEFAULT 'camp';

-- Valid values: camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance
INSERT INTO quiz_session (user_id, test_mode) VALUES (uuid, 'camp');
```

### Testing Requirements

Before committing a migration:

1. **Syntax validation** -- SQL must be valid PostgreSQL 15+
2. **RLS policy check** -- ensure `SELECT * FROM table;` behaves correctly with auth context
3. **Index performance** -- new tables with >1000 rows should have indexes on all FK and filtered columns
4. **FK integrity** -- all foreign key references must exist in target table
5. **Enum values** -- if adding to an existing enum, use `ALTER TYPE ... ADD VALUE` with explicit position

**Local testing example:**
```bash
# Reset local database with all migrations
supabase db reset

# Verify schema matches authoritative reference
psql supabase_url -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Check RLS policies are applied
psql supabase_url -c "SELECT table_name, COUNT(*) FROM pg_policies GROUP BY table_name;"
```

## Dependencies

### Internal

- **`DATABASE_SCHEMA.sql`** -- Authoritative schema reference. Regenerated from live Supabase instance.
- **Auth system** -- Supabase auth with JWT tokens; `auth.users` table referenced by all user-facing tables via FK.
- **IRT calculations** -- Mastery and readiness scores use stored `theta`, `a`, `b` parameters; triggers compute readiness on quiz completion.

### External

- **Supabase CLI** -- applies migrations via `supabase db push` (local) or automated deploys
- **PostgreSQL 15+** -- Supabase uses PostgreSQL 15. All SQL must be compatible.
- **Supabase auth** -- JWT-based auth with `auth.uid()` context variable available in RLS policies
- **pg_graphql** -- GraphQL API auto-generated from schema (extension: `CREATE EXTENSION pg_graphql`)
- **pg_stat_statements** -- Query performance monitoring (extension: `CREATE EXTENSION pg_stat_statements`)
- **pgcrypto** -- Encryption utilities (extension: `CREATE EXTENSION pgcrypto`)
- **pgjwt** -- JWT generation and verification (extension: `CREATE EXTENSION pgjwt`)
- **supabase_vault** -- Secrets management (extension: `CREATE EXTENSION supabase_vault`)
- **uuid-ossp** -- UUID utilities (extension: `CREATE EXTENSION uuid-ossp`)

<!-- MANUAL: -->

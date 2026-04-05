# Data Model and Backend Architecture

**Date:** 2026-04-05

SlateCamp uses Supabase/Postgres as the primary system of record for application data, auth-adjacent profile data, learning telemetry, and content management.

## Current Snapshot

- `DATABASE_SCHEMA.sql` contains 72 `CREATE TABLE` definitions.
- `supabase/migrations/` contains 64 migration files.
- Migration files currently include 145 `CREATE POLICY` statements.
- `DATABASE_SCHEMA.sql` remains the quickest schema snapshot, but policy history is expressed across migrations.

## Core Entity Areas

1. Users and roles
   - `profiles`
   - `user_roles`
   - Supabase `auth.users` linkage
2. Learning state
   - `quiz_sessions`
   - `user_interactions`
   - `user_node_mastery`
   - SRS- and readiness-related support tables
3. Content and taxonomy
   - `taxonomy_tree`
   - `wiki_articles`
   - `questions`
4. Business and operations
   - subscription/payment tables
   - admin/review workflow tables
   - analytics/supporting reporting tables

## Backend Shape

- Authenticated server access is handled through the Supabase server helpers in [`src/lib/supabase/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/supabase).
- Mutations flow through server actions in [`src/lib/actions/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions).
- Active quiz-session mutation paths now live under [`src/lib/actions/quiz-v2/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions/quiz-v2), while learning-model math remains under [`src/lib/srs/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/srs).

## RLS Notes

- Policy definitions are maintained in migrations, not in a single consolidated policy manifest.
- Development impersonation relies on server-side helpers and service-role-assisted flows for local debugging, rather than broad client-side bypasses.

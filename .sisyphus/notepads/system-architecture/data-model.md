# Data Model & Backend Architecture

**Date:** 2026-04-04

SlateCamp relies entirely on **Supabase (PostgreSQL)** for its persistent data layer, authentication, and security model.

## Core Database Metrics
- **Tables:** 51 primary tables.
- **Security:** 50 out of 51 tables enforce Row Level Security (RLS) with 89+ distinct policies.
- **Migrations:** Managed via 38 sequential SQL migrations in `supabase/migrations/`.
- **Source of Truth:** `DATABASE_SCHEMA.sql` is the authoritative manifest for all tables and relations.

## Key Entities
1. **Users & Auth (`profiles`, `user_roles`)**
   - Extends Supabase `auth.users`.
   - Supports RBAC through `user_roles` (`super_admin`, `content_admin`, `sme_reviewer`).

2. **Pedagogy & Mastery (`user_node_mastery`, `quiz_sessions`, `user_interactions`)**
   - `quiz_sessions`: Tracks the active state, mode, and configurations of 7 different testing modes.
   - `user_interactions`: The atomic log of every question answered, time spent, and confidence level.
   - `user_node_mastery`: Aggregated IRT `theta` values mapped strictly to the taxonomy tree.

3. **Content Taxonomy (`taxonomy_tree`, `wiki_articles`, `questions`)**
   - SlateCamp is deeply hierarchical. All content is anchored to a central `taxonomy_tree`.
   - `wiki_articles`: MDX-powered content that embeds active-learning widgets.
   - `questions`: Structured assessment items calibrated with `difficulty` (b-parameter) and `discrimination` (a-parameter).

## Security Philosophy (RLS)
The app relies heavily on Postgres RLS rather than application-layer filtering.
- Client-side reads (if any) are intrinsically filtered to `auth.uid()`.
- During Local Development, the `DEV_FORCE_USER_ID` strategy swaps the client to a `service_role` key to bypass RLS for server-side fetches, simulating a fully authenticated environment without a JWT cookie.

# Current Supabase Context

This document records the connected Supabase project context used for the first AI Audit Admin UI implementation.

## Project

- Project name: `SlateCamp`
- Project ref/id: `hrpdwqurngnyajuhbkdg`
- Region: `ap-northeast-1`
- Database: Postgres 17.x
- Organization plan: Free

## Relevant existing public tables

| Table | Approx rows | Relevance |
|---|---:|---|
| `wiki_articles` | 567 | Primary content target for audit. |
| `questions` | 7,159 | Main question target for audit. |
| `design_scenario_questions` | 249 | Secondary question target for audit. |
| `wiki_article_sources` | 1,110 | Existing source/citation rows for articles. |
| `wiki_article_taxonomy` | 567 | Links articles to taxonomy. |
| `taxonomy_tree` | 559 | Topic hierarchy/filtering. |
| `user_roles` | 1 | Existing role/admin access context. |
| `admin_draft_previews` | 30 | Potentially useful pattern for admin drafts/logging. |

## Installed useful extensions

- `vector` / pgvector is installed.
- `pg_cron` is available.
- `pgmq` is available.
- `pg_net` is available.
- `pgcrypto` is installed.

The UI MVP does not require vector search, pgmq, pg_net, or AI. These are future integration possibilities.

## RLS

Most existing tables have RLS enabled. All new AI audit tables should also enable RLS and use the existing admin access pattern.

## Important implementation note

Do not assume exact column names for `wiki_articles`, `questions`, or `user_roles`. Codex must inspect generated Supabase TypeScript types and existing code references.

Recommended repository searches:

```bash
rg "wiki_articles"
rg "questions"
rg "wiki_article_sources"
rg "user_roles"
rg "admin"
rg "is_admin|isAdmin|requireAdmin|AdminLayout"
```

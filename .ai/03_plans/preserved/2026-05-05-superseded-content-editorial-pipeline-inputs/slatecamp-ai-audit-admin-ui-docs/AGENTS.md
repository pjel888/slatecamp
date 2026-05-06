# Codex Instructions for SlateCamp AI Audit Admin UI

## Mission

Implement the first version of the permanent AI Audit admin dashboard for SlateCamp.

The dashboard must manage audit workflow state for existing articles and questions, but it must **not** perform AI fact-checking yet.

## Absolute constraints

- Do not integrate AI model APIs.
- Do not call Kimi, Qwen, DeepSeek, OpenAI, Perplexity, or Valyu.
- Do not mutate live `wiki_articles` or `questions` content.
- Do not auto-publish anything.
- Do not expose admin audit data to non-admin users.
- Do not place service-role keys in client-side code.
- Do not assume unknown table columns; inspect the codebase and generated Supabase types first.
- Reuse existing SlateCamp admin layout, auth guards, Supabase clients, table components, badges, buttons, and design system conventions.

## What to inspect first

Before coding, search the repository for:

- Existing `/admin` routes.
- Existing admin layout/sidebar/nav components.
- Existing Supabase client/server helpers.
- Existing auth/admin guard logic.
- Existing `user_roles` usage.
- Existing data table, badge, tabs, modal/dialog/drawer components.
- Existing content edit/admin pages for `wiki_articles`, `questions`, or `admin_draft_previews`.
- Existing TypeScript database types.

## Current database realities

Known public tables from the connected project:

- `wiki_articles` has 567 rows.
- `questions` has 7,159 rows.
- `design_scenario_questions` has 249 rows.
- `wiki_article_sources` has 1,110 rows.
- `user_roles` exists and is likely relevant to admin access.

Exact columns must be verified from the repository or Supabase generated types.

## Recommended implementation sequence

1. Add audit tracking migration.
2. Add server-side data access helpers.
3. Add `/admin/ai-audit` route shell.
4. Add summary cards.
5. Add article audit table.
6. Add question audit table.
7. Add findings tab/table.
8. Add runs tab/table.
9. Add manual finding creation.
10. Add review decision/status update actions.
11. Add filters and pagination.
12. Add acceptance tests/manual QA.

## UX principle

This must be a **workflow/status dashboard**, not only a raw log.

Every page should make clear:

- what has been checked,
- what has not been checked,
- what is blocked,
- what needs a source check,
- what needs correction,
- what needs human review,
- what is approved.

## Data principle

The audit module should create audit rows and status cache rows only. It should not rewrite production content.

Use a polymorphic target model:

```text
target_type = wiki_article | question | design_scenario_question | source | other
target_id = string form of the row id
```

This avoids dangerous assumptions about ID types and lets the audit module support multiple target tables.

## Security principle

All new public tables must have RLS enabled. Follow the existing SlateCamp admin authorization pattern. If a helper function like `is_admin()` exists, reuse it. If not, create one only after inspecting `user_roles` schema.

Supabase documentation recommends enabling Row Level Security for public schema tables and creating policies to restrict access.

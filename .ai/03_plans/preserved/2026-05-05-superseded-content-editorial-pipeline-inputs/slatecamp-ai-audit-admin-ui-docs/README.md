# SlateCamp AI Audit Admin UI Documentation Pack

This pack is for implementing the first permanent SlateCamp AI Audit module inside `/admin`.

The current task is **UI/workflow infrastructure only**. Do **not** integrate Kimi, Qwen, DeepSeek, OpenAI, Perplexity, Valyu, or any other AI model in this implementation pass.

Build a workflow/status dashboard that can monitor, filter, and manage article/question audit readiness. The module should be ready for future AI workers, but the first version should support manual and static-status workflows.

## Current Supabase snapshot

The connected SlateCamp Supabase project currently has approximately:

| Table | Rows | Notes |
|---|---:|---|
| `public.wiki_articles` | 567 | Primary article corpus. |
| `public.questions` | 7,159 | Main question bank. |
| `public.design_scenario_questions` | 249 | Design-scenario question bank. |
| `public.wiki_article_sources` | 1,110 | Existing structured article citations. |
| `public.wiki_article_taxonomy` | 567 | Article taxonomy links. |
| `public.taxonomy_tree` | 559 | Topic/taxonomy tree. |
| `public.user_roles` | 1 | Existing role/admin-related table. |

`pgvector` is already installed in Supabase, but this UI pass does not need embeddings.

## Primary goal

Create `/admin/ai-audit` as a workflow/status dashboard that answers:

- Which articles/questions have not been audited yet?
- Which phase is each article/question in?
- Which rows are green/yellow/orange/red/gray?
- Which items have open findings?
- Which findings need source checks, corrections, validation, or human review?
- What runs/actions have happened so far?
- What manual admin decisions were made?

## Deliverables Codex should implement

1. Supabase migration for AI audit tracking tables.
2. Admin UI routes under `/admin/ai-audit`.
3. Dashboard summary cards.
4. Article audit table.
5. Question audit table.
6. Findings log.
7. Runs log.
8. Detail pages or drawers for article/question audit context.
9. Manual actions: create finding, update status, add review decision, mark reviewed.
10. Server-side Supabase calls following existing SlateCamp patterns.

## Non-goals for this implementation pass

Do not build:

- AI model API integration.
- Automated fact-checking.
- Article rewriting.
- Question rewriting.
- Source retrieval/RAG.
- Perplexity/Valyu/Qwen/DeepSeek/Kimi payment or provider settings.
- Direct overwrite of live article/question content.

This UI is the permanent foundation where future AI results will be logged and reviewed.

## Suggested reading order

1. `AGENTS.md`
2. `docs/01-product-brief.md`
3. `docs/02-current-supabase-context.md`
4. `docs/03-mvp-scope.md`
5. `docs/04-route-map.md`
6. `docs/05-workflow-status-model.md`
7. `supabase/01-audit-tables-migration-spec.md`
8. `docs/06-dashboard-ux.md`
9. `queries/01-supabase-query-patterns.md`
10. `checklists/acceptance-criteria.md`

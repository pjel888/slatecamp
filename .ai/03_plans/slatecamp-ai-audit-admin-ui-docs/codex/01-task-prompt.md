# Codex Task Prompt

Use this prompt when asking Codex/codebase AI to implement the feature.

```text
Implement the first version of SlateCamp's permanent AI Audit admin module.

Read the documentation pack in slatecamp-ai-audit-admin-ui-docs. The current scope is admin UI and audit workflow/logging only. Do not integrate any AI providers yet.

Requirements:
1. Add Supabase migration for AI audit tracking tables:
   - ai_audit_runs
   - ai_audit_items
   - ai_audit_findings
   - ai_change_proposals
   - ai_review_decisions
   - ai_audit_status_cache
2. Enable RLS and use existing admin authorization patterns.
3. Add /admin/ai-audit route and admin nav item.
4. Build dashboard summary cards and tabs/pages for Articles, Questions, Findings, Runs.
5. List real wiki_articles/questions/design_scenario_questions with audit status.
6. Treat missing audit status rows as Not checked.
7. Add manual finding creation and finding status updates.
8. Log human/admin decisions in ai_review_decisions.
9. Do not call AI APIs.
10. Do not mutate live article/question content.

Before coding, inspect existing admin routes, Supabase helpers, auth guards, UI components, and generated database types. Reuse existing project conventions.

After implementation, run typecheck/lint/build and verify admin-only access.
```

# Acceptance Criteria

## Routing

- [ ] `/admin/ai-audit` exists and is admin-only.
- [ ] `/admin/ai-audit/articles` exists or Articles tab exists.
- [ ] `/admin/ai-audit/questions` exists or Questions tab exists.
- [ ] `/admin/ai-audit/findings` exists or Findings tab exists.
- [ ] `/admin/ai-audit/runs` exists or Runs tab exists.
- [ ] Admin navigation includes AI Audit.

## Database

- [ ] Migration creates `ai_audit_runs`.
- [ ] Migration creates `ai_audit_items`.
- [ ] Migration creates `ai_audit_findings`.
- [ ] Migration creates `ai_change_proposals`.
- [ ] Migration creates `ai_review_decisions`.
- [ ] Migration creates `ai_audit_status_cache`.
- [ ] RLS is enabled on all new tables.
- [ ] Admin-only policies or server-only access are implemented safely.
- [ ] Indexes are added for target/status/severity queries.

## Dashboard

- [ ] Summary cards show real counts.
- [ ] Missing status rows appear as `Not checked`.
- [ ] Open findings count is visible.
- [ ] Needs human review count is visible.
- [ ] High-priority queue is visible or included in findings table.

## Article table

- [ ] Lists real `wiki_articles` rows.
- [ ] Shows audit phase/status.
- [ ] Shows source count if possible.
- [ ] Shows open findings count.
- [ ] Supports search/filter/pagination.
- [ ] Row detail/drawer works.

## Question table

- [ ] Lists real `questions` rows.
- [ ] Supports `design_scenario_questions` or clearly defers them.
- [ ] Shows audit phase/status.
- [ ] Shows open findings count.
- [ ] Supports search/filter/pagination.

## Findings

- [ ] Admin can create manual finding.
- [ ] Finding appears in findings list.
- [ ] Finding updates target status cache.
- [ ] Admin can confirm/reject/resolve finding.
- [ ] Each status action creates a review decision row.

## Safety

- [ ] No AI providers are called.
- [ ] No live article/question content is overwritten.
- [ ] No service-role key is exposed client-side.
- [ ] Non-admin users cannot access audit pages.

## UX

- [ ] Status colors are consistent.
- [ ] Empty states are understandable.
- [ ] Loading states exist.
- [ ] Errors are handled.
- [ ] Filters can be cleared.

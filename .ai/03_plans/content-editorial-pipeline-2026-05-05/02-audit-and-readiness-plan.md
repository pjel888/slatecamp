# Audit and Readiness Plan

## Objective

Before implementation, verify the current pipeline state from the repo and local corpus. Do not rely on stale reports.

`readiness-report.md` is the formal Phase 0 gate. It must reconcile actual repo state against this plan pack and return one explicit decision: GO, CONDITIONAL GO, or NO-GO. It should not merely summarize the repo; it must identify what is ready, what is assumed, what is missing, and what must be resolved before implementation.

## Readiness audit outputs

Create these files in this folder during Phase 0:

- `readiness-report.md`
- `current-script-map.md`
- `current-artifact-map.md`
- `admin-ai-audit-current-state.md`
- `state-doc-contradictions.md`
- `pilot-candidate-shortlist.md`

## Required sources to inspect

### Repo and scripts
- `package.json`
- `scripts/content-audit/`
- `scripts/content-audit/lib.ts`
- `scripts/content-audit/sync-run-log-to-admin-audit.ts`
- `src/app/admin/ai-audit/`
- `src/lib/actions/admin/ai-audit.ts`
- `src/lib/queries/admin-ai-audit.ts`
- `supabase/` AI audit migrations

### Local corpus
- `.ai/content-audit-export/manifest.json`
- `.ai/content-audit-export/export-summary.json`
- `.ai/content-audit-export/run-log.json`
- `.ai/content-audit-export/articles/**/article-metadata.json`
- `.ai/content-audit-export/articles/**/normalized.md`
- `.ai/content-audit-export/articles/**/ui-blocks.json`
- `.ai/content-audit-export/articles/**/linked-questions.json`
- `.ai/content-audit-export/articles/**/sources.json`

### State documents
- `.ai/14_fact_checking/article-flagging-pass-tracker.md`
- `.ai/15_content_optimization/batch-tracker.md`
- `.ai/15_content_optimization/final-audit-report.md`
- `.ai/15_content_optimization/final-production-closure-report.md`
- `.ai/15_content_optimization/source-backlog-102.md`
- `.ai/10_state/current-state.md`

## Readiness questions

1. How many article bundles exist locally?
2. How many have non-empty `sources.json`?
3. How many have linked questions?
4. How many have existing `candidate.md` and diff reports?
5. How many have UI placeholders?
6. How many contain raw unresolved `[SLATECAMP_UI_BLOCK:]` in candidate or Supabase content?
7. Which content-audit scripts already produce outputs needed by the new pipeline?
8. Which admin audit tables and routes already exist?
9. Which state documents contradict each other?
10. Which articles are best for a 20-article pilot?

## Readiness commands

Run from repo root:

```bash
bun run content-audit:pull -- --dry-run --limit 1
bun run type-check
git diff --check
```

Use Python for corpus counts instead of shell-only grep where file counts are large.

## Exit criteria

Phase 0 is complete only when the readiness report states:

- what exists
- what is stale
- what can be reused
- what must be built
- what must not be touched
- exact pilot candidate list
- exact validation commands for Phase 1

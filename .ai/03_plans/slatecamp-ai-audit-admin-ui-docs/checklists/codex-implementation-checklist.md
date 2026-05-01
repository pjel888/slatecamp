# Codex Implementation Checklist

Use this checklist while coding.

## Before coding

- [ ] Inspect existing admin route patterns.
- [ ] Inspect existing Supabase helpers.
- [ ] Inspect admin auth/role logic.
- [ ] Inspect existing UI components.
- [ ] Inspect `wiki_articles`, `questions`, `wiki_article_sources` usage.

## Database

- [ ] Create migration.
- [ ] Add tables.
- [ ] Add indexes.
- [ ] Add RLS.
- [ ] Add/update generated types if applicable.

## Data layer

- [ ] `getAiAuditSummary`.
- [ ] `getAiAuditArticles`.
- [ ] `getAiAuditQuestions`.
- [ ] `getAiAuditFindings`.
- [ ] `getAiAuditRuns`.
- [ ] `createManualFinding`.
- [ ] `updateFindingStatus`.
- [ ] `markTargetReviewed`.
- [ ] `approveTarget`.
- [ ] `recomputeAuditStatusCache`.

## UI

- [ ] Add route shell.
- [ ] Add nav item.
- [ ] Add tabs.
- [ ] Add summary cards.
- [ ] Add tables.
- [ ] Add filters.
- [ ] Add manual finding dialog.
- [ ] Add detail drawer/page.
- [ ] Add loading/error/empty states.

## Final checks

- [ ] Typecheck.
- [ ] Lint.
- [ ] Build.
- [ ] Manual QA.
- [ ] Confirm no AI integration.

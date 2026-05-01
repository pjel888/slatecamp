# 05 — Review and Safety Checklist

## Pre-edit checklist

- [ ] Article folder selected.
- [ ] `article-metadata.json` read.
- [ ] `normalized.md` read.
- [ ] `ui-blocks.json` read if placeholders exist.
- [ ] `linked-questions.json` read for question impact.
- [ ] `sources.json` read for available evidence.
- [ ] `taxonomy.json` read for scope/context.
- [ ] Review target and evidence requirement are clear.

## During-edit checklist

- [ ] Edits are made in `normalized.md` only.
- [ ] `original.md` remains unchanged.
- [ ] `candidate.md` is not manually edited.
- [ ] UI placeholders remain intact.
- [ ] No raw UI block is changed; `ui-block-edits.json` is only a future-edit ledger and is not an apply path.
- [ ] Factual edits cite evidence.
- [ ] Linked question impact is recorded.
- [ ] Question changes are placed under `question-edits/<question_id>.json` only.

## Post-edit local safety checks

Run:

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
bun run content-audit:diff -- --article-id <article_id> --summary
bun run content-audit:validate -- --article-id <article_id> --summary
```

Then confirm:

- [ ] `compose-report.json` has no blockers.
- [ ] `diff-report.json` exists.
- [ ] `validation-report.json` has no blockers.
- [ ] `candidate.md` exists.
- [ ] No unresolved placeholders remain.
- [ ] UI blocks were reinserted exactly; intentional raw UI block edits are not supported by the current compose/push path.
- [ ] Diff is limited to intended prose/question-adjacent changes.

## Push dry-run checklist

Run:

```bash
bun run content-audit:push:dry-run -- --article-id <article_id>
```

Confirm:

- [ ] `push-report.json` has no blockers.
- [ ] `stale_check_passed` is true.
- [ ] `pushed` is false in dry-run.
- [ ] `remote_hash_before` matches the exported baseline.
- [ ] `candidate_hash` matches the reviewed candidate.

## Apply checklist

Before article apply:

- [ ] Human reviewer approved the exact diff.
- [ ] Push dry-run passed after the latest edit.
- [ ] No generated report was hand-edited to silence blockers.
- [ ] Reviewer ID and note are ready if used.

Apply:

```bash
bun run content-audit:push:apply -- --article-id <article_id> --reviewer-id <reviewer_id> --note "<review note>"
```

Before question apply:

- [ ] `question-edits/<question_id>.json` exists.
- [ ] `baseline_hash` matches the exported question or dry-run expectation.
- [ ] High-risk answer-key changes have evidence and approval.
- [ ] Question dry-run passed.

Apply:

```bash
bun run content-audit:push-question:apply -- --question-id <question_id>
```

## Hard blockers

Do not apply if any are true:

- Missing `original.md`.
- Missing or stale `candidate.md` that cannot auto-compose.
- Missing `ui-blocks.json` for an article with placeholders.
- Candidate content is a no-op match for `original.md` when an apply was expected.
- Unresolved placeholders.
- UI block raw content loss.
- `diff-report.json` reports unsafe push.
- `validation-report.json` has blockers.
- Push dry-run has blockers.
- Remote stale check fails.
- Question baseline hash does not match remote.
- Bulk apply is attempted without the exact confirmation phrase.
- Unknown or unparseable UI blocks are present and no explicit reviewed `--force` decision exists.

## Bulk apply guardrail

Bulk apply requires the exact phrase:

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

Prefer article-by-article apply during editorial rollout. Use bulk apply only after a reviewed batch has clean validation and dry-run reports.

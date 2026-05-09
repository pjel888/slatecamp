# 05 — Editing Workflow and Roundtrip Protocol

Generated: `2026-05-09T05:14:46.925474+00:00`

## Non-negotiable file rules

- Edit article prose in `normalized.md` only.
- Do not hand-edit `candidate.md`; generate it through the compose pipeline.
- Do not edit `original.md`; it is the exported baseline.
- Do not edit `linked-questions.json`; create `question-edits/<question_id>.json` files.
- Preserve custom UI block placeholders in `normalized.md` unless intentionally adding/removing a block through the governed UI-block workflow.
- Keep `ui-blocks.json` hash metadata synchronized with `normalized.md` when content changes.

## Fresh mirror protocol

When a fresh local import from Supabase is needed:

```bash
backup_root="$HOME/.hermes/backups/slatecamp-content-audit-export"
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p "$backup_root"
mv .ai/content-audit-export "$backup_root/content-audit-export-$stamp"
bun run content-audit:pull
bun run content-audit:normalize
bun run content-audit:validate -- --summary
```

Do not delete the old mirror. Move it to a backup outside the repo.

## Article edit protocol

For each article:

1. Read `article-metadata.json`, `taxonomy.json`, `sources.json`, `ui-blocks.json`, `normalized.md`, and `linked-questions.json`.
2. Build article source ledger from approved source packs / 001 raw files / official sources.
3. Rewrite only source-supported claims in `normalized.md`.
4. Leave component placeholders intact unless adding or replacing a block by protocol.
5. Update `ui-blocks.json` `normalized_content_hash` when `normalized.md` changes.
6. Run compose:
   - `bun run content-audit:compose -- --article-id <article_id> --overwrite`
7. Run diff:
   - `bun run content-audit:diff -- --article-id <article_id>`
8. Validate:
   - `bun run content-audit:validate -- --article-id <article_id>`
9. Dry-run push only after local review:
   - `bun run content-audit:push:dry-run -- --article-id <article_id>`
10. Apply only after explicit approval:
   - `bun run content-audit:push:apply -- --article-id <article_id> --note "<batch note>"`

## Question edit protocol

For each question:

1. Read the question from `linked-questions.json`.
2. Identify article objective and source locator.
3. Decide edit class:
   - clarity/rationale only;
   - option wording;
   - stem rewrite;
   - answer-key change;
   - quarantine/remove from batch.
4. Create `question-edits/<question_id>.json` with baseline hash and full proposed payload.
5. Validate question edit output. Do not assume broad `question-improvement` validators cover per-article `question-edits/<question_id>.json` unless confirmed by script behavior.
6. Run exact-ID dry-run push:
   - `bun run content-audit:push-question:dry-run -- --question-id <question_id>`
7. Apply only after explicit approval and source review:
   - `bun run content-audit:push-question:apply -- --question-id <question_id>`

### Dedicated question-edits validation requirement

Before scaled question editing, add or confirm a validator that reads `articles/**/question-edits/*.json` and checks: baseline hash, allowed fields, exactly one defensible key, option count, rationale shape, source locator, answer-key-change review metadata, and exact-ID push readiness.

## Bulk production protocol

Use bulk commands only after pilot and batch validators are stable:

```bash
bun run content-audit:article-improvement-jobs
bun run content-audit:article-improvement-run
bun run content-audit:article-improvement-validate
bun run content-audit:article-improvement-diff-report

bun run content-audit:question-improvement-jobs
bun run content-audit:question-improvement-run
bun run content-audit:question-improvement-validate
bun run content-audit:question-improvement-diff-report
```

Do not bulk apply without exact batch manifest, dry-run report, and explicit approval.

## Placeholder repair protocol

If raw `[SLATECAMP_UI_BLOCK:...]` appears in Supabase/published content, repair through candidate composition and push with placeholder repair flag:

```bash
bun run content-audit:push:apply -- --article-id <id> --repair-placeholders --note "Repair raw SlateCamp UI placeholders"
```

## Evidence to collect per batch

- Git branch and status summary before/after.
- Article IDs and question IDs changed.
- Source ledger paths.
- Validator output paths.
- Diff report paths.
- Dry-run output paths.
- Review memo paths.
- Remote verification output after apply.

## Isolation rule

Current repo branch has a large dirty working tree. Future implementation should use a dedicated branch/worktree or a carefully scoped commit that includes only the intended content artifacts. Do not stage broad `.ai/content-audit-export` changes without review.

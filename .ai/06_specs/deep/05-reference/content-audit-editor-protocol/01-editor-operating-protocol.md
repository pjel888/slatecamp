# 01 — Editor Operating Protocol

## Operating goal

Turn exported SlateCamp articles and linked questions into safe, reviewable edits without losing custom UI, breaking article interactivity, or pushing stale data back to Supabase.

## Bundle anatomy

Each generated article bundle normally lives at:

```text
.ai/content-audit-export/articles/<slug-or-id--article_id>/
```

Expected files include:

- `original.md` — immutable Supabase baseline from `wiki_articles.content`.
- `normalized.md` — editable markdown surface with UI placeholders.
- `ui-blocks.json` — exact preserved UI/custom blocks.
- `article-metadata.json` — IDs, hashes, counts, export run metadata.
- `linked-questions.json` — exported `questions` rows for context; read-only.
- `sources.json` — exported article sources; read-only in this milestone.
- `taxonomy.json` — exported article taxonomy context; read-only.
- `component-usage.json` — generated per-article component usage when inventory has run.
- `component-suggestions.json` — optional advisory suggestions; do not auto-insert.
- `ui-block-edits.json` — optional ledger for proposed future UI block edits; current compose/push scripts do not apply these edits.
- `candidate.md` — recomposed push candidate generated from `normalized.md` and `ui-blocks.json`.
- `compose-report.json`, `diff-report.json`, `validation-report.json`, `push-report.json` — machine-readable safety reports.

## Editor workflow

### 1. Select the article

Choose an article folder by `article_id`, slug, subject, or review queue. Before editing, read:

1. `article-metadata.json`
2. `normalized.md`
3. `ui-blocks.json`
4. `linked-questions.json`
5. `sources.json`
6. `taxonomy.json`
7. `component-usage.json` if present

Use `original.md` only for baseline comparison; do not edit it.

### 2. Establish the review target

Before changing text, write down the target in notes or a review issue:

- Article ID and slug.
- Claim or section being reviewed.
- Whether the task is copy cleanup, factual correction, source alignment, question alignment, or UI-preservation review.
- Which sources justify the change.
- Whether linked questions are affected.

### 3. Edit the article safely

Edit only `normalized.md` for article content. Keep all `[SLATECAMP_UI_BLOCK:...]` placeholders intact. Raw UI block edits are not supported by the current compose/push path.

Allowed article edits:

- Correct factual statements with source-backed wording.
- Improve clarity without changing meaning.
- Fix grammar, capitalization, and formatting.
- Add citations or source labels when the article already supports them.
- Remove duplicated prose when no assessment logic depends on it.

Disallowed article edits:

- Editing `original.md`.
- Editing `candidate.md` by hand.
- Deleting placeholders.
- Changing UI raw blocks in `ui-blocks.json`; current scripts recompose from preserved raw blocks and do not apply `ui-block-edits.json` proposals.
- Rewriting beyond the requested review scope.
- Adding unsupported claims.
- Changing linked questions in `linked-questions.json`.

### 4. Handle question impacts separately

If an article correction changes what a linked question should ask or answer, do not edit `linked-questions.json`. Create or update:

```text
question-edits/<question_id>.json
```

Follow `03-question-editing-rules.md`.

### 5. Compose, diff, and validate

After editing `normalized.md`, run composition, diff, and validation before any push command:

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
bun run content-audit:diff -- --article-id <article_id> --summary
bun run content-audit:validate -- --article-id <article_id> --summary
```

The article is not eligible for push if validation reports blockers, unresolved placeholders, UI block loss, stale baselines, no-op candidate content, or unsafe diffs.

### 6. Push dry-run first

Run a dry-run push before any apply:

```bash
bun run content-audit:push:dry-run -- --article-id <article_id>
```

The push script can auto-compose and auto-diff when `candidate.md` or `diff-report.json` is missing/stale, but editors should still run compose/diff/validate explicitly during review so reports are visible before pushing.

### 7. Apply only after review

Only after human approval and a clean dry-run may an apply command be used:

```bash
bun run content-audit:push:apply -- --article-id <article_id> --reviewer-id <reviewer_id> --note "<review note>"
```

If the remote Supabase article changed since export, the push must fail stale-safe. Re-export before retrying.

## Stop conditions

Stop and escalate instead of pushing when:

- The claim cannot be verified from available sources.
- A UI placeholder is missing or altered.
- `ui-blocks.json` has unresolved critical blocks and no explicit force/review approval.
- `candidate.md` differs from expected recomposition.
- `diff-report.json` says `safe_to_push: false`.
- Push dry-run reports blockers.
- Linked questions need answer-key changes but lack reviewer approval.
- Remote content is stale.

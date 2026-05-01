# 06 — Command Runbook

All commands run from the repository root with Bun.

## Command safety policy

| Command family | Live Supabase mutation? | Default safety | Notes |
| --- | --- | --- | --- |
| export / normalize / inventory / compose / diff / validate | No article mutation | Local files only | Export reads Supabase; generated files stay under `.ai/content-audit-export/`. |
| push dry-run | No | Dry-run | Fetches remote content for stale checks only. |
| push apply | Yes | Explicit `--apply` required | Requires scope and clean safety gates. |
| question push dry-run | No | Dry-run | Fetches remote question for stale checks only. |
| question push apply | Yes | Explicit `--apply` required | Updates whitelisted question fields only. |
| admin-log dry-run | No | Dry-run | Previews `ai_audit_runs` payload. |
| admin-log apply | Yes | Explicit `--apply` required | Inserts local run metadata; does not start an AI job. |


## Full local export and round-trip preparation

```bash
bun run content-audit:export -- --all --overwrite true --include-questions true --include-sources true --include-taxonomy true
bun run content-audit:normalize -- --all --overwrite
bun run content-audit:inventory
bun run content-audit:component-suggestions -- --all
bun run content-audit:ui-block-edits -- --all
bun run content-audit:compose -- --all --overwrite
bun run content-audit:diff -- --all --summary
bun run content-audit:validate -- --all --summary
```

This creates and verifies local generated data under `.ai/content-audit-export/`. It does not mutate live Supabase article content. Inspect `export-summary.json`, `sync-state.json`, and validation reports before assigning edits.

## Three-article smoke run

```bash
bun run content-audit:export -- --limit 3 --overwrite true --include-questions true --include-sources true --include-taxonomy true
bun run content-audit:normalize -- --all --overwrite
bun run content-audit:inventory
bun run content-audit:component-suggestions -- --all
bun run content-audit:ui-block-edits -- --all
bun run content-audit:compose -- --all --overwrite
bun run content-audit:diff -- --all --summary
bun run content-audit:validate -- --all --summary
```

## Incremental export

If the export baseline already exists and you only want remotely changed articles:

```bash
bun run content-audit:export -- --changed-only --overwrite true --include-questions true --include-sources true --include-taxonomy true
```

## Per-article editing loop

After editing `normalized.md`:

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
bun run content-audit:diff -- --article-id <article_id> --summary
bun run content-audit:validate -- --article-id <article_id> --summary
bun run content-audit:push:dry-run -- --article-id <article_id>
```

Apply only after review:

```bash
bun run content-audit:push:apply -- --article-id <article_id> --reviewer-id <reviewer_id> --note "<review note>"
```

## Push by slug

```bash
bun run content-audit:push:dry-run -- --slug <slug>
bun run content-audit:push:apply -- --slug <slug> --reviewer-id <reviewer_id> --note "<review note>"
```

## Bulk dry-run and apply

Dry-run all locally safe articles:

```bash
bun run content-audit:push:dry-run -- --all-safe
```

Apply all locally safe articles only with exact confirmation:

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

## Question edit dry-run and apply

Create `question-edits/<question_id>.json`, then run:

```bash
bun run content-audit:push-question:dry-run -- --question-id <question_id>
bun run content-audit:push-question:apply -- --question-id <question_id>
```

## Admin audit log sync

When a local content-audit run log should be recorded in the admin audit table, use the explicit sync command. Dry-run first:

```bash
bun run content-audit:admin-log -- --run-id latest
```

Apply only when the latest run log should be inserted into `ai_audit_runs`:

```bash
bun run content-audit:admin-log -- --run-id latest --apply
```

This imports local run-log metadata only. It does not start an AI job. Optional admin logging errors are reported as warnings by the script.

## Component inventory and suggestions

Inventory actual repo components and usage in exported articles:

```bash
bun run content-audit:inventory
```

Generate advisory component placement suggestions:

```bash
bun run content-audit:component-suggestions -- --all
```

Component suggestions are review aids only. Do not auto-insert components into articles from suggestions.

## UI-block edit ledger validation

Default policy is to preserve UI blocks exactly. Raw UI-block edits are **not supported in the current milestone** because candidate composition reads from preserved `ui-blocks.json`, not from `ui-block-edits.json`.

The validation command only checks the future-edit ledger shape and hashes; it does not apply proposed UI raw content:

```bash
bun run content-audit:ui-block-edits -- --article-id <article_id>
```

If a raw UI block must change, stop and create a follow-up implementation task for a supported UI-block edit compose/apply workflow. Do not push by manually editing `ui-blocks.json` or `candidate.md`.

## Guarded future commands

These commands intentionally fail closed until a future milestone implements AI workflows:

```bash
bun run content-audit:fact-check
bun run content-audit:rewrite
```

Do not replace them with live AI API calls in this protocol milestone.


## Orchestrator wrapper

The direct package scripts above are preferred for clarity. The optional orchestrator can dispatch the same steps by subcommand:

```bash
bun run content-audit:roundtrip -- export --limit 3
bun run content-audit:roundtrip -- normalize --all --overwrite
bun run content-audit:roundtrip -- inventory
bun run content-audit:roundtrip -- compose --all --overwrite
bun run content-audit:roundtrip -- diff --all --summary
bun run content-audit:roundtrip -- validate --all --summary
```

Supported subcommands include `export`, `normalize`, `inventory`, `components`, `compose`, `diff`, `validate`, `push`, `push-question`, `admin-log`, `component-suggestions`, `ui-block-edits`, `fact-check`, and `rewrite`. The guarded future commands still fail closed.

## Interpreting failures

- `stale_check_passed: false` means re-export before pushing.
- `safe_to_push: false` means inspect `blockers` before any apply.
- `unresolved_placeholders_count > 0` means restore placeholders or re-normalize.
- `ui_blocks_changed_count > 0` means stop; raw UI preservation failed.
- `pushed: false` in dry-run is expected.
- `pushed: false` in apply means inspect blockers and updated row count.

## Reports to inspect

Root-level generated reports:

- `.ai/content-audit-export/manifest.json`
- `.ai/content-audit-export/export-summary.json`
- `.ai/content-audit-export/sync-state.json`
- `.ai/content-audit-export/runs/<run_id>/run-log.json`
- `.ai/content-audit-export/component-inventory/component-audit-report.json`

Per-article generated reports:

- `compose-report.json`
- `compose-error.json` if composition fails
- `diff-report.json`
- `diff-report.md`
- `validation-report.json`
- `push-report.json`
- `push-result.json`
- `conflict-report.json` if stale remote content blocks push
- `parser-errors.json` if parser warnings/errors are present
- `component-usage.json`
- `component-suggestions.json`
- `ui-block-edits.json`

Per-question generated reports:

- root `question-push-report.json`
- per-question `question-edits/<question_id>.push-report.json`

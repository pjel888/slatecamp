# CLI Commands

SlateCamp uses Bun for package and script execution. Commands below reflect the implemented package scripts in `package.json`.

## Export article bundles

```bash
bun run content-audit:pull -- --limit 25
bun run content-audit:pull -- --article-id <article_id>
bun run content-audit:pull -- --slug <slug>
bun run content-audit:pull -- --changed-only
```

`content-audit:export` remains a legacy alias for `content-audit:pull`.

Useful flags:

```text
--all
--limit <n>
--article-id <id>
--slug <slug>
--output <path>
--include-questions true|false
--include-sources true|false
--include-taxonomy true|false
--overwrite true|false
--dry-run
--changed-only
```

## Normalize exported articles

```bash
bun run content-audit:normalize -- --all --overwrite
bun run content-audit:normalize -- --article-id <article_id>
```

Writes `normalized.md`, `ui-blocks.json`, `parser-errors.json`, and `ui-block-edits.json`.

## Scan component inventory

```bash
bun run content-audit:inventory
bun run content-audit:components
```

Writes aggregate inventory under `component-inventory/` and per-article `component-usage.json` files.

## Compose candidate article

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
```

Writes `candidate.md` and `compose-report.json`. If composition is unsafe, writes `compose-error.json` and does not write a candidate.

## Generate diff

```bash
bun run content-audit:diff -- --article-id <article_id>
bun run content-audit:diff -- --all --summary
```

Writes both `diff-report.json` and `diff-report.md`.

## Push dry-run

```bash
bun run content-audit:push:dry-run -- --article-id <article_id>
```

Dry-run is the default. Push auto-composes and auto-diffs when needed, then performs stale checks without mutating Supabase.

## Push apply

```bash
bun run content-audit:push:apply -- --article-id <article_id>
```

Bulk apply requires an exact confirmation phrase:

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

## Validate bundles

```bash
bun run content-audit:validate -- --all --summary
```

## Question push dry-run/apply

Question mutation is separate from article push and requires a local `question-edits/<question_id>.json` file plus stale checks.

```bash
bun run content-audit:push-question:dry-run -- --question-id <question_id>
bun run content-audit:push-question:apply -- --question-id <question_id>
```

## Optional admin AI Audit import

Admin logging is explicit and dry-run by default. It imports a local run log into `ai_audit_runs` only when `--apply` is passed and the AI Audit tables exist.

```bash
bun run content-audit:admin-log -- --run-id latest
bun run content-audit:admin-log -- --run-id latest --apply
```

## Component suggestions and UI block edit validation

```bash
bun run content-audit:component-suggestions -- --all
bun run content-audit:ui-block-edits -- --all
```

## Guarded non-goals

The following commands intentionally fail closed because this milestone still has no AI APIs, fact-checking, or automatic rewriting:

```bash
bun run content-audit:fact-check
bun run content-audit:rewrite
```

## Orchestrator

```bash
bun run content-audit:roundtrip -- export --limit 3 --overwrite true
bun run content-audit:roundtrip -- normalize --all --overwrite
bun run content-audit:roundtrip -- compose --all --overwrite
bun run content-audit:roundtrip -- diff --all --summary
bun run content-audit:roundtrip -- validate --all --summary
```

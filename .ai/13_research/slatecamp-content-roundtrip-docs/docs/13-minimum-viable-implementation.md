# Minimum Viable Implementation

The first implementation does not need to solve everything.

## MVP commands

```bash
bun run content-audit:pull
bun run content-audit:normalize
bun run content-audit:components
bun run content-audit:diff -- --article-id <article_id>
bun run content-audit:push:dry-run -- --article-id <article_id>
bun run content-audit:push:apply -- --article-id <article_id>
```

## MVP outputs

```text
article bundles
normalized markdown
ui-block preservation
linked questions
sources
component inventory
component usage report
diff report
safe push dry-run
```

## MVP exclusions

```text
AI fact-checking
AI rewrite
automatic component insertion
bulk push without review
question correction automation
source verification automation
```

## Optional explicit follow-up surfaces

```bash
bun run content-audit:push-question:dry-run -- --question-id <question_id>
bun run content-audit:admin-log -- --run-id latest
bun run content-audit:component-suggestions -- --all
bun run content-audit:ui-block-edits -- --all
```

AI fact-checking, AI rewrite, and automatic component insertion remain fail-closed guard surfaces only; no AI APIs are integrated.

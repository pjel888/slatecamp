# Minimum Viable Implementation

The first implementation does not need to solve everything.

## MVP commands

```bash
pnpm content-audit:export
pnpm content-audit:normalize
pnpm content-audit:components
pnpm content-audit:diff --article <article_id>
pnpm content-audit:push --article <article_id>
pnpm content-audit:push --article <article_id> --apply
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

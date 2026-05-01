# Implementation Plan

## Milestone 1 — Export

Build Supabase export script for article bundles.

Outputs:

```text
original.md
article-metadata.json
linked-questions.json
sources.json
taxonomy.json
manifest.json
```

## Milestone 2 — Normalize

Build markdown/custom UI parser.

Outputs:

```text
normalized.md
ui-blocks.json
parser-errors.json if needed
```

## Milestone 3 — Component inventory

Scan actual codebase `.tsx`/`.jsx` components.

Outputs:

```text
component-inventory/components.json
component-inventory/component-files.json
component-inventory/component-usage-in-articles.json
component-inventory/unknown-components.json
```

## Milestone 4 — Compose + diff

Build round-trip compose and diff.

Outputs:

```text
candidate.md
diff-report.json
```

## Milestone 5 — Safe push

Build dry-run and apply push with stale hash check.

Outputs:

```text
push-result.json
conflict-report.json if stale
```

## Milestone 6 — Validation

Validate generated bundle structure and placeholder integrity.

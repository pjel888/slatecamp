# Compose and Diff Command Spec

## Compose

```bash
pnpm content-audit:compose --article <article_id>
```

Composes:

```text
normalized.md + ui-blocks.json -> candidate.md
```

Every placeholder must resolve to a UI block.

If a placeholder is missing, abort.

If a UI block is unused, warn.

## Diff

```bash
pnpm content-audit:diff --article <article_id>
```

Compares:

```text
original.md vs candidate.md
```

Writes:

```text
diff-report.json
diff-report.md optional
```

## No mutation

Compose and diff never mutate Supabase.

# CLI Commands

Use the repo's existing package manager. Names below are recommended.

## Export all article bundles

```bash
pnpm content-audit:export
```

Optional:

```bash
pnpm content-audit:export --limit 25
pnpm content-audit:export --article <article_id>
pnpm content-audit:export --changed-only
```

## Normalize exported articles

```bash
pnpm content-audit:normalize
```

Optional:

```bash
pnpm content-audit:normalize --article <article_id>
```

## Scan component inventory

```bash
pnpm content-audit:components
```

## Compose candidate article

```bash
pnpm content-audit:compose --article <article_id>
```

## Generate diff

```bash
pnpm content-audit:diff --article <article_id>
```

## Push dry-run

```bash
pnpm content-audit:push --article <article_id>
```

## Push apply

```bash
pnpm content-audit:push --article <article_id> --apply
```

## Validate bundles

```bash
pnpm content-audit:validate
```

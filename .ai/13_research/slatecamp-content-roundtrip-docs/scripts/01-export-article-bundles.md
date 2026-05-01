# Script Spec: Export Article Bundles

Suggested file:

```text
scripts/content-audit/export-article-bundles.ts
```

## Responsibilities

```text
- connect to Supabase server-side
- query article rows
- query linked questions
- query sources
- query taxonomy links
- write deterministic folder names
- compute hashes
- write manifest updates
```

## Pseudocode

```ts
for each article in selectedArticles:
  const questions = fetch questions where article_id = article.article_id
  const sources = fetch wiki_article_sources where article_id = article.article_id
  const taxonomy = fetch wiki_article_taxonomy + taxonomy_tree
  write original.md
  write article-metadata.json
  write linked-questions.json
  write sources.json
  write taxonomy.json
```

## Folder naming

Use:

```text
<slugified-title-or-slug>--<article_id>
```

This avoids duplicate slug problems.

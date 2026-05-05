# Pull Command Spec

## Purpose

Pull article bundles from Supabase and write them locally.

Preferred package script: `content-audit:pull`.

Legacy alias: `content-audit:export`.

## Inputs

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY or equivalent server-side key
optional filters: limit, article id, changed only
```

Use existing server-side Supabase utilities if the repo has them.

## Supabase data to fetch

For each `wiki_articles` row:

```text
wiki_articles
questions where article_id = article.article_id
wiki_article_sources where article_id = article.article_id
wiki_article_taxonomy where article_id = article.article_id
joined taxonomy_tree rows
```

## Outputs

```text
original.md
article-metadata.json
linked-questions.json
sources.json
taxonomy.json
```

Normalization may happen separately or as part of export, but separate commands are cleaner.

## Safety

Do not mutate Supabase.

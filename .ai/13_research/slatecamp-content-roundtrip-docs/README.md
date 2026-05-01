# SlateCamp Content Round-Trip + Component Inventory Docs

This documentation pack is for implementing the **local content round-trip foundation** for SlateCamp articles.

The immediate goal is **not AI fact-checking** and **not article rewriting**. The immediate goal is to let SlateCamp export article bundles from Supabase, preserve all custom UI blocks safely, normalize article content into AI-readable markdown, inspect linked questions and sources, audit available `.tsx` learning components from the codebase, and later push approved local edits back to Supabase safely.

## Core outcome

Build a system that supports this flow:

```text
Supabase article + sources + linked questions
  ↓
local article bundle inside .ai/content-audit-export/
  ↓
original.md is preserved exactly
  ↓
normalized.md is generated for review/AI analysis
  ↓
ui-blocks.json preserves every embedded UI/custom component block
  ↓
component-inventory/ is generated from actual repo .tsx/.jsx component files
  ↓
edits can be composed back into candidate.md
  ↓
diff + stale-check + explicit approval
  ↓
safe push back to Supabase
```

## Strict scope

Implement the local export, normalization, component audit, diff, and safe sync infrastructure.

Do not implement AI fact-checking yet.
Do not integrate DeepSeek, Kimi API, Qwen, OpenAI, Perplexity, or Valyu yet.
Do not blindly rewrite article content.
Do not delete or simplify custom UI blocks.
Do not push any change to Supabase without dry-run, diff, and stale-content checks.

## Main generated location in the repo

```text
.ai/content-audit-export/
```

The generated export should be reproducible. Scripts and documentation should be committed. Generated export files may be committed or gitignored depending on project preference, but the implementation must work with the files inside the SlateCamp repository workspace.

## Current SlateCamp data shape

Based on the connected Supabase schema/context:

```text
wiki_articles: 567 rows
questions: 7,159 rows
design_scenario_questions: 249 rows
wiki_article_sources: 1,110 rows
wiki_article_taxonomy: 567 rows
taxonomy_tree: 559 rows
```

Important keys:

```text
wiki_articles.article_id
questions.question_id
questions.article_id -> wiki_articles.article_id
wiki_article_sources.article_id -> wiki_articles.article_id
wiki_article_taxonomy.article_id -> wiki_articles.article_id
wiki_article_taxonomy.node_id -> taxonomy_tree.node_id
```

## Files to read first

```text
AGENTS.md
docs/00-objective.md
docs/01-roundtrip-strategy.md
docs/02-export-bundle-format.md
docs/03-linked-questions-and-sources.md
docs/04-normalized-markdown-and-ui-blocks.md
docs/05-component-inventory-codebase-audit.md
docs/06-safe-push-to-supabase.md
codex/01-implementation-prompt.md
checklists/acceptance-criteria.md
```

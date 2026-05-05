# Codex / OpenCode Implementation Prompt

Copy this prompt into Codex/OpenCode when implementing.

```text
You are working inside the SlateCamp repo.

Implement the local content audit export and round-trip system described in:

.ai/03_plans/slatecamp-content-roundtrip-docs

Primary goal:
Build scripts and file outputs that export Supabase article bundles locally, normalize article markdown by preserving custom UI blocks, scan the actual codebase for .tsx/.jsx learning components, map component usage in articles, compose edited normalized markdown back into candidate article content, generate diffs, and safely push approved changes back to Supabase with stale checks.

Do not implement AI fact-checking.
Do not call Kimi, DeepSeek, Qwen, OpenAI, Perplexity, or Valyu.
Do not auto-insert components into articles.
Do not mutate live article/question content except through an explicit push command with --apply.

Read first:
- README.md
- AGENTS.md
- docs/00-objective.md
- docs/01-roundtrip-strategy.md
- docs/02-export-bundle-format.md
- docs/03-linked-questions-and-sources.md
- docs/04-normalized-markdown-and-ui-blocks.md
- docs/05-component-inventory-codebase-audit.md
- docs/06-safe-push-to-supabase.md
- commands/01-cli-commands.md
- scripts/01-export-article-bundles.md
- scripts/02-normalize-markdown.md
- scripts/04-scan-component-inventory.md
- supabase/01-current-schema-map.md
- supabase/02-required-queries.md
- checklists/acceptance-criteria.md

Implement commands, using existing repo conventions:
- content-audit:pull
- content-audit:export legacy alias
- content-audit:normalize
- content-audit:components
- content-audit:compose
- content-audit:diff
- content-audit:push
- content-audit:validate

Generated files should live under:
.ai/content-audit-export/

Each article bundle should include:
- original.md
- normalized.md
- candidate.md when composed
- ui-blocks.json
- article-metadata.json
- linked-questions.json
- sources.json
- taxonomy.json
- component-usage.json if available
- diff-report.json when diffed

Component inventory must come from actual codebase scan of .tsx/.jsx/.ts/.js files. Do not hardcode component names.

Before pushing to Supabase:
- compose candidate.md
- generate diff
- fetch current Supabase wiki_articles.content
- compare current hash to original content hash
- dry-run by default
- apply only with --apply

Run lint/typecheck/tests according to repo commands.
```

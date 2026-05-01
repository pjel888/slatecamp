# AGENTS.md — Implementation Rules for Codebase AI

## Mission

Build the local content export and round-trip system for SlateCamp.

The implementation must let the repo export all article content, linked questions, article sources, taxonomy links, preserved custom UI blocks, normalized markdown, and a real component inventory generated from `.tsx`/`.jsx` files in the codebase.

## Non-negotiables

1. Preserve `original.md` exactly as it came from Supabase.
2. Never delete custom UI blocks.
3. Never rewrite component syntax during normalization.
4. Never push changes to Supabase without a dry-run diff.
5. Never push if the current Supabase row no longer matches the exported `original_hash`.
6. Preserve question connections through `questions.article_id`.
7. Store enough metadata to reconstruct the original article after editing `normalized.md`.
8. Component inventory must be generated from the actual repo, not guessed from docs.
9. Do not integrate model APIs in this milestone.
10. Do not perform fact-checking in this milestone.

## Build mindset

This is infrastructure. Make it boring, deterministic, and safe.

The normalized markdown is for review and later AI use. The canonical live content remains Supabase until explicitly pushed.

## Expected implementation style

Use existing SlateCamp conventions for:

```text
Supabase client setup
scripts folder structure
TypeScript config
environment variables
logging
package manager commands
```

If the repo already has a pattern for admin scripts, Supabase CLI, generated DB types, or server actions, follow it.

## Generated files rule

Generated exports should include timestamps and hashes. Re-running the export should not destroy prior runs unless explicitly requested.

Preferred output layout:

```text
.ai/content-audit-export/
  manifest.json
  sync-state.json
  articles/
    <article-slug-or-id>/
      original.md
      normalized.md
      candidate.md
      ui-blocks.json
      ui-block-edits.json
      parser-errors.json
      article-metadata.json
      linked-questions.json
      sources.json
      taxonomy.json
      component-usage.json
      compose-report.json
      compose-error.json
      diff-report.json
      diff-report.md
      push-report.json
      push-result.json
      conflict-report.json
  runs/
    <run_id>/run-log.json
  component-inventory/
    components.json
    component-files.json
    component-usage-in-articles.json
    component-audit-report.json
    unknown-components.json
    component-fit-notes.md
```

The ZIP only contains Markdown docs. The generated implementation may output JSON/Markdown files as described.

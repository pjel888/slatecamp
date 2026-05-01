<!-- Parent: ../AGENTS.md -->

# content-audit-editor-protocol

## Scope

This file governs `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/`.

## Responsibility

This folder is the durable protocol for AI-assisted and human-reviewed content editing against generated SlateCamp content audit bundles in `.ai/content-audit-export/`.

It explains how to work with exported article bundles, linked questions, sources, taxonomy, preserved UI blocks, candidate recomposition, diffs, validation, and safe push commands.

## Non-goals

- Do not implement AI API calls here.
- Do not mutate `.ai/content-audit-export/` from these docs.
- Do not mutate live Supabase content from these docs.
- Do not change article rendering, question schemas, or admin UI code from this folder.
- Do not treat generated exports as canonical repo documentation.

## Editing rules

- Keep instructions safety-first and command-accurate.
- Treat `package.json` and `scripts/content-audit/` as the live command source of truth.
- Preserve the distinction between:
  - article edits in `normalized.md`
  - recomposed push candidates in `candidate.md`
  - preserved UI in `ui-blocks.json`
  - question edits in `question-edits/<question_id>.json`
- State dry-run-first behavior whenever push commands are documented.
- If the scripts drift, update this folder and `.ai/03_plans/content-audit-editor-protocol/` together.

## Validation

For docs-only changes in this folder:

- Verify every referenced path exists or is explicitly described as generated/optional.
- Run `git diff --check`.
- Prefer a grep/path check for referenced `content-audit:*` package scripts.

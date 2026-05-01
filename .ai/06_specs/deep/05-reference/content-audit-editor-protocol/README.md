# Content Audit Editor Protocol

**Status:** Active reference protocol
**Audience:** AI fact-checkers, content editors, reviewers, and maintainers
**Applies to:** Generated article/question bundles under `.ai/content-audit-export/`
**Does not implement:** AI fact-checking, automatic rewriting, admin UI review, or live Supabase mutation

## Purpose

The SlateCamp content round-trip system exports Supabase wiki articles into local bundles so editors can safely inspect, normalize, edit, recompose, diff, validate, and push content back only when safety gates pass.

This protocol tells an AI or human editor **what to read, what may be edited, what must stay immutable, and which commands prove the bundle is safe**.

## Canonical boundaries

- `.ai/content-audit-export/` is generated working data. Do not store durable instructions there.
- `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/` is the durable editor protocol.
- `.ai/03_plans/content-audit-editor-protocol/` tracks rollout and adoption work for this protocol.
- `package.json` plus `scripts/content-audit/` are the live command and behavior source of truth.

## File map

1. `01-editor-operating-protocol.md` — end-to-end editor workflow.
2. `02-article-editing-rules.md` — rules for editing `normalized.md` while preserving UI blocks.
3. `03-question-editing-rules.md` — rules for proposing and pushing question edits.
4. `04-fact-checking-and-source-policy.md` — evidence, citation, and uncertainty policy.
5. `05-review-and-safety-checklist.md` — reviewer checklist and blockers.
6. `06-command-runbook.md` — exact command sequences.
7. `07-review-packets-and-templates.md` — review packet, finding, approval, and blocker templates.
8. `08-quality-rubric-and-pilot-playbook.md` — editorial quality rubric and dry-run pilot process.

## Roles

- **Editor / AI assistant:** reads the bundle, drafts `normalized.md` edits, records evidence, and prepares review packets.
- **Reviewer:** approves source-backed changes, answer-key changes, and any apply decision.
- **Release operator:** runs dry-run/apply commands and verifies reports. This can be the same person as reviewer only if explicitly recorded.
- **Maintainer:** updates scripts or protocol when blockers reveal tooling gaps.

## Quick start for a single article

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
bun run content-audit:diff -- --article-id <article_id> --summary
bun run content-audit:validate -- --article-id <article_id> --summary
bun run content-audit:push:dry-run -- --article-id <article_id>
```

Use the templates in `07-review-packets-and-templates.md` before requesting apply approval.

## Standard workflow

1. Export bundles from Supabase.
2. Normalize articles and preserve UI blocks.
3. Run component inventory and optional component suggestions.
4. Edit `normalized.md`; never edit `original.md`.
5. Propose question changes only via `question-edits/<question_id>.json`.
6. Compose `candidate.md` from `normalized.md` + `ui-blocks.json`.
7. Diff and validate the bundle.
8. Run push dry-run.
9. Apply only with an explicit `--apply` command after human review.

## Non-negotiables

- Never edit `original.md`.
- Never delete or rewrite `ui-blocks.json` raw UI block content.
- Never manually edit `candidate.md` as the source of truth.
- Never push stale content.
- Never push unresolved placeholders.
- Never mutate Supabase without explicit `--apply`.
- Never use AI APIs from the content-audit scripts.
- Never rewrite questions directly in `linked-questions.json`.
- Never treat `component-suggestions.json` as permission to auto-insert components.
- Never treat `ui-block-edits.json` as an enabled raw UI compose/apply path.

# Content Audit Export

This directory is the local content round-trip workspace for exported article bundles, generated article/question improvement artifacts, and content-audit run outputs.

## Status

Active/generated/scripted. Do not relocate this directory or its `articles/` corpus without updating and validating `scripts/content-audit/*`, `.ai/scripts/*`, package scripts, and docs that reference `.ai/content-audit-export`.

## Current Structure

| Path | Status | Notes |
| --- | --- | --- |
| `articles/` | Do not move | Active generated article corpus; 567 article bundle folders and most files in this tree. |
| `runs/` | Keep in place | Content-audit run logs used by admin-log/import flows. |
| `roundtrip-dry-run-2026-05-09/` | Historical run output | Keep for closure traceability. |
| `target-mapping-no-apply-2026-05-09/` | Historical run output | Keep for no-apply mapping traceability. |
| `source-anchor-extracts/` | Generated evidence | Keep near exported article bundles. |
| top-level `source-audited-article-batch-*` files | Historical run output | Indexed in `RUN_ARTIFACTS_INDEX.md`; left in place to avoid breaking ad hoc scripts and references. |

## Key Script References

- `scripts/content-audit/lib.ts` defaults output to `.ai/content-audit-export`.
- `package.json` content-audit scripts run `scripts/content-audit/*`.
- `.ai/scripts/fix_articlemedia_issues.py` and `.ai/scripts/push_12_missing_articles.py` reference `.ai/content-audit-export/articles` directly.

## Organization Rule

Use indexes and labels here first. Move artifacts only after a path-reference scan proves the files are not scripted inputs, and keep a manifest for any relocation.

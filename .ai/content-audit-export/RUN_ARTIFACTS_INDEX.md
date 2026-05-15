# Content Audit Export Run Artifacts

**Indexed:** 2026-05-15
**Purpose:** Make top-level generated artifacts easier to scan without moving scripted paths.

## Summary

- Top-level files: 548
- Article bundle folders under `articles/`: 567
- Total files under `.ai/content-audit-export/`: 22,322
- Top-level `source-audited-article-batch-*` files: 524
- Top-level `batch-*` files: 6
- Top-level markdown reports containing `report` in the filename: 179

## Current Rule

Keep these files in place for now. The content-audit scripts and older ad hoc recovery scripts use `.ai/content-audit-export` as a fixed workspace, and several scripts point directly at `articles/` or named top-level artifacts.

## Artifact Families

| Pattern | Status | Notes |
| --- | --- | --- |
| `manifest.json`, `export-summary.json`, `sync-state.json`, `validation-report.json` | Do not move | Core workspace state and validation outputs. |
| `source-audited-article-batch-*-local-first-*` | Historical/generated | Batch ledger, report, scoped-check, and generation-summary outputs from local-first article work. |
| `source-audited-batch-*` | Historical/generated | Live verification and terminal freeze evidence. |
| `batch-*` | Historical/generated | Early batch execution/blocker/question-alignment artifacts. |
| `test-batch-*` | Historical/generated/script referenced | `scripts/content-audit/verify-test-batch-002.ts` and `test-batch-002-direct-improve.py` read these paths. |
| `question-push-report.json` | Generated | Question push output; keep beside article bundles. |

## Future Cleanup

If this workspace gets another cleanup pass, prefer creating a generated `runs/archive/` index before moving files. Any move must include:

- reference scan for exact filenames,
- script validation for affected package scripts,
- move manifest with original and new paths,
- update to this index.

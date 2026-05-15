<!-- Parent: ../AGENTS.md -->

# .ai/content-audit-export

## Scope

This file governs `.ai/content-audit-export/`.

## Responsibility

This subtree is an active/generated content round-trip workspace. It contains exported article bundles, run artifacts, ledgers, reports, and validation outputs used by `scripts/content-audit/*` and related ad hoc recovery scripts.

## Edit Rules

- Do not move `articles/` or its article bundle folders unless script references are updated and validated.
- Prefer indexes, README updates, and manifests over relocation.
- Keep `manifest.json`, `export-summary.json`, `sync-state.json`, and `validation-report.json` in place unless all callers are updated.
- Do not run Supabase apply/push scripts from an organization pass.

## Validation

- Check package/script references before moving any file in this subtree.
- If artifacts are moved, keep a manifest with original and new paths.

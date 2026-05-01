<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# scripts

## Scope
This file governs `scripts/` and the repository's script-level maintenance/tooling surface.

## Current subtree reality
`scripts/` currently contains 39 direct files, 3 direct nested directories, and 58 script files within two levels.

Live script areas include:
- dev server launcher (`dev.js`)
- database inspection and connectivity checks
- storybook checks
- entitlement checks
- content import/upload/normalization utilities
- content round-trip audit tooling (`scripts/content-audit/`) for Supabase export, markdown/UI-block preservation, candidate composition, validation, diffing, and dry-run-first push safety
- taxonomy/content-linking utilities
- legal citation/content quality tooling

## What agents must inspect before editing or documenting
- the actual script source file
- the corresponding `package.json` command, if one exists
- `.ai/00_system/VALIDATION_MATRIX.md`
- `.ai/00_system/ENVIRONMENT_CONTRACT.md`
- any referenced external systems or input/output files

## Safety rules
- Do not assume a script is safe to run just because it lives in `scripts/`.
- Verify side effects before execution, especially for content upload, normalization, or DB-related tooling.
- Keep README and `.ai` command documentation aligned with the real script surface.

## Validation expectations
- validate script names against `package.json`
- validate referenced script files/paths exist
- use read-only/source inspection by default for documentation work

## Anti-laziness rule
Do not summarize script behavior from filenames alone. Open the script and inspect what it actually touches.

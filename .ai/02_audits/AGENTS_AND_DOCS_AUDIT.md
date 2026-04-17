# AGENTS_AND_DOCS_AUDIT

## Summary

The repo already has a strong `AGENTS.md` hierarchy and a strong `.ai` layer.
The remaining problem is not absence of instructions; it is keeping high-authority docs and local AGENTS concise, current, and synchronized with live code.

## Evidence anchors

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/AGENTS.md`
- `src/AGENTS.md`
- `src/app/admin/AGENTS.md`
- `src/app/developer/AGENTS.md`
- `src/lib/AGENTS.md`
- `scripts/AGENTS.md`
- `supabase/AGENTS.md`

## Observed

- root docs are already strong enough to support future Codex work
- local AGENTS mostly explain scope and validation, but they can be sharpened with direct Codex-facing references
- `.ai` now has a coherent top-level shape and the main active bridge docs have been refreshed
- the remaining documentation risk is preserved historical material that still needs strong demotion language

## Top findings

- `CEX-DOC-002` deep `00-meta` lineage docs were previously too easy to misread as current authority
- `CEX-AGT-001` local AGENTS should point more directly to the Codex-enablement docs for fast future sessions
- `CEX-DOC-003` docs authority is strong only when README, CLAUDE, AGENTS, and `.ai` all stay synchronized

## Recommended artifacts

- `DOCS_SOURCE_OF_TRUTH.md`
- `DOCS_AND_AGENTS_HARDENING_PLAN.md`
- concise AGENTS refresh across the listed critical scopes

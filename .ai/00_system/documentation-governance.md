# Documentation Governance

**Last Updated:** 2026-04-16

## Canonical surface roles

### `README.md`
- Primary repository entrypoint for humans and agents arriving at the repo root
- Should explain what SlateCamp is, how the repo is organized, how to run it locally, what commands exist, and where deeper docs live
- Must stay concise enough to navigate, but comprehensive enough for onboarding

### `docs/`
- Human-facing pointer surface at the repo root
- In current reality this directory is a bridge, not the full canonical doc corpus
- Any statements here must stay aligned with `.ai/docs/` and `README.md`

### `.ai/`
- Operational intelligence layer for audits, plans, tasks, state, logs, agent governance, and documentation architecture decisions
- May contain active operational docs plus preserved historical material
- Should favor additive updates and explicit supersession over destructive cleanup

### `.ai/docs/`
- Preserved reference/specification corpus with architecture, product, design, development, and portal documentation
- Still valuable and actively referenced, but some index/ownership material has drifted and must be treated carefully
- When `.ai/docs` and `README.md` overlap, `README.md` should summarize while `.ai/docs` holds deeper reference detail

## Duplication policy

Intentional duplication is allowed only when roles differ:
- `README.md` = entrypoint
- `.ai/docs/` = deep reference/spec corpus
- `.ai/` state/roadmap/audit docs = operational truth and sequencing

If the same subject exists in multiple places:
1. identify the canonical owner
2. label supporting or transitional copies clearly
3. avoid silent divergence

## Drift management rules

1. Time-sensitive claims must be dated or omitted.
2. Commands must match `package.json` or actual executable scripts.
3. Architecture claims must be traceable to code/config/schema.
4. When a subtree changes meaning or ownership, update the nearest `AGENTS.md` and related `.ai` state/docs in the same change.
5. When older docs remain useful historically, keep them but mark them as historical, transitional, or superseded.

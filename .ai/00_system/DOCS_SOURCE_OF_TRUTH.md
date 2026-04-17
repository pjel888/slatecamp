# DOCS_SOURCE_OF_TRUTH

## Canonical docs by job

| Job | Canonical doc |
| --- | --- |
| Repository entrypoint | `README.md` |
| Repo-wide operating rules | `AGENTS.md` |
| Policy-heavy repository contract | `CLAUDE.md` |
| `.ai` routing and folder authority | `.ai/00_system/ai-folder-canonical-map.md` |
| Repo architecture map | `.ai/00_system/repo-map.md` |
| Validation commands and when to run them | `.ai/00_system/VALIDATION_MATRIX.md` |
| Environment expectations | `.ai/00_system/ENVIRONMENT_CONTRACT.md` |
| Current repo findings | `.ai/10_state/findings-register.md` |
| Current repo state | `.ai/10_state/current-state.md` |
| Deep reference/spec corpus | `.ai/06_specs/deep/` |
| Archive policy and preserved history entrypoint | `.ai/09_archive/` |
| Codex shared skills | `.agents/skills/` |

## Relationship rules

- `README.md` explains the repo and points outward
- root `AGENTS.md` explains how to work in the repo
- local `AGENTS.md` files refine the scope-local contract
- `.ai/` holds operational truth, audits, plans, logs, and governance
- `.ai/06_specs/deep/` holds deep reference material, not current operational state
- `.agents/skills/` is the Codex-discoverable shared skill surface

## Update triggers

Update `README.md` when:
- repo orientation changes
- commands change
- top-level documentation entrypoints change

Update root `AGENTS.md` when:
- repository-wide workflow rules change
- validation expectations change
- canonical docs shift

Update local `AGENTS.md` when:
- subtree ownership changes
- adjacent systems change
- validation instructions drift

Update `.ai/00_system/*` when:
- canonical routing changes
- validation or environment contract changes
- Codex enablement rules change

Update `.agents/skills/*` when:
- recurring Codex workflows change materially
- referenced repo docs move

## Anti-drift rule

If structure, workflow, or authority changes, update the canonical owner doc first and only then supporting docs.

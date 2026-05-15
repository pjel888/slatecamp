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
| Codex and companion AI CLI usage | `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md` |
| Agent-readable visual identity and design tokens | `DESIGN.md` |
| Implemented CSS/Tailwind design tokens | `src/app/globals.css` |
| Deep design-system reference | `.ai/06_specs/deep/03-design/001-design-system.md` |
| Philip UX/UI execution calibration | `.ai/00_system/philip-ux-ui-calibration.md` |
| Codex design-system behavior | `.codex/skills/slatecamp-design-system-engineer/SKILL.md` |
| Skill payload design-system mirror | `.ai/11_skills/payloads/slatecamp-design-system-engineer/SKILL.md` |
| Current repo findings | `.ai/10_state/findings-register.md` |
| Current repo state | `.ai/10_state/current-state.md` |
| Deep reference/spec corpus | `.ai/06_specs/deep/` |
| Archive policy and preserved history entrypoint | `.ai/09_archive/` |
| Codex shared skills | `.agents/skills/` |
| Project-local Codex skill mirrors | `.codex/skills/` |

## Relationship rules

- `README.md` explains the repo and points outward
- root `AGENTS.md` explains how to work in the repo
- local `AGENTS.md` files refine the scope-local contract
- `.ai/` holds operational truth, audits, plans, logs, and governance
- `.ai/06_specs/deep/` holds deep reference material, not current operational state
- `.agents/skills/` is the Codex-discoverable shared skill surface
- `.codex/skills/` contains project-local skill mirrors and must stay aligned when a matching skill governs active agent behavior

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
- companion AI CLI guidance changes

Update `DESIGN.md` when:
- brand/design-system tokens change
- visual identity guidance changes
- agent-facing component, layout, shape, color, or typography rules change

Update `.ai/06_specs/deep/03-design/001-design-system.md` when:
- design doctrine, token usage, component patterns, or visual-governance rules change
- `DESIGN.md` changes in a way that should be preserved as deep reference

Update `src/app/globals.css` when:
- implemented Tailwind CSS 4 variables or CSS custom properties change

Update `.ai/00_system/philip-ux-ui-calibration.md` when:
- Philip gives durable UX/UI taste corrections
- recurring SlateCamp visual standards change
- grid, uniformity, evidence, or 3D Lab calibration rules need refinement

Update `.codex/skills/slatecamp-design-system-engineer/SKILL.md` when:
- SlateCamp design-system doctrine or visual decision rules change
- external references are promoted, demoted, or clarified for agent behavior

Update `.ai/11_skills/payloads/slatecamp-design-system-engineer/SKILL.md` when:
- the project-local Codex design-system skill mirror changes
- generated or mirrored agent payloads would otherwise reintroduce stale design-system rules

Update `.agents/skills/*` when:
- recurring Codex workflows change materially
- referenced repo docs move

## Anti-drift rule

If structure, workflow, or authority changes, update the canonical owner doc first and only then supporting docs.

For design-system work, `DESIGN.md` is the canonical doctrine. External systems and historical inspiration notes are non-authoritative unless the rule is explicitly adopted there.

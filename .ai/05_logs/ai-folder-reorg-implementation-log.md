# AI Folder Reorg Implementation Log

Date: 2026-04-17

## Objective

Reduce `.ai` folder overlap by physically canonicalizing low-volume legacy directories and converting legacy entrypoints into explicit shims.

## Implemented moves

### State

- moved `.ai/state/current-task.md` -> `.ai/10_state/legacy-state/current-task-legacy-2026-04-11.md`
- moved `.ai/state/memory.md` -> `.ai/10_state/legacy-state/memory-legacy-2026-04-11.md`
- moved `.ai/state/multi-agent.md` -> `.ai/10_state/legacy-state/multi-agent-legacy-2026-04-06.md`
- added `.ai/state/README.md` shim

### Logs

- moved `.ai/logs/changelog.md` -> `.ai/05_logs/legacy-changelog-2026-04-06.md`
- added `.ai/logs/README.md` shim

### Prompts

- moved `.ai/prompts/2026-04-12-Admin-Knowledge-Speed-Optimization-And-Functionality-Audit-And-Implementation-Plan.md` -> `.ai/08_prompts/legacy/2026-04-12-admin-knowledge-speed-optimization-audit-and-implementation-plan.md`
- added `.ai/prompts/README.md` shim

### Rules

- moved `.ai/rules/design.md` -> `.ai/00_system/legacy-rules/design-legacy-2026-04-07.md`
- moved `.ai/rules/flowbite-alignment.md` -> `.ai/00_system/legacy-rules/flowbite-alignment-legacy-2026-04-07.md`
- moved `.ai/rules/identity_preservation_lock.md` -> `.ai/00_system/legacy-rules/identity-preservation-lock-legacy-2026-04-07.md`
- moved `.ai/rules/pedagogy.md` -> `.ai/00_system/legacy-rules/pedagogy-legacy-2026-04-10.md`
- moved `.ai/rules/stack.md` -> `.ai/00_system/legacy-rules/stack-legacy-2026-04-10.md`
- added `.ai/rules/README.md` shim

## Shim and routing improvements

- added explicit `README.md` entrypoints to legacy stores:
- `.ai/09_archive/store/`
- `.ai/03_plans/preserved/`
- `.ai/12_agents/payloads/`
- `.ai/11_skills/payloads/`
- `.ai/10_state/legacy-runtime/ralph/`
- added legacy-context READMEs under:
- `.ai/10_state/legacy-state/`
- `.ai/08_prompts/legacy/`
- `.ai/00_system/legacy-rules/`

## Governance docs updated

- `.ai/README.md`
- `.ai/05_logs/README.md`
- `.ai/08_prompts/README.md`
- `.ai/10_state/README.md`
- `.ai/11_skills/README.md`
- `.ai/12_agents/README.md`
- `.ai/09_archive/archive-index.md`
- `.ai/00_system/ai-folder-canonical-map.md`
- `.ai/03_plans/ai-folder-reorg-plan.md`

## Notes

- Large preserved stores were intentionally not mass-moved in this run:
- `.ai/09_archive/store/`
- `.ai/03_plans/preserved/`
- `.ai/12_agents/payloads/`
- `.ai/11_skills/payloads/`
- `.ai/06_specs/deep/`

- `.ai/10_state/legacy-runtime/ralph/state.json` was left in place as preserved runtime residue to avoid breaking unknown historical workflows; the folder is now explicitly marked legacy-runtime.

## Second pass: numbered-only normalization and lifecycle cleanup

### Top-level normalization completed

- removed all remaining unnumbered top-level `.ai` roots
- rehomed preserved content under numbered parents:
- `06_specs/deep/`
- `09_archive/store/`
- `03_plans/preserved/`
- `11_skills/payloads/`
- `12_agents/payloads/`
- `10_state/legacy-*`

### Naming strategy applied

- active management docs renamed to lowercase kebab-case
- reserved uppercase exceptions limited to:
- `README.md`
- `AGENTS.md`
- payload-required `SKILL.md`

### Outdated active files moved out

- stale 2026-04-16 audit set moved to:
- `09_archive/store/2026-04-16-repo-intelligence-pass/audits/`
- stale 2026-04-16 task set moved to:
- `09_archive/store/2026-04-16-repo-intelligence-pass/tasks/`
- superseded 2026-04-16 plan set moved to:
- `03_plans/preserved/2026-04-16-repo-intelligence-pass/plans/`

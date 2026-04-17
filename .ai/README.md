# `.ai` Operational Intelligence Workspace

This `.ai` directory is SlateCamp's operational intelligence layer.

It is where the repository keeps:
- audits
- plans
- tasks
- roadmap state
- execution logs
- agent-governance docs
- operational conventions
- deep reference docs and preserved historical context

## Current role in the repository

As of **2026-04-16**, the repo uses four documentation surfaces with different jobs:

| Surface | Job |
| --- | --- |
| `README.md` | Comprehensive repo entrypoint for onboarding, setup, repo structure, and navigation |
| `docs/` | Root-level bridge/pointer surface |
| `.ai/` | Operational brain: audits, plans, state, tasks, governance, agent guidance |
| `.ai/docs/` | Deep reference/specification corpus |

Do not treat these as duplicates.
They have different responsibilities.

## How to use `.ai`

### Start here when you need operational truth
- `.ai/10_state/current-state.md`
- `.ai/10_state/active-risks.md`
- `.ai/01_roadmap/current-phase.md`
- `.ai/01_roadmap/milestone-tracker.md`

### Start here when you need repo-wide findings
- `.ai/02_audits/2026-04-16-full-codebase-intelligence-audit.md`
- `.ai/02_audits/2026-04-16-agents-layer-audit.md`

### Start here when you need governance
- `.ai/00_system/principles.md`
- `.ai/00_system/workflow.md`
- `.ai/00_system/documentation-governance.md`
- `.ai/00_system/audit-standards.md`

### Start here when you need deep product/reference docs
- `.ai/docs/00-meta/001-index.md`
- `.ai/docs/02-architecture/001-system-architecture.md`
- `.ai/docs/portal/000-portal-guide.md`

## Numbered operational taxonomy

| Folder | Purpose |
| --- | --- |
| `00_performance/` | Performance notes, bottlenecks, benchmark-risk docs |
| `00_system/` | Governance, workflow rules, naming conventions, doc architecture |
| `01_roadmap/` | Current phase, milestones, sequencing, priorities |
| `02_audits/` | Codebase audits, subsystem audits, AGENTS audits, architecture truth reconciliation |
| `03_plans/` | Execution plans, remediation plans, documentation architecture decisions |
| `04_tasks/` | Actionable follow-ups and work packets |
| `05_logs/` | Update logs, validation logs, decision/change logs |
| `06_specs/` | Specification bridge area when operational specs are needed outside `.ai/docs` |
| `07_experiments/` | Experimental findings and prototype notes |
| `08_prompts/` | Reusable prompts for audits, planning, validation, and agent work |
| `09_archive/` | Archive policy and preserved historical references |
| `10_state/` | Current system state, blockers, risks, next actions |
| `11_skills/` | Repo-specific playbooks and skill-level guidance |
| `12_agents/` | Agent hierarchy, responsibilities, and handoff model |
| `13_research/` | Research packs and internal investigations |

## Preserved legacy/source surfaces

The repo still preserves older or parallel `.ai` surfaces where they remain useful:
- `agents/`
- `archive/`
- `docs/`
- `logs/`
- `plans/`
- `prompts/`
- `ralph/`
- `rules/`
- `skills/`
- `state/`

These are not junk by default.
Preserve them unless there is an explicit, traceable supersession path.

## Rules for humans and coding agents

1. **Audit before edit** — do not update state, roadmap, or AGENTS files from assumption.
2. **Prefer additive updates** — create bridge notes, audits, plans, and supersession logs instead of destructive cleanup.
3. **Keep canonical ownership clear** — README is the entrypoint; `.ai` is operations; `.ai/docs` is deep reference.
4. **Date time-sensitive claims** — counts, validation results, and status notes must be dated or omitted.
5. **Preserve history** — when something becomes outdated, mark it historical, transitional, or superseded rather than silently erasing it.
6. **Update `AGENTS.md` with structure changes** — local subtree guidance is part of the operational brain.

## Relationship to `AGENTS.md`

The repository now has a broad `AGENTS.md` hierarchy.
Use `.ai/12_agents/repo-agent-model.md` plus the nearest `AGENTS.md` file in scope when operating in any subtree.

## Relationship to archive

Archive is not deletion.
Archive is recoverability.
If a document is no longer active, preserve traceability:
- mark it superseded
- point to the replacement
- retain context where helpful

See `.ai/09_archive/archive-policy.md`.

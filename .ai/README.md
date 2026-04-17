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

As of **2026-04-17**, the repo uses four documentation surfaces with different jobs:

| Surface | Job |
| --- | --- |
| `README.md` | Comprehensive repo entrypoint for onboarding, setup, repo structure, and navigation |
| `docs/` | Root-level bridge/pointer surface |
| `.ai/` | Operational brain: audits, plans, state, tasks, governance, agent guidance |
| `.ai/06_specs/deep/` | Deep reference/specification corpus |

Do not treat these as duplicates.
They have different responsibilities.

Current `.ai` routing source of truth:
- `.ai/00_system/ai-folder-canonical-map.md`

## How to use `.ai`

### Start here when you need operational truth
- `.ai/10_state/current-state.md`
- `.ai/10_state/active-risks.md`
- `.ai/01_roadmap/current-phase.md`
- `.ai/01_roadmap/milestone-tracker.md`

### Start here when you need repo-wide findings
- `.ai/02_audits/master-audit.md`
- `.ai/00_system/repo-map.md`
- `.ai/00_system/ai-folder-canonical-map.md`

### Start here when you need governance
- `.ai/00_system/principles.md`
- `.ai/00_system/workflow.md`
- `.ai/00_system/documentation-governance.md`
- `.ai/00_system/audit-standards.md`

### Start here when you need deep product/reference docs
- `.ai/06_specs/deep/00-meta/001-index.md`
- `.ai/06_specs/deep/02-architecture/001-system-architecture.md`
- `.ai/06_specs/deep/portal/000-portal-guide.md`

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
| `06_specs/` | Specification bridge area when operational specs are needed outside `.ai/06_specs/deep` |
| `07_experiments/` | Experimental findings and prototype notes |
| `08_prompts/` | Reusable prompts for audits, planning, validation, and agent work |
| `09_archive/` | Archive policy and preserved historical references |
| `10_state/` | Current system state, blockers, risks, next actions |
| `11_skills/` | Repo-specific playbooks and skill-level guidance |
| `12_agents/` | Agent hierarchy, responsibilities, and handoff model |
| `13_research/` | Research packs and internal investigations |

## Preserved legacy/source surfaces

The top-level `.ai` tree is now numbered-only.

Preserved legacy material still exists, but under numbered parents:
- `03_plans/preserved/`
- `05_logs/legacy-*`
- `06_specs/deep/`
- `08_prompts/legacy/`
- `09_archive/store/`
- `10_state/legacy-*`
- `11_skills/payloads/`
- `12_agents/payloads/`

Use the canonical map before deciding where new docs belong:
- `.ai/00_system/ai-folder-canonical-map.md`

## Rules for humans and coding agents

1. **Audit before edit** — do not update state, roadmap, or AGENTS files from assumption.
2. **Prefer additive updates** — create bridge notes, audits, plans, and supersession logs instead of destructive cleanup.
3. **Keep canonical ownership clear** — README is the entrypoint; `.ai` is operations; `.ai/06_specs/deep` is deep reference.
4. **Date time-sensitive claims** — counts, validation results, and status notes must be dated or omitted.
5. **Preserve history** — when something becomes outdated, mark it historical, transitional, or superseded rather than silently erasing it.
6. **Update `AGENTS.md` with structure changes** — local subtree guidance is part of the operational brain.
7. **Do not recurse on generated audit artifacts** — audits, plans, logs, and indexes created in one run do not become new audit baseline by default.
8. **Remediation is a separate lane** — audit/planning runs document and plan; implementation requires a later approved run.

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

# AI File Lifecycle Audit

Audit date: 2026-04-17

## Objective

Determine which `.ai` files are current, which are stale but should stay active, and which should be moved out of active numbered folders into preserved or archive locations.

## Naming strategy outcome

Active `.ai` management docs now use:
- lowercase kebab-case
- no spaces
- no underscores
- no all-caps

Strategy source:
- `.ai/00_system/naming-conventions.md`

Reserved exceptions:
- `README.md`
- `AGENTS.md`
- payload-required files such as `SKILL.md`
- preserved historical imports

## Archived out of active folders in this run

### Active audits -> archive store

Moved into:
- `.ai/09_archive/store/2026-04-16-repo-intelligence-pass/audits/`

Reason:
- superseded by the 2026-04-17 active audit set

### Active plans -> preserved plans

Moved into:
- `.ai/03_plans/preserved/2026-04-16-repo-intelligence-pass/plans/`

Reason:
- superseded by the current 2026-04-17 remediation plan set

### Active tasks -> archive store

Moved into:
- `.ai/09_archive/store/2026-04-16-repo-intelligence-pass/tasks/`

Reason:
- completed task campaign from the prior repo-intelligence pass

## Still active but stale and should be revised, not archived

### `00_system`

- `architecture-map.md`
- `audit-standards.md`
- `documentation-governance.md`
- `principles.md`
- `system-boundaries.md`
- `workflow.md`

### `06_specs`

- `backend-system-map.md`
- `client-server-boundary-rules.md`
- `data-flow-map.md`
- `documentation-surface-map.md`
- `feature-inventory.md`
- `frontend-execution-model.md`
- `performance-standards.md`
- `route-inventory.md`

### `10_state`

- `active-risks.md`
- `architecture-state-summary.md`
- `backend-state-summary.md`
- `blockers.md`
- `feature-state-summary.md`
- `frontend-state-summary.md`
- `organizational-upgrade-summary.md`
- `performance-state-summary.md`
- `repo-intelligence-summary.md`

### `12_agents`

- `agent-governance-audit.md`
- `agent-hierarchy-map.md`
- `agent-system-map.md`
- `agent-update-plan.md`
- `repo-agent-model.md`

These files are structurally relevant, but their freshness markers still read 2026-04-16 and they need a review/update pass rather than immediate archiving.

## Current active set

Examples of current canonical docs:
- `00_system/ai-folder-canonical-map.md`
- `00_system/repo-map.md`
- `02_audits/master-audit.md`
- `03_plans/implementation-plan.md`
- `03_plans/readiness-plan.md`
- `05_logs/audit-run-log.md`
- `10_state/coverage-matrix.md`
- `10_state/findings-register.md`

## Codebase impact conclusion

- The blast radius of this cleanup was documentation and governance, not application behavior.
- Future lifecycle cleanup should stay focused on `.ai`, root docs, and mirror governance unless a code path explicitly depends on a renamed `.ai` file.

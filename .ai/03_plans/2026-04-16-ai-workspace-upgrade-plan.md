# Plan: Non-Destructive `.ai` Organizational Upgrade

**Date:** 2026-04-16
**Scope:** `.ai` workspace only
**Constraint:** No existing files or folders are deleted as part of this plan.

## Plan commitments

- No existing files will be deleted.
- No existing folders will be deleted.
- Existing work will be preserved.
- Existing legacy locations may remain in place for safety.
- New numbered folders, README files, and system docs will be added to improve clarity.

## Execution phases

### Phase 1 — Audit

- Inventory `.ai` recursively
- Identify aligned areas, missing taxonomy folders, ambiguous materials, duplicates, and naming drift
- Record findings in an audit document

### Phase 2 — Additive structure

- Create missing numbered folders: `00_performance` through `13_research`
- Add README/index files that explain each folder's purpose
- Add system-level principles, workflow, and naming conventions

### Phase 3 — Cross-reference and state documentation

- Add a root `.ai/README.md`
- Add a legacy-to-target mapping doc
- Add a current-state summary and organizational-upgrade summary
- Add an organizational-upgrade log and archive policy

### Phase 4 — Validation

- Re-scan `.ai`
- Confirm numbered folders exist
- Confirm existing files remain present
- Confirm the work was organizational only

## What will remain where it is for safety

- `.ai/docs/` remains in place as the established active documentation corpus
- `.ai/archive/` and `.ai/docs/archive/` both remain intact
- `.ai/plans/`, `.ai/prompts/`, `.ai/skills/`, `.ai/agents/`, `.ai/state/`, `.ai/rules/`, `.ai/ralph/`, `mcp.json`, and `settings.json` remain preserved in place

## Optional future cleanup recommendations (not executed here)

1. Manually decide whether `.ai/archive/` and `.ai/docs/archive/` should share a documented canonical relationship.
2. Review duplicate or overlapping audit/plan documents to identify canonical references.
3. Normalize naming gradually for new files while preserving historical names in old material.
4. Consider a future human-approved migration of especially active legacy folders into the numbered taxonomy only when traceability is guaranteed.

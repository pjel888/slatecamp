<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# .ai

## Scope
This file governs the `.ai/` subtree unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`.ai/` is the repository's operational intelligence layer.
It currently contains:
- numbered operational folders (`00_*` through `13_*`)
- numbered canonical folders plus numbered preserved subfolders
- deep reference docs under `.ai/06_specs/deep/`
- repo-wide audits, plans, roadmap, state, task, and agent-model documents

## Canonical roles inside `.ai`
- `.ai/` = operational brain
- `.ai/06_specs/deep/` = deep reference/spec corpus
- `.ai/09_archive/` and preserved archive areas = historical context, not deletion bins
- `.ai/10_state/` = current operational assessment
- `.ai/12_agents/` = repo agent-model docs
- `.ai/00_system/ai-folder-canonical-map.md` = canonical routing map for numbered vs unnumbered `.ai` surfaces

## What agents must do here
1. Audit before editing; do not update state, roadmap, or audit docs from assumption.
2. Prefer additive, non-destructive updates.
3. Mark historical or superseded material clearly rather than silently removing it.
4. Keep `.ai` consistent with `README.md`, root docs topology, and the nearest repo `AGENTS.md` hierarchy.
5. When implementation reality changes, update the relevant `.ai` state/audit/plan docs in the same change.
6. Generated audit, plan, and log artifacts do not recursively expand audit scope.
7. Audit/planning runs stop at documentation and planning artifacts; remediation requires a later implementation-approved run.

## Validation expectations
- verify every referenced file/path exists
- re-scan touched `.ai` areas after edits
- keep archive actions traceable
- use `git diff --check` for doc-only passes

## Anti-laziness rule
Do not treat `.ai` as a dumping ground. Every file here should either explain current reality, preserve historical context, or drive execution with a clear role.

## Precedence and authority
- Root `AGENTS.md` governs first.
- Local `.ai/**/AGENTS.md` files refine subtree rules.
- `.omx/` runtime outputs are never canonical `.ai` truth even when they are present locally.

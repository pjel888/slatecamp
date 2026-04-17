<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# .ai

## Scope
This file governs the `.ai/` subtree unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`.ai/` is the repository's operational intelligence layer.
It currently contains:
- numbered operational folders (`00_*` through `13_*`)
- preserved legacy/source folders (`agents/`, `archive/`, `docs/`, `plans/`, `prompts/`, `rules/`, `skills/`, `state/`, `ralph/`)
- deep reference docs under `.ai/docs/`
- repo-wide audits, plans, roadmap, state, task, and agent-model documents

## Canonical roles inside `.ai`
- `.ai/` = operational brain
- `.ai/docs/` = deep reference/spec corpus
- `.ai/09_archive/` and preserved archive areas = historical context, not deletion bins
- `.ai/10_state/` = current operational assessment
- `.ai/12_agents/` = repo agent-model docs

## What agents must do here
1. Audit before editing; do not update state, roadmap, or audit docs from assumption.
2. Prefer additive, non-destructive updates.
3. Mark historical or superseded material clearly rather than silently removing it.
4. Keep `.ai` consistent with `README.md`, root docs topology, and the nearest repo `AGENTS.md` hierarchy.
5. When implementation reality changes, update the relevant `.ai` state/audit/plan docs in the same change.

## Validation expectations
- verify every referenced file/path exists
- re-scan touched `.ai` areas after edits
- keep archive actions traceable
- use `git diff --check` for doc-only passes

## Anti-laziness rule
Do not treat `.ai` as a dumping ground. Every file here should either explain current reality, preserve historical context, or drive execution with a clear role.

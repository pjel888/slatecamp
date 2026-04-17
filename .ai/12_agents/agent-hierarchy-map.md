# Agent Hierarchy Map

**Last Updated:** 2026-04-17

## Levels

- **Level 1:** root `AGENTS.md`
- **Level 2:** major subtree governors such as `.ai/AGENTS.md`, `src/AGENTS.md`, and `supabase/AGENTS.md`
- **Level 3+:** route, domain, and subsystem `AGENTS.md` files under `src/app/*`, `src/lib/*`, `scripts/`, and other focused zones

## Adjacent but different surfaces

- `.ai/00_system/` explains repo-wide operating truth and document authority.
- `.agents/skills/` provides reusable Codex workflows, but it does not override scoped `AGENTS.md` files.

## Update discipline

Any AGENTS refresh should be verified from root down to the touched subtree, not inferred from folder names or stale counts.

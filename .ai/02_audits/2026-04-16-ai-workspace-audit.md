# Audit: `.ai` Workspace Organizational Baseline

**Date:** 2026-04-16
**Scope:** Entire `.ai` workspace
**Mode:** Strict non-destructive organizational audit

## Baseline summary

- Top-level entries before upgrade: `agents`, `archive`, `docs`, `logs`, `mcp.json`, `plans`, `prompts`, `ralph`, `rules`, `settings.json`, `skills`, `state`
- Folder count before upgrade: **181**
- File count before upgrade: **774**
- Deepest observed nesting: **9 levels**

## Existing folders already aligned with target intent

| Existing Path | Closest Target Intent | Notes |
| --- | --- | --- |
| `.ai/agents/` | `12_agents/` | Direct match in purpose; preserve and index |
| `.ai/archive/` | `09_archive/` | Direct match in purpose; preserve and index |
| `.ai/logs/` | `05_logs/` | Contains changelog history |
| `.ai/plans/` | `03_plans/` | Existing active planning surface |
| `.ai/prompts/` | `08_prompts/` | Existing prompt storage |
| `.ai/skills/` | `11_skills/` | Existing skill library |
| `.ai/state/` | `10_state/` | Existing human-readable state store |

## Existing folders partially aligned but broader or ambiguous

| Existing Path | Assessment |
| --- | --- |
| `.ai/docs/` | Strong active corpus, but mixes product specs, architecture, development reference, portal docs, and archived legacy material |
| `.ai/rules/` | Valuable governance surface, but not obviously connected to a wider system folder taxonomy |
| `.ai/ralph/` | Runtime-specific state, important to preserve, but not self-documenting in the broader workspace |
| `.ai/mcp.json` / `.ai/settings.json` | Important configuration artifacts without a surrounding system-level explanation |

## Missing target folders before upgrade

The following intended folders did **not** exist before this upgrade:

- `00_performance`
- `00_system`
- `01_roadmap`
- `02_audits`
- `03_plans`
- `04_tasks`
- `05_logs`
- `06_specs`
- `07_experiments`
- `08_prompts`
- `09_archive`
- `10_state`
- `11_skills`
- `12_agents`
- `13_research`

## Misplaced or scattered patterns

1. **Audit material is scattered** across `.ai/plans/`, `.ai/archive/IMPLEMENTED/`, `.ai/archive/RESEARCH/`, and `.ai/docs/archive/agent-archives/sisyphus/implemented-audits/`.
2. **Plan material is split** between `.ai/plans/`, `.ai/docs/00-meta/000-implementation-plan.md`, and archived implemented/superseded collections.
3. **Research and experiment artifacts are interleaved** with archives, module folders, and implemented plan directories.
4. **Task evidence exists without a dedicated task folder**, mostly via `.ai/state/current-task.md` and `.ai/docs/00-meta/tasks-completed/`.
5. **Governance documents exist without a clear systems layer**, mainly under `.ai/rules/`.

## Duplicated or overlapping patterns

- Archive exists in both `.ai/archive/` and `.ai/docs/archive/`.
- Prompt material exists in `.ai/prompts/` and in archived prompt collections under `.ai/docs/archive/legacy/prompts-archived/`.
- Audit/implementation documents appear in both active planning folders and implemented archives.
- Research artifacts are distributed across `RESEARCH`, module folders, archived docs, and plan folders.

## Naming inconsistencies observed

- Mixed separators and casing styles (`2026-04-12-...`, `2026-04-12_...`, title case folders, kebab-case, uppercase archive buckets)
- Mixed status encoding (`DONE`, `SUPERSEDED`, `RESEARCH`, `ABANDONED`, `IMPLEMENTED`) across filenames and folders
- Some typo drift exists (for example `Componetization`)

## Non-destructive standardization opportunities

1. Add a numbered overlay taxonomy without moving legacy folders.
2. Create README/index files that explain where future materials should go.
3. Document legacy-to-target mappings rather than relocating existing content.
4. Add state and summary files clarifying active references and workspace status.
5. Reserve future cleanup for human-reviewed consolidation only.

## Audit conclusion

A destructive cleanup would be risky because the existing `.ai` workspace contains substantial historical and operational value. The safest upgrade path is:

- **preserve all current folders and files**
- **add a numbered organizational overlay**
- **document routing and ownership clearly**
- **defer consolidation/moves to future manual review**

# `.ai` Naming Conventions

**Last Updated:** 2026-04-17

## Active naming strategy

For active `.ai` management docs:
- use lowercase kebab-case
- use `.md`
- do not use spaces
- do not use underscores
- do not use all-caps

Exceptions:
- `README.md`
- `AGENTS.md`
- tool-required payload files such as `SKILL.md`
- explicit run-contract document families when the filename itself is part of the required deliverable set (current exception: `CODEX_ENABLEMENT_*`)

## When to use date prefixes

Use `YYYY-MM-DD-` only when the document is intentionally time-bound and still active.

Pattern:
- `YYYY-MM-DD-topic-purpose.md`

Example:
- `2026-04-17-ai-file-lifecycle-audit.md`

## Stable active docs

If the document is the current canonical surface, omit the date and use lowercase kebab-case.

Examples:
- `master-audit.md`
- `ai-meta-system-audit.md`
- `implementation-plan.md`
- `repo-map.md`
- `coverage-matrix.md`

## Preserved historical docs

Historical files may retain legacy naming when the filename itself is part of the provenance:
- old date prefixes
- underscores
- uppercase status markers such as `DONE`, `ABANDONED`, `SUPERSEDED`
- imported spaces or mixed-case names

Those files belong under preserved locations such as:
- `03_plans/preserved/`
- `06_specs/deep/`
- `08_prompts/legacy/`
- `09_archive/store/`
- `10_state/legacy-*`
- `11_skills/payloads/`
- `12_agents/payloads/`

## Folder naming strategy

- Top-level `.ai` folders remain numbered: `00_*` through `13_*`
- New active subfolders use lowercase kebab-case
- Preserved imported folders may keep inherited names when renaming would erase historical meaning

## Status strategy

Prefer placement over filename shouting:
- active -> active numbered folder
- preserved -> `preserved/`, `store/`, `legacy/`, or `legacy-*`
- archived -> routed through `09_archive/`

## What was applied in this run

- active management docs were renamed from all-caps/underscore style to lowercase kebab-case
- stale 2026-04-16 audits, plans, and task packs were moved out of active numbered folders
- top-level `.ai` roots are now numbered-only

## Rename rule

Do not rename historical files solely for visual consistency.
Rename only when:
1. the file is an active canonical management doc, or
2. the current name creates ambiguity or collision

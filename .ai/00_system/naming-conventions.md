# `.ai` Naming Conventions

**Last Updated:** 2026-05-17
**Status:** Canonical — all new `.ai` files and folders MUST follow these conventions.

---

## Core Principle

Every filename must convey **what**, **when**, and **what kind** at a glance. No guessing. No ambiguity. No `implementation-plan.md` that could be about anything.

---

## File Naming Formats

Three patterns, chosen by document lifecycle:

### Pattern 1: Time-Bound Artifacts (plans, audits, reviews, reports, logs)

```
YYYY-MM-DD--topic--type--descriptor.ext
```

**Use for:** Documents created at a specific point in time that won't be updated in-place. Once the plan/audit/review is done, it's frozen.

| Segment | Format | Example |
|---------|--------|---------|
| Date | `YYYY-MM-DD` | `2026-05-07` |
| Separator | `--` (double dash between major segments) | `--` |
| Topic | kebab-case, 1-4 words max | `landing`, `stairway-configurator`, `bp344-ramp` |
| Separator | `--` | `--` |
| Type | Fixed vocabulary (see below) | `plan`, `audit`, `review`, `report`, `log` |
| Separator | `--` | `--` |
| Descriptor | kebab-case, scopes uniqueness within topic+type | `final-claude`, `v2`, `hero-3d-repair`, `implementation` |

**Examples:**
- `2026-05-07--landing--review--final-claude.md`
- `2026-05-07--landing--plan--hero-3d-interactive.md`
- `2026-05-09--bp344--plan--ramp-visual-rebuild.md`
- `2026-04-29--cleanup--log--execution.md`
- `2026-04-29--launch--audit--prelaunch-readiness.md`

### Pattern 2: Ongoing Canonical Docs (state, spec, map, guide, policy)

```
topic--type--vN.ext
```

**Use for:** Documents that evolve over time and get updated in-place. The version number increments on meaningful content changes.

| Segment | Format | Example |
|---------|--------|---------|
| Topic | kebab-case, 1-3 words | `architecture`, `implementation-status`, `tech-debt` |
| Separator | `--` | `--` |
| Type | Fixed vocabulary | `state`, `spec`, `map`, `guide`, `policy`, `tracker` |
| Separator | `--` | `--` |
| Version | `v` + integer (starts at `v1`) | `v1`, `v2`, `v3` |

**Examples:**
- `architecture--spec--v3.md`
- `implementation-status--state--v2.md`
- `codebase-map--spec--v2.md`
- `do-not-maintain--policy--v1.md`
- `developer-workflow--guide--v1.md`

**Version bump rules:**
- `v1` = initial creation
- Increment on any meaningful content change (not typo fixes)
- Update the "Last Updated" date in the document header when bumping

### Pattern 3: Generated/Machine Artifacts

```
topic--batch-NNN.generated.ext
```

**Use for:** Files produced by scripts/pipelines, not authored by hand.

**Examples:**
- `publish-ready-articles--batch-012.generated.json`
- `content-excellence-roundtrip-dry-run--report.generated.json`

---

## Type Vocabulary (Fixed)

Only these type tokens are permitted. Choose the most specific one.

| Type | Use For |
|------|---------|
| `plan` | Implementation plan, rollout strategy, remediation plan |
| `audit` | Audit report, findings, recommendations |
| `spec` | Technical specification, operational spec, feature spec |
| `report` | Generated report, status report, completion report |
| `log` | Execution log, run log, changelog entry |
| `review` | Code review, plan review, design review output |
| `state` | Current-state document, status tracking |
| `map` | Structural map (routes, architecture, codebase) |
| `guide` | How-to guide, enablement guide, instructions |
| `policy` | Rules, conventions, governance document |
| `tracker` | Progress tracker, batch tracker, checklist |
| `brief` | Research brief, design brief, creative brief |
| `checklist` | Release checklist, QA checklist, gate checklist |
| `inventory` | Generated inventory, file listing |

---

## General Rules

1. **All lowercase.** No `SCREAMING_SNAKE`, no `CamelCase`, no `Title Case`.
2. **No underscores (`_`) in filenames.** The only exception: top-level `.ai` numbered folders (`00_system/`, `03_plans/`).
3. **No spaces.** Use hyphens (`-`).
4. **Double dash `--`** separates major segments (date, topic, type, descriptor).
5. **Single dash `-`** within a segment (compound words like `stairway-configurator`).
6. **No dates at the end.** Dates always come first for time-bound artifacts.
7. **No redundant words.** The type token already says what kind of document it is. Don't add "document", "file", "final-version".
8. **Maximum filename length:** 80 characters. If it exceeds, shorten the descriptor.

### Exceptions (Tool-Required Names)

These names are required by tooling and are exempt from the convention:
- `README.md`
- `AGENTS.md`
- `SKILL.md`
- `PACK_INDEX.md`
- `STORE_INDEX.md`
- `mcp.json`
- `settings.json`

### Exceptions (Active Entrypoint Docs)

These files remain in `.ai/` root as deliberate entrypoints for human and agent discoverability:
- `PROJECT_CONTEXT.md` — what this project is
- `AGENT_INSTRUCTIONS.md` — how to work safely in this repo

These are exempt from the naming convention because their root-level placement is the discovery mechanism.

### Exceptions (Numbered Sequences)

`00_performance/` uses a numbered file sequence (`00_inventory.md` through `41_*.md`). This is a deliberate exception for that folder's internal structure. New performance files should follow the main convention.

---

## Folder Naming

### Top-Level `.ai/` Folders

```
NN_name/
```

Numbered, lowercase, underscore between number and name. These are the only places underscores are permitted.

**Examples:** `00_system/`, `03_plans/`, `06_specs/`, `14_fact_checking/`

### Active Plan/Audit Packages

```
YYYY-MM-DD--topic--purpose/
```

Date-prefixed, double-dash separated. Used for grouping related files around a single project/initiative.

**Examples:**
- `2026-05-07--landing--planning-package/`
- `2026-05-13--stairway--learning-workbench/`
- `2026-05-09--bp344--ramp-rebuild/`

### Ongoing Topic Folders

```
topic--purpose/
```

No date — for folders that accumulate work over time.

**Examples:**
- `3d-modules--lighting-room-simulator/`
- `general--surface-plans/`
- `general--codebase/`

### Preserved/Archived Folders

Keep original names. Renaming historical material erases provenance.

**Examples:**
- `preserved/2026-04-16-repo-intelligence-pass/`
- `09_archive/store/IMPLEMENTED/`

---

## Status by Placement (Not by Filename)

Prefer folder placement over filename shouting:

| Status | Location |
|--------|----------|
| Active | Root of the appropriate numbered folder |
| Superseded | `preserved/` subfolder |
| Archived | `09_archive/store/` |
| Legacy | `legacy/` or `legacy-*` subfolders |

**Don't do this:** `DONE-implementation-plan.md`, `SUPERSEDED-audit.md`, `ABANDONED-feature.md`

**Do this:** Move the file to the appropriate subfolder and rename without the status marker.

---

## What to Rename vs Preserve

| Situation | Action |
|-----------|--------|
| Active file in active folder | Rename to convention |
| Preserved/archived file | Keep original name (provenance > cosmetics) |
| Legacy/historical file | Keep original name |
| Generated file | Keep original name unless the generator can be updated |
| Script-referenced file | **Do not rename** unless script references are updated and validated |

---

## Migration Guide (2026-05-17)

When renaming existing files to this convention:

1. **Identify the topic** — group files by project/feature/initiative
2. **Identify the type** — pick from the fixed vocabulary
3. **Add date** — use the file's original creation/modification date if known, otherwise the current date
4. **Choose descriptor** — the shortest unique string that distinguishes this file from others with the same topic+type
5. **Version ongoing docs** — assign `v1` and note the version in the document header

**Before:**
```
03_plans/ADMIN_SURFACE_PLAN.md
03_plans/implementation-plan.md
03_plans/2026-05-07-landing-final-claude-review.md
03_plans/cleanup-executive-roadmap.md
```

**After:**
```
03_plans/general--surface-plans/admin-surface--plan--v1.md
03_plans/general--codebase/implementation--plan--v1.md
03_plans/2026-05-07--landing--planning-package/2026-05-07--landing--review--final-claude.md
03_plans/general--operations/cleanup-executive--roadmap--v1.md
```

---

## Anti-Drift Rule

Do not create new files that violate these conventions. If you see a name that doesn't fit, either rename it (active file) or leave it (preserved file). Do not introduce new naming patterns.
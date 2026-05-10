# Archive Notes — 2026-05-09

**Archive date:** 2026-05-09
**Auditor:** Sisyphus (automated audit via ultrawork loop)

## What Was Archived

No files were moved into this archive directory. All existing `.ai/` files remain in their original locations. This archive folder was created for future use if files need to be moved.

## What Was Superseded (In-Place)

Instead of moving files, superseded docs were updated in-place with clear banners:

| File | Action | Reason |
|------|--------|--------|
| `project-overview.md` | Added superseded banner | 2026-04-29 counts were stale (105 pages, 92 migrations); now points to `PROJECT_CONTEXT.md` with current verified counts |
| `01_roadmap/README.md` | Updated current gap section | Previously said "no single current master roadmap"; now points to `ROADMAP.md` |
| `04_tasks/README.md` | Updated current gap section | Previously said "no active task packet set"; now points to `TASKS.md` |

## What Was Updated (New Canonical Docs)

The following root-level `.ai/` files were created or substantially updated with verified live-code counts:

| File | Status |
|------|--------|
| `AUDIT_REPORT.md` | Created — audit of `.ai/` folder |
| `IMPLEMENTATION_STATUS.md` | Created — feature-by-feature implementation evidence |
| `PROJECT_CONTEXT.md` | Created — concise project context |
| `ARCHITECTURE.md` | Rewritten — full architecture documentation |
| `ROADMAP.md` | Created — prioritized roadmap |
| `TASKS.md` | Created — execution-level task list |
| `TECH_DEBT.md` | Created — technical debt by severity |
| `DECISIONS.md` | Created — decisions, assumptions, open questions |
| `AGENT_INSTRUCTIONS.md` | Created — agent handoff instructions |
| `README.md` | Updated — index and reading order |

## Verified Counts (2026-05-09)

All counts verified via live `find`/`ls` commands against the codebase:
- 128 page.tsx routes
- 12 route handlers
- 15 layouts
- 104 loading files
- 8 error boundaries
- 101 database migrations
- 88 test files (src/)
- 113 story files
- 150 server action files
- 652 component files
- 76 database tables
- supabase/config.toml: **MISSING**

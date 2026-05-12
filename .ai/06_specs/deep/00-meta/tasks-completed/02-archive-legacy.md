> Historical completed-task artifact from the 2026-04-06 deep-doc migration.
> Preserved for lineage only; not current task or workflow authority.

# Task 02: Archive Legacy Content

**Status:** pending
**Created:** 2026-04-06
**Objective:** Move deprecated numbered folders to `archive/legacy/` and clean up state files

---

## Steps

### 2.1 Archive Numbered Folders

Move all deprecated folders to `archive/legacy/`:

| Source | Destination |
|--------|-------------|
| `01-Discovery/` | `archive/legacy/01-discovery/` |
| `02-Frameworks/` | `archive/legacy/02-frameworks/` |
| `03-PRDs/` | `archive/legacy/03-prds/` |
| `04-Architecture/` | `archive/legacy/04-architecture/` |
| `05-Design/` | `archive/legacy/05-design/` |
| `06-Development/` | `archive/legacy/06-development/` |
| `07-Tests/` | `archive/legacy/07-tests/` |
| `08-Feedback/` | `archive/legacy/08-feedback/` |
| `09-Analytics/` | `archive/legacy/09-analytics/` |
| `10-Marketing/` | `archive/legacy/10-marketing/` |
| `XX-Archive/` | `archive/legacy/xx-archive/` |

### 2.2 Archive SQL Import Scripts

Move SQL import scripts to `archive/wiki-imports/`:
- `_batch*.sql`
- `_sql_*.sql`
- `_combined_insert.sql`
- `_insert.json`

### 2.3 Delete State Files

Remove runtime state directories:
- `.omc/` directories in wiki-articles
- Empty folders: `portal/proposals/`, `portal/superpowers/plans/`, `portal/superpowers/specs/`

### 2.4 Rename Preserved Files

| Current | New Location |
|---------|-------------|
| `SlateCamp Design System.md` | `archive/legacy/design-system.md` |
| `COPY-CONTENT-SOURCE-OF-TRUTH.md` | `03-design/002-copy-guide.md` |
| `RLS-POLICY-PATTERNS.md` | `05-reference/001-rls-patterns.md` |
| `PLATFORM_OVERVIEW.md` | `archive/legacy/platform-overview.md` |
| `portal/architecture/SLATECAMP-ARCHITECTURE.md` | `portal/architecture/001-architecture.md` |

### 2.5 Log Changes

Update `changelog.md` with each archive operation.

---

## Verification

- [ ] All 11 numbered folders exist under `archive/legacy/`
- [ ] All SQL import files under `archive/wiki-imports/`
- [ ] No `.omc/` directories remain
- [ ] No empty folders remain at root level
- [ ] Preserved files in correct new locations
- [ ] `changelog.md` updated with all archive operations

## Notes

- Use `git mv` to preserve git history where possible
- Log each operation in changelog with timestamp

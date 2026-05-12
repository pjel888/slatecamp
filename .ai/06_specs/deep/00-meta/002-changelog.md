# Documentation Changelog

> Historical deep-doc changelog only.
> Current operational logs live under `../../../05_logs/` and current human-readable state lives under `../../../10_state/`.

**Purpose:** Track historical changes to the deep reference corpus
**Source:** Historical deep-doc changelog; current human-readable logs live under `../../../05_logs/`

---

## Format

Each entry follows this format:

```markdown
### YYYY-MM-DD — [Document or Section]

| Change | Details | By |
|--------|---------|-----|
| [Type] | [Description] | [agent name] |
```

**Change types:** Added | Updated | Moved | Archived | Deleted | Renamed

---

## 2026-04-06

### Meta Documentation

| Change | Details | By |
|--------|---------|-----|
| Added | `00-meta/001-index.md` — Master index of all 42 planned documents | main agent |
| Added | `00-meta/002-changelog.md` — This file | main agent |

### Archive Operations

| Change | Details | By |
|--------|---------|-----|
| Archived | `01-Discovery/` → `archive/legacy/01-discovery/` | main agent |
| Archived | `02-Frameworks/` → `archive/legacy/02-frameworks/` | main agent |
| Archived | `03-PRDs/` → `archive/legacy/03-prds/` | main agent |
| Archived | `04-Architecture/` → `archive/legacy/04-architecture/` | main agent |
| Archived | `05-Design/` → `archive/legacy/05-design/` | main agent |
| Archived | `06-Development/` → `archive/legacy/06-development/` | main agent |
| Archived | `07-Tests/` → `archive/legacy/07-tests/` | main agent |
| Archived | `08-Feedback/` → `archive/legacy/08-feedback/` | main agent |
| Archived | `09-Analytics/` → `archive/legacy/09-analytics/` | main agent |
| Archived | `10-Marketing/` → `archive/legacy/10-marketing/` | main agent |
| Archived | `XX-Archive/` → `archive/legacy/xx-archive/` | main agent |
| Archived | 23 SQL/JSON import files → `archive/wiki-imports/` | main agent |
| Deleted | `wiki-articles/.omc/` — Runtime state | main agent |
| Deleted | Empty folders: `plans/`, `audits/`, `proposals/`, `superpowers/*/` | main agent |

### File Renames

| Change | Details | By |
|--------|---------|-----|
| Moved | `SlateCamp Design System.md` → `archive/legacy/design-system.md` | main agent |
| Moved | `COPY-CONTENT-SOURCE-OF-TRUTH.md` → `03-design/002-copy-guide.md` | main agent |
| Moved | `RLS-POLICY-PATTERNS.md` → `05-reference/001-rls-patterns.md` | main agent |
| Moved | `PLATFORM_OVERVIEW.md` → `archive/legacy/platform-overview.md` | main agent |
| Moved | `docs-implementation-plan.md` → `00-meta/000-implementation-plan.md` | main agent |
| Renamed | `portal/architecture/SLATECAMP-ARCHITECTURE.md` → `001-architecture.md` | main agent |

### Protocol Infrastructure

| Change | Details | By |
|--------|---------|-----|
| Added | `.ai/prd.md` — Project definition | main agent |
| Added | `.ai/state/memory.md` — Cross-session verified facts | main agent |
| Added | `.ai/state/current-task.md` — Active task tracker | main agent |
| Added | `.ai/logs/changelog.md` — Operational change log | main agent |
| Added | `.ai/tasks/` — 8 task execution files | main agent |
| Added | `.ai/opencode.json` — OpenCode agent configs | main agent |
| Added | `.ai/mcp-servers.json` — Unified MCP manifest | main agent |
| Added | `.ai/multi-agent.md` — Multi-agent orchestration guide | main agent |
| Added | `.ai/rules/stack.md` — Stack implementation rules | main agent |
| Added | `.ai/rules/design.md` — Design system rules | main agent |
| Added | `.ai/rules/pedagogy.md` — Pedagogical engine rules | main agent |
| Added | `.ai/state/active-tasks/` — Concurrency control dir | main agent |
| Added | `.ai/artifacts/plans/` — Pre-execution plans dir | main agent |
| Added | `.ai/artifacts/verifications/` — Verification outputs dir | main agent |
| Added | `.ai/artifacts/deliverables/` — Deliverables dir | main agent |
| Upgraded | `docs-implementation-plan.md` v4.0 → v5.0 (Model Workspace Protocol) | main agent |

---

*This file tracks documentation changes. Operational changes (code, config) are logged in `.ai/logs/changelog.md`.*

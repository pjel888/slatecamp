# Documentation Index

**Status:** Active  
**Version:** 1.0.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `.ai/docs/` folder structure

---

## How to Read This Index

Each entry follows this format:
```
- **File:** path/to/doc.md
- **Status:** Active | Archive | Legacy
- **Last Updated:** YYYY-MM-DD
- **Source:** source file(s)
```

---

## 00-Meta

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 000 | `00-meta/000-implementation-plan.md` | Active | 2026-04-06 | docs-implementation-plan.md v5.0 |
| 001 | `00-meta/001-index.md` | Active | 2026-04-06 | This file |
| 002 | `00-meta/002-changelog.md` | Active | 2026-04-06 | `.ai/logs/changelog.md` |

---

## 01-Product

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `01-product/001-features.md` | ✅ Active | 2026-04-06 | `src/app/dashboard/AGENTS.md` |
| 002 | `01-product/002-quiz-modes.md` | ✅ Active | 2026-04-06 | `src/types/app.ts`, `src/lib/quiz/` |
| 003 | `01-product/003-readiness-score.md` | ✅ Active | 2026-04-06 | `src/lib/readiness-score.ts` |
| 004 | `01-product/004-wiki.md` | ✅ Active | 2026-04-06 | `src/components/wiki/` |
| 005 | `01-product/005-notes.md` | ✅ Active | 2026-04-06 | `src/types/app.ts`, `src/components/notes/` |
| 006 | `01-product/006-analytics.md` | ✅ Active | 2026-04-06 | `src/components/analytics/` |
| 007 | `01-product/007-camp-trails.md` | ✅ Active | 2026-04-06 | `src/types/app.ts`, `src/lib/queries/trails.ts` |
| 008 | `01-product/008-3d-lab.md` | ✅ Active | 2026-04-06 | `src/features/3d-lab/` |

---

## 02-Architecture

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `02-architecture/001-system-architecture.md` | ✅ Active | 2026-04-06 | `package.json`, `AGENTS.md` |
| 002 | `02-architecture/002-portal-breakdown.md` | ✅ Active | 2026-04-06 | `app/AGENTS.md` |
| 003 | `02-architecture/003-database-schema.md` | ✅ Active | 2026-04-06 | `DATABASE_SCHEMA.sql` |
| 004 | `02-architecture/004-api-reference.md` | ✅ Active | 2026-04-06 | `lib/actions/`, `lib/queries/` |

---

## 03-Design

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `03-design/001-design-system.md` | ✅ Active | 2026-04-06 | `src/app/globals.css` |
| 002 | `03-design/002-copy-guide.md` | ✅ Active | 2026-04-06 | Preserved from root |
| 003 | `03-design/003-component-library.md` | ⏳ Pending | — | `src/components/ui/` |

---

## 04-Development

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `04-development/001-getting-started.md` | ✅ Active | 2026-04-06 | `README.md` |
| 002 | `04-development/002-tech-stack.md` | ✅ Active | 2026-04-06 | `package.json` |
| 003 | `04-development/003-scripts-reference.md` | ✅ Active | 2026-04-06 | `package.json` |
| 004 | `04-development/004-coding-standards.md` | ✅ Active | 2026-04-06 | `CLAUDE.md`, `src/lib/AGENTS.md` |
| 005 | `04-development/005-testing-guide.md` | ✅ Active | 2026-04-06 | `package.json` |
| 006 | `04-development/006-deployment.md` | ✅ Active | 2026-04-06 | `vercel.json` |

---

## 05-Reference

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `05-reference/001-rls-patterns.md` | ✅ Active | 2026-04-06 | Preserved from root |
| 002 | `05-reference/002-glossary.md` | ⏳ Pending | — | All docs + codebase |
| 003 | `05-reference/003-environment-vars.md` | ⏳ Pending | — | Env scan |

---

## Portal Documentation

### Portal Overview

| File | Status | Last Updated | Source |
|------|--------|-------------|--------|
| `portal/000-portal-guide.md` | ✅ Active | 2026-04-06 | `src/app/AGENTS.md`, `config/portals.ts` |
| `portal/001-dashboard.md` | ✅ Active | 2026-04-06 | `dashboard/AGENTS.md` |
| `portal/002-admin.md` | ✅ Active | 2026-04-06 | `admin/AGENTS.md` |
| `portal/003-ceo.md` | ✅ Active | 2026-04-06 | `components/ceo/AGENTS.md`, `queries/ceo/` |
| `portal/004-developer.md` | ✅ Active | 2026-04-06 | `developer/AGENTS.md` |

### Dashboard Portal

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `portal/dashboard/001-overview.md` | ✅ Active | 2026-04-06 | `dashboard/layout.tsx` |
| 002 | `portal/dashboard/002-testing-hub.md` | ✅ Active | 2026-04-06 | `components/testing/` |
| 003 | `portal/dashboard/003-analytics.md` | ✅ Active | 2026-04-06 | `components/analytics/` |

### Admin Portal

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `portal/admin/001-knowledge-hub.md` | ✅ Active | 2026-04-06 | `admin/knowledge/` |
| 002 | `portal/admin/002-taxonomy.md` | ✅ Active | 2026-04-06 | `types/app.ts` |
| 003 | `portal/admin/003-review-queue.md` | ✅ Active | 2026-04-06 | `admin/reviews/` |
| 004 | `portal/admin/004-content-workflow.md` | ✅ Active | 2026-04-06 | `lib/wiki/`, `lib/audit/` |

### CEO Portal

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `portal/ceo/001-command-center.md` | ✅ Active | 2026-04-06 | `components/ceo/` |
| 002 | `portal/ceo/002-financials.md` | ✅ Active | 2026-04-06 | `components/ceo/` |

### Developer Portal

| # | File | Status | Last Updated | Source |
|---|------|--------|-------------|--------|
| 001 | `portal/developer/001-design-system.md` | ✅ Active | 2026-04-06 | `developer/design-system/` |
| 002 | `portal/developer/002-api-reference.md` | ✅ Active | 2026-04-06 | `lib/actions/` |
| 003 | `portal/developer/003-dev-tools.md` | ✅ Active | 2026-04-06 | `developer/tools/` |

---

## Archive (Legacy — Read Only)

All content below is deprecated. **Do not edit.**

| Folder | Reason | Source |
|--------|--------|--------|
| `archive/legacy/01-discovery/` | Outdated personas, legacy branding | Pre-v4.0 |
| `archive/legacy/02-frameworks/` | Wrong package manager, outdated deps | Pre-v4.0 |
| `archive/legacy/03-prds/` | PRDs describe non-existent flows | Pre-v4.0 |
| `archive/legacy/04-architecture/` | Portal counts wrong, routes outdated | Pre-v4.0 |
| `archive/legacy/05-design/` | Empty folder | Pre-v4.0 |
| `archive/legacy/06-development/` | Pre-Bun commands, wrong scripts | Pre-v4.0 |
| `archive/legacy/07-tests/` | Testing matrix outdated | Pre-v4.0 |
| `archive/legacy/08-feedback/` | "Campfire" naming, wrong features | Pre-v4.0 |
| `archive/legacy/09-analytics/` | Chart names don't match codebase | Pre-v4.0 |
| `archive/legacy/10-marketing/` | Old copy, wrong upgrade flow | Pre-v4.0 |
| `archive/legacy/xx-archive/` | Empty folder | Pre-v4.0 |
| `archive/wiki-imports/` | SQL batch import scripts | Pre-v4.0 |

---

## Protocol Files (`.ai/` — Agent Only)

These files are for AI agents, not human readers:

| File | Purpose |
|------|---------|
| `.ai/prd.md` | Project definition |
| `.ai/state/memory.md` | Cross-session verified facts |
| `.ai/state/current-task.md` | Active task tracker |
| `.ai/logs/changelog.md` | Change log (operational) |
| `.ai/multi-agent.md` | Multi-agent orchestration guide |
| `.ai/opencode.json` | OpenCode agent configs |
| `.ai/mcp-servers.json` | Unified MCP server config |
| `.ai/rules/stack.md` | Stack implementation rules |
| `.ai/rules/design.md` | Design system rules |
| `.ai/rules/pedagogy.md` | Pedagogical engine rules |
| `.ai/tasks/*.md` | Task execution files |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Active | Document exists and is current |
| 🔄 In Progress | Document moved/preserved, needs update |
| ⏳ Pending | Not yet written |
| 🏛️ Legacy | Deprecated, preserved for reference |
| 📦 Archive | SQL/scripts, not documentation |

---

**Summary:** 45 planned documents. **39 complete** (87%), **3 pending**, **3 preserved/in-progress**.

---

*Last updated: 2026-04-06 | Tasks 07 (Product) and 08 (Portal) completed*

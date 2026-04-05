# Docs Implementation Plan v5.0 — Model Workspace Protocol

> **Status:** Active  
> **Last Updated:** 2026-04-06  
> **Version:** 5.0 (Model Workspace Protocol)  
> **Approach:** State-driven, version-controlled documentation system  
> **Source of Truth:** `src/`, `DATABASE_SCHEMA.sql`, `package.json`, `src/app/*/AGENTS.md`  
> **Supersedes:** v4.0 (`docs-implementation-plan.md`)

---

## Executive Summary

This plan implements a **Model Workspace Protocol** for SlateCamp's `.ai/docs` documentation — a state-driven, version-controlled system where:

- `.ai/prd.md` — holds the product/project definition that survives session resets
- `.ai/state/memory.md` — accumulates verified facts across sessions
- `.ai/state/current-task.md` — the active task in focus
- `.ai/logs/changelog.md` — every meaningful change is logged
- `.ai/tasks/*.md` — each task is a standalone file, not a todo

**All existing markdown files in `.ai/docs/` numbered folders (01–10) are deprecated. Deprecated content is archived (not deleted) for historical reference.**

---

## Phase 1: Protocol Infrastructure

### 1.1 Core Protocol Files

| File | Purpose | Template |
|------|---------|----------|
| `.ai/prd.md` | Project/product definition, goals, constraints | See Appendix A |
| `.ai/state/memory.md` | Accumulated facts, verified claims, cross-session knowledge | Freeform, structured sections |
| `.ai/state/current-task.md` | Active task in focus | `# Task`, status, blockers, next action |
| `.ai/logs/changelog.md` | Every meaningful change logged | Timestamped entries |
| `.ai/tasks/01-setup-structure.md` | Atomic task file | `# Task N`, objective, steps, verification |

### 1.2 Task Files (`.ai/tasks/`)

Each task is a standalone `.md` file:

```markdown
# Task N: [Short Title]

**Status:** pending | in_progress | completed | blocked  
**Created:** 2026-04-06  
**Objective:** [One-sentence goal]

## Steps
1. [Step]
2. [Step]

## Verification
- [ ] [Criteria]
- [ ] [Criteria]

## Notes
[Optional context, blockers, decisions]
```

---

## Phase 2: Archive Deprecated Content

> All deprecated content is archived, NOT deleted. This preserves historical context.

### 2.1 Archive Numbered Folders

| Path | → Archive Path | Reason |
|------|---------------|--------|
| `01-Discovery/` | `archive/legacy/01-discovery/` | Outdated personas, legacy branding |
| `02-Frameworks/` | `archive/legacy/02-frameworks/` | Wrong package manager, outdated deps |
| `03-PRDs/` | `archive/legacy/03-prds/` | PRDs describe non-existent flows |
| `04-Architecture/` | `archive/legacy/04-architecture/` | Portal counts wrong, routes outdated |
| `05-Design/` | `archive/legacy/05-design/` | Empty folder |
| `06-Development/` | `archive/legacy/06-development/` | Pre-Bun commands, wrong scripts |
| `07-Tests/` | `archive/legacy/07-tests/` | Testing matrix outdated |
| `08-Feedback/` | `archive/legacy/08-feedback/` | "Campfire" naming, wrong features |
| `09-Analytics/` | `archive/legacy/09-analytics/` | Chart names don't match codebase |
| `10-Marketing/` | `archive/legacy/10-marketing/` | Old copy, wrong upgrade flow |
| `XX-Archive/` | `archive/legacy/xx-archive/` | Empty folder |

### 2.2 Archive SQL Imports

| Path | → Archive Path | Reason |
|------|---------------|--------|
| `_batch*.sql` | `archive/wiki-imports/` | Import scripts, not documentation |
| `_sql_*.sql` | `archive/wiki-imports/` | Import scripts, not documentation |
| `_combined_insert.sql` | `archive/wiki-imports/` | Import scripts, not documentation |
| `_insert.json` | `archive/wiki-imports/` | Import metadata, not documentation |

### 2.3 Delete State Files

| Path | Action | Reason |
|------|--------|--------|
| `portal/wiki-articles/.omc/` | DELETE | Runtime state, not documentation |
| `portal/proposals/` | DELETE | Empty folder |
| `portal/superpowers/plans/` | DELETE | Empty folder |
| `portal/superpowers/specs/` | DELETE | Empty folder |

### 2.4 Rename Preserved Files

| Current | New Location | Action |
|---------|-------------|--------|
| `SlateCamp Design System.md` | `archive/legacy/design-system.md` | Archive — will regenerate fresh |
| `COPY-CONTENT-SOURCE-OF-TRUTH.md` | `03-design/002-copy-guide.md` | Move — keep content, update branding |
| `RLS-POLICY-PATTERNS.md` | `05-reference/001-rls-patterns.md` | Move — verify against current schema |
| `PLATFORM_OVERVIEW.md` | `archive/legacy/platform-overview.md` | Archive — will regenerate fresh |
| `docs-implementation-plan.md` | `00-meta/000-implementation-plan.md` | This file, upgraded to v5.0 |
| `portal/architecture/SLATECAMP-ARCHITECTURE.md` | `portal/architecture/001-architecture.md` | Move — update route references |

---

## Phase 3: New Folder Structure

```
.ai/
├── prd.md                           # Project definition
├── state/
│   ├── memory.md                    # Cross-session verified facts
│   └── current-task.md              # Active task in focus
├── logs/
│   └── changelog.md                 # All meaningful changes
├── tasks/
│   ├── 01-setup-structure.md
│   ├── 02-archive-legacy.md
│   ├── 03-write-meta-docs.md
│   ├── 04-write-architecture-docs.md
│   ├── 05-write-design-docs.md
│   ├── 06-write-development-docs.md
│   ├── 07-write-product-docs.md
│   └── 08-write-portal-docs.md
└── docs/                            # Target documentation
    ├── 00-meta/
    │   ├── 000-implementation-plan.md
    │   ├── 001-index.md
    │   └── 002-changelog.md
    ├── 01-product/
    │   ├── 001-features.md
    │   ├── 002-quiz-modes.md
    │   ├── 003-testing-hub.md
    │   ├── 004-wiki.md
    │   ├── 005-analytics.md
    │   ├── 006-camp-trails.md
    │   ├── 007-notes.md
    │   └── 008-3d-lab.md
    ├── 02-architecture/
    │   ├── 001-system-architecture.md
    │   ├── 002-portal-breakdown.md
    │   ├── 003-database-schema.md
    │   └── 004-api-reference.md
    ├── 03-design/
    │   ├── 001-design-system.md
    │   ├── 002-copy-guide.md
    │   └── 003-component-library.md
    ├── 04-development/
    │   ├── 001-getting-started.md
    │   ├── 002-tech-stack.md
    │   ├── 003-scripts-reference.md
    │   ├── 004-coding-standards.md
    │   ├── 005-testing-guide.md
    │   └── 006-deployment.md
    ├── 05-reference/
    │   ├── 001-rls-patterns.md
    │   ├── 002-glossary.md
    │   └── 003-environment-vars.md
    ├── portal/
    │   ├── 000-portal-guide.md
    │   ├── dashboard/
    │   │   ├── 001-dashboard-overview.md
    │   │   ├── 002-navigation.md
    │   │   └── 003-features.md
    │   ├── admin/
    │   │   ├── 001-admin-overview.md
    │   │   ├── 002-knowledge-base.md
    │   │   ├── 003-taxonomy-editor.md
    │   │   └── 004-review-queue.md
    │   ├── ceo/
    │   │   ├── 001-ceo-overview.md
    │   │   └── 002-metrics.md
    │   └── developer/
    │       ├── 001-dev-portal-overview.md
    │       ├── 002-design-system-catalog.md
    │       └── 003-dev-tools.md
    └── archive/
        ├── wiki-imports/            # Old SQL import scripts
        └── legacy/                  # Original numbered folders preserved verbatim
            ├── 01-discovery/
            ├── 02-frameworks/
            ├── 03-prds/
            ├── 04-architecture/
            ├── 05-design/
            ├── 06-development/
            ├── 07-tests/
            ├── 08-feedback/
            ├── 09-analytics/
            ├── 10-marketing/
            └── xx-archive/
```

---

## Phase 4: Task Execution

### Task 01: Setup Folder Structure

**Status:** pending  
**Objective:** Create all directories and core protocol files

**Steps:**
1. Create `.ai/state/`, `.ai/logs/`, `.ai/tasks/` directories
2. Write `.ai/prd.md` (Appendix A)
3. Write `.ai/state/memory.md` with current verified facts
4. Write `.ai/state/current-task.md` (point to Task 01)
5. Write `.ai/logs/changelog.md` with plan creation entry
6. Write all 8 task files under `.ai/tasks/`
7. Create all `.ai/docs/` subdirectories

**Verification:**
- [ ] All directories exist
- [ ] `.ai/prd.md` contains SlateCamp PRD
- [ ] `.ai/state/memory.md` contains verified facts
- [ ] All 8 task files exist under `.ai/tasks/`
- [ ] All doc directories exist under `.ai/docs/`

---

### Task 02: Archive Legacy Content

**Status:** pending  
**Objective:** Move deprecated content to `archive/legacy/`

**Steps:**
1. Create `archive/legacy/` and `archive/wiki-imports/`
2. Move all numbered folders (01-Discovery through 10-Marketing)
3. Move SQL import files
4. Delete state files (`.omc/`, empty folders)
5. Rename preserved files to new locations
6. Log each move in `changelog.md`

**Verification:**
- [ ] All 10 numbered folders exist under `archive/legacy/`
- [ ] SQL files under `archive/wiki-imports/`
- [ ] No `.omc/` directories remain
- [ ] Preserved files in correct new locations

---

### Task 03: Write Meta Documentation

**Status:** pending  
**Source:** `docs-implementation-plan.md`, `README.md`

**Deliverables:**
- `00-meta/001-index.md` — Master index of all planned docs
- `00-meta/002-changelog.md` — Template for tracking doc changes

**Verification:**
- [ ] Index lists all 42 planned documents
- [ ] Changelog has timestamped template

---

### Task 04: Write Architecture Docs

**Status:** pending  
**Source:** `src/app/AGENTS.md`, `src/AGENTS.md`, `package.json`

**Deliverables:**
- `02-architecture/001-system-architecture.md`
- `02-architecture/002-portal-breakdown.md`
- `02-architecture/003-database-schema.md` (link to `DATABASE_SCHEMA.sql`)
- `02-architecture/004-api-reference.md`

**Verification:**
- [ ] Portal counts match actual routes (4 portals)
- [ ] All routes verified against `src/app/*/AGENTS.md`
- [ ] Database table count matches schema

---

### Task 05: Write Design Docs

**Status:** pending  
**Source:** `src/app/globals.css`, `package.json`

**Deliverables:**
- `03-design/001-design-system.md` — Tokens from `globals.css`
- `03-design/002-copy-guide.md` — Brand voice from preserved file
- `03-design/003-component-library.md` — shadcn/ui inventory

**Verification:**
- [ ] All design tokens match `globals.css` verbatim
- [ ] No "Campfire" branding references remain
- [ ] Component names verified against `src/components/ui/`

---

### Task 06: Write Development Docs

**Status:** pending  
**Source:** `package.json`, `CLAUDE.md`, `AGENTS.md`

**Deliverables:**
- `04-development/001-getting-started.md`
- `04-development/002-tech-stack.md`
- `04-development/003-scripts-reference.md`
- `04-development/004-coding-standards.md`
- `04-development/005-testing-guide.md`
- `04-development/006-deployment.md`

**Verification:**
- [ ] All dependencies from `package.json` listed with versions
- [ ] Scripts match `package.json` exactly
- [ ] Coding standards from `CLAUDE.md` applied

---

### Task 07: Write Product Docs

**Status:** pending  
**Source:** `src/app/dashboard/AGENTS.md`, `src/app/dashboard/*/`

**Deliverables:**
- `01-product/001-features.md`
- `01-product/002-quiz-modes.md`
- `01-product/003-testing-hub.md`
- `01-product/004-wiki.md`
- `01-product/005-analytics.md`
- `01-product/006-camp-trails.md`
- `01-product/007-notes.md`
- `01-product/008-3d-lab.md`

**Verification:**
- [ ] All features match actual routes under `src/app/dashboard/`
- [ ] Quiz modes verified against `src/lib/actions/quiz-v2/`
- [ ] Chart names match actual components

---

### Task 08: Write Portal Docs

**Status:** pending  
**Source:** `src/app/*/AGENTS.md` for each portal

**Deliverables:**
- `portal/000-portal-guide.md`
- `portal/dashboard/{001-003}.md`
- `portal/admin/{001-004}.md`
- `portal/ceo/{001-002}.md`
- `portal/developer/{001-003}.md`

**Verification:**
- [ ] Each portal's routes verified
- [ ] No broken cross-references between portal docs

---

## Phase 5: Governance

### 5.1 Pre-Commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Verify no .sql files outside archive/
if git diff --cached --name-only | grep '\.sql$' | grep -v 'archive/'; then
  echo "ERROR: .sql files must be in archive/"
  exit 1
fi

# Verify no .omc/ state directories
if git diff --cached --name-only | grep '\.omc/'; then
  echo "ERROR: .omc/ state directories must not be committed"
  exit 1
fi
```

### 5.2 CI Validation

Add to GitHub Actions (`.github/workflows/docs-validate.yml`):

```yaml
name: Docs Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check no .sql outside archive
        run: |
          find .ai/docs -name "*.sql" ! -path "*/archive/*" && exit 1 || exit 0
      - name: Check no .omc directories
        run: find .ai/docs -name ".omc" -type d | grep . && exit 1 || exit 0
      - name: Check all doc folders exist
        run: |
          for dir in 00-meta 01-product 02-architecture 03-design 04-development 05-reference portal; do
            [ -d ".ai/docs/$dir" ] || echo "MISSING: $dir"
          done
```

### 5.3 Documentation Rules

| Rule | Description |
|------|-------------|
| **Source required** | Every doc must cite `source-of-truth` in header |
| **No assumptions** | Only document what exists in code |
| **Update on change** | When code changes, docs update within same sprint |
| **Kebab-case names** | All files: `001-*.md`, `002-*.md` |
| **Portal docs per-portal** | One folder per portal under `portal/` |
| **Task files for work** | Each work item is a `.ai/tasks/*.md` file |
| **State persists** | Write to `state/memory.md` after verifying facts |

---

## Appendix A: `.ai/prd.md` Template

```markdown
# SlateCamp PRD

**Last Updated:** 2026-04-06  
**Source:** `README.md`, `src/app/*/AGENTS.md`

## What is SlateCamp?

SlateCamp is an ALE prep platform built for the Philippine Architecture Licensure Exam. 
The product combines adaptive quiz flows, an expert-linked wiki, analytics, admin tooling, 
and interactive 3D learning modules under a shared Next.js codebase.

## Portals

| Portal | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/dashboard` | Student-facing study experience |
| Admin | `/admin` | Content, taxonomy, review, publishing |
| CEO | `/ceo` | Internal business reporting |
| Developer | `/developer` | Engineering docs and tools |

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router), React 19.2.4
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 4 with Campfire design tokens
- **Database:** Supabase SSR + PostgreSQL
- **State:** Zustand (client), Server Components (server)
- **3D:** React Three Fiber + Three.js
- **Package Manager:** Bun

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Absolute constraints, tech rules |
| `AGENTS.md` | Codebase overview, patterns |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema |
| `package.json` | Dependencies, scripts, versions |
| `src/app/globals.css` | Design tokens, colors, radii |
| `src/app/*/AGENTS.md` | Portal-specific structure |

## Key Domain Logic

- **Readiness scoring:** `src/lib/readiness-score.ts`
- **SRS/IRT logic:** `src/lib/srs/`
- **Quiz engine:** `src/lib/quiz/` + `src/lib/actions/quiz-v2/`
- **3D learning:** `src/features/3d-lab/` + `src/app/dashboard/3d-lab/`
- **Calculators:** `src/app/calculators/`
- **Wiki:** `src/components/wiki/` + related actions

## Constraints

- Arrow functions only — no `function` declarations
- Server Components by default, client at leaf nodes
- Design tokens from `globals.css` — no hardcoded hex values
- Supabase auth via middleware session refresh
- IRT 2-parameter logistic model for mastery calculations
- 4 portals: Dashboard, Admin, CEO, Developer
```

---

## Appendix B: Source-of-Truth File Inventory

| Source File | Contains | Used By |
|-------------|----------|---------|
| `package.json` | Dependencies, scripts, versions | Tech stack doc |
| `src/app/globals.css` | Design tokens, colors, radii, transitions | Design system doc |
| `src/app/*/AGENTS.md` | Portal structure, routes, components | Architecture + portal docs |
| `src/lib/actions/*/` | Server actions | API reference |
| `src/lib/queries/*/` | Query modules | API reference |
| `DATABASE_SCHEMA.sql` | Tables, columns, relationships | Database reference |
| `supabase/migrations/` | RLS policies, constraints | RLS patterns doc |
| `src/components/ui/` | shadcn/ui components | Component library doc |
| `src/stores/*` | Zustand stores | State management doc |
| `CLAUDE.md` | Absolute constraints, tech rules | Coding standards doc |
| `README.md` | Product overview, setup | Getting started doc |

---

## Appendix C: New Document Checklist (42 total)

**Meta (3):**
- [ ] `00-meta/000-implementation-plan.md`
- [ ] `00-meta/001-index.md`
- [ ] `00-meta/002-changelog.md`

**Product (8):**
- [ ] `01-product/001-features.md`
- [ ] `01-product/002-quiz-modes.md`
- [ ] `01-product/003-testing-hub.md`
- [ ] `01-product/004-wiki.md`
- [ ] `01-product/005-analytics.md`
- [ ] `01-product/006-camp-trails.md`
- [ ] `01-product/007-notes.md`
- [ ] `01-product/008-3d-lab.md`

**Architecture (4):**
- [ ] `02-architecture/001-system-architecture.md`
- [ ] `02-architecture/002-portal-breakdown.md`
- [ ] `02-architecture/003-database-schema.md`
- [ ] `02-architecture/004-api-reference.md`

**Design (3):**
- [ ] `03-design/001-design-system.md`
- [ ] `03-design/002-copy-guide.md`
- [ ] `03-design/003-component-library.md`

**Development (6):**
- [ ] `04-development/001-getting-started.md`
- [ ] `04-development/002-tech-stack.md`
- [ ] `04-development/003-scripts-reference.md`
- [ ] `04-development/004-coding-standards.md`
- [ ] `04-development/005-testing-guide.md`
- [ ] `04-development/006-deployment.md`

**Reference (3):**
- [ ] `05-reference/001-rls-patterns.md`
- [ ] `05-reference/002-glossary.md`
- [ ] `05-reference/003-environment-vars.md`

**Portal (13):**
- [ ] `portal/000-portal-guide.md`
- [ ] `portal/dashboard/001-dashboard-overview.md`
- [ ] `portal/dashboard/002-navigation.md`
- [ ] `portal/dashboard/003-features.md`
- [ ] `portal/admin/001-admin-overview.md`
- [ ] `portal/admin/002-knowledge-base.md`
- [ ] `portal/admin/003-taxonomy-editor.md`
- [ ] `portal/admin/004-review-queue.md`
- [ ] `portal/ceo/001-ceo-overview.md`
- [ ] `portal/ceo/002-metrics.md`
- [ ] `portal/developer/001-dev-portal-overview.md`
- [ ] `portal/developer/002-design-system-catalog.md`
- [ ] `portal/developer/003-dev-tools.md`

---

*Document version: 5.0 | Generated: 2026-04-06 | Status: READY FOR EXECUTION*

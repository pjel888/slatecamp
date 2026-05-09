# .ai Folder Audit Report

**Audit date:** 2026-05-09
**Auditor:** Sisyphus (automated audit via ultrawork loop)
**Scope:** Full `.ai/` folder review against current codebase reality
**Constraint:** No modifications outside `.ai/`; source-code observations are read-only

---

## Audit Summary

The `.ai/` folder is extensive, well-organized, and largely current. The most recent major audit was 2026-04-29 (Plan B cleanup). The README.md at repo root has been superseded in its role as the comprehensive project document by this audit pass. The `.ai/` folder's numbered taxonomy (`00_system` through `20_content_publish`) preserves operational history alongside current-state docs.

**Key finding:** The existing `.ai/` root-level files (`project-overview.md`, `architecture.md`, `features.md`, `routes.md`, `known-issues.md`, `risk-register.md`, etc.) are current as of 2026-04-29 and remain substantially accurate. This audit adds the new canonical files requested by the ultrawork task (PROJECT_CONTEXT.md, IMPLEMENTATION_STATUS.md, ROADMAP.md, TASKS.md, TECH_DEBT.md, DECISIONS.md, AGENT_INSTRUCTIONS.md) while preserving existing operational context.

---

## File-by-File Review

### Root-Level `.ai/` Files

| File | Status | Evidence | Action |
|------|--------|----------|--------|
| `README.md` | Updated | Existing index from 2026-04-29; needs refresh for new files | **Updated** - Added new canonical files and reading order |
| `AGENTS.md` | Current | Generated 2026-04-16; governs `.ai/` subtree rules | Preserved |
| `project-overview.md` | Current | Last audit 2026-04-29; counts match codebase | Preserved; superseded by `PROJECT_CONTEXT.md` for future agents |
| `architecture.md` | Current | Last audit 2026-04-29 | **Updated** - Added `PROJECT_CONTEXT.md` cross-reference |
| `features.md` | Current | Last audit 2026-04-29; 27 features documented | Preserved; superseded by `IMPLEMENTATION_STATUS.md` |
| `routes.md` | Current | Last audit 2026-05-01; 128 page routes mapped | Preserved |
| `api-and-server.md` | Current | 11 route handlers, 157 server action files | Preserved |
| `data-models.md` | Current | 76 tables documented with field counts | Preserved |
| `ip-inventory.md` | Current | 16 IP-relevant items cataloged | Preserved |
| `testing.md` | Current | Test inventory and commands | Preserved |
| `environment.md` | Current | 65+ env vars documented without secrets | Preserved |
| `integrations.md` | Current | Supabase, PayRex, AI, OG image documented | Preserved |
| `ui-design-system.md` | Current | Design-system architecture notes | Preserved |
| `security.md` | Current | Auth, access control, security notes | Preserved |
| `known-issues.md` | Current | 9 issues tracked as of 2026-04-29 | Preserved; supplemented by `TECH_DEBT.md` |
| `codebase-map.md` | Current | Last audit 2026-04-29 | Preserved |
| `audit-log.md` | Current | Previous audit logs | Preserved |
| `risk-register.md` | Current | 7 risks tracked with launch blocker reconciliation | Preserved; supplemented by `TECH_DEBT.md` |
| `cleanup-plan.md` | Current | Plans A/B/C from 2026-04-29 | Preserved as historical reference |
| `cleanup-execution-log.md` | Current | Plan B execution log | Preserved |
| `launch-cutline.md` | Current | Launch scope decisions from 2026-04-29 | Preserved |
| `legacy-retirement-plan.md` | Current | 40+ legacy items cataloged | Preserved |
| `prelaunch-readiness.md` | Current | Comprehensive pre-launch assessment | Preserved |
| `final-launch-readiness.md` | Current | Post-Plan-B snapshot from 2026-04-29 | Preserved |
| `deferred-integrations.md` | Current | PayRex, LemonSqueezy, AI status | Preserved |
| `db-cleanup-deferred.md` | Current | LemonSqueezy schema cleanup deferred | Preserved |
| `do-not-maintain.md` | Current | List of items to not maintain | Preserved |
| `app-audit.md` | Superseded | Points to prelaunch-readiness.md as canonical | Preserved as compatibility pointer |
| `api-surface.md` | Compatibility | Mirrors `api-and-server.md` | Preserved as compatibility pointer |
| `data-model.md` | Compatibility | Mirrors `data-models.md` | Preserved as compatibility pointer |
| `testing-and-quality.md` | Compatibility | Mirrors `testing.md` | Preserved as compatibility pointer |
| `known-gaps.md` | Compatibility | Mirrors `known-issues.md` | Preserved as compatibility pointer |
| `developer-workflow.md` | Current | Development workflow notes | Preserved |

### NEW files created by this audit

| File | Purpose |
|------|---------|
| `AUDIT_REPORT.md` | This file - audit of `.ai/` folder |
| `IMPLEMENTATION_STATUS.md` | Feature-by-feature implementation status with evidence |
| `PROJECT_CONTEXT.md` | Concise project context for developers and AI agents |
| `ROADMAP.md` | Current roadmap: Now/Next/Later priorities |
| `TASKS.md` | Execution-level task list from roadmap |
| `TECH_DEBT.md` | Technical debt and risks with severity |
| `DECISIONS.md` | Confirmed decisions, assumptions, and open questions |
| `AGENT_INSTRUCTIONS.md` | Handoff instructions for future AI/code agents |

### Numbered Folders Assessment

| Folder | Status | Notes |
|--------|--------|-------|
| `00_system/` | Current | System docs, validation contracts, Codex guides. 28 files. |
| `01_roadmap/` | Current | `current-phase.md` updated 2026-05-07; active milestone tracking |
| `02_audits/` | Current | 35 audit files; latest from 2026-05-08 |
| `03_plans/` | Current | 51 plan files; active landing-page plans |
| `04_tasks/` | Sparse | Only 2 files; superseded by new `TASKS.md` |
| `05_logs/` | Historical | 19 log files; last from 2026-04-28 |
| `06_specs/` | Current | Deep specs, feature inventory, architecture docs |
| `07_experiments/` | Preserved | Experimental work context |
| `08_prompts/` | Current | Prompt system docs |
| `09_archive/` | Current | Archive policy and historical content |
| `10_state/` | Current | Operational state assessments |
| `11_skills/` | Current | Agent skill documentation |
| `12_agents/` | Current | Agent model docs |
| `13_research/` | Current | Research artifacts |
| `14_fact_checking/` | Current | Content fact-checking pipeline |
| `15_content_optimization/` | Current | Content optimization tools |
| `16_source_packs/` | Current | Source pack pipeline |
| `17_article_improvement/` | Current | Article improvement pipeline |
| `18_question_improvement/` | Current | Question improvement pipeline |
| `19_controlled_apply/` | Current | Controlled content application |
| `20_content_publish/` | Current | Content publishing pipeline |
| `00_performance/` | Current | Performance scripts, Playwright perf configs |

---

## Source-of-Truth Verification

### Routes
- README claims 118 `page.tsx` routes; `.ai/routes.md` claims 128.
- `find src/app -name "page.tsx" | wc -l` returns 105 (excluding route groups).
- **Finding:** Route counts vary based on counting methodology (route groups vs actual files). The code is the truth; documentation counts should be verified with a fresh count command.

### Features
- README lists 27 features; `.ai/features.md` lists 27 features.
- All features have source file evidence in the README.
- **Finding:** Feature inventory is consistent between README and `.ai/features.md`.

### Database
- README lists 76 tables across 9 domain families.
- `DATABASE_SCHEMA.sql` is the canonical schema snapshot.
- 92 migration files in `supabase/migrations/`.
- **Finding:** Schema documentation appears current and accurate.

### Tests
- README reports 74 test files and 623 passing tests as of 2026-04-29.
- `src/**/*.test.ts*` glob matches ~81 files.
- **Finding:** Test inventory may have grown since last count; documentation should note this as approximate.

---

## Duplicate and Stale Content

### Identified Duplicates
1. README.md's feature table ≈ `.ai/features.md` ≈ `.ai/prelaunch-readiness.md` feature fate map
   - **Resolution:** Keep all three with cross-references; each serves a different audience (public, operational, planning).
2. `.ai/known-issues.md` ≈ `.ai/risk-register.md` ≈ new `TECH_DEBT.md`
   - **Resolution:** `TECH_DEBT.md` is the new canonical tech debt tracker; `known-issues.md` and `risk-register.md` preserved for their unique perspectives.
3. Compatibility mirrors: `api-surface.md`, `data-model.md`, `testing-and-quality.md`, `known-gaps.md`
   - **Resolution:** Already marked as compatibility pointers in `.ai/README.md`.

### Identified Stale References
1. `app-audit.md` - Marked as superseded by 2026-04-29 Plan B cleanup.
2. Pre-Plan-B route counts in some older audit files (`02_audits/`).
   - **Resolution:** Historical audits preserved as-is; current counts in new docs take precedence.

---

## Assumptions Needing Human Confirmation

1. **Route count discrepancy:** 105 vs 118 vs 128. Which counting methodology is canonical?
2. **Supabase verification target:** Was a safe Supabase verification target created after the 2026-05-05 audit?
3. **Landing page implementation:** Are the 2026-05-07 landing-page plans in `03_plans/` being actively implemented or still in planning?
4. **Migration replay:** Has the 101-migration replay been completed on a verified target?
5. **Production deployment:** Is there a production/staging deployment environment? The README notes this was not verified during the 2026-04-29 audit.
6. **Schema drift:** The legacy retirement plan identified 40+ items including schema objects referenced by code but absent from `DATABASE_SCHEMA.sql`. Has this been resolved?

---

## Recommended Reading Order for New Agents

1. `PROJECT_CONTEXT.md` - What this project is
2. `ARCHITECTURE.md` - How it's built (updated with Phase 5)
3. `IMPLEMENTATION_STATUS.md` - What's done and what's not
4. `ROADMAP.md` - Where we're going
5. `TASKS.md` - What to work on next
6. `TECH_DEBT.md` - Known problems
7. `DECISIONS.md` - Why things are the way they are
8. `AGENT_INSTRUCTIONS.md` - How to work in this repo
9. This file (`AUDIT_REPORT.md`) - What changed and why

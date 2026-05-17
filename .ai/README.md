# `.ai` Operational Intelligence Workspace

**Last audit:** 2026-05-17
**Last organization pass:** 2026-05-17
**Purpose:** This `.ai` directory is SlateCamp's operational intelligence layer. It contains current-state documentation, historical context, plans, audits, specs, performance work, and agent guidance.

---

## Naming Conventions

All `.ai` files and folders follow the naming conventions defined in `00_system/naming-conventions.md`.

**Quick reference:**
- **Time-bound artifacts:** `YYYY-MM-DD--topic--type--descriptor.ext`
- **Ongoing canonical docs:** `topic--type--vN.ext`
- **Type vocabulary:** `plan`, `audit`, `spec`, `report`, `log`, `review`, `state`, `map`, `guide`, `policy`, `tracker`, `brief`, `checklist`, `inventory`
- **All lowercase, double-dash `--` between major segments, single-dash `-` within segments**
- **No underscores in filenames** (except top-level numbered folders: `00_system/`, `03_plans/`, etc.)

---

## Recommended Reading Order (for new agents)

1. `PROJECT_CONTEXT.md` — What this project is, who it's for, current stage
2. `00_system/DOCS_SOURCE_OF_TRUTH.md` — Where canonical docs live by job
3. `00_system/naming-conventions.md` — File and folder naming rules
4. `00_system/philip-ux-ui-calibration.md` — Philip's UX/UI calibration: uniformity, grids, visual evidence
5. `06_specs/architecture--spec--v3.md` — Technical architecture, request flow, boundaries, risks
6. `10_state/implementation-status--state--v2.md` — Feature-by-feature implementation evidence
7. `01_roadmap/roadmap--state--v1.md` — Current priorities: Now/Next/Later
8. `04_tasks/tasks--state--v1.md` — Execution-level task list with acceptance criteria
9. `10_state/tech-debt--state--v1.md` — Known technical debt and risks by severity
10. `10_state/decisions--state--v1.md` — Confirmed decisions, assumptions, open questions
11. `AGENT_INSTRUCTIONS.md` — How to work safely in this repo
12. `02_audits/2026-05-09--repo--audit--full.md` — What was audited and what changed

---

## Current Canonical Docs

| Document | Location | Purpose | Last Updated |
|----------|----------|---------|-------------|
| `PROJECT_CONTEXT.md` | `.ai/` root | Concise project overview for developers/agents | 2026-05-09 |
| `architecture--spec--v3.md` | `06_specs/` | Technical architecture with diagrams | 2026-05-09 |
| `implementation-status--state--v2.md` | `10_state/` | Feature-by-feature implementation status with evidence | 2026-05-09 |
| `roadmap--state--v1.md` | `01_roadmap/` | Prioritized roadmap: Now/Next/Later | 2026-05-09 |
| `tasks--state--v1.md` | `04_tasks/` | Execution-level task list from roadmap | 2026-05-09 |
| `tech-debt--state--v1.md` | `10_state/` | Technical debt and risks by severity | 2026-05-09 |
| `decisions--state--v1.md` | `10_state/` | Confirmed decisions, assumptions, open questions | 2026-05-09 |
| `AGENT_INSTRUCTIONS.md` | `.ai/` root | Agent handoff and safe-work instructions | 2026-05-09 |
| `2026-05-09--repo--audit--full.md` | `02_audits/` | 2026-05-09 audit: file review, findings, recommendations | 2026-05-09 |
| `project-overview--spec--v2.md` | `06_specs/` | Previous audit counts and overview (2026-04-29) | 2026-04-29 |
| `features--inventory--v2.md` | `06_specs/` | Feature inventory with status, routes, and file paths | 2026-04-29 |
| `routes--map--v2.md` | `06_specs/` | Complete App Router page route map | 2026-05-01 |
| `api-and-server--spec--v2.md` | `06_specs/` | API route handlers and server action inventory | 2026-04-29 |
| `data-models--spec--v2.md` | `06_specs/` | Schema table/entity inventory (76 tables) | 2026-04-29 |
| `ip-inventory--spec--v1.md` | `06_specs/` | IP-relevant implementation inventory | 2026-04-29 |
| `testing--spec--v2.md` | `06_specs/` | Testing stack, commands, and file inventory | 2026-04-29 |
| `environment--spec--v2.md` | `06_specs/` | Environment variable inventory (no secrets) | 2026-04-29 |
| `integrations--spec--v2.md` | `06_specs/` | External service/library integration inventory | 2026-04-29 |
| `ui-design-system--spec--v2.md` | `06_specs/` | Design-system and UI architecture notes | 2026-04-29 |
| `security--spec--v2.md` | `06_specs/` | Auth, access control, privacy, and security notes | 2026-04-29 |
| `codebase-map--spec--v2.md` | `06_specs/` | Folder/file map for future agents | 2026-04-29 |
| `2026-04-29--repo--log--audit.md` | `05_logs/` | Previous audit logs and methodology | 2026-04-29 |
| `known-issues--state--v1.md` | `10_state/` | Current gaps, risks, and follow-ups | 2026-04-29 |
| `risk-register--state--v1.md` | `10_state/` | Risk tracking with IDs, owners, classifications | 2026-04-30 |
| `2026-04-29--cleanup--plan--prelaunch.md` | `03_plans/` | Pre-launch cleanup plans (A/B/C) | 2026-04-29 |
| `2026-04-29--cleanup--log--execution.md` | `05_logs/` | Plan B execution log | 2026-04-29 |
| `2026-04-29--launch--plan--cutline.md` | `03_plans/` | Launch scope decisions (keep/defer/remove) | 2026-04-29 |
| `2026-04-29--legacy--plan--retirement.md` | `03_plans/` | 40+ legacy items cataloged for retirement | 2026-04-29 |
| `2026-04-29--launch--audit--prelaunch-readiness.md` | `02_audits/` | Comprehensive pre-launch assessment | 2026-04-29 |
| `2026-04-29--launch--audit--final-readiness.md` | `02_audits/` | Post-Plan-B launch readiness snapshot | 2026-04-29 |
| `2026-04-29--integrations--audit--deferred.md` | `02_audits/` | PayRex, LemonSqueezy, AI provider status | 2026-04-29 |
| `2026-04-29--db--plan--cleanup-deferred.md` | `03_plans/` | LemonSqueezy schema cleanup tracking | 2026-04-29 |
| `do-not-maintain--policy--v1.md` | `00_system/` | Items explicitly excluded from maintenance | 2026-04-29 |
| `developer-workflow--guide--v1.md` | `00_system/` | Developer workflow and conventions | 2026-05-09 |
| `content-excellence--goal--v1.md` | `15_content_optimization/` | Content excellence targets and standards | 2026-05-09 |
| `naming-conventions.md` | `00_system/` | File and folder naming convention system | 2026-05-17 |

---

## Numbered Taxonomy

| Folder | Purpose | Status |
|--------|---------|--------|
| `00_system/` | System docs, naming conventions, validation contracts, Codex guides, runbooks | Active |
| `00_performance/` | Performance scripts, Playwright perf configs, benchmarks, audits | Active |
| `01_roadmap/` | Current phase, milestone tracker, feature status map, roadmap state | Active |
| `02_audits/` | Audit reports organized by topic (supabase, cleanup, code-quality, architecture, admin, docs) | Active |
| `03_plans/` | Active plans in topic subfolders plus preserved/superseded plan artifacts | Active |
| `04_tasks/` | Task state (sparse; superseded by `01_roadmap/`) | Superseded |
| `05_logs/` | Execution logs and run records | Historical |
| `06_specs/` | Operational specs, feature inventory, architecture docs; `deep/` = deep reference corpus | Active |
| `07_experiments/` | Experimental work context | Preserved |
| `08_prompts/` | Prompt system documentation; `legacy/` = preserved prompt artifacts | Active |
| `09_archive/` | Archive policy, index, and historical content store; `store/` = preserved archives | Active |
| `10_state/` | Operational state assessments, risk register, tech debt, decisions | Active |
| `11_skills/` | Agent skill documentation; `payloads/` = live skill payloads | Active |
| `12_agents/` | Agent model documentation; `payloads/` = live agent payloads | Active |
| `13_research/` | Research artifacts and labeled research packs (UX, market, competitive) | Active |
| `14_fact_checking/` | Content fact-checking pipeline, trackers, reports, and scripts | Active |
| `15_content_optimization/` | Content optimization pipeline, batch trackers, release reports | Active |
| `16_source_packs/` | Source pack pipeline — manifests, packs, reports, validation | Active |
| `17_article_improvement/` | Article improvement pipeline — diffs, jobs, outputs, reports | Active |
| `18_question_improvement/` | Question improvement pipeline — diffs, jobs, outputs, reports, generated artifacts | Active |
| `19_controlled_apply/` | Controlled content application — backups, logs, reports | Active |
| `20_content_publish/` | Content publishing pipeline — publish-ready batches, diffs, backups | Active |

Use `00_system/ai-folder-canonical-map.md` for the full routing of numbered vs unnumbered surfaces.

### Top-Level Exceptions

| Path | Role | Status |
|------|------|--------|
| `content-audit-export/` | Content round-trip export workspace; `articles/` corpus and run artifacts | Active/generated; do not move without script-path validation |
| `16_source_packs_draft/` | Draft source-pack staging area; scripts reference this path directly | Active; do not move without script-path validation |
| `scripts/` | Utility Python scripts for content operations | Active; verify script references before relocating |
| `tmp/` | Local generated residue; currently untracked | Do not promote unless explicitly needed |

---

## Rules

- **Codebase is source of truth.** Docs are hypotheses until verified against code.
- **Do not copy secrets into docs.** Document variable names only.
- **Date time-sensitive counts and validation claims.**
- **Follow naming conventions.** See `00_system/naming-conventions.md` for the complete specification.
- **Update README.md and relevant `.ai/` docs together** when product/architecture/routes change.
- **Prefer additive, non-destructive updates.** Mark historical/superseded material clearly.
- **Audit before editing.** Do not update state, roadmap, or audit docs from assumption.
- **No new unnumbered top-level folders.** Use the numbered taxonomy or archive under `09_archive/store/`.

---

## .ai/ Organization Pass (2026-05-17)

This pass reorganized `.ai/` following the naming conventions and folder taxonomy:

- **Naming conventions** established in `00_system/naming-conventions.md` — new files must follow the convention; existing entrypoint files (PROJECT_CONTEXT.md, AGENT_INSTRUCTIONS.md, etc.) retain original names for discoverability
- **Root cleanup:** 33 markdown files moved from `.ai/` root into appropriate numbered folders; 5 compatibility redirects deleted; 6 non-markdown files relocated
- **`03_plans/`** loose files grouped into dated topic subfolders
- **Unnumbered exception folders** archived into `09_archive/store/` — only `content-audit-export/`, `scripts/`, and `tmp/` remain as top-level exceptions
- **Other numbered folders** (`02_audits/`, `00_performance/`, `14_fact_checking/`, `18_question_improvement/`) polished with loose files grouped into subfolders

---

## Plan B Cleanup & Launch Stance (2026-04-29)

The current launch stance is **payment-free and live-AI-provider-free**. Key decisions:
- PayRex checkout/webhook code retained but disabled (`NEXT_PUBLIC_PAYMENTS_ENABLED=false`)
- Live AI provider behavior deferred; quiz AI helper UI disabled
- LemonSqueezy runtime removed; schema columns deferred
- Legacy routes cleaned up; `/tools` canonical, `/calculators` redirects
- `/dashboard/quiz` canonical; `/quiz/*` and `/dashboard/drills/*` redirect-only

---

## Previous Audit (2026-05-09)

New files created to provide a structured entry point for future agents:
- `PROJECT_CONTEXT.md`, `06_specs/architecture--spec--v3.md` (updated), `10_state/implementation-status--state--v2.md`
- `01_roadmap/roadmap--state--v1.md`, `04_tasks/tasks--state--v1.md`, `10_state/tech-debt--state--v1.md`, `10_state/decisions--state--v1.md`
- `AGENT_INSTRUCTIONS.md`, `02_audits/2026-05-09--repo--audit--full.md`

No existing files were deleted. The archive directory `09_archive/store/2026-05-09/` was created for future archival needs. Active docs with stale counts were marked with superseded banners showing current verified counts alongside historical values.

# `.ai` Operational Intelligence Workspace

**Last audit:** 2026-05-09
**Purpose:** This `.ai` directory is SlateCamp's operational intelligence layer. It contains current-state documentation, historical context, plans, audits, specs, performance work, and agent guidance.

---

## Recommended Reading Order (for new agents)

1. **PROJECT_CONTEXT.md** — What this project is, who it's for, current stage
2. **ARCHITECTURE.md** — Technical architecture, request flow, boundaries, risks
3. **IMPLEMENTATION_STATUS.md** — Feature-by-feature implementation evidence
4. **ROADMAP.md** — Current priorities: Now/Next/Later
5. **TASKS.md** — Execution-level task list with acceptance criteria
6. **TECH_DEBT.md** — Known technical debt and risks by severity
7. **DECISIONS.md** — Confirmed decisions, assumptions, open questions
8. **AGENT_INSTRUCTIONS.md** — How to work safely in this repo
9. **AUDIT_REPORT.md** — What was audited and what changed (this pass)

---

## Current Canonical Docs (root-level `.ai/`)

| Document | Purpose | Last Updated |
|----------|---------|-------------|
| `PROJECT_CONTEXT.md` | Concise project overview for developers/agents | 2026-05-09 |
| `ARCHITECTURE.md` | Technical architecture with diagrams | 2026-05-09 |
| `IMPLEMENTATION_STATUS.md` | Feature-by-feature implementation status with evidence | 2026-05-09 |
| `ROADMAP.md` | Prioritized roadmap: Now/Next/Later | 2026-05-09 |
| `TASKS.md` | Execution-level task list from roadmap | 2026-05-09 |
| `TECH_DEBT.md` | Technical debt and risks by severity | 2026-05-09 |
| `DECISIONS.md` | Confirmed decisions, assumptions, open questions | 2026-05-09 |
| `AGENT_INSTRUCTIONS.md` | Agent handoff and safe-work instructions | 2026-05-09 |
| `AUDIT_REPORT.md` | This audit's file review, findings, and recommendations | 2026-05-09 |
| `project-overview.md` | Previous audit counts and overview (2026-04-29) | 2026-04-29 |
| `features.md` | Feature inventory with status, routes, and file paths | 2026-04-29 |
| `routes.md` | Complete App Router page route map | 2026-05-01 |
| `api-and-server.md` | API route handlers and server action inventory | 2026-04-29 |
| `data-models.md` | Schema table/entity inventory (76 tables) | 2026-04-29 |
| `ip-inventory.md` | IP-relevant implementation inventory | 2026-04-29 |
| `testing.md` | Testing stack, commands, and file inventory | 2026-04-29 |
| `environment.md` | Environment variable inventory (no secrets) | 2026-04-29 |
| `integrations.md` | External service/library integration inventory | 2026-04-29 |
| `ui-design-system.md` | Design-system and UI architecture notes | 2026-04-29 |
| `security.md` | Auth, access control, privacy, and security notes | 2026-04-29 |
| `codebase-map.md` | Folder/file map for future agents | 2026-04-29 |
| `audit-log.md` | Previous audit logs and methodology | 2026-04-29 |
| `known-issues.md` | Current gaps, risks, and follow-ups | 2026-04-29 |
| `risk-register.md` | Risk tracking with IDs, owners, classifications | 2026-04-30 |
| `cleanup-plan.md` | Pre-launch cleanup plans (A/B/C) | 2026-04-29 |
| `cleanup-execution-log.md` | Plan B execution log | 2026-04-29 |
| `launch-cutline.md` | Launch scope decisions (keep/defer/remove) | 2026-04-29 |
| `legacy-retirement-plan.md` | 40+ legacy items cataloged for retirement | 2026-04-29 |
| `prelaunch-readiness.md` | Comprehensive pre-launch assessment | 2026-04-29 |
| `final-launch-readiness.md` | Post-Plan-B launch readiness snapshot | 2026-04-29 |
| `deferred-integrations.md` | PayRex, LemonSqueezy, AI provider status | 2026-04-29 |
| `db-cleanup-deferred.md` | LemonSqueezy schema cleanup tracking | 2026-04-29 |
| `do-not-maintain.md` | Items explicitly excluded from maintenance | 2026-04-29 |

### Compatibility Mirrors
These files point to canonical docs above and are preserved to avoid broken references:

| Mirror | Points To |
|--------|-----------|
| `api-surface.md` | `api-and-server.md` |
| `data-model.md` | `data-models.md` |
| `testing-and-quality.md` | `testing.md` |
| `known-gaps.md` | `known-issues.md` |
| `app-audit.md` | `prelaunch-readiness.md` |

---

## Numbered Taxonomy

Preserved operational folders with historical and active content:

| Folder | Purpose | Status |
|--------|---------|--------|
| `00_system/` | System docs, validation contracts, Codex guides, architecture maps | Active |
| `00_performance/` | Performance scripts, Playwright perf configs, benchmarks | Active |
| `01_roadmap/` | Current phase, milestone tracker, feature status map | Active |
| `02_audits/` | Historical and recent audit reports (35 files) | Historical/Active |
| `03_plans/` | Implementation plans, cleanup plans, landing plans (51 files) | Active |
| `04_tasks/` | Task checklists (sparse; superseded by `TASKS.md`) | Superseded |
| `05_logs/` | Execution logs and run records (19 files) | Historical |
| `06_specs/` | Deep reference specs, feature inventory, architecture docs | Active |
| `07_experiments/` | Experimental work context | Preserved |
| `08_prompts/` | Prompt system documentation | Active |
| `09_archive/` | Archive policy and historical content | Active |
| `10_state/` | Operational state assessments | Active |
| `11_skills/` | Agent skill documentation | Active |
| `12_agents/` | Agent model documentation | Active |
| `13_research/` | Research artifacts (UX, market, competitive) | Active |
| `14_fact_checking/` | Content fact-checking pipeline | Active |
| `15_content_optimization/` | Content optimization tools | Active |
| `16_source_packs/` | Source pack pipeline | Active |
| `17_article_improvement/` | Article improvement pipeline | Active |
| `18_question_improvement/` | Question improvement pipeline | Active |
| `19_controlled_apply/` | Controlled content application | Active |
| `20_content_publish/` | Content publishing pipeline | Active |

Use `.ai/00_system/ai-folder-canonical-map.md` for the full historical routing of numbered vs unnumbered surfaces.

---

## Rules

- **Codebase is source of truth.** Docs are hypotheses until verified against code.
- **Do not copy secrets into docs.** Document variable names only.
- **Date time-sensitive counts and validation claims.**
- **Update README.md and relevant `.ai/` docs together** when product/architecture/routes change.
- **Prefer additive, non-destructive updates.** Mark historical/superseded material clearly.
- **Audit before editing.** Do not update state, roadmap, or audit docs from assumption.

---

## Plan B Cleanup & Launch Stance (2026-04-29)

The current launch stance is **payment-free and live-AI-provider-free**. Key decisions:
- PayRex checkout/webhook code retained but disabled (`NEXT_PUBLIC_PAYMENTS_ENABLED=false`)
- Live AI provider behavior deferred; quiz AI helper UI disabled
- LemonSqueezy runtime removed; schema columns deferred
- Legacy routes cleaned up; `/tools` canonical, `/calculators` redirects
- `/dashboard/quiz` canonical; `/quiz/*` and `/dashboard/drills/*` redirect-only

---

## This Audit (2026-05-09)

New files created to provide a structured entry point for future agents:
- `PROJECT_CONTEXT.md`, `ARCHITECTURE.md` (updated), `IMPLEMENTATION_STATUS.md`
- `ROADMAP.md`, `TASKS.md`, `TECH_DEBT.md`, `DECISIONS.md`
- `AGENT_INSTRUCTIONS.md`, `AUDIT_REPORT.md`

No existing files were deleted or archived — the `.ai/` folder's operational history is preserved intact. The new files supplement existing documentation rather than replacing it.

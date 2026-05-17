# SlateCamp — Authoritative Repository Reference

**Do NOT trust stale memory.** Read this file before answering any question about the repo.
**Path:** `/.ai/00_system/slatecamp-authoritative-reference.md`
**Last verified:** 2026-05-17 (post-reorg)
**Branch:** `3dlab-gray-viewport-bg`

---

## 1. Identity

**SlateCamp** — Philippine **Licensure Examination for Architects (LEA)** prep platform.
Pre-launch MVP. Next.js 16 App Router. Supabase PostgreSQL. Bun-first.

Previous name: ALE (Architecture Licensure Examination). **All code, docs, and content have been migrated to LEA.**

## 2. Root File Layout

| File | Role |
|------|------|
| `AGENTS.md` | Repo-wide execution rules for AI agents (8.5K, 200+ lines) |
| `CLAUDE.md` | Policy-heavy repository contract (18.5K, 515 lines) |
| `DESIGN.md` | Agent-readable visual identity + design token contract (13.6K, 280 lines) |
| `GEMINI.md` | Gemini-specific instructions (888 bytes) |
| `README.md` | Comprehensive repo entrypoint (84K — largest doc) |
| `pass6-findings.md` | Content audit PASS 6 findings (5.4K) |

## 3. `.ai/` Directory Structure (Current)

Numbered-first top-level taxonomy with flat docs and a small set of documented legacy/scripted exceptions.

| Folder | Role | Key Contents |
|--------|------|-------------|
| `00_performance/` | Performance notes & risk refs | |
| `00_system/` | **POLICY LAYER** — read first | `ai-folder-canonical-map.md`, `repo-map.md`, `ENVIRONMENT_CONTRACT.md`, `VALIDATION_MATRIX.md`, `CODEX_ENABLEMENT_GUIDE.md`, `architecture-map.md`, `structure-map.md`, `DATA_BOUNDARY_MAP.md`, `ROUTE_SURFACE_MAP.md`, `REPO_METRICS_METHOD.md`, `DOCS_SOURCE_OF_TRUTH.md`, `documentation-governance.md`, `naming-conventions.md`, `principles.md`, `workflow.md`, `audit-standards.md`, `system-boundaries.md`, `baseline-agents-list.md`, `baseline-markdown-list.md`, `baseline-scope.md`, `cleanup-scope-baseline.md`, `AGENTS_INVENTORY.md` |
| `01_roadmap/` | Current roadmap & phase tracking | |
| `02_audits/` | Active audit registry | |
| `03_plans/` | Active plans + `preserved/` | `ai-folder-organization/`, `content-editorial-pipeline-2026-05-05/`, `final-second-audit/`, `preserved/2026-05-15-content-supabase-closure/` |
| `04_tasks/` | Follow-up task packs | |
| `05_logs/` | Human-readable logs + `legacy-changelog-2026-04-06.md` | |
| `06_specs/` | **Spec surface** | `README.md`, `backend-system-map.md`, `client-server-boundary-rules.md`, `data-flow-map.md`, `documentation-surface-map.md`, `feature-inventory.md`, `frontend-execution-model.md`, `performance-standards.md`, `route-inventory.md` **+** `deep/` (corpus) |
| `06_specs/deep/` | Deep reference/spec corpus | `00-meta/`, `01-product/`, `02-architecture/`, `03-design/`, `04-development/`, `05-reference/`, `archive/`, `portal/` |
| `07_experiments/` | Experiment notes | |
| `08_prompts/` | Active prompt library + `legacy/` | |
| `09_archive/` | Archive entrypoint + `store/` | `archive-index.md`, `archive-policy.md`, `store/` |
| `10_state/` | Human-readable state + `legacy-state/`, `legacy-state-root/`, `legacy-runtime/` | |
| `11_skills/` | Skill governance + `payloads/` | |
| `12_agents/` | Agent governance + `payloads/` | `agent-governance-audit.md`, `agent-hierarchy-map.md`, `agent-system-map.md`, `agent-update-plan.md`, `repo-agent-model.md` |
| `13_research/` | Research packs | `slatecamp-content-roundtrip-docs/`, landing/brand/competitive research packs, `3D-Lab-Audit-And-UXUI-Improvement/` |
| `14_fact_checking/` | Fact-checking records | `flags/`, tracker files, scripts |
| `15_content_optimization/` | Content optimization | `batch-tracker.md`, `final-audit-report.md`, `release-readiness-report.md`, etc. |
| `16_source_packs/` | Source pack pipeline | source pack trackers and validation artifacts |
| `17_article_improvement/` | Article improvement pipeline | article improvement jobs, reports, and validation artifacts |
| `18_question_improvement/` | Question improvement pipeline | question improvement jobs, reports, and validation artifacts |
| `19_controlled_apply/` | Controlled apply pipeline | local apply/rollback evidence |
| `20_content_publish/` | Content publish pipeline | publish readiness and handoff evidence |

**`.ai/` root files (entrypoints):** `AGENTS.md`, `AGENT_INSTRUCTIONS.md`, `PROJECT_CONTEXT.md`, `README.md`

**Docs organized in numbered folders:** See individual folder READMEs and the canonical map at `00_system/ai-folder-canonical-map.md`. Key active docs include:
- `06_specs/architecture--spec--v3.md`, `06_specs/api-and-server--spec--v2.md`, `06_specs/data-models--spec--v2.md`, etc.
- `10_state/implementation-status--state--v2.md`, `10_state/tech-debt--state--v1.md`, `10_state/decisions--state--v1.md`
- `01_roadmap/roadmap--state--v1.md`, `04_tasks/tasks--state--v1.md`
- `02_audits/` for audit reports, `03_plans/` for plans, `05_logs/` for logs

**Naming conventions:** See `00_system/naming-conventions.md`. New files must follow `YYYY-MM-DD--topic--type--descriptor.ext` (time-bound) or `topic--type--vN.ext` (ongoing canonical docs). Some existing active files (PROJECT_CONTEXT.md, AGENT_INSTRUCTIONS.md, etc.) retain their original names as documented entrypoints.

## 4. Mirror Directories

| Dir | Purpose |
|-----|---------|
| `.claude/` | Tool-specific mirror of agent/skill payloads + `agents/` (17 agent files), `skills/` (35 skills) |
| `.cursor/` | Same — `agents/` (19 files), `skills/` (38 skills) |
| `.codex/` | Same — `agents/` (19 files), `skills/` (38 skills), `config.toml` |
| `.gemini/` | Same — `agents/` (19 files), `skills/` (38 skills) |
| `.agents/` | Codex-discoverable shared skill surface, `skills/` (9 skills) |
| `.github/` | PR template + CI workflows |

All mirrors are **tracked copies** — no declared generator/parity contract. Source of truth lives in `.ai/`.

## 5. `src/` Directory Structure

| Directory | Contents |
|-----------|----------|
| `src/app/` | App Router routes, layouts, loading/error boundaries, route handlers |
| `src/app/portals` | `(admin-public)/`, `(auth)/`, `(protected)/` |
| `src/app/pages` | about, admin, api/*, auth/*, calculators/*, contact, dashboard/*, developer/*, pricing, quiz, settings/*, tools/*, try |
| `src/components/` | 652 files — UI surface (admin, dashboard, analytics, notes, wiki, testing, shared) |
| `src/features/` | 556 files — large feature modules (3d-lab, wall-configurator) |
| `src/lib/` | Server actions, queries, payments, Supabase helpers, entitlements, SRS, quiz logic, wiki |
| `src/hooks/` | Client-side hooks |
| `src/stores/` | Client-side state stores |
| `src/config/` | Runtime configuration |
| `src/data/` | Fixture data |
| `src/types/` | Shared TypeScript contracts |
| `src/storybook/` | Storybook stories |
| **Live stats (verified 2026-05-09):** | 128 `page.tsx` routes, 15 layouts, 104 loading files, 8 error boundaries, 12 route handlers, 150 action files, 652 components, 556 feature files, 101 migrations, 88 test files, 113 story files |

## 6. Key Scripts (`package.json`)

The content-roundtrip toolchain:
- `content-audit:compose` — composes normalized.md + ui-blocks.json → candidate.md
- `content-audit:push` — pushes candidate.md to Supabase
- `content-audit:push:apply` — apply push
- `content-audit:push:dry-run` — dry run
- `content-audit:validate` — validates roundtrip integrity
- `content-audit:roundtrip` — full roundtrip
- `content-audit:normalize` — normalize raw content
- `content-audit:pull` — pull/export from Supabase into local bundles
- `content-audit:export` — legacy alias for `content-audit:pull`
- `content-audit:inventory` — inventory
- `content-audit:fact-check` — fact-check
- `content-audit:diff` — show diffs
- `content-audit:rewrite` — rewrite content
- `content-audit:admin-log` — admin log
- `content-audit:component-suggestions` — component suggestions
- `content-audit:ui-block-edits` — UI block edits
- `content-audit:push-question:dry-run` — question push dry-run
- `content-audit:push-question:apply` — question push apply

Other: `dev`, `dev:turbo`, `build`, `lint`, `type-check` (check), `db:seed`, `design:lint`, `storybook`, etc.

## 7. Canonical Truth Sources

| Topic | Source |
|-------|--------|
| Commands & tooling | `package.json`, `scripts/` |
| Database schema | `DATABASE_SCHEMA.sql`, `supabase/` (numbered SQL files, not migrations/) |
| Runtime behavior | `next.config.ts`, `middleware.ts`, `src/app/` |
| Design system | `DESIGN.md` (agent-readable), `src/app/globals.css` (implemented) |
| Operational intelligence | `.ai/` (especially `00_system/`, `02_audits/`, `03_plans/`, `05_logs/`, `06_specs/`, `10_state/`) |
| Agent rules | `AGENTS.md` hierarchy (root → subtree → deeper) |
| Policy contract | `CLAUDE.md` |
| Content roundtrip docs | `.ai/13_research/slatecamp-content-roundtrip-docs/` |
| Repo entrypoint | `README.md` |

## 8. Critical Workflows

### Content roundtrip
`raw content` → `normalize` → `normalized.md` + `ui-blocks.json` → `compose` → `candidate.md` → `push:apply` → Supabase

### App request flow
`middleware.ts` → `src/lib/supabase/middleware.ts` (auth refresh) → route/layout in `src/app/` → data via `src/lib/actions/` or `src/lib/queries/` or `src/lib/supabase/`

### Entitlement flow
`resolveRole` → `applyPolicy` → `resolveEntitlements` → `enforce` → `audit`

## 9. Known Drift / Ambiguity

- `Bun-first` docs (package-lock.json has been deprecated; bun.lock is canonical)
- Server-first conventions vs broad client-heavy surfaces
- `.omx/` state vs `.ai/10_state/` vs `10_state/legacy-state`
- AGENTS.md has minimal persona; CLAUDE.md has full persona — not harmonized

## 10. This File Must Be Updated When

- Directory structure changes
- New major feature is built
- Stats drift (article count, component count, test count)
- Any root config file is added or removed

## Local Source Verification Hub

For law/code/content-production claims, use `.ai/00_system/vitruvius-source-reference.md` as the local source map. Primary truth starts in `vitruvius-connection/001_Raw-Source-Layer/`; `002_Raw-Conversion-Layer/` is search/OCR support only; `003_Canonical-Knowledge-Layer/` is discovery/context only. Learner-facing legal/code claims require raw source path, SHA256, locator, claim class, extraction status, and SME/release status.

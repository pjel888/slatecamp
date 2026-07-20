# `.ai` Folder Canonical Map

## Current rule

The canonical project intelligence root is `.ai/`.

The intended active structure is numbered-first. New durable project-management, audit, plan, state, prompt, agent, skill, archive, research, fact-checking, and content-optimization material should be placed under the numbered folders listed below.

As of 2026-05-17, the `.ai/` cleanup pass is complete. The tree now contains only numbered folders plus four documented top-level exceptions. See below for the resolved exception list.

## Top-level canonical folders

| Folder | Role | Notes |
| --- | --- | --- |
| `00_performance/` | performance notes and risk references | supporting reference layer |
| `00_system/` | governance, routing, structure, naming, workflow | primary policy layer |
| `01_roadmap/` | current roadmap and phase tracking | active roadmap index |
| `02_audits/` | active audit registry | current audit entrypoint |
| `03_plans/` | active plan registry | current planning entrypoint |
| `04_tasks/` | follow-up task packs | task packets only |
| `05_logs/` | human-readable logs | includes preserved legacy changelog |
| `06_specs/` | spec surface | root = operational summaries, `deep/` = deep reference corpus |
| `07_experiments/` | experiment notes | low-volume research/prototype shelf |
| `08_prompts/` | active prompt library | includes preserved prompt artifacts under `legacy/`; **frontier Plan Pack lifecycle + grounded Git commit workflow** under `000_Planning Prompts/` and `000_Git Commit Prompt/` (see `.ai/08_prompts/README.md`) |
| `09_archive/` | archive entrypoint | includes preserved content under `store/` |
| `10_state/` | human-readable state | includes preserved state/runtime residue under `legacy-*` |
| `11_skills/` | skill governance | live payloads under `payloads/` |
| `12_agents/` | agent governance | live payloads under `payloads/` |
| `13_research/` | research packs | current research shelf |
| `14_fact_checking/` | article/content fact-checking trackers and reports | active curriculum QA workstream |
| `15_content_optimization/` | article optimization batches, release notes, and trackers | active until live content push is complete |
| `16_source_packs/` | source pack pipeline and promoted source-pack artifacts | active content QA workstream |
| `17_article_improvement/` | article improvement pipeline outputs and trackers | active content QA workstream |
| `18_question_improvement/` | question improvement pipeline outputs and trackers | active content QA workstream |
| `19_controlled_apply/` | controlled local apply/rollback evidence | active content QA workstream |
| `20_content_publish/` | content publish readiness and handoff evidence | active content QA workstream |

## Top-level exceptions (resolved 2026-05-17)

These four folders remain at `.ai/` top level with documented justification:

| Folder | Justification | Status |
|--------|--------------|--------|
| `content-audit-export/` | Active scripted workspace; `scripts/content-audit/*` and `.ai/scripts/*` reference this path directly | Active — do not move without script-path validation |
| `16_source_packs_draft/` | Draft source-pack staging area; `scripts/content-audit/*` reference this path directly | Active — do not move without script-path validation |
| `scripts/` | Utility Python scripts for content operations | Active — verify references before relocating |
| `tmp/` | Local generated residue; currently not canonical | Do not promote without review |

### Archived exceptions (moved to `09_archive/store/` 2026-05-17)

The following unnumbered folders were archived:
- `articlemedia-fix-v2-backups/` → `09_archive/store/articlemedia-fix-v2-backups/`
- `archive/` → merged into `09_archive/store/2026-05-09/`
- `content-inspection-swarm/` → `09_archive/store/content-inspection-swarm/`
- `final-content-completion/` → `09_archive/store/final-content-completion/`
- `fix-articlemedia-backups/` → `09_archive/store/fix-articlemedia-backups/`
- `wiki-mdx-render-debug/` → `09_archive/store/wiki-mdx-render-debug/`
- `wiki-ui-audit/` → `09_archive/store/wiki-ui-audit/`

### Deleted exceptions (2026-05-17)

- `__pycache__/` — Python bytecode cache, regenerable

## Numbered subfolders that carry preserved or specialized material

| Legacy/specialized function | Current numbered home |
| --- | --- |
| deep reference corpus | `06_specs/deep/` |
| preserved archive content | `09_archive/store/` |
| preserved plan folders | `03_plans/preserved/` |
| live skill payloads | `11_skills/payloads/` |
| live agent payloads | `12_agents/payloads/` |
| preserved prompt artifacts | `08_prompts/legacy/` |
| preserved human-readable state notes | `10_state/legacy-state/` |
| preserved state-root artifacts | `10_state/legacy-state-root/` |
| preserved ralph runtime residue | `10_state/legacy-runtime/ralph/` |
| preserved legacy rules | `00_system/legacy-rules/` |
| preserved legacy changelog | `05_logs/legacy-changelog-2026-04-06.md` |
| archived database rollback/manual repair SQL | `09_archive/store/DB_ROLLBACKS/` |
| preserved content/Supabase closure plans | `03_plans/preserved/2026-05-15-content-supabase-closure/` |

## Source-of-truth policy

- `README.md` = repository entrypoint
- `.ai/00_system/` = policy, placement rules, and operational runbooks
- `.ai/00_system/supabase-change--protocol--v1.md` = mandatory AI-agent protocol for Supabase migrations, RLS, grants, RPCs, Supabase clients, advisor baselines, validation, and post-apply warning checks
- `.ai/00_system/SUPABASE_VERIFICATION_RUNBOOK.md` = operational runbook for safe Supabase migration replay, AI audit DB permission checks, and generated type regeneration
- `.ai/01_roadmap/current-phase.md` = active roadmap/phase state
- `.ai/02_audits/` = home for audit, reconciliation, remediation, and release-readiness reports
- `.ai/03_plans/` = active plans
- `.ai/03_plans/preserved/` = preserved superseded plan files; human-review before deleting or further moving
- `.ai/05_logs/` = human-readable logs
- `.ai/06_specs/deep/` = deep reference/specification corpus
- `.ai/09_archive/` = archive entrypoint and policy
- `.ai/10_state/current-state.md` = current truth / human-readable project state
- `.ai/14_fact_checking/` = current fact-checking evidence
- `.ai/15_content_optimization/` = current content optimization evidence until live push is complete
- `.ai/16_source_packs/` = current source pack evidence
- `.ai/17_article_improvement/` = current article improvement evidence
- `.ai/18_question_improvement/` = current question improvement evidence
- `.ai/19_controlled_apply/` = current local controlled-apply evidence
- `.ai/20_content_publish/` = current content publish evidence
- `.ai/content-audit-export/` = generated/scripted content round-trip workspace; use indexes before moving files
- `.omx/` = local runtime state only, never canonical repository truth

Broad `.ai` archive movements and large docs diffs require human semantic review before commit/release.

## Placement rules

- New deep architecture/product/reference doc: `06_specs/deep/`
- New operational summary spec: `06_specs/`
- New audit/remediation report: `02_audits/`
- New archive content: `09_archive/store/`
- New active plan: `03_plans/`
- New preserved plan import: `03_plans/preserved/`
- New skill payload: `11_skills/payloads/`
- New agent payload: `12_agents/payloads/`
- New fact-checking tracker/report: `14_fact_checking/`
- New content optimization tracker/report: `15_content_optimization/`
- New source pack tracker/report: `16_source_packs/`
- New article improvement tracker/report: `17_article_improvement/`
- New question improvement tracker/report: `18_question_improvement/`
- New controlled-apply tracker/report: `19_controlled_apply/`
- New content publish tracker/report: `20_content_publish/`

## Naming conventions

All `.ai` files and folders MUST follow the naming conventions defined in `00_system/naming-conventions.md`.

**Quick reference:**
- Time-bound artifacts: `YYYY-MM-DD--topic--type--descriptor.ext` (e.g., `2026-05-07--landing--review--final-claude.md`)
- Ongoing canonical docs: `topic--type--vN.ext` (e.g., `architecture--spec--v3.md`)
- Generated artifacts: `topic--batch-NNN.generated.ext`
- Active plan/audit package folders: `YYYY-MM-DD--topic--purpose/`
- Ongoing topic folders: `topic--purpose/`
- Fixed type vocabulary: `plan`, `audit`, `spec`, `report`, `log`, `review`, `state`, `map`, `guide`, `policy`, `tracker`, `brief`, `checklist`, `inventory`
- All lowercase, no underscores (except top-level numbered folders), double-dash `--` between major segments

## Anti-drift rule

Do not introduce new unnumbered top-level `.ai` content folders.
Do not create files that violate the naming conventions.
If preserved legacy material is needed, add it under the appropriate numbered parent.
If an unnumbered legacy folder must remain temporarily, list it in this map and add a cleanup recommendation instead of hiding it.

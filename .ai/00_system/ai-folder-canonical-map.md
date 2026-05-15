# `.ai` Folder Canonical Map

## Current rule

The canonical project intelligence root is `.ai/`.

The intended active structure is numbered-first. New durable project-management, audit, plan, state, prompt, agent, skill, archive, research, fact-checking, and content-optimization material should be placed under the numbered folders listed below.

As of 2026-05-15, the live tree still contains a small set of unnumbered workstream/back-up folders created by older tool runs plus one active scripted content-export workspace. They are tolerated exceptions until a dedicated cleanup pass can either archive them or validate and update all script references.

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
| `08_prompts/` | active prompt library | includes preserved prompt artifacts under `legacy/` |
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

## Known unnumbered legacy exceptions pending cleanup

These folders exist in the live tree but should not be used for new canonical work unless a human explicitly decides otherwise:

- `articlemedia-fix-v2-backups/`
- `archive/`
- `content-audit-export/` — active/generated scripted workspace; do not move `articles/` without validating `scripts/content-audit/*`, `.ai/scripts/*`, and package-script references
- `content-inspection-swarm/`
- `final-content-completion/`
- `fix-articlemedia-backups/`
- `scripts/`
- `tmp/` — local generated residue; currently not canonical and should not be promoted without review
- `wiki-mdx-render-debug/`
- `wiki-ui-audit/`
- `__pycache__/`
- `16_source_packs_draft/` — draft source-pack staging area pending merge/archive decision

Recommended action: archive or merge these during a dedicated `.ai` cleanup sprint. Do not delete without human review because some contain generated artifacts/backups from previous remediation runs.

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

## Anti-drift rule

Do not introduce new unnumbered top-level `.ai` content folders.
If preserved legacy material is needed, add it under the appropriate numbered parent.
If an unnumbered legacy folder must remain temporarily, list it in this map and add a cleanup recommendation instead of hiding it.

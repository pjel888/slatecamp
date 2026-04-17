# `.ai` Folder Canonical Map

## Current rule

The top-level `.ai` tree is numbered-only.
There are no longer any unnumbered top-level content roots such as `docs/`, `archive/`, `plans/`, `agents/`, `skills/`, `state/`, `logs/`, `prompts/`, `rules/`, or `ralph/`.

Preserved legacy material still exists, but it now lives under numbered parents.

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

## Numbered subfolders that now carry preserved legacy material

| Legacy function | Current numbered home |
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

## Source-of-truth policy

- `README.md` = repository entrypoint
- `.ai/00_system/` = policy and placement rules
- `.ai/02_audits/` = active audits
- `.ai/03_plans/` = active plans
- `.ai/05_logs/` = human-readable logs
- `.ai/06_specs/deep/` = deep reference/specification corpus
- `.ai/09_archive/` = archive entrypoint and policy
- `.ai/10_state/` = human-readable current state
- `.omx/` = local runtime state only, never canonical repository truth

## Placement rules

- New deep architecture/product/reference doc: `06_specs/deep/`
- New operational summary spec: `06_specs/`
- New archive content: `09_archive/store/`
- New active plan: `03_plans/`
- New preserved plan import: `03_plans/preserved/`
- New skill payload: `11_skills/payloads/`
- New agent payload: `12_agents/payloads/`

## Implemented normalization in this run

- removed all unnumbered top-level `.ai` content roots
- moved former `.ai/docs` into `06_specs/deep/`
- moved former `.ai/archive` into `09_archive/store/`
- moved former `.ai/plans` into `03_plans/preserved/`
- moved former `.ai/agents` into `12_agents/payloads/`
- moved former `.ai/skills` into `11_skills/payloads/`
- moved former `.ai/ralph` into `10_state/legacy-runtime/ralph/`
- moved former `.ai/state` into `10_state/legacy-state/` and `10_state/legacy-state-root/`
- moved former `.ai/logs`, `.ai/prompts`, and `.ai/rules` content into numbered homes

## Anti-drift rule

Do not reintroduce new unnumbered top-level `.ai` content folders.
If preserved legacy material is needed, add it under the appropriate numbered parent.

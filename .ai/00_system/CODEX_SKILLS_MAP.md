# CODEX_SKILLS_MAP

## Purpose

Define how repo operational docs and Codex skills relate so future sessions know where behavior lives and where reusable workflows live.

## Canonical relationship

| Surface | Role |
| --- | --- |
| `.ai/00_system/*` | policy, routing, contracts, validation, environment maps |
| `.ai/02_audits/*` | evidence and findings |
| `.ai/03_plans/*` | sequencing and approval-ready planning |
| `.ai/11_skills/` | repo-local skill governance and payload storage history |
| `.agents/skills/` | Codex-discoverable shared skill surface for future sessions |

## Rule

- `.ai` remains the canonical documentation and planning layer
- `.agents/skills` is the reusable Codex workflow layer
- skills should point back to canonical `.ai` docs rather than duplicate repository truth

## Current decision on `.ai/11_skills`

- treat `.ai/11_skills/` as the repo-local skill governance/payload surface
- do **not** treat it as the primary Codex-discoverable shared skill surface
- use `.agents/skills/` for the curated shared skills that future Codex sessions should rely on directly

## Skill design rule

Each repo-shared Codex skill should:
- stay scoped to one job
- declare inputs and outputs
- require evidence
- point back to canonical docs and AGENTS hierarchy

## Current repo-shared skill set

- `repo-orientation`
- `docs-sync`
- `route-audit`
- `readiness-check`
- `admin-flow-audit`
- `developer-surface-audit`
- `supabase-safety-review`

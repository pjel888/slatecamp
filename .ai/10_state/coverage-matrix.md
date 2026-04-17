# Coverage Matrix

Status values: `not started`, `in progress`, `complete`, `blocked`, `excluded`

| Area | Status | Audit owner doc | Documentation status | Findings status | Plan linkage | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Root governance and config files | complete | `.ai/02_audits/master-audit.md` | updated | open | `.ai/03_plans/implementation-plan.md` | Includes root docs, package/config files, and runtime contracts |
| `.ai` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/ai-folder-reorg-plan.md` | Primary structural ambiguity area |
| `.claude` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Mirror meta-tooling surface |
| `.code-review-graph` | complete | `.ai/02_audits/tooling-and-ci-audit.md` | inventory-only | open | `.ai/03_plans/risk-management-plan.md` | Inventory-only local graph artifact; gitignored |
| `.codex` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Mirror meta-tooling surface |
| `.cursor` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Mirror meta-tooling surface |
| `.gemini` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Mirror meta-tooling surface |
| `.github` | complete | `.ai/02_audits/tooling-and-ci-audit.md` | updated | open | `.ai/03_plans/readiness-plan.md` | CI and PR workflow |
| `.gitnexus` | complete | `.ai/02_audits/tooling-and-ci-audit.md` | inventory-only | open | `.ai/03_plans/risk-management-plan.md` | Inventory-only local artifact; gitignored |
| `.omx` | complete | `.ai/02_audits/ai-meta-system-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Runtime layer; audit once without recursive expansion |
| `.storybook` | complete | `.ai/02_audits/tooling-and-ci-audit.md` | updated | open | `.ai/03_plans/readiness-plan.md` | Support tooling surface |
| `docs` | complete | `.ai/02_audits/documentation-and-agents-audit.md` | updated | open | `.ai/03_plans/documentation-repair-plan.md` | Missing local AGENTS at T0, now documented |
| `public` | complete | `.ai/02_audits/architecture-audit.md` | verified | open | `.ai/03_plans/implementation-plan.md` | Static asset surface |
| `scripts` | complete | `.ai/02_audits/tooling-and-ci-audit.md` | verified | open | `.ai/03_plans/risk-management-plan.md` | Read-only script contract audit |
| `src` | complete | `.ai/02_audits/architecture-audit.md` | verified | open | `.ai/03_plans/implementation-plan.md` | Main application surface |
| `supabase` | complete | `.ai/02_audits/data-and-supabase-audit.md` | verified | open | `.ai/03_plans/risk-management-plan.md` | Includes migrations and admin scripts |
| Baseline Markdown inventory | complete | `.ai/02_audits/documentation-and-agents-audit.md` | updated | open | `.ai/03_plans/documentation-repair-plan.md` | Frozen register plus disposition map created |
| Baseline `AGENTS.md` inventory | complete | `.ai/02_audits/documentation-and-agents-audit.md` | updated | open | `.ai/03_plans/agents-governance-plan.md` | Frozen register plus AGENTS refresh completed |
| `.git` | excluded | `.ai/00_system/baseline-scope.md` | n/a | n/a | n/a | Git metadata only |
| Runtime docs created by this run | excluded | `.ai/00_system/baseline-scope.md` | n/a | n/a | n/a | Deliverables do not expand scope |

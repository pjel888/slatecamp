# Cleanup Coverage Matrix

| Area | Status | Primary audit doc | Findings status | Plan linkage | Notes |
| --- | --- | --- | --- | --- | --- |
| root docs and configs | complete | `.ai/02_audits/dependency-rationalization-audit.md` | complete | `.ai/03_plans/cleanup-safety-validation-plan.md` | package/tooling and validation contract reviewed from live root files |
| `.ai` | complete | `.ai/02_audits/legacy-code-audit.md` | complete | `.ai/03_plans/legacy-removal-plan.md` | `.ai` assessed for stale references and false-positive cautions only |
| `.storybook` | complete | `.ai/02_audits/dependency-rationalization-audit.md` | complete | `.ai/03_plans/dependency-rationalization-plan.md` | addon/test package and validation-surface review complete |
| `public` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/legacy-removal-plan.md` | asset area reviewed conservatively; no high-value cleanup candidates surfaced |
| `scripts` | complete | `.ai/02_audits/scripts-and-supabase-cleanup-audit.md` | complete | `.ai/03_plans/dependency-rationalization-plan.md` | script/tooling and validation review complete |
| `src/app` | complete | `.ai/02_audits/legacy-code-audit.md` | complete | `.ai/03_plans/cleanup-implementation-plan.md` | route conventions and legacy alias surface reviewed |
| `src/components` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/component-optimization-plan.md` | confirmed alias removals and large component hotspots captured |
| `src/features` | complete | `.ai/02_audits/legacy-code-audit.md` | complete | `.ai/03_plans/component-optimization-plan.md` | 3D migration debt and hotspot modules captured |
| `src/lib` | complete | `.ai/02_audits/client-server-boundary-audit.md` | complete | `.ai/03_plans/cleanup-safety-validation-plan.md` | boundary, duplicate logic, and entitlement blockers captured |
| `src/hooks` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/component-optimization-plan.md` | likely dead and manual-validation hooks captured |
| `src/stores` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/component-optimization-plan.md` | reviewed; no store removals recommended in this run |
| `src/config` | complete | `.ai/02_audits/legacy-code-audit.md` | complete | `.ai/03_plans/dependency-rationalization-plan.md` | route/feature-flag config overlap captured |
| `src/data` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/legacy-removal-plan.md` | stub/seed artifact cautions captured |
| `src/types` | complete | `.ai/02_audits/dead-code-audit.md` | complete | `.ai/03_plans/cleanup-safety-validation-plan.md` | generated/reference contract caution captured |
| `supabase` | complete | `.ai/02_audits/scripts-and-supabase-cleanup-audit.md` | complete | `.ai/03_plans/cleanup-safety-validation-plan.md` | migration history preserved; helper/script blockers captured |
| meta tooling mirrors | complete | `.ai/02_audits/dependency-rationalization-audit.md` | complete | `.ai/03_plans/dependency-rationalization-plan.md` | inventory-only review; not a primary cleanup target in this run |
| `.omx` runtime | excluded | `.ai/02_audits/cleanup-audit.md` | n/a | n/a | local runtime residue excluded from canonical repo cleanup scope |


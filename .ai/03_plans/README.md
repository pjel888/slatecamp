# 03_plans

Use this folder for active implementation plans, rollout strategies, remediation plans, migration plans, and phase-by-phase execution documents.

**Last Updated:** 2026-05-17

## Status

Active planning entrypoint. All loose plan files have been grouped into topic subfolders. Superseded artifacts belong under `preserved/`.

## Current Active Entry Points

- `2026-05-13--li-vizcode--3d-learning-master-plan/` is the active consolidated plan package for LI, VizCode competitive response, 3D Lab hotspot learning, source-truth gates, UX/UI learning paths, implementation sequencing, QA, and release gates.
- `content-editorial-pipeline-2026-05-05/` is the active comprehensive plan pack for source-grounded AI-assisted article/question editing, fact ledgers, validators, pilot benchmarks, and `/admin/ai-audit` integration. Several scripts reference this path directly.
- `final-second-audit/` preserves the live closure/readiness aggregation from the final content/Supabase pass.
- `auth-status-feature-flag-cleanup/` is the preparation-only plan package for high-risk auth/status/feature-flag compatibility cleanup.
- `ai-folder-organization/` contains `.ai` organization plans and cleanup manifests.
- `general--surface-plans/` contains admin, developer, and Codex enablement plans.
- `general--codebase/` contains component optimization, dependency rationalization, legacy removal, and implementation plans.
- `general--operations/` contains ai-folder-reorg, agents-governance, readiness, risk-management, and executive remediation plans.
- `general--cleanup/` contains cleanup executive roadmap, implementation, and safety validation plans.
- `general--docs-and-agents/` contains docs hardening and documentation repair plans.
- `general--misc/` contains content delivery, NSCP, scenario enrichment, and handoff plans.
- `2026-05-07--landing--planning-package/` contains all landing page planning and review artifacts.
- `2026-05-13--stairway--learning-workbench/` contains stairway learning workbench plans and specs.
- `3d-modules/` contains 3D Lab module plans (lighting-room-simulator, parking-lot-requirements).
- See `ls 03_plans/` for the full list of topic subfolders.

## Preserved/Superseded Material

- `preserved/2026-05-15-content-supabase-closure/` contains 300 files from the content/Supabase closure period.
- `preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/` contains prior content-audit editor docs.
- `.ai/09_archive/store/2026-05-13-li-vizcode-3d-learning-consolidation-inputs/` preserves original input folders for the LI/VizCode consolidation.
- `preserved/2026-04-16-repo-intelligence-pass/` preserves older repo-intelligence plan artifacts.
- `.ai/09_archive/store/IMPLEMENTED/` and `.ai/09_archive/store/SUPERSEDED/` contain historical plan outputs.

## Current Shape

- **Top-level loose plans:** 0 (all grouped into topic subfolders)
- **Topic subfolders:** 31
- **Naming convention:** `YYYY-MM-DD--topic--purpose/` for date-specific packages, `general--topic/` for cross-cutting plans
- Historical content is preserved; this folder should not regain loose batch artifacts.

## Organization Rule

- Put new active plans directly under `03_plans/` or in a named active plan folder.
- Follow naming conventions: `YYYY-MM-DD--topic--purpose/` or `topic--purpose/`.
- Put superseded plan imports under `03_plans/preserved/`.
- Keep scripted paths such as `content-editorial-pipeline-2026-05-05/` stable unless references are updated and validated.
- Prefer manifests for bulk moves.

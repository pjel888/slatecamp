# 03_plans

Use this folder for active implementation plans, rollout strategies, remediation plans, migration plans, and phase-by-phase execution documents.

## Status

Active planning entrypoint. Superseded loose artifacts belong under `preserved/` with a README or manifest.

## Current Active Entry Points

- `2026-05-13-li-vizcode-3d-learning-master-plan/` is the active consolidated plan package for LI, VizCode competitive response, 3D Lab hotspot learning, source-truth gates, UX/UI learning paths, implementation sequencing, QA, and release gates.
- `content-editorial-pipeline-2026-05-05/` is the active comprehensive plan pack for source-grounded AI-assisted article/question editing, fact ledgers, validators, pilot benchmarks, and `/admin/ai-audit` integration. Several scripts reference this path directly.
- `final-second-audit/` preserves the live closure/readiness aggregation from the final content/Supabase pass.
- `auth-status-feature-flag-cleanup/` is the preparation-only plan package for high-risk auth/status/feature-flag compatibility cleanup.
- `ai-folder-organization/` contains `.ai` organization plans and cleanup manifests.

## Preserved/Superseded Material

- `preserved/2026-05-15-content-supabase-closure/` contains 300 files: 298 moved loose content/Supabase closure artifacts, this pack's `README.md`, and `MOVE_MANIFEST.tsv`. Start with its `README.md` and manifest.
- `preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/` contains prior active content-audit editor and AI audit admin UI docs, preserved as inputs to `content-editorial-pipeline-2026-05-05/`.
- `.ai/09_archive/store/2026-05-13-li-vizcode-3d-learning-consolidation-inputs/` preserves the original input folders for the LI/VizCode consolidation.
- `preserved/2026-04-16-repo-intelligence-pass/` preserves older repo-intelligence plan artifacts.
- `.ai/09_archive/store/IMPLEMENTED/` and `.ai/09_archive/store/SUPERSEDED/` contain historical plan outputs that are no longer active plans.

## Current Shape

- Top-level plan files after 2026-05-15 organization pass: 58.
- Top-level plan folders after 2026-05-15 organization pass: 17.
- Historical content is preserved; this folder should not regain hundreds of loose batch artifacts.

## Organization Rule

- Put new active plans directly under `03_plans/` or in a named active plan folder.
- Put superseded plan imports under `03_plans/preserved/`.
- Keep scripted paths such as `content-editorial-pipeline-2026-05-05/` stable unless references are updated and validated.
- Prefer manifests for bulk moves.

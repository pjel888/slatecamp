# Content/Supabase Closure `.ai` Organization Plan

**Date:** 2026-05-15
**Scope:** `.ai/` organization after content/Supabase closure work
**Non-goals:** Supabase/DB/auth/billing/DNS/infrastructure mutation, deployment, deletion of historical material, moving generated article corpus paths.

## Recon Summary

- `.ai/09_archive/` is the largest archive surface at about 432 MB, mostly under `.ai/09_archive/store/`.
- `.ai/content-audit-export/` is about 191 MB with 22,322 tracked files and 567 article bundle folders under `articles/`.
- `.ai/03_plans/` had 356 loose top-level files and 16 top-level folders before this pass; 298 loose files were classified as content/Supabase closure batch, production-line, worker-prompt, source-audited coordination, release-freeze, or handoff artifacts.
- `.ai/13_research/` has 8 top-level research pack folders; current README still points at old distributed locations instead of the live pack set.
- `.ai/tmp/` contains one untracked `tsconfig.tsbuildinfo` backup. It should remain uncommitted unless explicitly promoted to historical evidence.

## Reference Findings

- `package.json` exposes content-audit scripts that run `scripts/content-audit/*`.
- `scripts/content-audit/lib.ts` defaults content-audit output to `.ai/content-audit-export`.
- Multiple scripts reference `.ai/content-audit-export/articles` directly.
- Several scripts reference `.ai/03_plans/content-editorial-pipeline-2026-05-05` directly for handoff, admin fixtures, and rebaseline artifacts.
- `.ai/scripts/fix_articlemedia_issues.py` and `.ai/scripts/push_12_missing_articles.py` use absolute paths into `.ai/content-audit-export/articles`.

## Keep Active/Current

- `.ai/00_system/`
- `.ai/01_roadmap/`
- `.ai/02_audits/`
- `.ai/03_plans/README.md`
- `.ai/03_plans/content-editorial-pipeline-2026-05-05/`
- `.ai/03_plans/final-second-audit/`
- `.ai/03_plans/2026-05-13-li-vizcode-3d-learning-master-plan/`
- `.ai/13_research/slatecamp-content-roundtrip-docs/`
- `.ai/14_fact_checking/`
- `.ai/15_content_optimization/`
- `.ai/16_source_packs/`
- `.ai/17_article_improvement/`
- `.ai/18_question_improvement/`
- `.ai/19_controlled_apply/`
- `.ai/20_content_publish/`

## Archive/Superseded

Move only the targeted loose `.ai/03_plans` closure artifacts into:

- `.ai/03_plans/preserved/2026-05-15-content-supabase-closure/`

Proposed subfolders:

- `batch-quality-reviews/` for `batch-*-independent-quality-review*.md`
- `git-handoff-stage-lists/` for `batch-*-git-handoff-stage-*`
- `production-manifests/` for `production-line-batch-*-manifest.json` and reservation manifests
- `worker-prompts/` for `codex-batch-*` and `opencode-batch-*` prompts
- `source-audited-coordination/` for `source-audited-production-line-*`, `source-audited-local-first-*`, reservation summaries, and readiness coordination notes
- `release-freeze-and-blockers/` for terminal freeze, blocker, residual exhaustion, and recent-batch review notes

Each move should be logged in a manifest in the preserved pack.

## Index-Only/No Move

- `.ai/content-audit-export/`: add a README and run-artifact map, but do not move the corpus or top-level run outputs in this pass.
- `.ai/content-audit-export/articles/`: active/generated corpus; do not move.
- `.ai/content-audit-export/runs/`, `roundtrip-dry-run-2026-05-09/`, `target-mapping-no-apply-2026-05-09/`, `source-anchor-extracts/`: leave in place and document.
- `.ai/13_research/`: refresh README/index labels; do not move packs in this pass because research paths appear in archived planning references.
- `.ai/09_archive/store/`: refresh index labels; do not reorganize the large store in this pass.
- `.ai/tmp/`: leave untracked cache backup out of commits; document as local/generated residue in canonical guidance.

## Do-Not-Touch Generated/Scripted Paths

- `.ai/content-audit-export/articles/**`
- `.ai/content-audit-export/component-inventory/**` if present
- `.ai/content-audit-export/source-packs/**` if present
- `.ai/content-audit-export/embeddings/**` if present
- `.ai/content-audit-export/manifest.json`
- `.ai/content-audit-export/export-summary.json`
- `.ai/content-audit-export/sync-state.json`
- `.ai/content-audit-export/validation-report.json`
- `.ai/03_plans/content-editorial-pipeline-2026-05-05/**`
- `.ai/03_plans/final-second-audit/**`

## Planned Edits

1. Create preserved closure pack folders under `.ai/03_plans/preserved/2026-05-15-content-supabase-closure/`.
2. Move the targeted loose `.ai/03_plans` closure files into their matching preserved subfolders.
3. Add a move manifest and README for the preserved pack.
4. Add/refresh README/index files for `.ai/content-audit-export/`, `.ai/13_research/`, `.ai/09_archive/`, and `.ai/03_plans/`.
5. Update `.ai/README.md`, `.ai/AGENTS.md`, `.ai/00_system/ai-folder-canonical-map.md`, and `.ai/00_system/slatecamp-authoritative-reference.md`.

## Verification

- `git status -sb`
- `git diff --check`
- Path-reference scan for moved paths
- Verify package/script references still point to existing paths
- Staged secret scan before commit

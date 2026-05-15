You are the SlateCamp local-first source-audited content batch worker for Batch 161.

Repo: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Baseline: HEAD 28743d0e0 (`chore(content): add NSCP OCR conversion tooling`) after Batch 160 closure commit 3dc61a3d5.

Mission: reopen the residual NSCP/timber blockers ONLY if the newly available local NSCP source conversion gives exact support. Produce one local-first source-audited Batch 161 with article + linked-question edits where source-safe.

Strict rules:
- Local-first only. Do not Supabase push, deploy, mutate DB, merge main, force-push, or touch secrets.
- Do not stage, commit, or push. Hermes will serially accept after review.
- Do not edit unrelated dirty files. Treat these as off-limits unless directly required and explicitly justified in report: `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`, `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`, `.ai/README.md`, `.ai/00_system/philip-ux-ui-calibration.md`, `.hermes/skills/README.md`, `.ai/content-audit-export/sync-state.json`, `.ai/content-audit-export/ui-block-edit-validation.json`, `.ai/content-audit-export/validation-report.json`, untracked `.ai/content-audit-export/runs/content-roundtrip-*`, `.ai/03_plans/blocked-source-recovery/prompt-*.md`, `.ai/03_plans/batch-156-git-finalization-blocker.md`, and the deleted stale `lea-strc-011-03.../compose-error.json`.
- Use raw/local sources first. The valid source is `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National-Structural-Code-of-Ph-7th-Ed.pdf`; conversion is `vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition/` with per-page markdown and metadata. The older `National Structural Code of the Philippines 2015.pdf` is null-byte corrupted and must not be used as evidence.
- Do not cite OCR text blindly. Verify exact anchors in page markdown and source metadata; keep claim scope source-safe.
- Preserve THIN_NEEDS_EXPANSION, scenario/depth, source-primary, and question-alignment findings for final remediation unless directly fixed in the selected batch.

Candidate residual clusters from Batch 160:
- NSCP/seismic/wind/nonstructural: `lea-strc-004-02`, `lea-strc-007-03`, `lea-strc-007-05`, `lea-strc-012-01`, `lea-util-004-05`, `lea-util-004-08`
- Timber-specific: `lea-strc-009-01`, `lea-strc-009-02`

Selection:
- Pick a small safe Batch 161 (prefer 3-5 clusters) from the above only where exact source support exists in the NSCP OCR conversion.
- If some remain unsupported, preserve them as blockers with exact reason and next source need.

Required work per selected cluster:
1. Inspect article folder and linked questions.
2. Source-audit with exact local anchors from NSCP OCR pages / metadata.
3. Update `normalized.md`, regenerate/repair `candidate.md`, update `sources.json` and `source-audit-evidence.json`.
4. Add source-safe `question-edits/*.json` for every linked question; preserve answer keys unless source audit proves a correction and document it.
5. Add concise Real World Scenario only if source-safe and pedagogically useful; otherwise record scenario status.
6. Run compose/diff/validate for every selected article and the scoped scans/tests used by prior batches.

Required artifacts:
- `.ai/content-audit-export/source-audited-article-batch-161-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-161-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-161-local-first-scoped-checks.json`
- `.ai/03_plans/production-line-batch-161-reservation-manifest.json`
- `.ai/03_plans/batch-161-independent-quality-review.md` (self-QA acceptable only if no external reviewer is available; be explicit)
- `.ai/03_plans/batch-161-git-handoff-stage-list.md`
- `.ai/03_plans/batch-161-git-handoff-stage-paths.txt`
- update `.ai/03_plans/source-audited-local-first-batches-handoff.md`
- update `.ai/03_plans/source-audited-production-line-coordination.md`

Acceptance gates before stopping:
- blockers=0 for selected clusters; unresolved unselected clusters listed separately.
- linked-question count equals question-edit count for selected clusters.
- JSON parse passes.
- no placeholders, internal AI notes, raw UI markers, or unsupported source-gap claims in selected content.
- compose/diff/validate passes for selected articles.
- scoped content-audit tests pass.
- scoped `git diff --check` over intended Batch 161 paths passes.
- No Supabase/deploy/DB/main merge/git staging/commit/push.

Final response from worker should state Batch 161 status, selected clusters, question-edit count, blockers, validation commands/results, and intended stage paths.

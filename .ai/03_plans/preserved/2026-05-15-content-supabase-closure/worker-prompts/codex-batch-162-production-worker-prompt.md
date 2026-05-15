You are the SlateCamp local-first source-audited production worker for Batch 162.

Repo: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Baseline commit: ee1283991 chore(content): accept source-audited batch 161

Mission: continue the local-first source-audited production line after Batch 161. Start Batch 162 unless live artifacts prove a later completed/accepted batch exists.

Hard prohibitions:
- No Supabase push, deploy, production DB mutation, main merge, force-push, or destructive git cleanup.
- Do not stage, commit, or push unless all Batch 162 gates pass and only exact intended Batch 162 files are staged. If git staging/commit/push is blocked, write handoff paths and stop.
- Do not edit unrelated dirty files or broad aggregate files unless they are intentionally part of Batch 162 and validated.
- Preserve unrelated dirty paths as off-limits, including: .ai/00_performance/results/dev_server_memory_profile_dev-server.json, .ai/00_system/DOCS_SOURCE_OF_TRUTH.md, .ai/README.md, .hermes/skills/README.md, .ai/00_system/philip-ux-ui-calibration.md, .ai/03_plans/batch-156-git-finalization-blocker.md, .ai/03_plans/blocked-source-recovery/*, .ai/03_plans/codex-batch-161-reopen-nscp-prompt.md, .ai/content-audit-export/runs/content-roundtrip-*/ and pre-existing aggregate validation/sync files unless explicitly regenerated for selected Batch 162 scope.

Required workflow:
1. Inspect latest reports/ledgers/handoff and live git state. Do not duplicate accepted batches.
2. Select only sourceable residual article/question clusters. Batch 161 explicitly deferred lea-strc-009-02 as sourceable with NSCP OCR anchors: vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition/pages/page-0889.md lines 5-65 and page-0943.md lines 51-96. Utility clusters lea-util-004-05 and lea-util-004-08 are not sourceable from NSCP alone; do not include them unless you find exact local authoritative anchors for all linked claims.
3. Prefer a small safe batch if source-heavy. Article edits and linked question-edits must be done together.
4. Use raw/local source first: vitruvius-connection/001_Raw-Source-Layer and 002_Raw-Conversion-Layer. For legal/code/standards claims, cite exact local source path, hash/provenance where available, and line/page anchors.
5. Repair normalized.md and generated candidate.md; keep ui-blocks.json canonical and placeholders in normalized.md only. No raw [SLATECAMP_UI_BLOCK:...] markers in candidate.md.
6. Create/update all linked question-edits JSON. Preserve answer keys unless source audit proves correction; document any answer-key changes explicitly.
7. Add/update sources.json and source-audit-evidence.json for each selected article.
8. Run compose/diff/validate strictly for selected articles; use scoped/temp validation if global export files are dirty.
9. Run JSON parse, placeholder/internal-note/source-gap scan, question parity scan, source verification invariants, and scoped git diff --check.
10. Write required artifacts:
   - .ai/content-audit-export/source-audited-article-batch-162-local-first-report.md
   - .ai/content-audit-export/source-audited-article-batch-162-local-first-ledger.json
   - .ai/content-audit-export/source-audited-article-batch-162-local-first-scoped-checks.json
   - .ai/03_plans/batch-162-independent-quality-review.md
   - .ai/03_plans/batch-162-git-handoff-stage-list.md
   - .ai/03_plans/batch-162-git-handoff-stage-paths.txt
   - update .ai/03_plans/source-audited-local-first-batches-handoff.md and .ai/03_plans/source-audited-production-line-coordination.md with Batch 162 status.
11. If and only if blockers=0, QA PASS, linked-question parity PASS, scoped checks PASS, and git diff --cached --check PASS, commit with: chore(content): accept source-audited batch 162; push origin 3dlab-gray-viewport-bg. If git is blocked, leave exact handoff stage paths and report the blocker.

Final response: concise status with article count, question-edit count, blocker count, artifacts, commands run, commit/push status, and any next source gaps. Never Supabase-push.
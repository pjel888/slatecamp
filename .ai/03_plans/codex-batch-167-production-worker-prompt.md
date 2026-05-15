You are the SlateCamp local-first source-audited production worker for Batch 167.

Repo: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Baseline: Batch 166 accepted and pushed at 50e74000b (origin/3dlab-gray-viewport-bg).

Mission:
Continue the source-audited local-first content production line with the next eligible article/question clusters after Batch 166. If no eligible clusters remain, produce a zero-content closure packet proving exhaustion; otherwise process the next sourceable batch.

Hard prohibitions:
- No Supabase push, deploy, DB mutation, main merge, force-push, or production infrastructure changes.
- Do not edit/stage/revert/delete unrelated dirty product/planning files already present in the working tree.
- Do not touch active read-only audit reports except to avoid them.
- Do not stage broadly. Stage only your intended Batch 167 files using an exact handoff path list.

Current dirty-tree boundary to preserve/off-limits unless directly and intentionally part of Batch 167:
- src/components/marketing/**
- tests/vitest/components/marketing/**
- .ai/00_performance/**
- .ai/00_system/**
- .ai/README.md
- .ai/00_system/philip-ux-ui-calibration.md
- .ai/03_plans/3d-modules/**
- .hermes/skills/README.md
- older untracked prompts/recovery prompts and old content-roundtrip run directories not created by Batch 167
- any currently active rolling-readonly-swarm reports not assigned to you

Batch rules:
1. Inspect existing accepted reports/ledgers/manifests through Batch 166 before selecting work. Do not duplicate accepted clusters.
2. Prefer sourceable residual clusters with authoritative local/raw source evidence. For legal/code/proprietary standards, use only usable local authorized sources or source-safe claim boundaries.
3. For each selected article, update article + all linked question-edits together. Linked-question/question-edit parity is mandatory.
4. Source audit first: raw source -> refined conversion/anchors -> sources.json/source-audit-evidence.json. No unsupported legal/code/numeric claims.
5. Preserve and explicitly classify scenario status for every article: eligible-added, eligible-deferred, or not-applicable. Add concise source-safe scenarios where pedagogically useful.
6. Run compose/diff/validate for every selected article; run scoped JSON parse, placeholder/internal-note/source-gap scan, linked-question parity checks, and scoped git diff --check.
7. Run or obtain independent QA with a different lane/model if available. If unavailable, write exact blocker and do not self-accept as independent QA.
8. Write the completion trio:
   - .ai/content-audit-export/source-audited-article-batch-167-local-first-report.md
   - .ai/content-audit-export/source-audited-article-batch-167-local-first-ledger.json
   - .ai/content-audit-export/source-audited-article-batch-167-local-first-scoped-checks.json
9. Write .ai/03_plans/batch-167-git-handoff-stage-paths.txt with exact intended paths, plus a readable stage list if useful.
10. If all gates pass and blockers=0, stage only exact Batch 167 paths, run `git diff --cached --check`, commit `chore(content): accept source-audited batch 167`, and push origin 3dlab-gray-viewport-bg. If git is blocked, leave exact handoff paths and blocker details for Hermes.

Report requirements:
- Article folders processed
- Linked question count and question-edit count
- Source families used and hashes/locators
- Scenario status per article
- Validation commands/results
- Independent QA path/verdict
- Blockers or zero-content closure proof
- Exact git/staging/push result

Keep working autonomously until Batch 167 is either accepted/pushed or blocked with exact evidence. Never Supabase-push.

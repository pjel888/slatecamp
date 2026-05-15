Independent read-only QA for SlateCamp Batch 163 acceptance.

Repo: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Baseline: 0c0f08510 chore(content): accept source-audited batch 162

You may write exactly one file:
.ai/03_plans/batch-163-independent-quality-review-opencode.md

Hard prohibitions:
- Do not edit article/question/source/export files.
- Do not stage, commit, push, deploy, Supabase push, mutate DB, merge main, force-push, or delete files.
- Do not write anywhere except the single report path above.

Audit evidence to inspect:
- .ai/content-audit-export/source-audited-article-batch-163-local-first-report.md
- .ai/content-audit-export/source-audited-article-batch-163-local-first-ledger.json
- .ai/content-audit-export/source-audited-article-batch-163-local-first-scoped-checks.json
- .ai/03_plans/batch-163-git-handoff-stage-paths.txt
- Article folders:
  - .ai/content-audit-export/articles/lea-util-004-05-seismic-bracing-and-earthquake-resilience--1caee82f-c2c8-409b-a3bf-41576bc702c5
  - .ai/content-audit-export/articles/lea-util-004-08-seismic-bracing-requirements-per-nscp-2015--585425ad-355a-4180-b64b-a872115f39f6
- Local source anchors under vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition/pages/page-0237.md, page-0240.md, page-0259.md, page-0283.md, page-0284.md, page-0285.md, page-0286.md, page-0287.md, page-0290.md

Required report:
1. Verdict: PASS or BLOCKER for Batch 163 acceptance.
2. Evidence files inspected.
3. Source-primary check against local NSCP anchors; identify unsupported claims if any.
4. Roundtrip/placeholder/internal-note check for normalized.md, candidate.md, ui-blocks/ui-block-edits, compose/diff artifacts.
5. Question alignment: verify 30 linked question edits, 0 answer-key changes, source-safe explanations.
6. Scenario/pedagogy: note THIN_NEEDS_EXPANSION or scenario findings for final remediation, but do not block unless misleading/unsupported.
7. Git handoff scope: confirm stage path list is scoped to Batch 163 intended files and excludes unrelated dirty files.
8. Final acceptance recommendation and risks.

Keep it concise, evidence-based, and do not modify anything except the allowed report file.
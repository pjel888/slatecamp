# Batch 164/167 Commit-Scope Reconciliation

Generated: 2026-05-14

## Context

Commit `1cfaf9e8d` was pushed with subject:

`chore(content): accept source-audited batch 167`

The intended Hermes acceptance action was to commit Batch 164 question-alignment remediation after independent QA passed.

## Finding

The commit is mixed in naming/scope documentation but not a content-corruption event.

Content-affecting changes in `1cfaf9e8d` are Batch 164 remediation artifacts:

- 90 question-edit JSON files across the eight NSCP clusters
- 8 `source-audit-evidence.json` files
- Batch 164 report/ledger/scoped-checks/handoff paths
- Batch 164 independent QA report

Additional files in the same commit are Batch 167 zero-content closure artifacts:

- `.ai/content-audit-export/source-audited-article-batch-167-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-167-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-167-local-first-scoped-checks.json`
- `.ai/03_plans/batch-167-independent-quality-review.md`
- `.ai/03_plans/batch-167-independent-quality-review-kimi.md`
- `.ai/03_plans/batch-167-git-handoff-stage-list.md`
- `.ai/03_plans/batch-167-git-handoff-stage-paths.txt`

The Batch 167 artifacts select 0 articles, 0 linked questions, 0 question edits, and 0 answer-key changes. They do not mutate article/question content.

## Verification Performed

Hermes verified before acceptance:

- Batch 164 intended handoff paths: 103
- Missing handoff paths: 0
- JSON files in intended scope: 100
- JSON parse errors: 0
- Question edits: 90
- Bad answer-key flags: 0
- Placeholder/internal-note hits: 0
- `git diff --check`: PASS
- Species-name hits in timber stress-group proposals were manually inspected and confirmed source-safe under NSCP Table 615.2-1 rather than off-anchor timber durability claims.

Independent QA verified Batch 164:

- 90/90 question-edit parity
- 0 answer-key field changes
- all 8 clusters PASS
- no BLOCKER and no NEEDS_REMEDIATION

## Decision

Do not rewrite pushed history.

Reason:

- Rewriting/force-pushing is prohibited without explicit owner approval.
- The commit is already on `origin/3dlab-gray-viewport-bg`.
- The extra Batch 167 files are zero-content closure artifacts, not article/question mutations.
- The substantive remediation is valid and independently QA-passed.

## Publish Gate Implication

Before Supabase apply or website publication, use this interpretation:

- Treat `1cfaf9e8d` as the accepted commit containing Batch 164 question-alignment remediation plus Batch 167 zero-content closure artifacts.
- Do not rely on the commit subject alone for batch semantics.
- Publish readiness must be determined from current artifacts and final freeze audit, not from the commit subject.

## Required Next Step

Run a final freeze/readiness audit over the accepted local state before any Supabase apply:

1. Verify no raw `[SLATECAMP_UI_BLOCK:...]` markers in normalized/candidate article outputs.
2. Verify Batch 164 question-edit parity and answer-key preservation still hold at `HEAD`.
3. Verify source-audit evidence for the eight NSCP clusters points to local NSCP OCR anchors.
4. Verify no content-affecting dirty files are required for publication outside accepted commits.
5. Produce a final publish-readiness report with explicit PASS/BLOCKER status.

No Supabase, deploy, production DB mutation, main merge, or force-push is authorized by this reconciliation.

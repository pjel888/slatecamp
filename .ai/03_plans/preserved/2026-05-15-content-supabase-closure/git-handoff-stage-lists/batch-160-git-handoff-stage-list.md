# Batch 160 Git Handoff Stage List

Batch 160 is a closure packet with no article/question/source edits.

Do not stage unrelated dirty files, deleted compose-error sidecars outside Batch 160, aggregate validation files, untracked content-roundtrip run directories, secrets, Supabase state, deployment config, or any article/source folder.

## Exact Stage Command

```bash
git add --pathspec-from-file=.ai/03_plans/batch-160-git-handoff-stage-paths.txt
```

No `-f` is required because Batch 160 does not add ignored Vitruvius source artifacts.

## Intended Paths

- `.ai/content-audit-export/source-audited-article-batch-160-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-160-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-160-local-first-scoped-checks.json`
- `.ai/03_plans/production-line-batch-160-reservation-manifest.json`
- `.ai/03_plans/batch-160-independent-quality-review.md`
- `.ai/03_plans/batch-160-git-handoff-stage-list.md`
- `.ai/03_plans/batch-160-git-handoff-stage-paths.txt`
- `.ai/03_plans/source-audited-local-first-batches-handoff.md`
- `.ai/03_plans/source-audited-production-line-coordination.md`

## Acceptance Commit Target

```text
chore(content): close source-audited batch 160
```

Suggested Lore trailers:

```text
Constraint: Batch 160 is local-only and has zero selected article/question clusters because the remaining residuals lack legitimate source support.
Confidence: high
Scope-risk: narrow
Directive: Reopen only after legitimate NSCP extraction, timber-specific source acquisition, or explicit owner-approved scope expansion.
Tested: JSON parse, targeted source-verification test, scoped placeholder scan, scoped git diff --check.
Not-tested: Article compose/diff/validate and UI-block validation are not applicable because no article folders were selected.
```

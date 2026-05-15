# Batch 120 Git Handoff Stage List

Git index blocker observed in Codex: `git add` failed creating `.git/index.lock` with `Operation not permitted`.

Hermes should stage, run cached diff check, commit, and push from a live git-capable shell.

## Stage Normal Paths

- .ai/03_plans/production-line-batch-120-manifest.json
- .ai/03_plans/batch-120-independent-quality-review.md
- .ai/03_plans/batch-120-git-handoff-stage-list.md
- .ai/03_plans/source-audited-local-first-batches-handoff.md
- .ai/03_plans/source-audited-local-first-freeze-readiness-report.md
- .ai/03_plans/source-audited-production-line-coordination.md
- .ai/content-audit-export/source-audited-article-batch-120-local-first-report.md
- .ai/content-audit-export/source-audited-article-batch-120-local-first-ledger.json
- .ai/content-audit-export/source-audited-article-batch-120-local-first-scoped-checks.json
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .ai/content-audit-export/validation-report.json
- .ai/content-audit-export/articles/lea-hist-002-04-core-concept--52d78a3d-6f0f-4d68-a8e3-39d02b78d68f
- .ai/content-audit-export/articles/lea-hist-002-05-core-concept--9bcf8ae9-81a7-41eb-b636-74c93570864c
- .ai/content-audit-export/articles/lea-hist-002-06-core-concept--c93bfab9-3571-4e80-8d9b-d9d50a9eff02
- .ai/content-audit-export/articles/lea-hist-004-01-core-concept--157a66ee-39c3-47ba-ba86-f32414fd2896
- .ai/content-audit-export/articles/lea-hist-004-02-core-concept--c0a5189b-4c67-47ad-bfd0-4b4d33df7247

## Force-Add Source Captures

- vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-04-renaissance-architecture.source-capture.md
- vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-05-baroque-architecture.source-capture.md
- vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-06-neoclassicism.source-capture.md
- vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-004-01-islamic-architecture.source-capture.md
- vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-004-02-umayyad-and-abbasid-architecture.source-capture.md
- vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-04-renaissance-architecture.refined.md
- vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-05-baroque-architecture.refined.md
- vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-06-neoclassicism.refined.md
- vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-004-01-islamic-architecture.refined.md
- vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-004-02-umayyad-and-abbasid-architecture.refined.md

## Commands

```bash
git add \
  .ai/03_plans/production-line-batch-120-manifest.json \
  .ai/03_plans/batch-120-independent-quality-review.md \
  .ai/03_plans/batch-120-git-handoff-stage-list.md \
  .ai/03_plans/source-audited-local-first-batches-handoff.md \
  .ai/03_plans/source-audited-local-first-freeze-readiness-report.md \
  .ai/03_plans/source-audited-production-line-coordination.md \
  .ai/content-audit-export/source-audited-article-batch-120-local-first-report.md \
  .ai/content-audit-export/source-audited-article-batch-120-local-first-ledger.json \
  .ai/content-audit-export/source-audited-article-batch-120-local-first-scoped-checks.json \
  .ai/content-audit-export/sync-state.json \
  .ai/content-audit-export/ui-block-edit-validation.json \
  .ai/content-audit-export/validation-report.json \
  .ai/content-audit-export/articles/lea-hist-002-04-core-concept--52d78a3d-6f0f-4d68-a8e3-39d02b78d68f \
  .ai/content-audit-export/articles/lea-hist-002-05-core-concept--9bcf8ae9-81a7-41eb-b636-74c93570864c \
  .ai/content-audit-export/articles/lea-hist-002-06-core-concept--c93bfab9-3571-4e80-8d9b-d9d50a9eff02 \
  .ai/content-audit-export/articles/lea-hist-004-01-core-concept--157a66ee-39c3-47ba-ba86-f32414fd2896 \
  .ai/content-audit-export/articles/lea-hist-004-02-core-concept--c0a5189b-4c67-47ad-bfd0-4b4d33df7247

git add -f \
  vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-04-renaissance-architecture.source-capture.md \
  vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-05-baroque-architecture.source-capture.md \
  vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-002-06-neoclassicism.source-capture.md \
  vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-004-01-islamic-architecture.source-capture.md \
  vitruvius-connection/001_Raw-Source-Layer/002-History/source-map-batch-120/lea-hist-004-02-umayyad-and-abbasid-architecture.source-capture.md \
  vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-04-renaissance-architecture.refined.md \
  vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-05-baroque-architecture.refined.md \
  vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-002-06-neoclassicism.refined.md \
  vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-004-01-islamic-architecture.refined.md \
  vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/source-map-batch-120/lea-hist-004-02-umayyad-and-abbasid-architecture.refined.md

git diff --cached --check
git commit -m "chore(content): accept source-audited batch 120" -m "Constraint: local-first content/source artifacts only; no Supabase push, deploy, production DB mutation, or main merge.
Confidence: high
Scope-risk: narrow
Directive: preserve roundtrip protocol; ui-blocks.json owns blocks, normalized.md owns editable body, candidate.md is generated.
Tested: compose/diff/validate for five slugs; UI-block edit validation; scoped JSON/source/hash/count/scans; targeted content-audit tests; scoped git diff --check.
Not-tested: cached staged diff check, commit, and push blocked inside Codex by git index lock permission."
git push origin 3dlab-gray-viewport-bg
```

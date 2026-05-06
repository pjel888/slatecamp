# Final Content Production Report

Status: FIRST_SAFE_BATCH_PUBLISHED_AND_VERIFIED

Generated: 2026-05-06T09:04:21.018494+00:00

Articles processed locally: 567
Articles improved locally in validated smoke batch: 3
Articles published remotely in this resumed run: 3
Articles held/quarantined from broad pass: 564

Questions processed locally: 7159
Questions improved with real edit payloads: 0
Questions published remotely in this resumed run: 0
Questions quarantined for source/review risk: 3478
Questions verified no-op only: 3681
Answer-key changes: 0

Published articles:
- `ee1f8beb-e236-4831-a0a8-1ddce447a3b8` / bp-344-vs-pd-1096-conflicts / verified=True
- `9085e0d8-3498-4d3b-b991-46e54d94bde0` / pd-1096-rule-vii-occupancy / verified=True
- `859b1a7f-8aba-473d-8c28-f9aaa39af11d` / pd-1096-rule-viii-setbacks-and-easements / verified=True

Remote backup files:
- .ai/20_content_publish/backups/articles-backup-20260506T090253Z.json
- .ai/20_content_publish/backups/questions-backup-20260506T090253Z.json

Remote apply batch:
- .ai/20_content_publish/reports/apply-batches/batch-001-apply-report.md
- .ai/20_content_publish/reports/apply-batches/batch-001-remote-verification.json

Rollback:
- .ai/20_content_publish/rollback/rollback-manifest.generated.json
- rollback_available: true

Validation:
- resume preflight: type-check pass, lint 0 errors/10 warnings, content-audit validate pass, git diff --check pass
- post-publish: content-audit validate pass, type-check pass, lint 0 errors/10 warnings, git diff --check pass
- intended artifact secret scan: real_secret_matches 0

Agents used:
- Hermes coordinator
- Prior Claude/Kimi rubric/review artifacts
- Prior subagent article/question review artifacts

Remaining risks:
- 564 broad-pass article edits are still held from publish pending article-level reconciliation and source verification.
- 3478 questions remain quarantined for missing citations, ambiguity, option clueing, missing correct_option_id, or source-linkage risk.
- No question edits were published because no validated real question payloads exist.

Next batch recommendation:
- Process the next 10 articles as an independently reviewed source-backed batch.
- Publish only after backup, baseline hash match, dry-run, exact-ID apply, and remote hash verification.

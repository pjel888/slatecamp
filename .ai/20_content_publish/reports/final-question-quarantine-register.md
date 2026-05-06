# Final Question Quarantine Register

Total question quarantines: 158

See `.ai/20_content_publish/quarantine-final.generated.json`.

## Tool/Context Cap Handoff — 2026-05-06T14:49:29.121236+00:00

Stop reason: TOOL/CONTEXT CAP REACHED, not a safety failure.

Clean resume point:
- Batch 016 published/verified committed/pushed: cdca876f4.
- Batch 017 published/verified committed/pushed: 975450128.
- Batch 018 published/verified committed/pushed: 3e6a73b9a.
- Batch 019 published/verified committed/pushed: 81ca6b678.

Remote publication totals now committed:
- Through Batch 008: 72.
- Batch 009: 5.
- Batch 010: 25.
- Batch 011: 25 recovered/no-op verified.
- Batch 012: 50.
- Batch 013: 50.
- Batch 014: 50.
- Batch 015: 50.
- Batch 016: 50.
- Batch 017: 50.
- Batch 018: 50.
- Batch 019: 50.
- Total committed published/recovered verified: 527.

Answer-key changes published: 0.
Option changes published: 0.
Remote verification failures: 0 for committed batches.

Known unrelated blocker remains: `bun run content-audit:validate` may fail on article bundle `public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9` due missing preserved UI blocks and candidate_hash mismatch. This is unrelated to question batches and was not repaired.

Next exact resume step:
1. Confirm clean tree with `git status --short`.
2. Run `bun scripts/content-audit/select-question-remediation-batch.ts question-batch-020 50`.
3. Run `bun scripts/content-audit/verify-question-batch.ts question-batch-020`.
4. Copy publish-ready JSONs to `.ai/20_content_publish/`.
5. Independent safety review.
6. Publish with exact `question_id` filters only.
7. Remote verify, commit, push, and continue to Batch 021.

## Question Batch 025 Published — 2026-05-06T15:15:57.467942+00:00

Status: PUBLISHED_VERIFIED.

- Selected: 50.
- Local verifier: 50/50 pass.
- Independent safety review: PASS, blockers none.
- Remote apply: 50/50 by exact question_id filter.
- Remote verification: 50/50.
- Answer-key changes: 0.
- Option changes: 0.
- Backup: `.ai/20_content_publish/backups/questions-backup-question-batch-025-20260506T151502Z.json`.

Running total committed after Batch 025: 827 published/recovered verified questions.

## Tool/Context Cap Handoff — 2026-05-06T15:15:57.467942+00:00

Stop reason: TOOL/CONTEXT CAP REACHED, not a safety failure.

Clean resume point:
- Latest completed batch: question-batch-025.
- Next exact batch: question-batch-026.
- Continue strict selector with 50 candidates unless stability policy is changed by Philip.

Current committed question totals:
- Through Batch 008: 72.
- Batch 009: 5.
- Batch 010: 25.
- Batch 011: 25 recovered/no-op verified.
- Batch 012–025: 14 batches x 50 = 700.
- Total committed published/recovered verified after Batch 025: 827.

Answer-key changes published: 0.
Option changes published: 0.
Remote verification failures: 0.

Known unrelated blocker remains: `bun run content-audit:validate` may fail on article bundle `public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9` due missing preserved UI blocks and candidate_hash mismatch. This is unrelated to question batches and was not repaired.

Next exact resume step:
1. `git status --short`
2. `bun scripts/content-audit/select-question-remediation-batch.ts question-batch-026 50`
3. Run `bun scripts/content-audit/verify-question-batch.ts question-batch-026`
4. Copy publish-ready JSONs to `.ai/20_content_publish/`
5. Independent safety review
6. Publish with exact `question_id` filters only
7. Remote verify, commit, push, continue to Batch 027.

# Source Audited Article Batch 017 Local-First Report

Generated: 2026-05-10T23:35:00.000+08:00
Workspace: /Users/philiplewis/slatecamp
Mode: local-first only. No Supabase push, no deploy, no commit.

## Selection

Selected five LEA professional-ethics article/question clusters not found in Batch 001 through Batch 016 report/ledger artifacts. Each selected cluster has 10 linked questions, zero exported UI blocks, and an available raw PDF under vitruvius-connection/001_Raw-Source-Layer.

| Article slug | Article ID | Improved article folder path | Question-edits folder path | Edits | Status |
| --- | --- | --- | --- | ---: | --- |
| lea-prac-eth-001-core-concept | 6604a199-6687-435d-aeb1-ffdc46be7d23 | .ai/content-audit-export/articles/lea-prac-eth-001-core-concept--6604a199-6687-435d-aeb1-ffdc46be7d23 | .ai/content-audit-export/articles/lea-prac-eth-001-core-concept--6604a199-6687-435d-aeb1-ffdc46be7d23/question-edits | 10 | local_passed |
| lea-prac-eth-002-core-concept | f769b43e-e467-4ce4-afd9-2d0152fe8d46 | .ai/content-audit-export/articles/lea-prac-eth-002-core-concept--f769b43e-e467-4ce4-afd9-2d0152fe8d46 | .ai/content-audit-export/articles/lea-prac-eth-002-core-concept--f769b43e-e467-4ce4-afd9-2d0152fe8d46/question-edits | 10 | local_passed |
| lea-prac-eth-003-core-concept | 9bc92dcd-8cce-4970-9111-13e21a72fb68 | .ai/content-audit-export/articles/lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68 | .ai/content-audit-export/articles/lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68/question-edits | 10 | local_passed |
| lea-prac-eth-004-core-concept | cd6c1a20-eee6-4475-b0cc-239897d3f4d7 | .ai/content-audit-export/articles/lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7 | .ai/content-audit-export/articles/lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7/question-edits | 10 | local_passed |
| lea-prac-eth-005-core-concept | 504b1844-1db1-44f8-9aa9-5b78705ca37e | .ai/content-audit-export/articles/lea-prac-eth-005-core-concept--504b1844-1db1-44f8-9aa9-5b78705ca37e | .ai/content-audit-export/articles/lea-prac-eth-005-core-concept--504b1844-1db1-44f8-9aa9-5b78705ca37e/question-edits | 10 | local_passed |

## Source Audit

Primary checked source for all five clusters: UAP Document Code of Ethics raw PDF plus local Markdown conversion. Existing claims about unverified external resolutions, enforcement mechanics, or duties outside the checked lines were removed or rewritten to source-safe form.

| Article slug | Raw PDF path | Raw PDF SHA-256 | Checked Markdown lines |
| --- | --- | --- | --- |
| lea-prac-eth-001-core-concept | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | raw markdown lines 23-29; raw markdown lines 31-118 |
| lea-prac-eth-002-core-concept | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | raw markdown lines 1-21 |
| lea-prac-eth-003-core-concept | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | raw markdown lines 23-29; raw markdown lines 31-44 |
| lea-prac-eth-004-core-concept | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | raw markdown lines 47-63; raw markdown lines 82-89 |
| lea-prac-eth-005-core-concept | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | raw markdown lines 92-118 |

Raw Markdown path: vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/UAP Document Code of Ethics.md
Raw Markdown SHA-256: sha256:e4f83ff0a83ece7895d9da8d89634c2f26a79f76785c22ceb98c62927f839933

## Local Repairs

- Rewrote 5 normalized.md files as learner-facing plain Markdown with no UI markers or process notes.
- Re-composed 5 candidate.md files from normalized.md.
- Updated 5 sources.json files to checked raw PDF/Markdown evidence.
- Updated 5 source-audit-evidence.json files with local pass status.
- Created 50 source-safe replacement question-edit JSON files.

## Validation

- compose: 5/5 passed, blockers=0.
- diff: 5/5 changed=true and safe=true, blockers=0.
- validate: 5/5 valid=true, blockers=0. Warning only: component-usage.json has not been generated for these articles yet.
- scoped JSON parse: pass, 100 JSON files parsed.
- scoped content/edit marker scan: pass.
- source path and hash check: pass.
- question-edit schema/count check: pass, 50 edits.
- test: bun test scripts/content-audit/content-audit.test.ts -> 27 pass, 0 fail.
- git diff --check on selected Batch 017 paths: pass after EOF blank-line fix.

## Counts

- Articles locally improved: 5.
- Linked questions covered: 50.
- Question-edit JSON files created: 50.
- Verified source records: 5.
- Raw PDFs checked: 1.
- Raw Markdown conversions checked: 1.
- Unresolved local blockers: 0.

## Artifacts

- Ledger: .ai/content-audit-export/source-audited-article-batch-017-local-first-ledger-2026-05-10.json
- Report: .ai/content-audit-export/source-audited-article-batch-017-local-first-report-2026-05-10.md

## Next-Phase Readiness

Batch 017 is ready for the next local-first phase. Supabase remains final publishing only and still requires explicit remote stale checks before any later publish action.

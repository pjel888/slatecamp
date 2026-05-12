# Source-Audited Article Batch 020 Local-First Report

Generated: 2026-05-11T00:46:49+08:00 (Asia/Manila); UTC: 2026-05-10T16:45:50.612Z
Mode: local-first only. No Supabase push, no deploy, no commit.

## Counts

- Selected articles: 5
- Linked questions covered: 50
- Source-safe question-edit JSON files: 50
- Source entries: 5 (4 unique raw PDFs)
- Unresolved local blockers: 0

## Improved Article And Question-Edit Paths

| Article ID | Slug | Improved article folder path | Question-edits folder path | Edits | Diff |
|---|---|---|---:|---:|---|
| e37575ae-c640-4ddc-911a-7553f338b981 | lea-prac-svc-025-core-concept | .ai/content-audit-export/articles/lea-prac-svc-025-core-concept--e37575ae-c640-4ddc-911a-7553f338b981 | .ai/content-audit-export/articles/lea-prac-svc-025-core-concept--e37575ae-c640-4ddc-911a-7553f338b981/question-edits | 10 | PASS |
| c534d94f-967a-48bb-babf-419fa6d35ec7 | spp-doc-204-a-fulltime-supervision-services | .ai/content-audit-export/articles/spp-doc-204-a-fulltime-supervision-services--c534d94f-967a-48bb-babf-419fa6d35ec7 | .ai/content-audit-export/articles/spp-doc-204-a-fulltime-supervision-services--c534d94f-967a-48bb-babf-419fa6d35ec7/question-edits | 10 | PASS |
| f76bad6c-4bdf-4d2c-bdfb-a3381c42e320 | spp-doc-207-design-build-services | .ai/content-audit-export/articles/spp-doc-207-design-build-services--f76bad6c-4bdf-4d2c-bdfb-a3381c42e320 | .ai/content-audit-export/articles/spp-doc-207-design-build-services--f76bad6c-4bdf-4d2c-bdfb-a3381c42e320/question-edits | 10 | PASS |
| 3e530aa4-6004-4664-a241-9634a725bd5c | lea-prac-svc-010-core-concept | .ai/content-audit-export/articles/lea-prac-svc-010-core-concept--3e530aa4-6004-4664-a241-9634a725bd5c | .ai/content-audit-export/articles/lea-prac-svc-010-core-concept--3e530aa4-6004-4664-a241-9634a725bd5c/question-edits | 10 | PASS |
| b59fc6ec-5ae5-4b15-a8eb-cd55d9b6a95b | lea-prac-svc-013-full-time-supervision-services-construction-phase-administration | .ai/content-audit-export/articles/lea-prac-svc-013-full-time-supervision-services-construction-phase-administration--b59fc6ec-5ae5-4b15-a8eb-cd55d9b6a95b | .ai/content-audit-export/articles/lea-prac-svc-013-full-time-supervision-services-construction-phase-administration--b59fc6ec-5ae5-4b15-a8eb-cd55d9b6a95b/question-edits | 10 | PASS |

## Source Audit

| Article ID | Raw PDF path | Checked source locators |
|---|---|---|
| e37575ae-c640-4ddc-911a-7553f338b981 | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 203.pdf | vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 203.md lines 101-117; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 203.md lines 121-150; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 203.md lines 228-231 |
| c534d94f-967a-48bb-babf-419fa6d35ec7 | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 204A.pdf | vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 204A.md lines 3-8; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 204A.md lines 201-206 |
| f76bad6c-4bdf-4d2c-bdfb-a3381c42e320 | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 207.pdf | vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 207.md lines 3-8; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 207.md lines 147-153; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/SPP 207.md lines 429-432 |
| 3e530aa4-6004-4664-a241-9634a725bd5c | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 208.pdf | vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 208.md lines 3-8; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 208.md lines 111-151; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/SPP 208.md lines 155-173; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 208.md lines 179-201; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 208.md lines 205-241; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 208.md lines 253-259 |
| b59fc6ec-5ae5-4b15-a8eb-cd55d9b6a95b | vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 204A.pdf | vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 204A.md lines 3-8; vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 204A.md lines 201-206 |

## Local Validation

- PASS: compose/diff/validate for all five bundles. Bundle validation warnings are limited to existing missing component-usage.json sidecars.
- PASS: scoped JSON parse check over 105 selected JSON files.
- PASS: scoped marker scan over repaired normalized/candidate/evidence/question-edit outputs.
- PASS: raw PDF path and sha256 checks.
- PASS: `bun test scripts/content-audit/content-audit.test.ts` (27 pass, 0 fail).
- PASS: scoped `git diff --check` on selected article folders.

## Artifacts

- Ledger: .ai/content-audit-export/source-audited-article-batch-020-local-first-ledger-2026-05-11.json
- Report: .ai/content-audit-export/source-audited-article-batch-020-local-first-report-2026-05-11.md
- Per-article evidence: each improved article folder contains `source-audit-evidence.json`, `sources.json`, `candidate.md`, `diff-report.json`, and `question-edits/`.

## Next Phase Readiness

Batch 020 is locally ready for review/publishing queue handoff. Supabase remains final publishing only; no live mutation, deployment, or commit was performed.

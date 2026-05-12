# Source-Audited Article Batch 022 Local-First Report

Generated: 2026-05-10T17:56:15.182Z
Mode: local-first only; no Supabase push, no deploy, no commit.

## Summary

Batch 022 selected five previously unpassed article/question clusters from `.ai/content-audit-export/articles`. Prior batch artifacts 001-021 were scanned (53 files, 314 UUIDs); none of the selected article IDs appeared in those prior artifacts.

Counts:

- Selected articles: 5
- Locally passed articles: 5
- Linked questions covered: 50
- Source-safe question edits created: 50
- Source records created: 12
- Distinct local raw PDFs checked: 8

## Exact Paths

| Article ID | Title | Improved article folder path | Question-edits folder path | Question edits | Sources | Status |
|---|---|---|---|---:|---:|---|
| 958cf8ad-c743-41b3-a7fd-47da9421a09b | CPD Ethics and Compliance | `.ai/content-audit-export/articles/lea-prac-eth-009-introduction--958cf8ad-c743-41b3-a7fd-47da9421a09b` | `.ai/content-audit-export/articles/lea-prac-eth-009-introduction--958cf8ad-c743-41b3-a7fd-47da9421a09b/question-edits` | 10/10 | 2 | locally_passed |
| 01e537a7-be03-49ec-b745-258474c27f70 | Architect's Guidelines (formerly 1979 UAP Doc 208-b | `.ai/content-audit-export/articles/lea-prac-svc-023-core-concept--01e537a7-be03-49ec-b745-258474c27f70` | `.ai/content-audit-export/articles/lea-prac-svc-023-core-concept--01e537a7-be03-49ec-b745-258474c27f70/question-edits` | 10/10 | 1 | locally_passed |
| 5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5 | Architect's Authority During Construction Powers Limits | `.ai/content-audit-export/articles/lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5` | `.ai/content-audit-export/articles/lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5/question-edits` | 10/10 | 2 | locally_passed |
| 4e28889a-cba3-4bf4-805c-ff0526910ee3 | Change Orders Types Authority Limits and the Documentation Process | `.ai/content-audit-export/articles/lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process--4e28889a-cba3-4bf4-805c-ff0526910ee3` | `.ai/content-audit-export/articles/lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process--4e28889a-cba3-4bf4-805c-ff0526910ee3/question-edits` | 10/10 | 2 | locally_passed |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | Full Time Supervision vs Construction Management vs SPP 202 | `.ai/content-audit-export/articles/lea-prac-svc-015-full-time-supervision-vs-construction-management-vs-spp-202-administration--1277bf71-f3cc-4d29-86a8-8cadca0133f9` | `.ai/content-audit-export/articles/lea-prac-svc-015-full-time-supervision-vs-construction-management-vs-spp-202-administration--1277bf71-f3cc-4d29-86a8-8cadca0133f9/question-edits` | 10/10 | 5 | locally_passed |

## Source Audit Evidence

| Article ID | Source ID | Raw PDF path | Raw PDF SHA-256 | Locator |
|---|---|---|---|---|
| 958cf8ad-c743-41b3-a7fd-47da9421a09b | ra9266-irr-board-discipline-cpd-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf` | sha256:d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574 | RA 9266 IRR refined markdown lines 296-323, 588-630, 670-680, and 855-873 |
| 958cf8ad-c743-41b3-a7fd-47da9421a09b | uap-code-ethics-client-contractor-colleague-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf` | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | UAP Code of Ethics refined markdown lines 23-29, 31-58, 60-71, and 81-99 |
| 01e537a7-be03-49ec-b745-258474c27f70 | uap-standards-selection-compensation-supervision-cm-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf` | sha256:af3b0fd1b232443881cbb79d3b2ed2a9a93ecb34677cdbd3b2acddbcdb7d2b3b | UAP Standards refined markdown lines 79-100, 217-265, 416-458, 915-964, 1129-1168, and 1174-1216 |
| 5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5 | uap-document-301-general-conditions-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document 301.pdf` | sha256:bd1d2f88cf3e430a893c8d52b0a1ca74b234b2e2ca14dfc7aa67fc0ce1ee86a3 | UAP Document 301 refined markdown lines 41-71, 482-520, 1019-1051, and 1062-1080 |
| 5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5 | uap-code-ethics-client-contractor-colleague-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf` | sha256:74444a64eb5da055137c52e64c37d32e73c95d8e899f7564471d960dd5a56eea | UAP Code of Ethics refined markdown lines 23-29, 31-58, 60-71, and 81-99 |
| 4e28889a-cba3-4bf4-805c-ff0526910ee3 | uap-document-301-general-conditions-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document 301.pdf` | sha256:bd1d2f88cf3e430a893c8d52b0a1ca74b234b2e2ca14dfc7aa67fc0ce1ee86a3 | UAP Document 301 refined markdown lines 41-71, 482-520, 1019-1051, and 1062-1080 |
| 4e28889a-cba3-4bf4-805c-ff0526910ee3 | ciap-document-102-change-orders-claims-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/CIAP/CIAP-Document-102-Private-Constn-Contract.pdf` | sha256:63943bc59465b154329631d2b286706ba45e85c63b31433d1c285d9b7caecd15 | CIAP Document 102 refined markdown lines 21, 287, 468, 497, 507, 522, 573, 598, and 899-903 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | uap-standards-selection-compensation-supervision-cm-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf` | sha256:af3b0fd1b232443881cbb79d3b2ed2a9a93ecb34677cdbd3b2acddbcdb7d2b3b | UAP Standards refined markdown lines 79-100, 217-265, 416-458, 915-964, 1129-1168, and 1174-1216 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | spp-202-regular-design-services-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 202.pdf` | sha256:1d01f1660b8505351ff8c653b7f1c1299b06863c1301c630698fc46aa24ce46d | SPP 202 refined markdown lines 175-183, corroborated by UAP Standards lines 1129-1168 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | spp-204a-full-time-supervision-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 204A.pdf` | sha256:ec08811ae8611f077fda9f0d1106cc7fab6a1e6210fe6d617637adaa6de083b8 | SPP 204-A refined markdown lines 201-207, corroborated by UAP Standards lines 915-964 and 1129-1168 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | spp-204b-construction-management-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 204B.pdf` | sha256:b6bfffcf6e3ca7a4317121b28d5fab9237c2a4642b450573232516ef9dfb697e | SPP 204-B refined markdown line 7, corroborated by UAP Standards lines 1174-1216 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | uap-document-301-general-conditions-local | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document 301.pdf` | sha256:bd1d2f88cf3e430a893c8d52b0a1ca74b234b2e2ca14dfc7aa67fc0ce1ee86a3 | UAP Document 301 refined markdown lines 41-71, 482-520, 1019-1051, and 1062-1080 |

## Local Validation

| Article ID | Compose blockers | Diff locally safe | Bundle valid | Bundle blockers | Bundle warnings |
|---|---:|---|---|---:|---:|
| 958cf8ad-c743-41b3-a7fd-47da9421a09b | 0 | true | true | 0 | 1 |
| 01e537a7-be03-49ec-b745-258474c27f70 | 0 | true | true | 0 | 1 |
| 5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5 | 0 | true | true | 0 | 1 |
| 4e28889a-cba3-4bf4-805c-ff0526910ee3 | 0 | true | true | 0 | 1 |
| 1277bf71-f3cc-4d29-86a8-8cadca0133f9 | 0 | true | true | 0 | 1 |

Scoped checks:

- JSON parse/count/source-hash check: passed.
- Edited content marker scan: passed for `normalized.md`, `candidate.md`, `sources.json`, and `question-edits/*.json`.
- Compose/diff/validate: 5/5 passed; all diffs locally safe.
- Targeted tests: `bun test scripts/content-audit/content-audit.test.ts` passed, 27 pass / 0 fail.
- Whitespace check: `git diff --check` over selected batch paths passed.

Nonblocking validation warning: `component-usage.json has not been generated for this article yet` appears for each selected bundle. This does not block local candidate safety.

## Artifacts

- Ledger: `.ai/content-audit-export/source-audited-article-batch-022-local-first-ledger-2026-05-11.json`
- Report: `.ai/content-audit-export/source-audited-article-batch-022-local-first-report-2026-05-11.md`

## Next-Phase Readiness

Status: ready for final publishing review only. Supabase mutation, deployment, and commit were not attempted. Final publishing should run in a separately authorized phase with remote stale checks and dry-run/apply gates.
